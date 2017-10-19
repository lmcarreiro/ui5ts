import * as ui5 from "../ui5api";
import Config   from "../GeneratorConfig";
import TreeNode from "./base/TreeNode";

export default class Method extends TreeNode {

    private content: ui5.Method;

    constructor(config: Config, apiSymbol: ui5.Method, indentationLevel: number) {
        super(config, indentationLevel);

        this.content = apiSymbol;
    }

    public generateTypeScriptCode(output: string[]): void {
        let method = this.content;

        let visibilityModifier = method.visibility.replace(ui5.Visibility.Restricted, ui5.Visibility.Protected) + " ";
        let staticModifier = method.static ? "static " : "";
        let returnType = (method.returnValue && method.returnValue.type) || "void";
        let parameters = (method.parameters || []).map(p => `${p.name.replace(/<[^>]+>/g, "")}${p.optional ? "?" : ""}: ${p.type}`);

        this.printTsDoc(output);
        output.push(`${this.indentation}${visibilityModifier}${staticModifier}${method.name}(${parameters.join(", ")}): ${returnType};\r\n`);
    }

    protected printTsDoc(output: string[]): void {
        let method = this.content;
        let docInfo: string[] = [];

        (method.parameters || []).forEach(p => {
            docInfo.push(`@param {${p.type}} ${p.name} - ${p.description}.`);
        });

        if (method.returnValue) {
            docInfo.push(`@returns {${method.returnValue.type}} ${method.returnValue.description}.`);
        }

        super.printTsDoc(output, method.description, docInfo);
    }

}
