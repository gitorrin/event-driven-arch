var AWS = require('aws-sdk');
var sns = new AWS.SNS();
var topic = process.env.Topic;

exports.lambdaHandler = async (event, context) => {
    // Send order fail notification
    // Could be done also directly from StepFunctions
    console.info(JSON.stringify(event));
    var params = {
        TargetArn:topic,
        Message:event.messageId,
        Subject: 'OrderFailed'
    };
    const data = await sns.publish(params).promise();
    console.info(data);
    return { 
        'messageId': event.messageId,
        'sentMessageId': data.MessageId
    };
};



