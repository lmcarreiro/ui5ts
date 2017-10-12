import * as request from 'request';
import * as fs from 'fs';
import * as ui5 from './ui5api';


var basePath = "./exports/";

var apiBaseUrl = "https://sapui5.hana.ondemand.com/test-resources";
var apiUrlSuffix = "designtime/api.json";

var namespaces = [
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


console.log(`Starting exports generation...`);

namespaces.forEach(url => exportNamespace(url));

console.log(`All requests made.`);


function exportNamespace(namespace: string): void
{
    let url = `${apiBaseUrl}/${namespace}/${apiUrlSuffix}`;

    console.log(`Making request to '${url}'`);
    request({ url: url, json: true }, (error, response, body) => processJsonApi(url, error, response, body));
}

function processJsonApi(url: string, error: any, response: request.RequestResponse, body: any): void
{
    if (!error && response.statusCode === 200) {
        console.log(`Got response from '${url}'`);
        createExports(response.body);
    }
    else {
        console.log(`Error from '${url}'`);
        console.log(error);
    }
}

function createExports(api: ui5.API): void
{
    api.symbols.forEach(s => exportSymbol(s));
}

function exportSymbol(symbol: ui5.Symbol): void
{
    if (symbol.name.match(/^jquery/i))
    {
        return;
    }

    if (symbol.kind == "namespace" && symbol.name.replace(/[.]/g, "/") === symbol.module)
    {
        var path = basePath + symbol.resource.replace(/[.]js$/g, ".d.ts");
        var content = `export default ${symbol.name};`

        createFile(path, content);
    }
    else if (symbol.kind === "class")
    {
        var path = basePath + symbol.name.replace(/[.]/g, "/") + ".d.ts";
        var content = `export default ${symbol.name};`

        createFile(path, content);
    }
}

function createFile(path: string, content: string): void
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
    
        console.log(`File saved: ${path}`);
    });
}
