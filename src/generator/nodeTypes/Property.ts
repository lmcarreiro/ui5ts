import * as ui5     from "../ui5api";
import Config       from "../GeneratorConfig";
import TypeUtil     from "../util/TypeUtil";
import TreeNode     from "./base/TreeNode";

export default class Property extends TreeNode {

    private visibility: ui5.Visibility;
    private static: boolean;
    private description: string;
    private type: string;

    private parentKind: ui5.Kind;

    constructor(config: Config, property: ui5.Property, parentName: string, indentationLevel: number, parentKind: ui5.Kind) {
        super(config, indentationLevel, property.name, parentName);

        this.visibility = super.replaceVisibility(property.visibility);
        this.static = property.static || false;
        this.description = property.description || "";

        let typeReplacement = config.replacements.specific.propertyType[this.fullName];

        this.type = typeReplacement || TypeUtil.replaceTypes(property.type, config, this.fullName);

        this.parentKind = parentKind;
    }

    public generateTypeScriptCode(output: string[]): void {
        let declaration: string;
        
        switch (this.parentKind) {
            case ui5.Kind.Namespace:
                declaration = "var ";
                break;
            case ui5.Kind.Interface:
                declaration = "";
                break;
            case ui5.Kind.Class:
                let visibilityModifier = this.visibility.replace(ui5.Visibility.Restricted, ui5.Visibility.Protected) + " ";
                let staticModifier = this.static ? "static " : "";
                declaration = visibilityModifier + staticModifier;
                break;
            case ui5.Kind.Enum:
                throw new Error(`Enum kind should use the class EnumProperty instead of Property.`);
            default:
                throw new Error(`UI5 kind '${this.parentKind}' cannot have properties.`);
        }

        this.printTsDoc(output, this.description);
        output.push(`${this.indentation}${declaration}${this.name}: ${this.type};\r\n`);
    }
}
