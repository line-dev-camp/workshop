const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");

setGlobalOptions({
    region: "asia-northeast1",
    memory: "1GB",
    concurrency: 40,
})


exports.helloWorld = onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

/*
function validateWebhook(request, response) {
    if (request.method !== "POST") {
        return response.status(405).send("Method Not Allowed");
    }

    if (!line.verifySignature(request.headers["x-line-signature"], request.body)) {
        return response.status(401).send("Unauthorized");
    }
}
*/

exports.webhook = onRequest((request, response) => {
    // validateWebhook(request, response)
    const events = request.body.events

    for (const event of events) {
        switch (event.type) {
            case "follow":
                // greeting message 
                // new friend or old friend
                break;
            case "unfollow":
                // write to log json
                break;
            case "message":
                // reply message with longlive
                // reply flex message
                // reply message with stateless
                // check message out group
                // check message in group
                break;
            case "unsend":
                // save to log 
                break;

            case "join":
                // group message 
                // welcome message 
                break;
            case "leave":
                // save to log
                // delete database 
                break;
            case "memberJoined":
                // welcome message
                break;
            case "memberLeft":
                // save to log
                // delete database 
                break;
            case "postback":
                // spacial data json from flex
                break;

            default:
                return response.end();
        }

    }

    return response.end();

});

exports.dialogflow = onRequest(async (request, response) => {
    // validateWebhook(request, response)
    const events = request.body.events

    for (const event of events) {
        switch (event.type) {
            case "message":
                // await dialogflow.postToDialogflow(request)
                break;
            default:
                // defult message
                break;
        }

    }

    return response.end();

});