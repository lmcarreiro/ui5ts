import * as request         from 'request';
import * as fs              from 'fs';
import * as ui5             from './ui5api';
import TreeNode             from './nodeTypes/base/TreeNode';
import TreeBuilder          from './nodeTypes/base/TreeBuilder';
import GeneratorConfig      from './GeneratorConfig';

export default class Generator
{
    private config: GeneratorConfig;

    public constructor(configPath: string) {
        var jsonConfig = fs.readFileSync(configPath, { encoding: "utf-8" });
        this.config = JSON.parse(jsonConfig);
    }

    public generate(): void
    {
        console.log(`Starting exports generation...`);

        var requests = this.config.input.namespaces.map(url => this.getApiJson(url));
        
        console.log(`All requests made.`);

        Promise.all(requests)
            .then(apiList => this.execute(apiList))
            .catch(error => {
                console.log("\x1b[31m", `\n\n  Error: ${error}\n\n`);
                process.exit(1);
            });
    }
    
    private getApiJson(namespace: string): Promise<ui5.API>
    {
        if (this.config.input.runLocal) {
            let path = `${this.config.input.localPath}/${namespace}/${this.config.input.jsonLocation}`.replace(/\//g, "\\");

            console.log(`Making local file '${path}'`);

            return new Promise((resolve: (api: ui5.API) => void, reject: (error: any) => void) => {
                fs.readFile(path, { encoding: "utf-8" }, (err, data) => {
                    if (!err) {
                        console.log(`Got content from '${path}'`);
                        resolve(JSON.parse(data))
                    }
                    else {
                        console.log(`Got error from '${path}'`);
                        reject(`${err}`);
                    }
                });
            });
        }
        else {
            let url = `${this.config.input.remoteUrl}/${namespace}/${this.config.input.jsonLocation}`;
            
            console.log(`Making request to '${url}'`);

            return new Promise((resolve: (api: ui5.API) => void, reject: (error: any) => void) => {
                request({ url: url, json: true }, (error, response, body) => {
                    if (!error && response && response.statusCode === 200) {
                        console.log(`Got response from '${url}'`);
                        resolve(response.body);
                    }
                    else {
                        console.log(`Got error from '${url}'`);
                        reject(`${response.statusCode} - ${response.statusMessage}`);
                    }
                });
            });
        }
    }
    
    private execute(apiList: ui5.API[]): void
    {
        this.createExports(apiList);
        this.createDefinitions(apiList);
    }

    private createDefinitions(apiList: ui5.API[]): void
    {
        let allSymbols = apiList.map(api => api.symbols).reduce((a, b) => a.concat(b));

        allSymbols.sort((a, b) => a.name.localeCompare(b.name));

        let rootNodes = TreeBuilder.createFromSymbolsArray(this.config, allSymbols);
        for (var node of rootNodes) {
            let output: string[] = [];
            let tsCode = node.generateTypeScriptCode(output);
            this.createFile(`${this.config.output.definitionsPath}${node.fullName}.d.ts`, output.join(""));
        }

        // Uncomment this to see the details, statistics and example values of the different types of API members
        // this.printApiData(allSymbols);
    }

    /**
     * This method just print api data to help identify and understand de API structure and define it in ui5api.ts
     * @param symbols Symbols array
     */
    private printApiData(symbols: ui5.Symbol[]): void
    {
        var result: { [name: string]: any } = {};
        var object: { [name: string]: any[] } = {};

        symbols.forEach(s => (object[s.kind] = object[s.kind] || []).push(s));

        this.addToResult(result, object);

        console.log(result);
    }

    private addToResult(result: { [name: string]: any }, object: any): void
    {
        let storageValuesFrom = [
            "kind",
            "visibility",
            "static",
            "final",
            "abstract",
            "optional",
            "defaultValue",
            "$keyEqualsName"
        ];

        let treatAsArray = [
            "parameterProperties"
        ];

        if (Array.isArray(object)) {
            if (object.length > 0 && typeof(object[0]) === "object") {
                result.$length = (result.$length || 0) + object.length;
                object.forEach(o => this.addToResult(result, o));
            }
            else {
                result.$examples = result.$examples || [];
                if (result.$examples.length < 5) result.$examples.push(object);
            }
        }
        else {
            if (object && object.hasOwnProperty("defaultValue")) {
                object.defaultValue = typeof(object.defaultValue) + "[" + object.defaultValue + "]";
            }
            for (let key in object) {
                if (object.hasOwnProperty(key)) {
                    let value = object[key];
                    key = key === "constructor" ? "_constructor" : key;

                    result[key] = result[key] || { $count: 0 };
                    result[key].$count++;

                    if (typeof(value) === "object") {
                        if (treatAsArray.indexOf(key) > -1) {
                            let array: any[] = [];
                            for (var k in value) {
                                value[k].$keyEqualsName = k === value[k].name;
                                array.push(value[k]);
                            }
                            value = array;
                        }
                        this.addToResult(result[key], value);
                    }
                    else {

                        if (storageValuesFrom.indexOf(key) > -1) {
                            result[key][value] = result[key][value] || 0;
                            result[key][value]++;
                        }
                        else {
                            result[key].$examples = result[key].$examples || [];
                            if (result[key].$examples.length < 5 && result[key].$examples.indexOf(value) === -1) {
                                result[key].$examples.push(value);
                            }
                        }
                    }
                }
            }
        }
    }

    private createExports(apiList: ui5.API[]): void
    {
        apiList.forEach(api => api.symbols.forEach(s => this.exportSymbol(s)));
    }
    
    private exportSymbol(symbol: ui5.Symbol): void
    {
        if (symbol.name.match(/^jquery/i))
        {
            return;
        }
    
        if (symbol.kind == "namespace" && symbol.name.replace(/[.]/g, "/") === symbol.module)
        {
            var path = this.config.output.exportsPath + symbol.resource.replace(/[.]js$/g, ".d.ts");
            var content = `export default ${symbol.name};`
    
            this.createFile(path, content);
        }
        else if (symbol.kind === "class")
        {
            var path = this.config.output.exportsPath + symbol.name.replace(/[.]/g, "/") + ".d.ts";
            var content = `export default ${symbol.name};`
    
            this.createFile(path, content);
        }
    }
    
    private createFile(path: string, content: string): void
    {
        var dirPieces = path.replace(/\/[^/]+$/, "").split("/");
    
        // make sure that the directory exists
        for (let i = 0, dir = dirPieces[0]; i < dirPieces.length; i++, dir += `/${dirPieces[i]}`)
        {
            if (!fs.existsSync(dir))
            {
                fs.mkdirSync(dir);
            }
        }
    
        // write the file
        fs.writeFile(path, content, (err) => {
            if(err) {
                return console.log(err);
            }
        
            //console.log(`File saved: ${path}`);
        });
    }
}

