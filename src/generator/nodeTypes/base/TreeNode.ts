import * as ui5     from "../../ui5api";

export default abstract class TreeNode {
    private static indentationStr = "    ";

    protected indentation: string;

    protected constructor(indentationLevel: number) {
        this.indentation = new Array(indentationLevel + 1).join(TreeNode.indentationStr);
    }

    public abstract generateTypeScriptCode(output: string[]): void;

    protected printTsDoc(output: string[], description?: string, additionalDocInfo?: string[]): void
    {
        output.push(`${this.indentation}/**\r\n`);

        if (description) {
            let lines = description.split(/\r|\n|\r\n/g);
            lines.forEach(line => output.push(`${this.indentation} * ${line}\r\n`));
        }

        if (additionalDocInfo) {
            additionalDocInfo.forEach(info => output.push(`${this.indentation} * ${info}\r\n`));
        }

        output.push(`${this.indentation} */\r\n`);
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

    protected overrideMethodParameter(parentName: string, method: ui5.Method, parameter: ui5.Parameter): string
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