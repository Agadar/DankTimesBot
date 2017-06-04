var assert=require('assert')
var fs = require('fs');
var vm = require('vm');
var DankTimesBot = require('../main.js');

/********************
 * NEWUSER FUNCTION *
 ********************/

describe('newUser(id, name)', function(id, name) {
    var tests = [ 
        { args: [-1     , "Mr. Minus"   ], expected: {id: -1, name: "Mr. Minus", score: 0, called: false }      },
        { args: [ 0     , "Default"     ], expected: {id:  0, name: "Default"  , score: 0, called: false }      },
    ];

    var invalidTests = [
        { args: [ 0     , "Default V2"  ], expected: null                                                       }, /* Two users, same ID. */
        { args: [ 1     , ""            ], expected: null                                                       }, /* Empty name */
        { args: [ null  , "Null"        ], expected: null                                                       },
        { args: [ 2     , null          ], expected: null                                                       }
    ];



    /* Valid tests. */
    tests.forEach(function(test) {
        it('Should create a valid user (' + test.expected.id + ', ' + test.expected.name + ')' , function() {
                assert.deepEqual(test.expected, DankTimesBot.newUser(test.args[0], test.args[1]));
            });
    });

    invalidTests.forEach(function(test) {
        it('Should not create a valid user (' + test.args[0] + ', ' + test.args[1] + ')', function() {
            assert.equal(test.expected, DankTimesBot.newUser(test.args[0], test.args[1]));
        });
    });

});

/********************
 * NEWCHAT FUNCTION *
 ********************/

describe('newChat(id)', function(id) {
    var tests = [
        { args: [ -1            ], expected: {id: -1, users: [], lastTime: undefined    }       },
        { args: [  0            ], expected: {id:  0, users: [], lastTime: undefined    }       },
        { args: [  1            ], expected: {id:  1, users: [], lastTime: undefined    }       }
    ];

    var invalidTests = [
        { args: [ null          ], expected: null                                               },
        { args: [ undefined     ], expected: null                                               }
    ];

    tests.forEach(function(test) {
        it('Should create a valid new chat. (' + test.args[0] + ')', function() {
            assert.deepEqual(test.expected, DankTimesBot.newChat(test.args[0]));
        });
    });
    
    invalidTests.forEach(function(test) {
        it('Should not create a valid new chat. (' + test.args[0] + ')', function() {
            assert.equal(test.expected, DankTimesBot.newChat(test.args[0]));
        });
    });
});


/************************
 * NEWDANKTIME FUNCTION *
 ************************/

describe('newDankTime(shoutout, hour, minute)', function(shoutout, hour, minute) {
    var tests = [
        { args: [ "Shoutout"    , 12    ,       0       ], expected: { shoutout: "Shoutout"     , hour: 12, minute: 0           }       },
        { args: [ ""            , 15    ,       0       ], expected: { shoutout: ""             , hour: 15, minute: 0           }       },
        { args: [ "Test"        , 0     ,       0       ], expected: { shoutout: "Test"         , hour:  0, minute: 0           }       }
    ];

    var invalidTests = [
        { args: [ "Invalid I"       , 24    ,       0   ], expected: null                                                               },
        { args: [ "Invalid II"      , 25    ,       0   ], expected: null                                                               },
        { args: [ "Invalid III"     , 12    ,       60  ], expected: null                                                               },
        { args: [ "Invalid IV"      , -5    ,       0   ], expected: null                                                               },
        { args: [ "Invalid V"       , 12    ,       -6  ], expected: null                                                               }
    ];

    tests.forEach(function(test) {
        it('Should create a valid new Dank Time... (' + test.args[0] + ', ' + test.args[1] + ', ' + test.args[2] + ')', function() {
            assert.deepEqual(test.expected, DankTimesBot.newDankTime(test.args[0], test.args[1], test.args[2]));
        });
    });

    invalidTests.forEach(function(test) {
        it('Should not create a valid new Dank Time... (' + test.args[0] + ', ' + test.args[1] + ', ' + test.args[2] + ')', function() {
            assert.equal(test.expected, DankTimesBot.newDankTime(test.args[0], test.args[1], test.args[2]));
        });
    });
});
