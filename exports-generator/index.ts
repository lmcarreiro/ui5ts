
import * as request from 'request';

var namespaces = [
    "https://sapui5.hana.ondemand.com/test-resources/sap/ui/core/designtime/api.json"
];

namespaces.forEach(url => {
    request({
        url: url,
        json: true
    }, function (error, response, body) {
    
        if (!error && response.statusCode === 200) {
            console.log(body) // Print the json response
        }
        else {
            console.error(error);
        }

    })

});
