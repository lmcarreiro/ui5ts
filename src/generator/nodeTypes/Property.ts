import * as ui5 from "../ui5api";
import Config   from "../GeneratorConfig";
import TreeNode from "./base/TreeNode";

export default class Property extends TreeNode {

    private visibility: ui5.Visibility;
    private static: boolean;
    private name: string;
    private type: string;
    private description: string;

    constructor(config: Config, apiSymbol: ui5.Property, indentationLevel: number) {
        super(config, indentationLevel);

        this.visibility = super.replaceVisibility(apiSymbol.visibility);
        this.static = apiSymbol.static || false;
        this.name = apiSymbol.name;
        this.type = apiSymbol.type;
        this.description = apiSymbol.description || "";
    }

    public generateTypeScriptCode(output: string[]): void {
        let visibilityModifier = this.visibility + " ";
        let staticModifier = this.static ? "static " : "";

        this.printTsDoc(output, this.description);
        output.push(`${this.indentation}${visibilityModifier}${staticModifier}${this.name}: ${this.type};\r\n`);
    }

}
