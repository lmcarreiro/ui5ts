import * as ui5 from "../ui5api";
import TreeNode from "./base/TreeNode";

export default class Namespace extends TreeNode {

    private content: ui5.SymbolNamespace;
    private children: TreeNode[];

    constructor(apiSymbol: ui5.SymbolNamespace, children: TreeNode[], indentationLevel: number) {
        super(indentationLevel);

        this.content = apiSymbol;
        this.children = children;
    }

    public generateTypeScriptCode(output: string[]): void {
        var type = this.typeDefinedAsNamespace(this.content.name);

        if (!type) {
            let declare = !this.indentation ? "declare " : "";

            this.printTsDoc(output, this.content.description);
            output.push(`${this.indentation}${declare}namespace ${this.content.basename} {\r\n`);
            this.children.forEach(c => c.generateTypeScriptCode(output));
            output.push(`${this.indentation}}\r\n`);
        }
        else {
            output.push(`${this.indentation}export type ${this.content.basename} = ${type};\r\n`);
        }
    }

}
