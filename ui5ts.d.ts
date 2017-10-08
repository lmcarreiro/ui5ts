/**
 * Translates a typescript generated define() call to a sap.ui.define() taking out the 'require' and 'exports' dependencies
 * @param aDependencies array of dependencies, including 'require' as first and 'exports' as second.
 * @param vFactory factory function with dependencies arguments, including 'require' as first and 'exports' as second.
 * @returns UI5 module.
 */
declare function define(aDependencies: string[], vFactory: (...args: any[]) => any): any;
/**
 * Convert a class definition to the UI5 format of inheritance. This decorator can only be used in a class that extends from
 * another UI5 class. If your class doesn't extends from any other, don't use this decorator or make your class extend from
 * sap.ui.base.Object
 * @param name Full name of the class. This parameter will be passed to BaseClass.extend(name, ...) method at runtime.
 */
declare function UI5(name: string): Function;
