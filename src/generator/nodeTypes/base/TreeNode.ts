import * as ui5     from "../../ui5api";
import Config       from "../../GeneratorConfig";

export default abstract class TreeNode {
    protected config: Config;
    protected indentation: string;

    protected constructor(config: Config, indentationLevel: number) {
        this.config = config;
        this.indentation = new Array(indentationLevel + 1).join(this.config.output.indentation);
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
}