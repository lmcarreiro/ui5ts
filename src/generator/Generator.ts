import * as request from 'request';
import * as fs from 'fs';
import * as ui5 from './ui5api';

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
            .catch(error => console.log("Errors", error));
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
                    console.log(`Error from '${url}'`);
                    reject(error);
                }
            });
        });
    }
    
    private execute(apiList: ui5.API[]): void
    {
        console.log("Success. " + apiList.length);
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

