export interface API {
    library: string;
    symbols: Symbol[];
    version: string;
}

export type Symbol = SymbolNamespace|SymbolClass|SymbolEnum|SymbolInterface;

export enum Kind {
    Namespace   = "namespace",
    Class       = "class",
    Enum        = "enum",
    Interface   = "interface"
}

export enum Visibility {
    Public      = "public",
    Protected   = "protected",
    Restricted  = "restricted",
}

export interface DeprecatedInfo {
    since?: string;
    text?: string;
}

export interface ExperimentalInfo {
    since?: string;
    text?: string;
}

export interface ExampleInfo {
    caption: string;
    text: string;
}

export interface SymbolBase {

}

export interface SymbolNamespace extends SymbolBase {
    kind: Kind.Namespace;

    visibility: Visibility;

    name: string;
    basename: string;
    module: string;
    resource: string;
    description?: string;

    methods?: Method[];
    properties?: Property[];
    events?: Event[];

    extends?: string;
    export?: string;
    since?: string;
    static?: boolean;// all true
    final?: boolean;// all true
    deprecated?: DeprecatedInfo;
    experimental?: ExperimentalInfo;
}

export interface SymbolClass extends SymbolBase {
    kind: Kind.Class;

    visibility: Visibility;

    name: string;
    basename: string;
    module: string;
    resource: string;
    description?: string;

    events?: Event[];
    methods?: Method[];
    properties?: Property[];

    constructor: ClassContructor;
    abstract?: boolean;// all true
    extends?: string;
    implements?: string[];
    export?: string;
    since?: string;
    static: boolean;// all true
    final?: boolean;
    deprecated?: DeprecatedInfo;
    experimental?: ExperimentalInfo;

    ["ui5-metadata"]?: any;
}

export interface SymbolEnum extends SymbolBase {
    kind: Kind.Enum;

    visibility: Visibility;

    name: string;
    basename: string;
    module: string;
    resource: string;
    description?: string;

    properties?: EnumProperty[];

    export?: string;
    since?: string;
    static: boolean;// all true
    deprecated?: DeprecatedInfo;
    experimental?: ExperimentalInfo;
}

export interface SymbolInterface extends SymbolBase {
    kind: Kind.Interface;
    
    visibility: Visibility;

    name: string;
    basename: string;
    module: string;
    resource: string;
    description?: string;

    events?: Event[];
    methods?: Method[];
    properties?: Property[];

    extends?: string;
    export?: string;
    since?: string;
    static: boolean;// all true
    deprecated?: DeprecatedInfo;
    experimental?: ExperimentalInfo;
}

export interface ClassContructor {
    visibility: Visibility;

    description?: string;
    parameters?: MethodParameter[];
    examples?: ExampleInfo[];
}

export interface EnumProperty {
    name: string;
    visibility: Visibility;
    static: boolean;
    type: string;
}

export interface Method {
    name: string;
    visibility: Visibility;
    returnValue?: { type: string, description: string };
    parameters?: MethodParameter[];
    static?: boolean;
    module?: string;
    resource?: string;
    examples?: any;
}

export interface MethodParameter {
    name: string;
    type: string;
    optional: boolean;
    description?: string;
    defaultValue?: string;
    parameterProperties?: MethodParameterProperty[];
}

export interface MethodParameterProperty {
    name: string;
    type: string;
    optional: boolean;
    description?: string;
    defaultValue?: string;
    parameterProperties?: MethodParameterProperty[];
}

export interface Property {
    //TODO: fill this
}

export interface Event {
    //TODO: fill this
}

