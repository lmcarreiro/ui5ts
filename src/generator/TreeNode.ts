import * as ui5 from './ui5api';

interface TreeNodeConstructor<T extends TreeNode<T>> {
    new(content: ui5.Symbol, indentationLevel: number, parent: T|null): T;
}

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

    protected addChildren(children: T[]): TreeNode<T>
    {
        this.children = this.children.concat(children);
        return this;
    }

    public abstract generateTypeScriptCode(output: string[]): void;

    public static createFromSymbolsArray<T extends TreeNode<T>>(treeType: TreeNodeConstructor<T>, symbols: ui5.Symbol[], parent: T|null, indentationLevel: number): T[]
    {
        let nodes: T[] = [];
        let namespaces = new Set<string>();
        symbols
            .map(s => s.name.split(".").slice(0, indentationLevel + 1).join("."))
            .forEach(n => namespaces.add(n));

        for (var namespace of namespaces) {
            var parentSymbol = symbols.find(s => s.name === namespace) || <ui5.SymbolNamespace>{
                name: namespace
                , basename: namespace.replace(/^.*[.]/, "")
                , kind: ui5.Kind.Namespace
            };
            var childrenSymbols = symbols.filter(s => s.name.startsWith(namespace + "."));

            var newNode: T = new treeType(parentSymbol, indentationLevel, parent);
            var children = TreeNode.createFromSymbolsArray<T>(treeType, childrenSymbols, newNode, indentationLevel + 1);

            newNode.addChildren(children);

            nodes.push(newNode);
        }

        return nodes;
    }
}
