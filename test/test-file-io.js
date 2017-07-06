'use strict';

// Imports.
const assert = require('assert');
const rewire = require('rewire');
const Release = require('../src/release.js');
const FileIO = rewire('../src/file-io.js');

describe('loadReleaseLogFromFile()', function () {
  let m_fs; // Mock fs

  it('Should be the correct log (1)', function () {
    // Rewire fs and parse calls.
    m_fs = {
      existsSync: function (path) {
        return true;
      },
      readFileSync: function (fPath) {
        return '[ { "version": "1.1.0", "date": "July 7th, 2017", "changes": ["First Change!"] } ]';
      }
    };
    FileIO.__set__("fs", m_fs); // Set FS to Mock FS
    const expectedLog = [new Release('1.1.0', 'July 7th, 2017', ['First Change!'])];
    assert.deepEqual(FileIO.loadReleaseLogFromFile(), expectedLog)
  })

  it('Should be the correct log (2)', function () {
    m_fs.readFileSync = function (fPath) {
      return '[ { "version": "1.1.0", "date": "July 7th, 2017", "changes": ["First Change!"] }, ' +
        '{ "version": "1.2.0", "date": "July 12th, 2017", "changes": ["Second Change!"] }]';
    };
    const expectedLog = [new Release('1.1.0', 'July 7th, 2017', ['First Change!']), new Release('1.2.0', 'July 12th, 2017', ['Second Change!'])];
    assert.deepEqual(FileIO.loadReleaseLogFromFile(), expectedLog);
  });
});