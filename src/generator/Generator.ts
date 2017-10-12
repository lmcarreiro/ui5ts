import * as request from 'request';
import * as fs from 'fs';
import * as ui5 from './ui5api';
import TreeNode from './TreeNode';
import SapTreeNode from './SapTreeNode';

export default class Generator
{
    private basePath = "./exports/";
    
    private apiBaseUrl = "https://sapui5.hana.ondemand.com/test-resources";
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
        let url = `${this.apiBaseUrl}/${namespace}/${this.apiUrlSuffix}`;

        console.log(`Making request to '${url}'`);

        return new Promise((resolve: (api: ui5.API) => void, reject: (error: any) => void) => {
            request({ url: url, json: true }, (error, response, body) => {
                if (!error && response.statusCode === 200) {
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
    
    private execute(apiList: ui5.API[]): void
    {
        let kinds: {[index: string]: {name:string;num:number}[]} = {};
        let v: string[] = [];
        let allSymbols = apiList.map(api => api.symbols).reduce((a, b) => a.concat(b));

        allSymbols.sort((a, b) => a.name.localeCompare(b.name));

        //TreeNode.createFromSymbolsArray<JqueryTreeNode>(JqueryTreeNode, allSymbols.filter(s => s.name.startsWith("jQuery.")), "jQuery", 0);
        let jQueryTree = TreeNode.createFromSymbolsArray<SapTreeNode>(SapTreeNode, allSymbols.filter(s => s.name.match(/^jQuery([.]|$)/)), null, 0);
        let jQueryOutput: string[] = [];
        let tsJQuery = jQueryTree.generateTypeScriptCode(jQueryOutput);
        this.createFile("./jQuery.d.ts", jQueryOutput.join(""));

        let sapTree = TreeNode.createFromSymbolsArray<SapTreeNode>(SapTreeNode, allSymbols.filter(s => s.name.match(/^sap([.]|$)/)), null, 0);
        let sapOutput: string[] = [];
        let tsSap = sapTree.generateTypeScriptCode(sapOutput);
        this.createFile("./sap.d.ts", sapOutput.join(""));
    }

    private createExports(api: ui5.API): void
    {
        api.symbols.forEach(s => this.exportSymbol(s));
    }
    
    private exportSymbol(symbol: ui5.Symbol): void
    {
        if (symbol.name.match(/^jquery/i))
        {
            return;
        }
    
        if (symbol.kind == "namespace" && symbol.name.replace(/[.]/g, "/") === symbol.module)
        {
            var path = this.basePath + symbol.resource.replace(/[.]js$/g, ".d.ts");
            var content = `export default ${symbol.name};`
    
            this.createFile(path, content);
        }
        else if (symbol.kind === "class")
        {
            var path = this.basePath + symbol.name.replace(/[.]/g, "/") + ".d.ts";
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

