'use strict';

const assert = require('assert');
const ChatRegistry = require('../src/chat-registry.js');

describe('Constructor', function () {
  var instance = new ChatRegistry();
  it('should have created a new instance...', function () {
    assert.deepEqual(instance._chats.size, 0);
  });
});

describe('Setting _chats...', function () {
  let instance = new ChatRegistry();
  it('Should be an empty map...', function () {
    console.log(instance._chats);
    assert.equal(instance._chats.size, 0);
  });

  let instance2 = new ChatRegistry();
  const m = new Map();
  m.set('hello', 'world');

  instance2.setChats(m);

  it('Should not be an empty map...', function () {
    assert.equal(instance2._chats.size, 1);
    assert.equal(instance2._chats.get('hello'), 'world');
  });

  describe('getOrCreateChat(id)', function () {
    let instance = new ChatRegistry();

    assert.equal(instance._chats.size, 0);
    assert.equal(instance._chats.get(0), null);
    instance.getOrCreateChat(0);
    assert.equal(instance._chats.size, 1);
    assert.notEqual(instance._chats.get(0), null);
  });
});