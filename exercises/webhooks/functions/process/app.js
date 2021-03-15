
exports.lambdaHandler = async (event, context) => {
    // Processing payment
    // Should call some external service
    let paymentId = Math.floor(Math.random() * Math.floor(1000));
    // for failed payments add 'payment_failed': true
    return {
        'messageId': event.messageId,
        'paymentId': paymentId
    }
}
