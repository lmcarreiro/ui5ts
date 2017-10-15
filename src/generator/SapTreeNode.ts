import * as ui5 from './ui5api';
import TreeNode from './TreeNode';

export default class SapTreeNode extends TreeNode<SapTreeNode>
{
    public constructor(content: ui5.Symbol, indentationLevel: number, parent: SapTreeNode)
    {
        super(content, indentationLevel, parent);
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
        output.push(`${this.indentation}namespace ${symbol.basename} {\r\n`);
        this.children.forEach(c => c.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);
    }

    private generateClass(output: string[], symbol: ui5.SymbolClass): void
    {
        //is nested inside a class?
        if (this.parent && this.parent.content.kind === ui5.Kind.Class) {
            output.push(`${this.indentation.slice(0, -4)}namespace ${this.parent.content.basename} {\r\n`);
        }

        output.push(`${this.indentation}export class ${symbol.basename} {\r\n`);
        //... methods, properties, events
        output.push(`${this.indentation}}\r\n`);

        //is nested inside a class?
        if (this.parent && this.parent.content.kind === ui5.Kind.Class) {
            output.push(`${this.indentation.slice(0, -4)}}\r\n`);
        }

        this.children.forEach(c => c.generateTypeScriptCode(output));
    }

    private generateInterface(output: string[], symbol: ui5.SymbolInterface): void
    {
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

    private generateEnum(output: string[], symbol: ui5.SymbolEnum): void
    {
        //is nested inside a class?
        if (this.parent && this.parent.content.kind === ui5.Kind.Class) {
            output.push(`${this.indentation.slice(0, -4)}namespace ${this.parent.content.basename} {\r\n`);
        }
        
        this.printTsDoc(output, symbol, 0);
        output.push(`${this.indentation}export enum ${symbol.basename.replace(/^.*[.]/, "")} {\r\n`);
        this.generateEnumContent(output, symbol);
        this.children.forEach(c => c.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);
        
        //is nested inside a class?
        if (this.parent && this.parent.content.kind === ui5.Kind.Class) {
            output.push(`${this.indentation.slice(0, -4)}}\r\n`);
        }
    }

    private printTsDoc(output: string[], element: ui5.ApiElement, innerIndentation: number): void
    {
        let indentation = this.indentation + new Array(innerIndentation + 1).join("    ");

        output.push(`${indentation}/**\r\n`);
        
        if (element.description) {
            let lines = element.description.split(/\r?\n/);
            lines.forEach(line => output.push(`${indentation} * ${line}\r\n`));
        }

        output.push(`${indentation} */\r\n`);
    }

    private generateEnumContent(output: string[], symbol: ui5.SymbolEnum): void
    {
        (symbol.properties || []).forEach(p => {
            this.printTsDoc(output, p, 1);
            output.push(`${this.indentation}    ${p.name} = "${p.name}",\r\n`);
        });
    }

}
