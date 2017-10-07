# ui5ts

A ridiculously simple adapter to develop SAPUI5 and OpenUI5 applications using TypeScript and ES2015 modules/classes.


## How to use

Check this Master-Detail example app https://github.com/lmcarreiro/ui5-typescript-example that is already working with ui5+typescript.

### 1) Install the package

```
npm install ui5ts --save
```

### 2) Add a reference to the "library"

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

### 3) Change your `<class-name>.js` to a `<class-name>.ts`.

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

namespace typescript.example.ui5app
{
    @UI5("typescript.example.ui5app.Component")
    export class Component extends UIComponent
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
}

export default typescript.example.ui5app.Component;
```

 - Don't forget to decorate your class with `@UI5("your.full.namespace.ClassName")`, this decorator parameter will be passed to `BaseClass.extend("your.full.namespace.ClassName", { ... });` call at runtime.
 - You need to export your class as default export at the end of the file: `export default your.full.namespace.ClassName;`

### 4) Resolving typescript module resolution problems

I'll write this soon. Can't wait? Check the example app: https://github.com/lmcarreiro/ui5-typescript-example 
