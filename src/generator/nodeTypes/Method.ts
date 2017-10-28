import * as ui5     from "../ui5api";
import Config       from "../GeneratorConfig";
import TypeUtil     from "../util/TypeUtil";
import TreeNode     from "./base/TreeNode";
import Parameter    from "./Parameter";

export default class Method extends TreeNode {

    public visibility: ui5.Visibility;
    private static: boolean;
    private description: string;
    public parameters: Parameter[];
    public returnValue: { type: string, description: string };

    private parentKind: ui5.Kind;

    constructor(config: Config, method: ui5.Method, parentName: string, indentationLevel: number, parentKind: ui5.Kind) {
        super(config, indentationLevel, method.name, parentName);

        this.visibility = super.replaceVisibility(method.visibility);
        this.static = method.static || false;
        this.description = method.description || "";
        this.parameters = (method.parameters || []).map(p => new Parameter(this.config, p, this.fullName));

        let returnTypeReplacement = config.replacements.specific.methodReturnType[this.fullName];
        
        let description = (method.returnValue && method.returnValue.description) || "";
        let type = returnTypeReplacement || (method.returnValue && method.returnValue.type) || (description ? "any" : "void");
        type = TypeUtil.replaceTypes(type, config, this.fullName);

        this.returnValue = { type, description };

        this.parentKind = parentKind;
    }

    public generateTypeScriptCode(output: string[]): void {
        this.printTsDoc(output);
        this.printMethodOverloads(output, this.parameters || []);
        this.printCompatibilityMethodOverload(output);
    }

    private printCompatibilityMethodOverload(output: string[]): void {
        if (this.config.replacements.specific.methodOverridesNotCompatible.indexOf(this.fullName) > -1) {
            let symbol: ui5.Parameter = {
                name: "args",
                type: "any[]",
                spread: true
            };
            let comment = "This method overload is here just for compatibility with the overrided methods in base classes";
            this.print(output, [new Parameter(this.config, symbol, this.fullName)], comment);
        }
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

        this.print(output, parameters);
    }

    private print(output: string[], parameters: Parameter[], comment?: string): void {
        let declaration: string;

        switch (this.parentKind) {
            case ui5.Kind.Namespace:
                declaration = "function ";
                break;
            case ui5.Kind.Interface:
                declaration = "";
                break;
            case ui5.Kind.Class:
                let visibilityModifier = this.visibility.replace(ui5.Visibility.Restricted, ui5.Visibility.Protected) + " ";
                let staticModifier = this.static ? "static " : "";
                declaration = visibilityModifier + staticModifier;
                break;
            default:
                throw new Error(`UI5 kind '${this.parentKind}' cannot have methods.`);
        }

        comment = comment ? ` // ${comment}` : "";

        let parametersCode = parameters.map(p => p.getTypeScriptCode());
        let returnType = this.name !== "constructor" ? `: ${this.returnValue.type}` : "";
        output.push(`${this.indentation}${declaration}${this.name}(${parametersCode.join(", ")})${returnType};${comment}\r\n`);
    }

    protected printTsDoc(output: string[]): void {
        let docInfo = (this.parameters || []).map(p => p.getTsDoc().replace(/\r\n|\r|\n/g, " "));

        if (this.returnValue.type !== "void") {
            docInfo.push(`@returns {${this.returnValue.type}} ${this.returnValue.description}`.replace(/\r\n|\r|\n/g, " "));
        }

        super.printTsDoc(output, this.description, docInfo);
    }

}
