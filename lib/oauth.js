/**
 * Created by austin on 9/22/14.
 */

var authenticator = require('./authenticator')
    , Promise = require('bluebird')
    , request = require('request-promise')
    , querystring = require('querystring');

var oauth = {};

oauth.getRequestAccessURL = function(args) {

    var url = 'https://www.strava.com/oauth/authorize?'
        , oauthArgs = {
            client_id: args.clientId || authenticator.getClientId()
            , redirect_uri: args.redirectUri || authenticator.getRedirectUri()
            , response_type: 'code'
        };

    if(args.scope)
        oauthArgs.scope = args.scope;
    if(args.state)
        oauthArgs.state = args.state;
    if(args.approval_prompt)
        oauthArgs.approval_prompt = args.approval_prompt;

    var qs = querystring.stringify(oauthArgs);

    url += qs;
    return url;
};

oauth.getToken = function(args, done) {
    return request({
      method: 'POST'
      , url: 'https://www.strava.com/api/v3/oauth/token'
      , json: true
      , form : {
            code: args.code
            , client_secret: args.clientSecret || 
		  		authenticator.getClientSecret()
            , client_id: args.clientId || 
		  		authenticator.getClientId()
        }
    }, done);

};

oauth.deauthorize = function(args,done) {

    var endpoint = 'https://www.strava.com/oauth/deauthorize';

    var url = endpoint
        , options = {
            url: url
            , method: 'POST'
            , json: true
              // We want to consider some 30x responses valid as well
              // 'simple' would only consider 2xx responses successful
            , simple: false
            , headers: {
                Authorization: 'Bearer ' + args.access_token
            }
        };

    // Promise.resolve is used to convert the promise returned
    // to a Bluebird promise
    // asCallback is used to support both Promise and callback-based APIs
    return Promise.resolve(request(options)).asCallback(done);
};

module.exports = oauth;
