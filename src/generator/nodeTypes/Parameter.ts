import * as ui5 from "../ui5api";
import Config   from "../GeneratorConfig";
import TypeUtil from "../util/TypeUtil";

export default class Parameter {

    private constructorArgs: any[];

    private name: string;
    private type: string;
    private optional: boolean;
    private description: string;

    constructor(config: Config, parameter: ui5.Parameter, parentName: string) {
        //save constructor arguments to reinstantiate if needed
        this.constructorArgs = [].slice.call(arguments);

        let parameterTypeReplacement = config.replacements.specific.methodParameterType[`${parentName}.${parameter.name}`];

        this.name = parameter.name;
        this.type = TypeUtil.replaceTypes(parameterTypeReplacement || parameter.type, config);
        this.optional = parameter.optional || false;
        this.description = parameter.description || "";
    }

    public getTypeScriptCode(): string {
        return `${this.name.replace(/<[^>]+>/g, "")}${this.optional ? "?" : ""}: ${this.type}`;
    }

    public getTsDoc(): string {
        let description = this.description ? ` - ${this.description}` : "";
        return `@param {${this.type}} ${this.name}${description}`;
    }

    public isOptional(): boolean {
        return this.optional;
    }

    public asRequired(): Parameter {
        if (!this.optional) {
            throw new Error("This parameter is already required");
        }

        var parameterConstructor: { new(...args: any[]): Parameter } = Parameter;
        var parameterAsRequired = new parameterConstructor(...this.constructorArgs);
        parameterAsRequired.optional = false;
        return parameterAsRequired;
    }
}
