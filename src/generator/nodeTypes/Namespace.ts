import * as ui5 from "../ui5api";
import * as fs  from 'fs';
import Config   from "../GeneratorConfig";
import TreeNode from "./base/TreeNode";
import Property from "./Property";
import Method   from "./Method";
import Class    from "./Class";

export default class Namespace extends TreeNode {

    private apiSymbol: ui5.SymbolNamespace;

    private description: string;
    private properties: Property[];
    private methods: Method[];
    private children: TreeNode[];

    constructor(config: Config, apiSymbol: ui5.SymbolNamespace, children: TreeNode[], indentationLevel: number) {
        super(config, indentationLevel, apiSymbol);

        this.apiSymbol = apiSymbol;

        this.description = apiSymbol.description || "";
        this.properties = (apiSymbol.properties || []).map(m => new Property(this.config, m, this.fullName, indentationLevel + 1, this.isJQueryNamespace ? ui5.Kind.Interface : ui5.Kind.Namespace));
        this.methods    = (apiSymbol.methods    || []).map(m => new Method  (this.config, m, this.fullName, indentationLevel + 1, this.isJQueryNamespace ? ui5.Kind.Interface : ui5.Kind.Namespace));
        this.children = children;
    }

    public generateTypeScriptCode(output: string[]): void {
        var type = this.config.replacements.specific.namespaceAsType[this.fullName];

        if (!type) {
            if (this.isJQueryNamespace) {
                this.generateTypeScriptCodeJQuery(output);
            }
            else {
                this.generateTypeScriptCodeSap(output);
            }
        }
        else {
            this.generateNamespaceAsType(output, type);
        }
    }

    private generateNamespaceAsType(output: string[], type: "string"|"enum"|"class") {
        switch (type) {
            case "string":
                this.printTsDoc(output, this.description);
                output.push(`${this.indentation}export type ${this.name} = ${type};\r\n`);
                break;
            case "enum":
                this.printTsDoc(output, this.description);
                let content = fs.readFileSync(`./src/generator/replacements/${this.fullName}.ts`, { encoding: "utf-8" });
                content = content.split(/\r\n|\r|\n/g).map(line => `${this.indentation}${line}`).join("\r\n");
                output.push(content);
                break;
            case "class":
                let classSymbol: any = this.apiSymbol;
                classSymbol.kind = ui5.Kind.Class;
                var classInstance = new Class(this.config, classSymbol, this.children, this.indentation.length / this.config.output.indentation.length);
                classInstance.generateTypeScriptCode(output);
                break;
            default:
                throw new Error(`Unknown generateNamespaceAsType option: '${type}'.`);
        }
    }

    private generateTypeScriptCodeSap(output: string[]): void {
        let declare = !this.indentation ? "declare " : "";

        this.printTsDoc(output, this.description);
        output.push(`${this.indentation}${declare}namespace ${this.name} {\r\n`);

        this.properties.forEach(p => p.generateTypeScriptCode(output));
        this.methods.forEach(m => m.generateTypeScriptCode(output));
        this.children.forEach(c => c.generateTypeScriptCode(output));

        output.push(`${this.indentation}}\r\n`);
    }

    private generateTypeScriptCodeJQuery(output: string[]): void {
        var jQueryInterfaceName = this.getJQueryFullName();

        this.printTsDoc(output, this.description);
        output.push(`${this.indentation}declare interface ${jQueryInterfaceName} {\r\n`);

        this.children.forEach(c => output.push(`${this.indentation}${this.config.output.indentation}${c.name}: ${c.getJQueryFullName()};\r\n`));
        this.properties.forEach(p => p.generateTypeScriptCode(output));
        this.methods.forEach(m => m.generateTypeScriptCode(output));

        output.push(`${this.indentation}}\r\n`);

        this.children.forEach(c => c.generateTypeScriptCode(output));
    }

}
