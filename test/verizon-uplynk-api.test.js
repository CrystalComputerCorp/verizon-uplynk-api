
var api = require('../verizon-uplynk-api.js');

const fs = require('fs');
const config = JSON.parse( fs.readFileSync('test/config.json'));

const noConfigError = `

NOTE: most tests executed agains UpLynk API and LiveSlicer require API keys and running
LiveSlicer. If you want to run these tests create your own account and add a config.json
file to the test directory, containing the following options:

{
    "liveSlicerURL": "<URL of the LiveSlicer API>",
    "liveSlicerURLAuth": "<URL of the Authenticated LiveSlicer API",
    "userID": "<User ID from Gears/Account Settings tab in CMS>",
    "apiKey": "<API Key from Gears/Playback Tokens tab in CMS>"
}

`;

exports.testLiveSlicerObject = function(test) {
    
    var l = api.LiveSlicer('http://127.0.0.1:65009');
    test.ok(l instanceof api.LiveSlicer);

    var ls = new api.LiveSlicer('http://127.0.0.1:65009');
    test.ok(ls instanceof api.LiveSlicer);
    test.equal(ls.apiURL.hostname,'127.0.0.1');
    test.equal(ls.apiURL.port, 65009);

    test.deepEqual(l,ls);

    test.done();
}

exports.testLiveSlicerNoConnect = function(test) {
    // Test connection errors
    test.expect(1);
    var lse = new api.LiveSlicer('http://127.0.0.1:23234');
    lse.request('nosuchmethod',{},(data)=>{
        test.equal(data.error, -33916);
        test.done();
    });
}

exports.testAPIObject = function(test) {
    var a = api.API('boroda','sogrevaetvholoda');
    var a2 = new api.API('boroda','sogrevaetvholoda');
    test.ok(a instanceof api.API);
    test.ok(a2 instanceof api.API);
    test.deepEqual(a,a2);
    test.equal(a.apiURL.hostname,'services.uplynk.com');
    test.done();
}

exports.testRemoteConfig = function(test) {
    test.equal(typeof(config.liveSlicerURL),'string', noConfigError);
    test.done();
}

exports.testLiveSlicerUnknownEndpoint = function(test) {
    var ls = new api.LiveSlicer(config.liveSlicerURL);
    test.expect(1);
    ls.request('badendpoint',{},(response)=>{
        test.notEqual(0,response.error)
        test.done();
    });
}

exports.testLiveSlicerStatus = function(test) {
    var ls = new api.LiveSlicer(config.liveSlicerURL);
    test.expect(2);
    ls.request('status',{},(response)=>{
        test.equal(0,response.error)
        test.equal('object', typeof response.status );
        test.done();
    });
}

exports.testLiveSlicerNoAuthError = function(test) {
    var ls = new api.LiveSlicer(config.liveSlicerURLAuth);
    test.expect(1);
    ls.request('status',{},(response)=>{
        test.equal(11,response.error); // should be 'timestamp, cnonce, and/or sig parameter missing'
        test.done();
    });
}

exports.testLiveSlicerStatusAuth = function(test) {
    var ls = new api.LiveSlicer(config.liveSlicerURLAuth,config.apiKey);
    test.expect(2);
    ls.request('status',{},(response)=>{
        test.equal(0,response.error,response.msg)
        test.equal('object', typeof response.status );
        test.done();
    });
}

exports.testAPIAssetList = function(test) {
    var a = api.API(config.userID,config.apiKey);
    test.expect(2);
    a.request('/api2/asset/list', {}, (response)=>{
        test.equal(0,response.error,response.msg);
        test.ok(Array.isArray(response.assets));
        test.done();
    });
}




