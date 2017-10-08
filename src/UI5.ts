/**
 * Convert a class definition to the UI5 format of inheritance. This decorator can only be used in a class that extends from
 * another UI5 class. If your class doesn't extends from any other, don't use this decorator or make your class extend from
 * sap.ui.base.Object
 * @param name Full name of the class. This parameter will be passed to BaseClass.extend(name, ...) method at runtime.
 */
function UI5(name: string): Function
{
    return function (target: FunctionConstructor): FunctionConstructor
    {
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
