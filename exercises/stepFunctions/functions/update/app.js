var AWS = require('aws-sdk');

var docClient = new AWS.DynamoDB.DocumentClient();
var table = process.env.TABLE;

exports.lambdaHandler = async (event, context) => {
    // Update order
    // Should update the order into db
    console.info(JSON.stringify(event));
   
    let ts = Date.now();
    await recordOrder(event.messageId, ts);
    return { 
      'messageId': event.messageId,
      'updateddAt' : ts
      };
};


function recordOrder(orderId, timestamp) {
  console.info(orderId);
  var params = {
    TableName: table,
    Key:{
        "MessageId": orderId,
    },
    UpdateExpression: "set UpdatedTimestamp = :t",
    ExpressionAttributeValues:{
        ":t":timestamp,
    },
    ReturnValues:"UPDATED_NEW"
  };
  return docClient.update(params).promise();
}