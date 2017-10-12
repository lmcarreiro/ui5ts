export interface API
{
    library: string;
    symbols: Symbol[];
    version: string;
}

export interface SymbolBase
{
    basename: string;
    description: string;
    export: string;
    methods: Method[];
    module: string;
    name: string;
    resource: string;
    visibility: "public"|"private";
}

export interface SymbolNamespace extends SymbolBase
{
    kind: "namespace";
}

export interface SymbolClass extends SymbolBase
{
    kind: "class";
    constructor: any;
    extends: string;
    implements: string[];
    static: boolean;
    ["ui5-metadata"]: any;
}

export type Symbol = SymbolNamespace|SymbolClass;

export interface Method
{
    //TODO: fill this
}