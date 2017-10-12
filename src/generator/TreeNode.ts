import * as ui5 from './ui5api';

type TreeNodeConstructor<T extends TreeNode<T>> = new(content: ui5.Symbol, indentationLevel: number, parent: T|null) => T;

export default abstract class TreeNode<T extends TreeNode<T>>
{
    protected content: ui5.Symbol;
    protected indentationLevel: number;
    protected parent: T|null;
    protected children: T[];

    protected indentation: string;

    public constructor(content: ui5.Symbol, indentationLevel: number, parent: T|null)
    {
        this.content = content;
        this.indentationLevel = indentationLevel;
        this.parent = parent;
        this.children = [];

        //let isNestedClass = parent && parent.content.kind === ui5.Kind.Class && content.kind === ui5.Kind.Class;
        this.indentation = new Array(indentationLevel + 1/* + (isNestedClass ? 1 : 0)*/).join("    ");
    }

    protected addChild(child: T): TreeNode<T>
    {
        this.children.push(child);
        return this;
    }

    public abstract generateTypeScriptCode(output: string[]): void;

    public static createFromSymbolsArray<T extends TreeNode<T>>(treeType: TreeNodeConstructor<T>, symbols: ui5.Symbol[], parent: T|null, indentationLevel: number): T
    {
        let content = symbols[0];
        let rest = symbols.slice(1);

        let childrenByParent: { [name: string]: ui5.Symbol[] } = {};

        let lastParent: string|undefined;
        for (let s of rest) {
            if (!lastParent || !s.name.startsWith(lastParent + ".")) {
                lastParent = s.name;
                childrenByParent[lastParent] = [];
            }

            childrenByParent[lastParent].push(s);
        }

        var treeNode: T = new treeType(content, indentationLevel, parent);

        let children: T[] = [];
        for (let nextParent in childrenByParent) {
            var child = TreeNode.createFromSymbolsArray<T>(treeType, childrenByParent[nextParent], treeNode, indentationLevel + 1);
            treeNode.addChild(child);
        }

        return treeNode;
    }
}
