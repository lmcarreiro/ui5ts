import Config from "../GeneratorConfig";

export default {
    replaceTypes(type: string, config: Config, name: string): string {
        var types = type.split("|");

        for (let k in types) {
            let isArray = !!types[k].match(/.*\[\]$/);
            let t = types[k].replace(/\[\]$/, "");

            var replacement = config.replacements.global[t];
            if (replacement && ["any", "any[]"].indexOf(replacement) > -1) {
                console.log(`Replacing '${t}'${t !== type ? ` (in '${type}')` : ""} with '${replacement}' in '${name}'.`);
            }

            t = replacement || t;

            types[k] = t + (isArray ? "[]" : "");
        }

        return types.join("|");
    }
};