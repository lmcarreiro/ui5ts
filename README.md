# ui5ts

A simple adapter to develop SAPUI5 and OpenUI5 applications using TypeScript and ES2015 modules/classes

## This Repo Is No Longer Maintained

For a newer version supporting a more recent version of UI5, see https://github.com/neoprincie/ui5ts.

## Release Notes

**0.3.2** - Handle some UI5 API errors in the Docs, when method with names like get*Something* has `void` as return type. It is being replaced by `any` now. 

**0.3.1** - Just fixed an error in this README instructions.

**0.3.0** - Create definitions for more than one version of UI5 (just 1.46 and 1.48 for now). Published in https://github.com/lmcarreiro/ui5-typescript-definitions too. *Be carefull, now that there is these definitions inside the package and I have plans to make these definitions better (normally replacing an `any` type with a more specific one), **almost all new versions from now on may be a breaking change.***

**0.2.0** - Create my own UI5 definitions generator, because the available ones didn't fit my needs (you can still use another, just set it up in your `tsconfig.json`).

**0.1.\*** - Generated exports files for all namespace sap.* objects, to make possible import these objects without creating a single `<object>.d.ts` for each imported object.

**0.0.\*** - Just a draft.

## How to use

It is very simple, make it work with only 4 steps:

1. Install *ui5ts*, *typescript* and *@types/jquery* npm packages
2. Add a reference to the "library" in your index.html
3. Add the required TypeScript options in the tsconfig.json
4. Change your `<class-name>.js` to a `<class-name>.ts`

Check this Master-Detail example app https://github.com/lmcarreiro/ui5-typescript-example that is already working with ui5+typescript.

### 1) Install *ui5ts*, *typescript* and *@types/jquery* npm packages

```
npm install @types/jquery --save-dev
npm install typescript --save-dev
npm install ui5ts --save
```

### 2) Add a reference to the library in your index.html

Put a reference to the `ui5ts.js` script in your `index.html` file using a script tag `<script src="node_modules/ui5ts/ui5ts.js" type="text/javascript"></script>` between the `sap-ui-core.js` script tag and the `sap.ui.getCore().attachInit()` call:

```diff
...
<!-- Bootstrapping UI5 -->
<script id="sap-ui-bootstrap" src="https://openui5.hana.ondemand.com/resources/sap-ui-core.js" ... ></script>

+ <!-- Convert typescript generated modules/classes into ui5 modules/classes -->
+ <script type="text/javascript" src="node_modules/ui5ts/ui5ts.js"></script>

<script>
    sap.ui.getCore().attachInit(function () { ... });
</script>
...
```

### 3) Add the required TypeScript options in the tsconfig.json

 - compilerOptions.module = `"amd"`
 - compilerOptions.experimentalDecorators = `true` *(just to avoid typescript warning/error)*
 - compilerOptions.baseUrl = `"./"` *(your project root, if you change this value, you need to change the paths too)*
 - compilerOptions.paths = `{ ... }` *(your paths, relative to your baseUrl, check the example bellow)*
 - files = `["node_modules/ui5ts/ui5ts.d.ts", "node_modules/ui5ts/ui5-types/1.48/sap.d.ts", "node_modules/ui5ts/ui5-types/1.48/jQuery.d.ts", ...]`

Example of `tsconfig.json` file:
```json
{
    "compilerOptions": {
        "target": "es5",
        "module": "amd",
        "experimentalDecorators": true,
        "alwaysStrict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "noImplicitReturns": true,
        "noImplicitThis": true,
        "sourceMap": true,
        "baseUrl": "./",
        "paths": {
            "your/app/namespace/*": [ "./src/*" ],
            "sap/*": [ "./node_modules/ui5ts/exports/sap/*" ]
        }
    },
    "files": [
        "node_modules/ui5ts/ui5ts.d.ts",
        "node_modules/ui5ts/ui5-types/1.48/sap.d.ts",
        "node_modules/ui5ts/ui5-types/1.48/jQuery.d.ts"
    ],
    "include": [
        "src/**/*",
        "node_modules/@types"
    ],
    "exclude": [
        "node_modules",
        "**/*.spec.ts"
    ]
}
```


### 4) Change your `<class-name>.js` to a `<class-name>.ts`

