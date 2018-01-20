exports.myDateTime = function () {
return Date();
}

exports.myRandNum = function random (low, high) {
    return Math.random() * (high - low) + low;
}
