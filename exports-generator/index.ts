import * as request from 'request';
import * as fs from 'fs';

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

            fs.writeFile("./teste.txt", "Hey there", function(err) {
                if(err) {
                    return console.log(err);
                }
            
                console.log("The file was saved!");
            });
        }
        else {
            console.error(error);
        }

    })

});
