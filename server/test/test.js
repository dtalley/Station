var assertCounter = 1;
var testsPassed = 0;
var testsFailed = 0;

module.exports.assert = function(val1, val2) {
    if( val1 != val2 )
    {
        console.log(val1 + " != " + val2 + ", assertion #" + assertCounter);
        throw new Error("Assertion failed.");
    }

    assertCounter++;
}

module.exports.test = function(description, callback) {
    console.log(description);

    assertCounter = 1;

    try {
        callback();
        console.log("TEST PASSED.");
        testsPassed++;
    }
    catch(e) {
        console.log("TEST FAILED.");
        console.log(e);
        testsFailed++;
    }
}

module.exports.report = function() {
    console.log(testsPassed + " tests passed, " + testsFailed + " tests failed.");
}