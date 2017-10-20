import * as ui5 from "../ui5api";
import Config   from "../GeneratorConfig";

export default class Parameter {

    private name: string;
    private type: string;
    private optional: boolean;
    private description: string;

    constructor(config: Config, parameter: ui5.Parameter, parentName: string) {
        let parameterTypeReplacement = config.replacements.specific.methodParameterType[`${parentName}.${parameter.name}`];

        this.name = parameter.name;
        this.type = parameterTypeReplacement || parameter.type;
        this.optional = parameter.optional || false;
        this.description = parameter.description || "";
    }

    public getTypeScriptCode(): string {
        return `${this.name.replace(/<[^>]+>/g, "")}${this.optional ? "?" : ""}: ${this.type}`;
    }

    public getTsDoc(): string {
        return `@param {${this.type}} ${this.name} - ${this.description}`;
    }

}
