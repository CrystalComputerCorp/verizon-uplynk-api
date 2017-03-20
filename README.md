# verizon-uplynk-api
Node.JS implementation of Verizon UpLynk APIs

`verizon-uplynk-api` implements two sets of API's provided by VDMS UpLynk:

- API to access LiveSplicer (trans|en)coders;
- API to access UpLynk cloud platform;

## LiveSlicer API
LiveSlicer API is used to communicate with an instance of UpLynk Live Slicer running locally and uploading video to the cloud. For details of this API and available methods please see [http://support.uplynk.com/doc_live_slicer_api.html](http://support.uplynk.com/doc_live_slicer_api.html).

To use this API, create an instance of `LiveSlicer()` and use `LiveSlicer.request()` passing the API method, parameters as object and a callback to asynchronously process the response.

See the documentation referenced above for a full list of methods available.

### LiveSlicer API Example

```javascript
const vzAPI = require('verizon-uplynk-api');
var liveSlicer = new vzAPI.LiveSlicer('http://10.122.173.51:65009');
liveSlicer.request('status',{},(response)=>{
    if (response.error) {
        console.log(`LiveSlicer access error ${response.error} ${response.msg}.`);
    } else {
        console.log(`LiveSlicer ${response.status.slicer_id} is sending ${response.status.signal}`);
    }
});
```

Output:

    LiveSlicer myslicer1 is sending TS multicast 233.1.1.1:11112 1280x720    
        

## Integration APIs
Integration API's at http://service.uplynk.com are used to communicate with the UpLynk cloud platform. For details of these API's see [http://support.uplynk.com/doc_integration_apis.html](http://support.uplynk.com/doc_integration_apis.html).

To use these API's, create an instance of `API()`, then use `API.request()` passing the API "endpoint", parameters as object and a callback to asynchronously process the response.

See the documentation referenced above for a full list of endpoints available.

### Integration APIs Example

```javascript
const vzAPI = require('verizon-uplynk-api');
var api = new vzAPI.API( '06d6f896162146e3928032bb2e546837', 'rw6ZDVL/2Oz0tjIu3ha2tO5TCt3qOy+gqnbixXI8A');
// Fetch and print asset ID's
api.request('/api2/asset/list',{},(response)=>{
    if (response.error) {
        console.log(`Integration API access error ${response.error} ${response.msg}.`);
    } else {
        console.log(`Total ${response.assets.length} assets found:`);
        for ( a in response.assets ) {
            console.log(`   ${response.assets[a].id} ${response.assets[a].desc}`);
        }
    }
});
```
Output:

    Total 6 assets found:
    7e4f02e6e358486593d194bfc108b1cf realtime.mpg
    1f3656434d1a4205bad477dea0a90982 safelite.ts
    e91ebe7af2c449e792cb14947cf3beb0 safelite_30_640x360_264.ts
    fbba907a1afb4a8d861a61477add7028 salonpas.ts
    0fa8d090231c4503adc99e8a6291e91f wix.ts
    a296e9cf4eac4cda9b525ebc0d4d5082 crizal.ts

## Testing
Unit tests are using `nodeunit`.

Running unit tests would require you to have an active VDMS UpLynk account and a running instance of LiveSlicer with API enabled. To run tests, you will also need to create a `config.json` file in `test` directory. This JSON file is used to store your UpLink account credentials (userID/accountGUID and API key), and the URL of your LiveSlicer API. Obviously, I am not shipping mine with the module;).

The format of this file is:

```json
{
    "liveSlicerURL": "<URL of the LiveSlicer API>",
    "liveSlicerURLAuth": "<URL of the Authenticated LiveSlicer API",
    "userID": "<User ID from Gears/Account Settings tab in CMS>",
    "apiKey": "<API Key from Gears/Playback Tokens tab in CMS>"
}
```

Once this is set up and LiveSlicer is running, execute

    nodeunit

to run the tests.

## Legal
License: MIT  
Copyright &copy; 2017 Crystal Computer Corp.   
[http://www.crystalcc.com](http://www.crystalcc.com)

