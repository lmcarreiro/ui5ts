import * as ui5 from './ui5api';
import TreeNode from './TreeNode';

export default class SapTreeNode extends TreeNode<SapTreeNode>
{
    protected constructor(content: ui5.Symbol, indentationLevel: number, children: SapTreeNode[])
    {
        super(content, indentationLevel, children);
    }

    public generateTypeScriptCode(output: string[]): void
    {
        if (this.indentationLevel === 0) {
            output.push("declare ");
        }

        switch (this.content.kind) {
            case ui5.Kind.Namespace:
                this.generateNamespace(output, this.content);
                break;
            case ui5.Kind.Class:
                this.generateClass(output, this.content);
                break;
            case ui5.Kind.Interface:
                this.generateInterface(output, this.content);
                break;
            case ui5.Kind.Enum:
                this.generateEnum(output, this.content);
                break;
            default:
                throw new Error("Unknown kind of symbol.");
        }
    }

    private generateNamespace(output: string[], symbol: ui5.SymbolNamespace): void
    {
        output.push(`${this.indentation}export namespace ${symbol.basename} {\r\n`);
        this.children.forEach(c => c.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);
    }

    private generateClass(output: string[], symbol: ui5.SymbolClass): void
    {
        output.push(`${this.indentation}export class ${symbol.basename} {\r\n`);
        this.children.forEach(c => c.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);
    }

    private generateInterface(output: string[], symbol: ui5.SymbolInterface): void
    {
        output.push(`${this.indentation}export interface ${symbol.basename} {\r\n`);
        this.children.forEach(c => c.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);
    }

    private generateEnum(output: string[], symbol: ui5.SymbolEnum): void
    {
        output.push(`${this.indentation}export enum ${symbol.basename} {\r\n`);
        this.children.forEach(c => c.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);
    }

}
