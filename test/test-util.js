var assert=require('assert');
var Utility = require('../util.js');


describe('padNumber(msg)', function(msg) {
    var tests = [
        { arg:  "0" , expected: "00" } ,
        { arg:  "7" , expected: "07" } ,
        { arg: "13" , expected: "13" } ,
        { arg: "20" , expected: "20" }
    ];

    tests.forEach(function(test) {
        it('Should create a valid string (' + test.arg + ')', function() {
            assert.deepEqual(test.expected, Utility.padNumber(test.arg));
        });
    });

    var stringTests = [
        { args: [ "13" , "37" ] , expected: "1337" } ,
        { args: [  "0" , "5"  ] , expected: "0005" } ,
        { args: [ "12" , "3"  ] , expected: "1203" } ,
        { args: [  "3" , "12" ] , expected: "0312" }
    ];

    stringTests.forEach(function(test) {
        it('Should create a valid string: (' + test.args[0] + " + " + test.args[1] + ') => ' + test.expected + ' ?', function() {
            assert.deepEqual(test.expected, Utility.padNumber(test.args[0]) + Utility.padNumber(test.args[1]));
        });
    });
});

describe('compareDankTimes(time1, time2)', function(time1, time2) {
    var tests = [
        { args: [ { shoutout: "", hour: 13, minute: 37, points: 0 }, { shoutout: "", hour: 13, minute: 37, points: 0 } ], expected: ("">"") },
        { args: [ { shoutout: "", hour: 10, minute: 0, points: 0 }, {shoutout: "", hour: 9, minute: 10, points: 0} ], expected: 1 },
        { args: [ { shoutout: "", hour: 16, minute: 0, points: 0 }, {shoutout: "", hour: 17, minute: 5, points: 0} ], expected: -1 },
        { args: [ { shoutout: "", hour: 15, minute: 30, points: 0 }, { shoutout: "", hour: 15, minute: 20, points:0 } ], expected: 1 },
        { args: [ { shoutout: "", hour: 15, minute: 15, points: 0 }, { shoutout: "", hour: 15, minute: 30, points: 0 } ], expected: -1 }
    ];

    tests.forEach(function(test) {
        it('Should compare correctly.', function() {
            assert.deepEqual(test.expected, Utility.compareDankTimes(test.args[0], test.args[1]));
        });
    });
});
