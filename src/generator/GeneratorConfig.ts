export default interface GeneratorConfig {
    output: {
        exportsPath:        string,
        definitionsPath:    string,
        indentation:        string
    },
    input: {
        runLocal:       boolean,
        remoteUrl:      string,
        localPath:      string,
        jsonLocation:   string,
        namespaces:     string[],
    },
    replacements: {
        global:     { [type: string]: string },
        warnings:    string[],
        specific:   {
            namespaceAsType:        { [namespace:   string]: "string"|"enum"|"class" },
            methodParameterType:    { [parameter:   string]: string };
            methodReturnType:       { [method:      string]: string };
            propertyType:           { [property:    string]: string };
        }
    }
}
