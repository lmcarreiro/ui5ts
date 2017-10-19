import * as ui5 from "../ui5api";
import Config   from "../GeneratorConfig";
import TreeNode from "./base/TreeNode";

export default class Namespace extends TreeNode {

    private name: string;
    private fullName: string;
    private description: string;
    private children: TreeNode[];

    constructor(config: Config, apiSymbol: ui5.SymbolNamespace, children: TreeNode[], indentationLevel: number) {
        super(config, indentationLevel);

        this.name = apiSymbol.basename;
        this.fullName = apiSymbol.name;
        this.description = apiSymbol.description || "";
        this.children = children;
    }

    public generateTypeScriptCode(output: string[]): void {
        var type = this.config.replacements.specific[this.fullName];

        if (!type) {
            let declare = !this.indentation ? "declare " : "";

            this.printTsDoc(output, this.description);
            output.push(`${this.indentation}${declare}namespace ${this.name} {\r\n`);
            this.children.forEach(c => c.generateTypeScriptCode(output));
            output.push(`${this.indentation}}\r\n`);
        }
        else {
            output.push(`${this.indentation}export type ${this.name} = ${type};\r\n`);
        }
    }

}
