import * as ui5     from "../../ui5api";
import TreeNode     from "./TreeNode";
import Namespace    from "../Namespace";
import Class        from "../Class";
import Interface    from "../Interface";
import Enum         from "../Enum";

export default class TreeBuilder {

    public static createFromSymbolsArray(symbols: ui5.Symbol[]): TreeNode
    {
        let root = TreeBuilder.createNodeChildren(symbols, 0)[0];
        return root;
    }

    private static createNode(symbol: ui5.Symbol, children: TreeNode[], indentationLevel: number): TreeNode {
        switch (symbol.kind) {
            case ui5.Kind.Namespace: return new Namespace   (symbol, children, indentationLevel);
            case ui5.Kind.Class:     return new Class       (symbol, children, indentationLevel);
            case ui5.Kind.Interface: return new Interface   (symbol, children, indentationLevel);
            case ui5.Kind.Enum:      return new Enum        (symbol, children, indentationLevel);
            default: throw new Error("Unknown symbol kind.");
        }
    }

    private static createNodeChildren(symbols: ui5.Symbol[], indentationLevel: number): TreeNode[]
    {
        let nodes: TreeNode[] = [];
        let namespaces = new Set<string>();

        symbols
            .map(s => s.name.split(".").slice(0, indentationLevel + 1).join("."))
            .forEach(n => namespaces.add(n));

        for (var namespace of namespaces) {
            var parentSymbol = symbols.find(s => s.name === namespace) || <ui5.SymbolNamespace>{
                kind: ui5.Kind.Namespace
                , visibility: ui5.Visibility.Public
                , name: namespace
                , basename: namespace.replace(/^.*[.]/, "")
                , module: ""
                , resource: ""
            };
            var childrenSymbols = symbols.filter(s => s.name.startsWith(namespace + "."));

            var children = TreeBuilder.createNodeChildren(childrenSymbols, indentationLevel + 1);
            var newNode = TreeBuilder.createNode(parentSymbol, children, indentationLevel);

            nodes.push(newNode);
        }

        return nodes;
    }
}