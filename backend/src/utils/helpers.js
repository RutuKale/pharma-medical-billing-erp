const moment = require("moment");


// GENERATE BILL NUMBER
exports.generateBillNumber = () => {

    const timestamp = Date.now();

    return `BILL-${timestamp}`;

};


// FORMAT DATE
exports.formatDate = (date) => {

    return moment(date).format(
        "YYYY-MM-DD HH:mm:ss"
    );

};


// CALCULATE GST AMOUNT
exports.calculateGST = (
    amount,
    gstPercentage
) => {

    return (
        amount * gstPercentage
    ) / 100;

};


// CALCULATE DISCOUNT
exports.calculateDiscount = (
    amount,
    discount
) => {

    return (
        amount - discount
    );

};


// GET EXPIRY STATUS
exports.getExpiryStatus = (
    daysRemaining
) => {

    if (daysRemaining < 0) {
        return "EXPIRED";
    }

    if (daysRemaining <= 30) {
        return "CRITICAL";
    }

    if (daysRemaining <= 90) {
        return "NEAR_EXPIRY";
    }

    return "SAFE";

};