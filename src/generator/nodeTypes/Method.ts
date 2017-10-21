import * as ui5     from "../ui5api";
import Config       from "../GeneratorConfig";
import TypeUtil     from "../util/TypeUtil";
import TreeNode     from "./base/TreeNode";
import Parameter    from "./Parameter";

export default class Method extends TreeNode {

    private visibility: ui5.Visibility;
    private static: boolean;
    private name: string;
    private description: string;
    private parameters: Parameter[];
    private returnValue: { type: string, description: string };

    constructor(config: Config, method: ui5.Method, parentName: string, indentationLevel: number) {
        super(config, indentationLevel);

        let methodFullName = `${parentName}.${method.name}`;
        let returnTypeReplacement = config.replacements.specific.methodReturnType[methodFullName];

        this.visibility = super.replaceVisibility(method.visibility);
        this.static = method.static || false;
        this.name = method.name;
        this.description = method.description || "";
        this.parameters = (method.parameters || []).map(p => new Parameter(this.config, p, methodFullName));
        
        let description = (method.returnValue && method.returnValue.description) || "";
        let type = returnTypeReplacement || (method.returnValue && method.returnValue.type) || (description ? "any" : "void");
        type = TypeUtil.replaceTypes(type, config);

        this.returnValue = { type, description };
    }

    public generateTypeScriptCode(output: string[]): void {
        let visibilityModifier = this.visibility.replace(ui5.Visibility.Restricted, ui5.Visibility.Protected) + " ";
        let staticModifier = this.static ? "static " : "";

        this.printTsDoc(output);

        let parameters = (this.parameters || []).map(p => p.getTypeScriptCode());
        output.push(`${this.indentation}${visibilityModifier}${staticModifier}${this.name}(${parameters.join(", ")}): ${this.returnValue.type};\r\n`);
    }

    protected printTsDoc(output: string[]): void {
        let docInfo = (this.parameters || []).map(p => p.getTsDoc());

        if (this.returnValue.type !== "void") {
            docInfo.push(`@returns {${this.returnValue.type}} ${this.returnValue.description}`);
        }

        super.printTsDoc(output, this.description, docInfo);
    }

}
