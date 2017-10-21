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
        type = TypeUtil.replaceTypes(type, config, methodFullName);

        this.returnValue = { type, description };
    }

    public generateTypeScriptCode(output: string[]): void {
        this.printTsDoc(output);
        this.printMethodOverloads(output, this.parameters || []);
    }

    private printMethodOverloads(output: string[], parameters: Parameter[]): void {
        let firstOptional: number|undefined;
        for (let i = 0; i < parameters.length; i++) {
            if (!firstOptional && parameters[i].isOptional()) {
                firstOptional = i;
            }
            else if (firstOptional !== undefined && !parameters[i].isOptional()) {
                // optional parameter followed by required parameter
                this.printMethodOverloads(output, parameters.filter((p, k) => k !== firstOptional));
                this.printMethodOverloads(output, parameters.map((p, k) => k !== firstOptional ? p : p.asRequired()));
                return;
            }
        }

        let visibilityModifier = this.visibility.replace(ui5.Visibility.Restricted, ui5.Visibility.Protected) + " ";
        let staticModifier = this.static ? "static " : "";

        let parametersCode = parameters.map(p => p.getTypeScriptCode());
        output.push(`${this.indentation}${visibilityModifier}${staticModifier}${this.name}(${parametersCode.join(", ")}): ${this.returnValue.type};\r\n`);
    }

    protected printTsDoc(output: string[]): void {
        let docInfo = (this.parameters || []).map(p => p.getTsDoc().replace(/\r\n|\r|\n/g, " "));

        if (this.returnValue.type !== "void") {
            docInfo.push(`@returns {${this.returnValue.type}} ${this.returnValue.description}`.replace(/\r\n|\r|\n/g, " "));
        }

        super.printTsDoc(output, this.description, docInfo);
    }

}
