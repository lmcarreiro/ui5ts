import * as ui5 from "../ui5api";
import TreeNode from "./base/TreeNode";

export default class Class extends TreeNode {

    private content: ui5.SymbolEnum;

    constructor(apiSymbol: ui5.SymbolEnum, children: TreeNode[], indentationLevel: number) {
        super(children, indentationLevel);

        this.content = apiSymbol;
    }

    public generateTypeScriptCode(output: string[]): void {
        //is nested inside a class?
        if (this.parent && this.parent.content.kind === ui5.Kind.Class) {
            output.push(`${this.indentation.slice(0, -4)}namespace ${this.parent.content.basename} {\r\n`);
        }
        
        this.printTsDoc(output, 0, symbol);
        output.push(`${this.indentation}export enum ${symbol.basename.replace(/^.*[.]/, "")} {\r\n`);
        this.generateEnumContent(output, symbol);
        this.children.forEach(c => c.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);
        
        //is nested inside a class?
        if (this.parent && this.parent.content.kind === ui5.Kind.Class) {
            output.push(`${this.indentation.slice(0, -4)}}\r\n`);
        }
    }

    private generateEnumContent(output: string[], symbol: ui5.SymbolEnum): void
    {
        (symbol.properties || []).forEach(p => {
            this.printTsDoc(output, 1, p);
            output.push(`${this.indentation}    ${p.name} = "${p.name}",\r\n`);
        });
    }

}
