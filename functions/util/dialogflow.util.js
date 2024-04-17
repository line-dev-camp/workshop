const axios = require("axios");

/* Dialogflow Forward API */
exports.forwardDialodflow = async (req) => {
  try {
    // Create a new headers object to ensure clean forward of headers
    req.headers.host = "dialogflow.cloud.google.com";
    const url = `https://dialogflow.cloud.google.com/v1/integrations/line/webhook/${process.env.DIALOGFLOW_AGENT_ID}`;
    
    // Perform the POST request to Dialogflow
    const response = await axios({
      url: url,
      method: "post",
      headers: req.headers,
      data: req.body
    });

    // Optionally process the response here if needed
    return response;
  } catch (error) {
    // Log and handle errors
    console.error('Error forwarding request to Dialogflow:', error.message);
    throw error;  // Rethrow or handle error appropriately
  }
};