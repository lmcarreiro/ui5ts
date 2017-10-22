import * as ui5     from "../../ui5api";
import Config       from "../../GeneratorConfig";

export default abstract class TreeNode {

    protected isJQueryNamespace: boolean;

    protected config: Config;
    protected indentation: string;

    //TODO:check if it could be protected
    public name: string;
    public fullName: string;

    protected constructor(config: Config, indentationLevel: number, obj: { basename: string, name: string })
    protected constructor(config: Config, indentationLevel: number, name: string, parentName: string)
    protected constructor(config: Config, indentationLevel: number, objOrName: string|{ basename: string, name: string }, parentName?: string) {
        this.config = config;
        this.indentation = new Array(indentationLevel + 1).join(this.config.output.indentation);
        
        if (typeof objOrName === "object") {
            this.name = objOrName.basename;
            this.fullName = objOrName.name;
        }
        else if (parentName) {
            this.name = objOrName;
            this.fullName = `${parentName}.${objOrName}`;
        }
        else {
            throw new Error("Wrong arguments.");
        }

        // fix some names that has a dot in the middle
        this.name = this.name.replace(/^.*[.]/, "");

        this.isJQueryNamespace = !!this.fullName.match(/^jQuery/);
        if (this.isJQueryNamespace) {
            this.indentation = parentName ? this.config.output.indentation : "";
        }
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

    protected replaceVisibility(visibility: ui5.Visibility): ui5.Visibility {
        return <ui5.Visibility>visibility.replace(ui5.Visibility.Restricted, ui5.Visibility.Protected);
    }

    //TODO:check if it could be protected
    public getJQueryFullName(): string {
        return this.fullName === "jQuery"
            ? "JQueryStatic"
            : this.fullName
                .split(".")
                .map(p => p[0].toUpperCase() + p.slice(1))
                .join("");
    }
}