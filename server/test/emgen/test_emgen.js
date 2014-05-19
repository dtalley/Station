var test = require(__dirname + "/../test.js");
var messages = require(__dirname + "/generated_messages_test_node.js");

var buffer;
var testPack;
var testUnpack;

testPack = messages.SimpleTest.create();
testPack.test1 = -46;
testPack.test2 = -521;
testPack.test3 = -80344;
testPack.test5 = 243;
testPack.test6 = 51233;
testPack.test7 = 101884;
testPack.test9 = -1.3344454;
testPack.test10 = 8847758475847.11212122221;
testPack.test11 = "Test string!";
testPack.test12 = true;
testPack.test13 = false;
testPack.test14 = "true";
testPack.test15 = "false";
testPack.test16 = 1;
testPack.test17 = 0;

var size = testPack.pack();

buffer = new Buffer(testPack.buffer.length + 1);
testPack.buffer.copy(buffer, 0, 0, size);

testUnpack = messages.SimpleTest.create(buffer);

testUnpack.unpack();

test.test("Message ID and size of simple test message should be accurate", function(){
    test.assert(testPack.buffer.readUInt16BE(0), testPack.id);
    test.assert(testPack.buffer.readUInt32BE(2), size);

    test.assert(testUnpack.buffer.readUInt16BE(0), testUnpack.id);
    test.assert(testUnpack.buffer.readUInt32BE(2), size);
});

test.test("Simple test message unpacked should match packed simple test massage", function(){
    test.assert(testUnpack.test1, testPack.test1);
    test.assert(testUnpack.test2, testPack.test2);
    test.assert(testUnpack.test3, testPack.test3);
    test.assert(testUnpack.test4, testPack.test4);
    test.assert(testUnpack.test5, testPack.test5);
    test.assert(testUnpack.test6, testPack.test6);
    test.assert(testUnpack.test7, testPack.test7);
    test.assert(testUnpack.test8, testPack.test8);
    //Test 9 is sort of untestable because it's stored in the original message as a double
    test.assert(testUnpack.test10, testPack.test10);

    test.assert(testUnpack.test11, testPack.test11);

    test.assert(testUnpack.test12, true);
    test.assert(testUnpack.test13, false);
    test.assert(testUnpack.test14, true);
    test.assert(testUnpack.test15, true);
    test.assert(testUnpack.test16, true);
    test.assert(testUnpack.test17, false);
});

testPack.release();
testUnpack.release();

test.report();