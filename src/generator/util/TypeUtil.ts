import Config from "../GeneratorConfig";

export default {
    replaceTypes(type: string, config: Config): string {
        var types = type.split("|");

        for (let k in types) {
            let isArray = !!types[k].match(/.*\[\]$/);
            let t = types[k].replace(/\[\]$/, "");

            t = config.replacements.global[t] || t;

            types[k] = t + (isArray ? "[]" : "");
        }

        return types.join("|");
    }
};