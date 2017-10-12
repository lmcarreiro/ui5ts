export interface API
{
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

export interface SymbolBase
{
    name: string;
    basename: string;
    resource: string;
    module: string;
    visibility: "public"|"protected"|"restricted";
    description?: string;
    export?: string;
    static?: boolean;
    since?: string;
}

export interface SymbolNamespace extends SymbolBase
{
    kind: Kind.Namespace;

    events?: Event[];
    methods?: Method[];
    properties?: Property[];
    extends?: string;
    deprecated?: boolean;
    experimental?: boolean;
    final?: boolean;
}

export interface SymbolClass extends SymbolBase
{
    kind: Kind.Class;

    events?: Event[];
    methods?: Method[];
    properties?: Property[];
    constructor: any;
    extends?: string;
    implements?: string[];
    abstract?: boolean;
    deprecated?: boolean;
    experimental?: boolean;
    final?: boolean;
    "ui5-metadata"?: any;
}

export interface SymbolEnum extends SymbolBase
{
    kind: Kind.Enum;

    properties?: Property[];
    deprecated?: boolean;
    experimental?: string;
}

export interface SymbolInterface extends SymbolBase
{
    kind: Kind.Interface;

    events?: Event[];
    methods?: Method[];
}

export interface Method
{
    //TODO: fill this
}

export interface Property
{
    //TODO: fill this
}

export interface Event
{
    //TODO: fill this
}

