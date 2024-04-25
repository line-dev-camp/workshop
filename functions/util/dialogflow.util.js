const axios = require("axios");

/* Dialogflow Forward API */
exports.forwardDialodflow = async (req) => {
  try {
    req.headers.host = "dialogflow.cloud.google.com";
    const url = `https://dialogflow.cloud.google.com/v1/integrations/line/webhook/${process.env.DIALOGFLOW_AGENT_ID}`;
    const response = await axios({
      url: url,
      method: "post",
      headers: req.headers,
      data: req.body
    });
    return response;
  } catch (error) {
    console.error('Error forwarding request to Dialogflow:', error.message);
    throw error;
  }
};