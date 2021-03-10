var AWS = require('aws-sdk');

const stepFunctions = new AWS.StepFunctions();
var stateMachine = process.env.StateMachine;

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
              const data = await callStateMachine(message.messageId, JSON.parse(message.body).text);
              console.info("Data: ", data);
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


function callStateMachine(messageId, text){
  const params = {
    stateMachineArn: stateMachine,
    input: JSON.stringify({
      'messageId':messageId,
      'text':text
    }),// Optional if your statemachine requires an application/json input, make sure its stringified 
    name: 'TestExecution-' + messageId // name can be anything you want, but it should change for every execution
  };
  return stepFunctions.startExecution(params).promise();
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