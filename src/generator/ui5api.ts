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

export enum Visibility {
    Public      = "public",
    Protected   = "protected",
    Restricted  = "restricted",
}

export interface ApiElement
{
    description?: string;
    deprecated?: boolean;
    since?: string;
}

export interface SymbolBase extends ApiElement
{
    name: string;
    basename: string;
    resource: string;
    module: string;
    visibility: Visibility;
    export?: string;
    static?: boolean;
}

export interface SymbolNamespace extends SymbolBase
{
    kind: Kind.Namespace;

    events?: Event[];
    methods?: Method[];
    properties?: Property[];
    extends?: string;
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
    experimental?: boolean;
    final?: boolean;
    "ui5-metadata"?: any;
}

export interface SymbolEnum extends SymbolBase
{
    kind: Kind.Enum;

    properties?: EnumProperty[];
    experimental?: string;
}

export interface SymbolInterface extends SymbolBase
{
    kind: Kind.Interface;

    events?: Event[];
    methods?: Method[];
}

export interface EnumProperty extends ApiElement
{
    name: string;
    visibility: Visibility;
    static: boolean;
    type: string;
}

export interface Method extends ApiElement
{
    //TODO: fill this
}

export interface Property extends ApiElement
{
    //TODO: fill this
}

export interface Event extends ApiElement
{
    //TODO: fill this
}