#### UI5 JavaScript way:
```javascript
sap.ui.define([
    "sap/ui/core/UIComponent",
    "typescript/example/ui5app/model/models"
], function (UIComponent, models) {
    "use strict";
    
    return UIComponent.extend("typescript.example.ui5app.Component", {
        metadata: {
            manifest: "json"
        },
        
        init: function () {
            // set the device model
            this.setModel(models.createDeviceModel(), "device");
            // call the base component's init function and create the App view
            UIComponent.prototype.init.call(this);
            // create the views based on the url/hash
            this.getRouter().initialize();
        }
    });
});
```

#### ES2015 TypeScript way:
```typescript
import UIComponent  from "sap/ui/core/UIComponent";
import models       from "typescript/example/ui5app/model/models";

@UI5("typescript.example.ui5app.Component")
export default class Component extends UIComponent
{
    public static metadata: any = {
        manifest : "json"
    };

    public init(): void {
        // set the device model
        this.setModel(models.createDeviceModel(), "device");
        // call the base component's init function and create the App view
        super.init();
        // create the views based on the url/hash
        this.getRouter().initialize();
    }
}
```

#### Don't forget

 - You need to decorate your class with `@UI5("your.full.namespace.ClassName")`, this decorator parameter will be passed to `BaseClass.extend("your.full.namespace.ClassName", { ... });` call at runtime.
 - You need to export your class as default export.
 - If your class has the ui5 metadata object, define it as `static`
 - The paths in the `import` statements must be the same as it would be if you were using `sap.ui.define()` function. The TypeScript compiler will generate an AMD module with a `define()` call with these paths, and the `define()` function that **ui5ts** overrides will call the real `sap.ui.define()` function. This is the way that **ui5ts** works.
 - If `your/app/namespace/is/too/big`, you don't need to have all this levels of directories in your physical project structure, you can create a virtual mapping using the `tsconfig.json` configuration option `paths` (see it in the common problems bellow).

## Resolving common typescript errors and module resolution problems

**Problem:** Doesn't find the @UI5 decorator:
```typescript
...
// error TS2304: Cannot find name 'UI5'.
@UI5("your.full.namespace.ClassName")
export default class Component extends UIComponent {
...
```

**Solution:** Make sure you have the ui5ts.d.ts referenced in your `tsconfig.json`
```diff
...
"files": [
    ...,
+   "node_modules/ui5ts/ui5ts.d.ts"
],
...
```

**Problem:** Doesn't find your own `*.ts` class:
```typescript
...
// error TS2307: Cannot find module 'your/app/namespace/folder/ClassName'.
import ClassName from "your/app/namespace/folder/ClassName";
...
```

**Solution:** Make sure you have the path of your namespace root in the `tsconfig.json` and if it match with your application startup in the `index.html`
```diff
...
"compilerOptions": {
    ...
    "baseUrl": "./",
    "paths": {
        ...
+       "your/app/namespace/*": [ "./src/*" ]
    }
...
```
```diff
...
sap.ui.getCore().attachInit(function () {
    sap.ui.require(["sap/m/Shell", "sap/ui/core/ComponentContainer"], function (Shell, ComponentContainer) {
        new Shell({
            app: new ComponentContainer({
                height : "100%",
+               name : "your.app.namespace"
            })
        }).placeAt("content");
    });
});
...
```

**Problem:** Doesn't find your own `*.js` class:
```typescript
...
// error TS2307: Cannot find module 'your/app/namespace/folder/ClassName'.
import ClassName from "your/app/namespace/folder/ClassName";
...
```

**Solution:** Create a corresponding `*.d.ts` of your `*.js` class or forget about it. You can live with this error and the app will still work. Even if you allow the TypeScript compiler to accept `*.js` modules, it will not recognize it as a AMD module, since you declare it using `sap.ui.define()` instead of `define()`.


**Problem:** Doesn't find a class in sap.* namespace:
```typescript
...
// error TS2307: Cannot find module 'sap/ui/core/UIComponent'.
import UIComponent from "sap/ui/core/UIComponent";
...
```

**Solution:** Make sure you have mapped the **ui5ts** exports folder in your paths of the `tsconfig.json`:

```diff
...
"compilerOptions": {
    ...
    "baseUrl": "./",
    "paths": {
        ...
+       "sap/*": [ "./node_modules/ui5ts/exports/sap/*" ]
    }
...
```

If the problem still remains, please, create an issue in the github project:

https://github.com/lmcarreiro/ui5ts/issues
