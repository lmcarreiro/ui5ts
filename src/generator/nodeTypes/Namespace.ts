import * as ui5 from "../ui5api";
import TreeNode from "./base/TreeNode";

export default class Namespace extends TreeNode {

    private content: ui5.SymbolNamespace;

    constructor(apiSymbol: ui5.SymbolNamespace, children: TreeNode[], indentationLevel: number) {
        super(children, indentationLevel);

        this.content = apiSymbol;
    }

    public generateTypeScriptCode(output: string[]): void {
        var type = this.typeDefinedAsNamespace(symbol.name);

        this.printTsDoc(output, 0, symbol);
        if (!type) {
            
            if (this.indentationLevel === 0) {
                output.push("declare ");
            }

            output.push(`${this.indentation}namespace ${symbol.basename} {\r\n`);
            this.children.forEach(c => c.generateTypeScriptCode(output));
            output.push(`${this.indentation}}\r\n`);
        }
        else {
            output.push(`${this.indentation}export type ${symbol.basename} = ${type};\r\n`);
        }
    }

}
