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
        specific:   {
            namespaceAsType:        { [namespace:   string]: string },
            methodParameterType:    { [parameter:   string]: string };
            methodReturnType:       { [method:      string]: string };
        }
    }
}
