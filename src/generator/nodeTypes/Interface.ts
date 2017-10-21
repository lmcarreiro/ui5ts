import * as ui5 from "../ui5api";
import Config   from "../GeneratorConfig";
import TreeNode from "./base/TreeNode";
import Property from "./Property";
import Method   from "./Method";

export default class Interface extends TreeNode {

    public name: string;
    public fullName: string;
    private description: string;
    private properties: Property[];
    private methods: Method[];

    constructor(config: Config, apiSymbol: ui5.SymbolInterface, children: TreeNode[], indentationLevel: number) {
        super(config, indentationLevel);

        if (children.length) {
            throw new Error("Interface cannot have children.");
        }

        this.name = apiSymbol.basename;
        this.fullName = apiSymbol.name;
        this.description = apiSymbol.description || "";
        this.properties = (apiSymbol.properties || []).map(m => new Property(this.config, m, this.fullName, indentationLevel + 1, ui5.Kind.Interface));
        this.methods    = (apiSymbol.methods    || []).map(m => new Method  (this.config, m, this.fullName, indentationLevel + 1, ui5.Kind.Interface));
    }

    public generateTypeScriptCode(output: string[]): void {
        this.printTsDoc(output, this.description);
        output.push(`${this.indentation}export interface ${this.name} {\r\n`);
        this.properties.forEach(p => p.generateTypeScriptCode(output));
        this.methods.forEach(m => m.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);
    }

}
