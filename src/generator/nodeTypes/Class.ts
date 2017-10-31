import * as ui5 from "../ui5api";
import Config   from "../GeneratorConfig";
import TypeUtil from "../util/TypeUtil";
import TreeNode from "./base/TreeNode";
import Property from "./Property";
import Method   from "./Method";




// typescript bug?
declare function f(a: string, c: string): void;
function a(x: string, map1: Map<string, string>, map2: Map<string, string[]>): void {
    let a = map1.get(x);
    let b = map2.get(x);
    if (a && b) {
        b.forEach(c => f(a, c));
    }
}




export default class Class extends TreeNode {
    private description: string;
    private baseClass: string;
    private properties: Property[];
    private methods: Method[];
    private children: TreeNode[];

    constructor(config: Config, apiSymbol: ui5.SymbolClass, children: TreeNode[], indentationLevel: number) {
        super(config, indentationLevel, apiSymbol);

        this.children = children;

        this.description = apiSymbol.description || "";
        this.baseClass = apiSymbol.extends ? TypeUtil.replaceTypes(apiSymbol.extends, config, this.fullName)  : "";
        this.properties = (apiSymbol.properties || []).map(m => new Property(this.config, m, this.fullName, indentationLevel + 1, ui5.Kind.Class));
        this.methods    = (apiSymbol.methods    || []).map(m => new Method  (this.config, m, this.fullName, indentationLevel + 1, ui5.Kind.Class));

        if (typeof(apiSymbol.constructor) === "object") {
            let constructorSymbol = Object.assign(apiSymbol.constructor, { name: "constructor" });
            let constructor = new Method(this.config, constructorSymbol, this.fullName, indentationLevel + 1, ui5.Kind.Class)
            this.methods = [constructor].concat(this.methods);
        }
    }

    public generateTypeScriptCode(output: string[]): void {
        if (this.isJQueryNamespace) {
            this.generateTypeScriptCodeJQuery(output);
        }
        else {
            this.generateTypeScriptCodeSap(output);
        }
    }

    private generateTypeScriptCodeSap(output: string[]): void {
        let extend = this.baseClass ? ` extends ${this.baseClass}` : "";

        this.printTsDoc(output, this.description);
        output.push(`${this.indentation}export class ${this.name}${extend} {\r\n`);
        this.properties.forEach(p => p.generateTypeScriptCode(output));
        this.methods.forEach(m => m.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);

        if (this.children.length) {
            output.push(`${this.indentation}namespace ${this.name} {\r\n`);
            this.children.forEach(c => c.generateTypeScriptCode(output));
            output.push(`${this.indentation}}\r\n`);
        }
    }
    
    private generateTypeScriptCodeJQuery(output: string[]): void {
        var jQueryFullName = this.getJQueryFullName();
        let extend = this.baseClass ? ` extends ${this.baseClass}` : "";

        this.printTsDoc(output, this.description);
        output.push(`${this.indentation}declare class ${jQueryFullName}${extend} {\r\n`);
        this.properties.forEach(p => p.generateTypeScriptCode(output));
        this.methods.forEach(m => m.generateTypeScriptCode(output));
        //TODO: support class children (there is only one case, it's an enum. Could be converted in a static object literal)
        //this.children.forEach(c => c.generateTypeScriptCode(output));
        output.push(`${this.indentation}}\r\n`);
    }

    public static fixMethodsOverrides(nodes: TreeNode[]): void {
        let instancesByName: Map<string, Class> = new Map();
        let instancesByBaseClass: Map<string, Class[]> = new Map();

        Class.fillInstancesMaps(nodes, instancesByName, instancesByBaseClass);

        for (let baseClassName in instancesByBaseClass) {
            let baseClass = instancesByName.get(baseClassName);
            if (baseClass && !baseClass.baseClass) {
                Class.fixMethodsOverridesByBaseClass(baseClassName, instancesByName, instancesByBaseClass);
            }
        }
    }

    private static fillInstancesMaps(nodes: TreeNode[], instancesByName: Map<string, Class>, instancesByBaseClass: Map<string, Class[]>): any {
        for (let node of nodes) {
            if (node instanceof Class) {
                if (instancesByName.has(node.fullName)) {
                    throw new Error(`Class '${node.fullName}' is already in the map.`);
                }
                instancesByName.set(node.fullName, node);

                if (node.baseClass && node.baseClass.match(/\./)) {
                    let arr = instancesByBaseClass.get(node.baseClass) || [];
                    arr.push(node);
                    instancesByBaseClass.set(node.baseClass, arr);
                }
            }
            
            let children = (<any>node).children;
            if (children) {
                this.fillInstancesMaps(children, instancesByName, instancesByBaseClass);
            }
        }
    }

    private static fixMethodsOverridesByBaseClass(baseClassName: string, instancesByName: Map<string, Class>, instancesByBaseClass: Map<string, Class[]>): void {
        let baseClass = instancesByName.get(baseClassName);
        let subClasses = instancesByBaseClass.get(baseClassName);
        if (baseClass && subClasses) {
            subClasses.forEach(subClass => Class.fixMethodsOverridesFor(baseClass, subClass));
        }
    }

    private static fixMethodsOverridesFor(baseClass: Class, subClass: Class): void {
        subClass.methods.forEach(method => {
            let methodOverrided = Class.findMethodInBaseClassHierarchy(baseClass, method.name);
            if (methodOverrided) {
                let returnTypeMethod = method.returnValue.type;
                let returnTypeMethodOverrided = methodOverrided.returnValue.type;

                let newReturnType: string|undefined;
                if (!Class.checkTypeCompatibility(returnTypeMethodOverrided, returnTypeMethod)) {
                    // for "return this" methods
                    if (returnTypeMethodOverrided === baseClass.fullName) {
                        if (returnTypeMethod !== subClass.fullName) {
                            newReturnType = subClass.fullName; // "return this" in this case it's the subClass
                        }
                    }
                    // for "return somethingElse" methods
                    else {
                        newReturnType = methodOverrided.returnValue.type;
                    }
                }

                if (newReturnType && newReturnType !== "any") {
                    //console.log(`${++Class.changesCount} - ${method.fullName}: Replacing return type from '${method.returnValue.type}' to '${newReturnType}' to match the same method in base class '${baseClass.fullName}'.`);
                    method.returnValue.type = newReturnType;
                }

                if (methodOverrided.visibility === ui5.Visibility.Public && method.visibility === ui5.Visibility.Protected) {
                    method.visibility = ui5.Visibility.Public;
                }
            }
        });

        Class.fixMethodsOverrides(subClass.fullName);
    }
    private static changesCount = 0;

    private static findMethodInBaseClassHierarchy(baseClass: Class|undefined, name: string): Method|undefined {
        if (!baseClass) return;

        let baseBaseClass = instancesByName[baseClass.baseClass];
        return baseClass.methods.find(m => m.name === name) || Class.findMethodInBaseClassHierarchy(baseBaseClass, name);
    }

    private static checkTypeCompatibility(baseType: string, subType: string): boolean {
        if (baseType === subType) {
            return true;
        }

        let baseClass = instancesByName[baseType];
        let subClass = instancesByName[subType];

        if (baseClass && subClass) {
            do {
                if (subClass.name === baseClass.name) {
                    return true;
                }
                subClass = instancesByName[subClass.baseClass];
            } while(subClass);
        }

        return false;
    }
}
