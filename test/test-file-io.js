var assert = require('assert');
var rewire = require('rewire');
var FileIO = rewire('../file-io.js');

describe('loadReleaseLogFromFile()', function() {
    var typeTests = [
        { expected: new FileIO.Releaselog() }
    ];

    typeTests.forEach(function(test) {
        it('Should have the correct type.', function() {
            assert.deepEqual(test.expected, new FileIO.Releaselog());
        });
    });


    var m_fs; // Mock FS

    it('Should be the correct log...', function() {
    // Rewire FS & Parse calls.
     m_fs = {
      existsSync: function(path) {
        return true;
      },
      readFileSync: function(fPath) {
        return '{"Releases": [ { "Tag": "1.0.0", "Date": "22-06-2017", "Changes": ["First Change!"] } ] }';
      }
    };
    FileIO.__set__("fs", m_fs); // Set FS to Mock FS
        let ExpectedLog  = new FileIO.Releaselog();

        let ReleaseA     = new FileIO.Release();
        ReleaseA.Tag     = "1.0.0";
        ReleaseA.Date    = "22-06-2017";
        ReleaseA.Changes = ["First Change!"];

        ExpectedLog.Releases.push(ReleaseA);
        assert.deepEqual(FileIO.loadReleaseLogFromFile(), ExpectedLog)
    })


    //FileIO.__set__("fs", m_fs2);
    it('Should be the correct log II', function() {
      m_fs.readFileSync = function(fPath) {
        return '{"Releases": [ {"Tag": "1.0.1", "Date": "23-06-2017", "Changes": ["Lame Change"] }, { "Tag": "1.0.0", "Date": "22-06-2017", "Changes": ["First Change!", "Second Change"] } ] }';
      };

        let ExpectedLog  = new FileIO.Releaselog();

        let ReleaseA     = new FileIO.Release();
        ReleaseA.Tag     = "1.0.1";
        ReleaseA.Date    = "23-06-2017";
        ReleaseA.Changes = ["Lame Change"];

        let ReleaseB     = new FileIO.Release();
        ReleaseB.Tag     = "1.0.0";
        ReleaseB.Date    = "22-06-2017";
        ReleaseB.Changes = ["First Change!", "Second Change"];

        ExpectedLog.Releases.push(ReleaseA);
        ExpectedLog.Releases.push(ReleaseB);

        assert.equal(FileIO.loadReleaseLogFromFile().Releases.length, 2);
        });
});