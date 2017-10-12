import * as ui5 from './ui5api';

export default abstract class TreeNode<T extends TreeNode<T>>
{
    protected content: ui5.Symbol;
    protected indentationLevel: number;
    protected children: T[];

    protected indentation: string;

    protected constructor(content: ui5.Symbol, indentationLevel: number, children: T[])
    {
        this.content = content;
        this.indentationLevel = indentationLevel;
        this.children = children;

        this.indentation = new Array(indentationLevel + 1).join("    ");
    }

    public abstract generateTypeScriptCode(output: string[]): void;

    public static createFromSymbolsArray<T extends TreeNode<T>>(treeType: any, symbols: ui5.Symbol[], parent: string, indentationLevel: number): T
    {
        let content = symbols[0];
        let rest = symbols.slice(1);

        let childrenByParent: { [name: string]: ui5.Symbol[] } = {};

        let lastParent: string|undefined;
        for (let s of rest) {
            if (!lastParent || !s.name.startsWith(lastParent)) {
                lastParent = s.name;
                childrenByParent[lastParent] = [];
            }

            childrenByParent[lastParent].push(s);
        }

        let children: T[] = [];
        for (let nextParent in childrenByParent) {
            var child = TreeNode.createFromSymbolsArray<T>(treeType, childrenByParent[nextParent], nextParent, indentationLevel + 1);
            children.push(child);
        }

        return new treeType(content, indentationLevel, children);
    }
}
