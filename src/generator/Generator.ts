import * as request         from 'request';
import * as fs              from 'fs';
import * as ui5             from './ui5api';
import TreeNode             from './TreeNode';
import SapTreeNode          from './SapTreeNode';
import JQuerySapTreeNode    from './JQuerySapTreeNode';

export default class Generator
{
    private baseExportsPath = "./exports/";
    private baseDefinitionsPath = "./types/";
    
    private getFromLocal = true;
    private apiBaseUrl = "https://sapui5.hana.ondemand.com/test-resources";
    private apiBasePath = "C:/Users/leonardo/Documents/sapui5/sapui5-sdk-1.48.6/test-resources";
    private apiUrlSuffix = "designtime/api.json";
    
    private namespaces = [
        "sap/m",
        "sap/tnt",
        "sap/ui/commons",
        "sap/ui/core",
        "sap/ui/demokit",
        "sap/ui/dt",
        "sap/ui/layout",
        "sap/ui/suite",
        "sap/ui/table",
        "sap/ui/unified",
        "sap/ui/ux3",
        "sap/uxap"
    ]
    
    public generate(): void
    {
        console.log(`Starting exports generation...`);

        var requests = this.namespaces.map(url => this.getApiJson(url));
        
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
        if (this.getFromLocal) {
            let path = `${this.apiBasePath}/${namespace}/${this.apiUrlSuffix}`.replace(/\//g, "\\");

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
            let url = `${this.apiBaseUrl}/${namespace}/${this.apiUrlSuffix}`;
            
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
        let kinds: {[index: string]: {name:string;num:number}[]} = {};
        let v: string[] = [];
        let allSymbols = apiList.map(api => api.symbols).reduce((a, b) => a.concat(b));

        allSymbols.sort((a, b) => a.name.localeCompare(b.name));

        //TreeNode.createFromSymbolsArray<JqueryTreeNode>(JqueryTreeNode, allSymbols.filter(s => s.name.startsWith("jQuery.")), "jQuery", 0);
        // let jQueryTree = TreeNode.createFromSymbolsArray(JQuerySapTreeNode, allSymbols.filter(s => s.name.match(/^jQuery([.]|$)/)), null, 0)[0];
        // let jQueryOutput: string[] = [];
        // let tsJQuery = jQueryTree.generateTypeScriptCode(jQueryOutput);
        // this.createFile(this.baseDefinitionsPath + "jQuery.d.ts", jQueryOutput.join(""));

        // let sapTree = TreeNode.createFromSymbolsArray(SapTreeNode, allSymbols.filter(s => s.name.match(/^sap([.]|$)/)), null, 0)[0];
        // let sapOutput: string[] = [];
        // let tsSap = sapTree.generateTypeScriptCode(sapOutput);
        // this.createFile(this.baseDefinitionsPath + "sap.d.ts", sapOutput.join(""));

        this.printData(allSymbols);
    }

    /**
     * This method just print api data to help identify and understand de API structure and define it in ui5api.ts
     * @param symbols Symbols array
     */
    private printData(symbols: ui5.Symbol[]): void
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
            "optional"
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
            for (let key in object) {
                if (object.hasOwnProperty(key)) {
                    let value = object[key];
                    key = key === "constructor" ? "_constructor" : key;

                    result[key] = result[key] || { $count: 0 };
                    result[key].$count++;

                    if (typeof(value) === "object") {
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
            var path = this.baseExportsPath + symbol.resource.replace(/[.]js$/g, ".d.ts");
            var content = `export default ${symbol.name};`
    
            this.createFile(path, content);
        }
        else if (symbol.kind === "class")
        {
            var path = this.baseExportsPath + symbol.name.replace(/[.]/g, "/") + ".d.ts";
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

