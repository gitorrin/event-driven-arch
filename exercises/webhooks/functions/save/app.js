var AWS = require('aws-sdk');

var docClient = new AWS.DynamoDB.DocumentClient();
var table = process.env.TABLE;

exports.lambdaHandler = async (event, context) => {
    // Save order
    // Could use directlly a step from step function to add to Dynamo, wanted an example with lambda
    console.info(JSON.stringify(event));
    let ts = Date.now();
    await recordOrder(event.messageId, ts);
    return { 
      'messageId': event.messageId,
      'savedAt' : ts
      };
};


function recordOrder(orderId, timestamp) {
   console.info(orderId);
  var params = {
    TableName: table,
    Item: {
      "MessageId": orderId,
      "SavedTimestamp":  timestamp,
    }
  };
  return docClient.put(params).promise();
}