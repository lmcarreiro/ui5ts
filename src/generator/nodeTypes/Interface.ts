import * as ui5 from "../ui5api";
import Config   from "../GeneratorConfig";
import TreeNode from "./base/TreeNode";
import Method   from "./Method";

export default class Interface extends TreeNode {

    private name: string;
    private description: string;
    private methods: Method[];

    constructor(config: Config, apiSymbol: ui5.SymbolInterface, children: TreeNode[], indentationLevel: number) {
        super(config, indentationLevel);

        if (children.length) {
            throw new Error("Interface cannot have children.");
        }

        this.name = apiSymbol.basename;
        this.description = apiSymbol.description || "";
        this.methods = (apiSymbol.methods || []).map(m => new Method(this.config, m, indentationLevel + 1));;
    }

    public generateTypeScriptCode(output: string[]): void {
        this.printTsDoc(output, this.description);
        output.push(`${this.indentation}export interface ${this.name} {\r\n`);
        this.methods.forEach(m => m.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);
    }

}
