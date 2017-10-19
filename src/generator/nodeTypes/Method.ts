import * as ui5 from "../ui5api";
import Config   from "../GeneratorConfig";
import TreeNode from "./base/TreeNode";

export default class Method extends TreeNode {

    private visibility: ui5.Visibility;
    private static: boolean;
    private name: string;
    private description: string;
    private parameters: ui5.Parameter[];
    private returnValue: ui5.ReturnValueInfo;

    constructor(config: Config, apiSymbol: ui5.Method, indentationLevel: number) {
        super(config, indentationLevel);

        this.visibility = super.replaceVisibility(apiSymbol.visibility);
        this.static = apiSymbol.static || false;
        this.name = apiSymbol.name;
        this.description = apiSymbol.description || "";
        this.parameters = apiSymbol.parameters || [];
        this.returnValue = apiSymbol.returnValue || {};
        this.returnValue.type = this.returnValue.type || "void";
    }

    public generateTypeScriptCode(output: string[]): void {
        let visibilityModifier = this.visibility.replace(ui5.Visibility.Restricted, ui5.Visibility.Protected) + " ";
        let staticModifier = this.static ? "static " : "";
        let parameters = (this.parameters || []).map(p => `${p.name.replace(/<[^>]+>/g, "")}${p.optional ? "?" : ""}: ${p.type}`);

        this.printTsDoc(output);
        output.push(`${this.indentation}${visibilityModifier}${staticModifier}${this.name}(${parameters.join(", ")}): ${this.returnValue.type};\r\n`);
    }

    protected printTsDoc(output: string[]): void {
        let docInfo: string[] = [];

        (this.parameters || []).forEach(p => {
            docInfo.push(`@param {${p.type}} ${p.name} - ${p.description}`);
        });

        let returnType = this.returnValue.type ? `{${this.returnValue.type}}` : "";
        let returnDescription = this.returnValue.description ? this.returnValue.description : "";
        if (returnType !== "void") {
            docInfo.push(`@returns ${returnType} ${returnDescription}`);
        }

        super.printTsDoc(output, this.description, docInfo);
    }

}
