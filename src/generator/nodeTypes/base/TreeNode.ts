import * as ui5     from "../../ui5api";
import Namespace    from "../Namespace";
import Class        from "../Class";
import Interface    from "../Interface";
import Enum         from "../Enum";

export default abstract class TreeNode {
    private static indentationStr = "    ";

    protected children: TreeNode[];
    protected indentation: string;

    protected constructor(children: TreeNode[], indentationLevel: number) {
        this.children = children;
        this.indentation = new Array(indentationLevel + 1).join(TreeNode.indentationStr);
    }

    public abstract generateTypeScriptCode(output: string[]): void;

    public static createFromSymbolsArray(symbols: ui5.Symbol[]): TreeNode
    {
        let root = TreeNode.createNodeChildren(symbols, 0)[0];
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

            var children = TreeNode.createNodeChildren(childrenSymbols, indentationLevel + 1);
            var newNode = TreeNode.createNode(parentSymbol, children, indentationLevel);

            nodes.push(newNode);
        }

        return nodes;
    }

    protected printTsDoc(output: string[], innerIndentation: number, element: ui5.ApiElement, parent?: ui5.ApiElement): void
    {
        let indentation = this.indentation + new Array(innerIndentation + 1).join("    ");

        output.push(`${indentation}/**\r\n`);
        
        if (element.description) {
            let lines = element.description.split(/\r|\n|\r\n/g);
            lines.forEach(line => output.push(`${indentation} * ${line}\r\n`));
        }
        
        if (parent && (element.parameters || element.returnValue)) {
            let methodOwner = <ui5.SymbolClass|ui5.SymbolInterface|ui5.SymbolNamespace>parent;
            let method = <ui5.Method>element;
            
            (method.parameters || []).forEach(p => {
                output.push(`${indentation} * @param {${this.mapType(this.overrideMethodParameter(methodOwner.name, method, p))}} ${p.name} - ${p.description}.\r\n`);
            });

            if (method.returnValue && parent.name) {
                output.push(`${indentation} * @returns {${this.mapType(this.overrideMethodReturnType(methodOwner.name, method))}} ${method.returnValue.description}.\r\n`);
            }
        }

        output.push(`${indentation} */\r\n`);
    }

    protected mapType(typeName: string): string
    {
        if (typeName.indexOf("|") > -1) {
            return typeName.split("|").map(t => this.mapType(t)).join("|");
        }
        
        switch (typeName) {
            case "function":                    return "Function";
            case "int":                         return "number";
            case "float":                       return "number";
            case "DOMRef":                      return "HTMLElement";
            case "domRef":                      return "HTMLElement";
            case "DomNode":                     return "HTMLElement";
            case "jQuery":                      return "JQuery";
            case "Map":                         return "{ [key: string]: any }";
            case "ODataAnnotations~Source":     return "{ [key: string]: any }";
            case "sap.m.IconTabBarSelectList":  return "sap.m.SelectList";
            default:                            return typeName;
        }
    }

    protected overrideMethodParameter(parentName: string, method: ui5.Method, parameter: ui5.MethodParameter): string
    {
        let fullName = `${parentName}.${method.name}.${parameter.name}`;
        let originalType = parameter.type;

        switch(fullName) {
            case "sap.ui.base.ManagedObject.propagateMessages.aMessages":   return "string[]";
            case "sap.m.P13nConditionPanel.setKeyFields.aKeyFields":        return "{ key: string, text: string }[]";
            case "sap.ui.model.analytics.AnalyticalBinding.sort.aSorter":   return "sap.ui.model.Sorter|sap.ui.model.Sorter[]";
            default:                                                        return originalType;
        }
    }

    protected overrideMethodReturnType(parentName: string, method: ui5.Method): string
    {
        let methodName = parentName + "." + method.name;
        let originalReturnValue = (method.returnValue && method.returnValue.type) || "void";

        switch(methodName) {
            case "sap.m.MenuButton.setTooltip":                             return "sap.m.MenuButton";
            case "sap.m.OverflowToolbar._getVisibleAndNonOverflowContent":  return "sap.ui.core.Control[]";
            case "sap.m.P13nConditionPanel.getKeyFields":                   return "{ key: string, text: string }[]";
            default:                                                        return originalReturnValue;
        }
    }

    protected typeDefinedAsNamespace(namespace: string): string|undefined
    {
        switch(namespace)
        {
            case "sap.ui.core.ID":          return "string";
            case "sap.ui.core.URI":         return "string";
            case "sap.ui.core.CSSSize":     return "string";
            case "sap.ui.core.CSSColor":    return "string";
            default:                        return;
        }
    }
}