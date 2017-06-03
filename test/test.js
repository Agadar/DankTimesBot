var assert=require('assert')
var fs = require('fs');
var vm = require('vm');
var DankTimesBot = require('../index.js');

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
