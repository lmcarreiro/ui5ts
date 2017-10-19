import * as ui5 from "../ui5api";
import TreeNode from "./base/TreeNode";

export default class EnumProperty extends TreeNode {

    private content: ui5.Property;

    constructor(apiSymbol: ui5.Property, indentationLevel: number) {
        super(indentationLevel);

        this.content = apiSymbol;
    }

    public generateTypeScriptCode(output: string[]): void {
        let property = this.content;

        this.printTsDoc(output, property.description);
        output.push(`${this.indentation}${property.name} = "${property.name}",\r\n`);
    }

}
