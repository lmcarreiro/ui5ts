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
        specific:   { [type: string]: string }
    }
}
