import * as ui5 from "../ui5api";
import Config   from "../GeneratorConfig";
import TreeNode from "./base/TreeNode";
import Property from "./Property";
import Method   from "./Method";

export default class Class extends TreeNode {

    private description: string;
    private baseClass: string;
    private properties: Property[];
    private methods: Method[];
    private children: TreeNode[];

    constructor(config: Config, apiSymbol: ui5.SymbolClass, children: TreeNode[], indentationLevel: number) {
        super(config, indentationLevel, apiSymbol);

        this.children = children;

        this.description = apiSymbol.description || "";
        this.baseClass = apiSymbol.extends || "";
        this.properties = (apiSymbol.properties || []).map(m => new Property(this.config, m, this.fullName, indentationLevel + 1, ui5.Kind.Class));
        this.methods    = (apiSymbol.methods    || []).map(m => new Method  (this.config, m, this.fullName, indentationLevel + 1, ui5.Kind.Class));

        if (typeof(apiSymbol.constructor) === "object") {
            let constructorSymbol = Object.assign(apiSymbol.constructor, { name: "constructor" });
            let constructor = new Method(this.config, constructorSymbol, this.fullName, indentationLevel + 1, ui5.Kind.Class)
            this.methods = [constructor].concat(this.methods);
        }
    }

    public generateTypeScriptCode(output: string[]): void {
        if (this.isJQueryNamespace) {
            this.generateTypeScriptCodeJQuery(output);
        }
        else {
            this.generateTypeScriptCodeSap(output);
        }
    }

    private generateTypeScriptCodeSap(output: string[]): void {
        let extend = this.baseClass ? ` extends ${this.baseClass}` : "";

        this.printTsDoc(output, this.description);
        output.push(`${this.indentation}export class ${this.name}${extend} {\r\n`);
        this.properties.forEach(p => p.generateTypeScriptCode(output));
        this.methods.forEach(m => m.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);

        if (this.children.length) {
            output.push(`${this.indentation}namespace ${this.name} {\r\n`);
            this.children.forEach(c => c.generateTypeScriptCode(output));
            output.push(`${this.indentation}}\r\n`);
        }
    }
    
    private generateTypeScriptCodeJQuery(output: string[]): void {
        var jQueryFullName = this.getJQueryFullName();
        let extend = this.baseClass ? ` extends ${this.baseClass}` : "";

        this.printTsDoc(output, this.description);
        output.push(`${this.indentation}declare class ${jQueryFullName}${extend} {\r\n`);
        this.properties.forEach(p => p.generateTypeScriptCode(output));
        this.methods.forEach(m => m.generateTypeScriptCode(output));
        //TODO: support class children (there is only one case, it's an enum. Could be converted in a static object literal)
        //this.children.forEach(c => c.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);
    }

}
