import Config from "../GeneratorConfig";

export default {
    replaceTypes(type: string, config: Config, name: string): string {
        var types = type.split("|");

        for (let k in types) {
            let isArray = !!types[k].match(/.*\[\]$/);
            let t = types[k].replace(/\[\]$/, "");

            var replacement = config.replacements.global[t];

            // warnings when using types that could be more specific
            if (replacement && config.replacements.warnings.indexOf(replacement) > -1) {
                console.log(`Replacing '${t}'${t !== type ? ` (in '${type}')` : ""} with '${replacement}' in '${name}'.`);
            }

            t = replacement || t;

            if (t.match(/^jQuery[.]/)) {
                if (name.match(/^jQuery[.]/)) {
                    t = this.getJQueryFullName(t);
                }
                else {
                    t = `typeof ${t}`;
                }
            }

            types[k] = t + (isArray ? "[]" : "");
        }

        return types.join("|");
    },

    getJQueryFullName(fullName: string): string {
        return fullName === "jQuery"
            ? "JQueryStatic"
            : fullName
                .split(".")
                .map(p => p[0].toUpperCase() + p.slice(1))
                .join("");
    }
};