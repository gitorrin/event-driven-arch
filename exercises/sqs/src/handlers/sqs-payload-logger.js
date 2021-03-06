var AWS = require('aws-sdk');

var docClient = new AWS.DynamoDB.DocumentClient();
var table = process.env.TABLE;
    
/**
 * A Lambda function that logs the payload received from SQS.
 */
exports.sqsPayloadLoggerHandler = async (event, context) => {
    // All log statements are written to CloudWatch by default. For more information, see
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
    console.info(JSON.stringify(event));
    for (const message of event.Records){
      try{
          let validationResponse = validateMessage(message.body);
          if (validationResponse ===""){
              await recordText(message.messageId, JSON.parse(message.body).text);
          } else {
              await recordError(message.messageId, validationResponse);
          }
      }catch (error) {
        console.log(error);
        // Return error will consume message from the queue, throw error so that message is not lost
        throw error;
      }
    }
};

function recordText(textId, inputText) {
   console.info(textId, inputText);
  var params = {
    TableName: table,
    Item: {
      "MessageId": textId,
      "inputText": inputText,
    }
  };
  return docClient.put(params).promise();
}

function recordError(textId, error) {
  var params = {
    TableName: table,
    Item: {
      "MessageId": textId,
      "error": error.message,
    }
  };
  return docClient.put(params).promise();
}

function validateMessage(body){
  try{
    JSON.parse(body).text;
    return "";
  } catch (error){
    console.log("Error parsing body, it will be saved with error", error);
    return error;
  }
}