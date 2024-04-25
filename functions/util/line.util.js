const axios = require("axios");
const NodeCache = require("node-cache");
const crypto = require('crypto');
const cache = new NodeCache({stdTTL: 1800}); // 30 min

/*
#Get profile
https://developers.line.biz/en/reference/messaging-api/#get-profile

You can get the profile information of users who meet one of two conditions:

- Users who have added your LINE Official Account as a friend
- Users who haven't added your LINE Official Account as a friend but have sent a message to your LINE Official Account (except users who have blocked your LINE Official Account)
*/
exports.getProfile = async (userId) => {
  try {

    let profile = cache.get(userId);
    console.log(`[Cache Profile] : `, profile);

    if (profile == undefined) {


      const url = `${process.env.LINE_MESSAGING_API}/profile/${userId}`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${process.env.LINE_MESSAGING_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        maxBodyLength: Infinity,
      });

      if (response.status === 200) {
        console.log(`[getProfile] : ${response.data} `);

        profile = cache.set(userId, response.data);
        console.log(profile);


        profile = response.data;

      } else {
        throw new Error(`Failed to fetch user profile. API responded with status: ${response.status}`);
      }

    }
    return profile
  } catch (error) {
    console.error('Error fetching user profile:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/*
#Display a loading animation
https://developers.line.biz/en/reference/messaging-api/#send-broadcast-message
*/
exports.isAnimationLoading = async (userId) => {
  try {
    const url = `${process.env.LINE_MESSAGING_API}/chat/loading/start`;
    const response = await axios.post(url, {
      "chatId": `${userId}`,
      "loadingSeconds": 5 // The default value is 20.
      // Number of seconds to display a loading animation. You can specify a any one of 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, or 60.
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.LINE_MESSAGING_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 202) {
      return response.data;
    } else {
      throw new Error(`Failed to send reply. API responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending reply:', error.message);
    throw error;
  }
};

/*
#Send reply message
https://developers.line.biz/en/reference/messaging-api/#send-reply-message
Sends a reply message in response to an event from a user, group chat, or multi-person chat. To send reply messages, you need a reply token which is included in the webhook event object.
*/
exports.replyWithLongLived = async (token, payload) => {
  try {
    const url = `${process.env.LINE_MESSAGING_API}/message/reply`;

    const response = await axios.post(url, {
      replyToken: token,
      messages: payload
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.LINE_MESSAGING_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Failed to send reply. API responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending reply:', error.message);
    throw error;
  }
};

/*Reply messsage with stateless token*/
exports.replyWithStateless = async (token, payload) => {
  try {
    const accessToken = await issueStatelessAccessToken();
    if (!accessToken) {
      throw new Error('Failed to obtain an access token.');
    }

    const url = `${process.env.LINE_MESSAGING_API}/message/reply`;
    const response = await axios.post(url, {
      replyToken: token,
      messages: payload
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Failed to send reply. API responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error in sending stateless reply:', error.message);
    throw error;
  }
};

/* 
    # Stateless Channel Access Token
    https://developers.line.biz/en/reference/messaging-api/#issue-stateless-channel-access-token
    https://medium.com/linedevth/stateless-channel-access-token-e489dfc210ad

    Issues channel access tokens that are only valid for 15 minutes. There is no limit to the number of tokens that can be issued. Once a stateless channel access token is issued, it can't be revoked.


*/
async function issueStatelessAccessToken() {
  try {
    const response = await axios.post(process.env.LINE_MESSAGING_OAUTH_ISSUE_TOKENV3, {
      grant_type: 'client_credentials',
      client_id: process.env.LINE_MESSAGING_CHANNEL_ID,
      client_secret: process.env.LINE_MESSAGING_CHANNEL_SECRET
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      maxBodyLength: Infinity,
    });

    if (response.status === 200 && response.data && response.data.access_token) {
      console.log(`[issueStatelessAccessToken] : ${response.data.access_token} `);
      return response.data.access_token;
    } else {
      throw new Error('Failed to obtain access token, check response for details.');
    }
  } catch (error) {
    console.error('Error issuing token:', error.message);
    throw error;
  }
}

/*
#verify-signature
https://developers.line.biz/en/docs/messaging-api/receiving-messages/#verify-signature
https://medium.com/linedevth/7a94d9548f34

When your bot server receives a request, verify the request sender. To make sure the request is from the LINE Platform, make your bot server verify the signature in the x-line-signature request header.
*/
exports.verifySignature = (originalSignature, body) => {
  const signature = crypto
    .createHmac("SHA256", process.env.LINE_MESSAGING_CHANNEL_SECRET)
    .update(JSON.stringify(body))
    .digest("base64");

  if (signature !== originalSignature) {
    return false;
  }
  return true;
};

/*
#Get content
https://developers.line.biz/en/reference/messaging-api/#get-content
 This domain name is different from that of other endpoints
The domain name (api-data.line.me) of this endpoint is for sending and receiving large amounts of data in the LINE Platform for Messaging API. This domain name differs from that of other endpoints (api.line.me).
*/
exports.getContent = async (message, messageId) => {
  const url = `${process.env.LINE_DATA_MESSAGING_API}/message/${messageId}/content`;
  const response = await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${process.env.LINE_MESSAGING_ACCESS_TOKEN}`,
    },
    responseType: 'arraybuffer',
  });

  let extension = getExtension(message, message.type)
  let resObject = {
    fileName: `${message.id}.${extension}`,
    binary: response.data
  }
  return resObject
};


function getExtension(message, messageType) {
  let extension = '';
  switch (messageType) {
    case "image":
      extension = 'png';
      break;
    case "video":
      extension = 'mp4';
      break;
    case "audio":
      extension = 'm4a';
      break;
    case "file":
      const regex = /\.([0-9a-z]+)(?:[\?#]|$)/i;
      const match = regex.exec(message.fileName);
      extension = match ? match[1] : '';
      break;
  }

  return extension

}

