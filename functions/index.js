const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
setGlobalOptions({
    region: "asia-northeast1",
    memory: "1GB",
    concurrency: 40,
})

const line = require('./util/line.util');
const dialogflow = require('./util/dialogflow.util');
const flex = require('./message/flex');

exports.helloWorld = onRequest((request, response) => {
    response.send(`Method : ${request,method} `);
});

function validateWebhook(request, response) {
    if (request.method !== "POST") {
        return response.status(405).send("Method Not Allowed");
    }
    if (!line.verifySignature(request.headers["x-line-signature"], request.body)) {
        return response.status(401).send("Unauthorized");
    }
}

exports.webhook = onRequest(async (request, response) => {
    validateWebhook(request, response)
    const events = request.body.events
    for (const event of events) {
        let profile = {}
        switch (event.type) {

            case "follow":
                /*
                    Greeting Message for new friend
                */
                profile = await line.getProfile(event.source.userId)
                let text = `ยินดีต้อนรับคุณ ${profile.displayName} คุณสามารถพูดคุย สนทนากับ admin ได้เลย`
                if (event.follow.isUnblocked) {
                    /*
                        Greeting Message for Old Friend
                        https://developers.line.biz/en/reference/messaging-api/#follow-event
                        https://linedevth.line.me/th/knowledge-api/follow-event
                    */
                    text = `ยินดีต้อนการกลับมา ${profile.displayName} คุณสบายดีไหม`
                }
                await line.replyWithLongLived(event.replyToken, [{
                    "type": "text",
                    "text": text,
                }])
                break;
            case "unfollow":
                /*
                    Unsend event
                    https://developers.line.biz/en/reference/messaging-api/#unsend-event
                */
                console.log(JSON.stringify(event));
                break;
            case "message":
               
            

                /*
                    Message
                    https://developers.line.biz/en/reference/messaging-api/#message-event
                */
                if (event.message.type === "text") {

                    if (event.source.type !== "group") {
                        // Display a loading animation in one-on-one chats between users and LINE Official Accounts.
                        await line.isAnimationLoading(event.source.userId)
                    }


                    let textMessage = event.message.text

                    if (textMessage === "1") { 

                        console.log([{
                            "type": "text",
                            "text": JSON.stringify(event),
                        }]);

                        await line.replyWithLongLived(event.replyToken, [{
                            "type": "text",
                            "text": JSON.stringify(event),
                        }])

                    } else if (textMessage === "2") {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": JSON.stringify(event),
                        }])

                    } else if (textMessage === "3") {

                        await line.replyWithStateless(event.replyToken, [flex.exampleFlex()])

                    } else if (textMessage === "4") {

                        profile = await line.getProfile(event.source.userId)
                        console.log('profile', profile);
                        await line.replyWithStateless(event.replyToken, [flex.examplePostback(JSON.stringify(profile))])

                    } else if (textMessage === "สวัสดี") {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": `สวัสดี`,
                            "quickReply": {
                                "items": [{
                                    "type": "action",
                                    "imageUrl": "https://bucket.ex10.tech/images/06960db7-fd91-11ee-808f-0242ac12000b/originalContentUrl.png",
                                    "action": {
                                        "type": "message",
                                        "label": "สวัสดี",
                                        "text": "สวัสดี"
                                    }
                                }, {
                                    "type": "action",
                                    "imageUrl": "https://bucket.ex10.tech/images/06960db7-fd91-11ee-808f-0242ac12000b/originalContentUrl.png",
                                    "action": {
                                        "type": "clipboard",
                                        "label": "คัดลองคำ",
                                        "clipboardText": "สวัสดี"
                                    }
                                }]
                            }
                        }])

                    } else {
                        /* Foward to Dialogflow */
                        await dialogflow.forwardDialodflow(request)
                    }

                } else {
                    /*
                    # Handle Other Message Type
                    - Image : https://developers.line.biz/en/reference/messaging-api/#image-message
                    - Video : https://developers.line.biz/en/reference/messaging-api/#video-message
                    - Audio : https://developers.line.biz/en/reference/messaging-api/#audio-message
                    - Location : https://developers.line.biz/en/reference/messaging-api/#location-message
                    - Sticker : https://developers.line.biz/en/reference/messaging-api/#sticker-message
                    */
                    await line.replyWithLongLived(event.replyToken, [{
                        "type": "text",
                        "text": JSON.stringify(event),
                    }])
                }
                break;
            case "unsend":
                /*
                    unsend
                    https://developers.line.biz/en/reference/messaging-api/#unsend-event
                */
                profile = await line.getProfile(event.source.userId)
                console.log(`พบ ${profile.displayName} unsend`);
                break;
            case "join":
                /*
                    join
                    https://developers.line.biz/en/reference/messaging-api/#join-event
                */

                    await line.replyWithLongLived(event.replyToken, [{
                        "type": "text",
                        "text": `ยินดีที่ได้รู้จัก`,
                        "quickReply": {
                            "items": [{
                                "type": "action",
                                "imageUrl": "https://bucket.ex10.tech/images/06960db7-fd91-11ee-808f-0242ac12000b/originalContentUrl.png",
                                "action": {
                                    "type": "message",
                                    "label": "สวัสดี",
                                    "text": "สวัสดี"
                                }
                            }, {
                                "type": "action",
                                "imageUrl": "https://bucket.ex10.tech/images/06960db7-fd91-11ee-808f-0242ac12000b/originalContentUrl.png",
                                "action": {
                                    "type": "clipboard",
                                    "label": "คัดลองคำ",
                                    "clipboardText": "สวัสดี"
                                }
                            }]
                        }
                    }])
                break;
            case "leave":
                /*
                    leave
                    https://developers.line.biz/en/reference/messaging-api/#leave-event
                */
                console.log(JSON.stringify(event));
                break;
            case "memberJoined":
                /*
                    memberJoined
                    https://developers.line.biz/en/reference/messaging-api/#member-joined-event
                */
                for (let member of event.joined.members) {
                    if (member.type === "user") {
                        console.log(JSON.stringify(event));
                        await line.replyWithLongLived(event.replyToken, [{
                            "type": "text",
                            "text": JSON.stringify(event),
                            "quickReply": {
                                "items": [{
                                    "type": "action",
                                    "imageUrl": "https://bucket.ex10.tech/images/9f2a63dc-d84e-11ee-97d4-0242ac12000b/originalContentUrl.png",
                                    "action": {
                                        "type": "message",
                                        "label": "สวัสดี",
                                        "text": "สวัสดี"
                                    }
                                }]
                            }
                        }])
                    }
                }
                break;
            case "memberLeft":
                /*
                    memberLeft
                    https://developers.line.biz/en/reference/messaging-api/#member-left-event
                */
                console.log(JSON.stringify(event));
                break;
            case "postback":
                /*
                    postback
                    https://developers.line.biz/en/reference/messaging-api/#postback-event
                */
                console.log(event.postback.data);
                await line.replyWithLongLived(event.replyToken, [{
                    "type": "text",
                    "text": JSON.stringify(event.postback.data),
                }])
                break;

            default:
                return response.end();
        }

    }

    return response.end();

});

exports.dialogflow = onRequest(async (request, response) => {
    
    /*
        receive dialogflow
        bonus
    */
    
    console.log(request);

    return response.end();

});