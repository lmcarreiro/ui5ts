function UI5(name: string): any {
    return function (target: FunctionConstructor, propertyKey: string, descriptor: PropertyDescriptor) {
        var functionMembers: string[] = Object.getOwnPropertyNames(function () {});
        var staticMembers:   string[] = Object.getOwnPropertyNames(target).filter(o => functionMembers.indexOf(o) === -1);
        var instanceMethods: string[] = Object.getOwnPropertyNames(target.prototype);
        
        var baseClass: any = Object.getPrototypeOf(target); // it is the same as: baseClass = target.__proto__;

        var thisClass: any = {};
        staticMembers  .forEach(m => thisClass[m] = (<any>target)[m]);
        instanceMethods.forEach(m => thisClass[m] = (<any>target.prototype)[m]);

        if (typeof baseClass.extend === "function") {
            return baseClass.extend(name, thisClass);
        }
        else {
            throw new Error("This class doesn't inherit from a UI5 class");
        }
    }
}
