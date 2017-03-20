/* jshint node: true */
(function(){

    /**
     * API object for UpLynk LiveSlicer
     * @param {String} url 
     * @param {String} [apiKey=''] 
     * @return {LiveSlicer}
     */
    function LiveSlicer( url, apiKey ) {
        // Make calls to LiveSlicer() without "new" safe
        if (!(this instanceof LiveSlicer)) return new LiveSlicer( url, apiKey );
        this.apiURL = require('url').parse(url);
        this.apiKey = apiKey || false;
        this.timeout = 500; //ms
    };

    /**
     * Sends the data in parameters to the API using method as a URL, executes callBack 
     * on response, passing the parsed JSON response as object in the first parameter
     * @param {String} method
     * @param {object} parameters
     * @param {function(object)} [callBack](response)
     */
    LiveSlicer.prototype.request = function( method, parameters, callBack) {

        // Add authentication parameters if needed
        if (this.apiKey) {
            var cnonce = Math.floor(Math.random()*1000);
            parameters.cnonce = cnonce;
            parameters.timestamp = Math.floor( new Date()/1000);
            const crypto = require('crypto-js');
            var authToken = crypto.SHA1(this.apiKey).toString();
            var sig_input = `/${method}:${parameters.timestamp}:${cnonce}:${authToken}`;
            parameters.sig = new Buffer(crypto.SHA1(sig_input).toString(),'hex').toString('base64');
        }

        if (typeof callBack !== 'function') callBack = function(data){};
        var payload = JSON.stringify(parameters);

        const http = require('http');
        var rq = http.request(
            {
                protocol: this.apiURL.protocol,
                hostname: this.apiURL.hostname,
                port: this.apiURL.port,
                method: 'POST',
                path: '/' + method,
                timeout: this.timeout,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': payload.length
                }
            },
            (response)=>{
                var responseData = ''
                response.setEncoding('utf8');
                response.on('data', (chunk)=>responseData+=chunk );
                response.on('end',()=>{
                    var parsedData = {};
                    try {
                        parsedData = JSON.parse(responseData);
                    } catch (e) {
                        parsedData = {
                            error: -33915,
                            msg: `Failed to parse response provided by the server: ${e.message}`
                        };
                    }
                    callBack(parsedData);
                })
            }
        );
        rq.on('error', (e)=>{
            callBack( { error: -33916,  msg: `Error accessing the slicer API: ${e.message}` } );
        });
        rq.write(payload);
        rq.end();
    };
    exports.LiveSlicer = LiveSlicer;

    /**
     * Provides Integration API interface to UpLynk services in the cloud.
     * @param {string} userID User ID or Account GUID, from "Gears"/Account Settings tab
     * @param {string} apiKey API Key
     * @param {string} [apiURL]
     * @returns {API}
     */
    function API( userID, apiKey, apiURL ) {
        // Make calls to API() without "new" safe
        if (!(this instanceof API)) return new API( userID, apiKey, apiURL);
        var url = apiURL || 'http://services.uplynk.com';
        this.apiURL = require('url').parse(url);
        this.userID = userID || '';
        this.apiKey = apiKey || '';
        this.timeout = 500; //ms
    }

    /**
     * Call UpLynk integration API
     * @param {string} endPoint API endpoint / path
     * @param {object} parameters
     * @param {function(object)} callBack callback to be called with the response
     */
    API.prototype.request = function( endPoint, parameters, callBack) {

        // Add required parameters
        parameters._owner = this.userID;
        parameters._timestamp = Math.floor((new Date()).getTime()/1000);

        // Do their insane request encoding
        const zlib = require('zlib');
        var msg = zlib.deflateSync(JSON.stringify(parameters)).toString('base64');
        const crypto = require('crypto');
        var sig = encodeURIComponent(crypto.createHmac('sha256',this.apiKey).update(msg).digest('hex'));
        msg = encodeURIComponent(msg);
        var payload = `msg=${msg}&sig=${sig}`

        // Start the HTTP transaction
        const http = require('http');
        var rq = http.request(
            {
                protocol: this.apiURL.protocol,
                hostname: this.apiURL.hostname,
                method: 'POST',
                path: endPoint,
                timeout: this.timeout,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': payload.length
                }
            },
            (response)=>{
                var responseData = ''
                response.setEncoding('utf8');
                response.on('data', (chunk)=>responseData+=chunk );
                response.on('end',()=>{
                    var parsedData = {};
                    try {
                        parsedData = JSON.parse(responseData);
                    } catch (e) {
                        parsedData = {
                            error: -33915,
                            msg: `Failed to parse response provided by the server: ${e.message}`
                        };
                    }
                    callBack(parsedData);
                })
            }
        );
        rq.on('error', (e)=>{
            callBack( { error: -33916,  msg: `Error accessing the UpLynk API: ${e.message}` } );
        });
        rq.write(payload);
        rq.end();
    }
    exports.API = API;

}());