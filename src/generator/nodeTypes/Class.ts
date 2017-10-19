import * as ui5 from "../ui5api";
import TreeNode from "./base/TreeNode";
import Method   from "./Method";

export default class Class extends TreeNode {

    private children: TreeNode[];

    private name: string;
    private description: string;
    private methods: Method[];

    constructor(apiSymbol: ui5.SymbolClass, children: TreeNode[], indentationLevel: number) {
        super(indentationLevel);

        this.children = children;

        this.name = apiSymbol.basename;
        this.description = apiSymbol.description || "";
        this.methods = (apiSymbol.methods || []).map(m => new Method(m, indentationLevel + 1));
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
