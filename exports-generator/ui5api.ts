export interface API
{
    library: string;
    symbols: Symbol[];
    version: string;
}

export interface Symbol
{
    kind: "namespace"|"class"|"interface"|"enum";
    basename: string;
    description: string;
    export: string;
    methods: Method[];
    module: string;
    name: string;
    resource: string;
    visibility: "public"|"private";
}

export interface SymbolClass extends Symbol
{
    kind: "class";
    constructor: any;
    extends: string;
    implements: string[];
    static: boolean;
    ["ui5-metadata"]: any;
}

export interface Method
{
    //TODO: fill this
}