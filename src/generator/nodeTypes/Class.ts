import * as ui5 from "../ui5api";
import Config   from "../GeneratorConfig";
import TreeNode from "./base/TreeNode";
import Method   from "./Method";

export default class Class extends TreeNode {

    private name: string;
    private fullName: string;
    private description: string;
    private methods: Method[];
    private children: TreeNode[];

    constructor(config: Config, apiSymbol: ui5.SymbolClass, children: TreeNode[], indentationLevel: number) {
        super(config, indentationLevel);

        this.children = children;

        this.name = apiSymbol.basename;
        this.fullName = apiSymbol.name;
        this.description = apiSymbol.description || "";
        this.methods = (apiSymbol.methods || []).map(m => new Method(this.config, m, this.fullName, indentationLevel + 1));
    }

    public generateTypeScriptCode(output: string[]): void {
        this.printTsDoc(output, this.description);
        output.push(`${this.indentation}export class ${this.name} {\r\n`);
        this.methods.forEach(m => m.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);

        if (this.children.length) {
            output.push(`${this.indentation}namespace ${this.name} {\r\n`);
            this.children.forEach(c => c.generateTypeScriptCode(output));
            output.push(`${this.indentation}}\r\n`);
        }
    }

}
