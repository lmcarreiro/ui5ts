import * as ui5 from "../ui5api";
import TreeNode from "./base/TreeNode";

export default class Class extends TreeNode {

    private content: ui5.SymbolClass;

    constructor(apiSymbol: ui5.SymbolClass, children: TreeNode[], indentationLevel: number) {
        super(children, indentationLevel);

        this.content = apiSymbol;
    }

    public generateTypeScriptCode(output: string[]): void {
        //is nested inside a class?
        if (this.parent && this.parent.content.kind === ui5.Kind.Class) {
            output.push(`${this.indentation.slice(0, -4)}namespace ${this.parent.content.basename} {\r\n`);
        }

        output.push(`${this.indentation}export class ${symbol.basename} {\r\n`);
        this.generateMethods(output, symbol);
        output.push(`${this.indentation}}\r\n`);

        //is nested inside a class?
        if (this.parent && this.parent.content.kind === ui5.Kind.Class) {
            output.push(`${this.indentation.slice(0, -4)}}\r\n`);
        }

        this.children.forEach(c => c.generateTypeScriptCode(output));
    }

    private generateMethods(output: string[], symbol: ui5.SymbolNamespace|ui5.SymbolInterface|ui5.SymbolClass): void
    {
        (symbol.methods || []).forEach(m => {
            let visibilityModifier = m.visibility.replace(ui5.Visibility.Restricted, ui5.Visibility.Protected) + " ";
            let staticModifier = m.static ? "static " : "";
            let returnType = m.returnValue ? this.mapType(this.overrideMethodReturnType(symbol.name, m)) : "void";
            let parameters = (m.parameters || []).map(p => `${p.name.replace(/<[^>]+>/g, "")}${p.optional ? "?" : ""}: ${this.mapType(this.overrideMethodParameter(symbol.name, m, p))}`);

            this.printTsDoc(output, 1, m, symbol);
            output.push(`${this.indentation}    ${visibilityModifier}${staticModifier}${m.name}(${parameters.join(", ")}): ${returnType};\r\n`);
        });
    }

}
