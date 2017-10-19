import * as ui5 from "../ui5api";
import Config   from "../GeneratorConfig";
import TreeNode from "./base/TreeNode";

export default class Property extends TreeNode {

    private content: ui5.Property;

    constructor(config: Config, apiSymbol: ui5.Property, indentationLevel: number) {
        super(config, indentationLevel);

        this.content = apiSymbol;
    }

    public generateTypeScriptCode(output: string[]): void {
        let property = this.content;

        let visibilityModifier = property.visibility.replace(ui5.Visibility.Restricted, ui5.Visibility.Protected) + " ";
        let staticModifier = property.static ? "static " : "";

        this.printTsDoc(output, property.description);
        output.push(`${this.indentation}${visibilityModifier}${staticModifier}${property.name}: ${property.type};\r\n`);
    }

}
