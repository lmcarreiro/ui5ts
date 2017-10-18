import * as ui5 from "../ui5api";
import TreeNode from "./base/TreeNode";

export default class Class extends TreeNode {

    private content: ui5.SymbolInterface;

    constructor(apiSymbol: ui5.SymbolInterface, children: TreeNode[], indentationLevel: number) {
        super(children, indentationLevel);

        this.content = apiSymbol;
    }

    public generateTypeScriptCode(output: string[]): void {
        //is nested inside a class?
        if (this.parent && this.parent.content.kind === ui5.Kind.Class) {
            output.push(`${this.indentation.slice(0, -4)}namespace ${this.parent.content.basename} {\r\n`);
        }

        output.push(`${this.indentation}export interface ${symbol.basename} {\r\n`);
        this.children.forEach(c => c.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);
        
        //is nested inside a class?
        if (this.parent && this.parent.content.kind === ui5.Kind.Class) {
            output.push(`${this.indentation.slice(0, -4)}}\r\n`);
        }
    }

}
