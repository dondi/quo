/*
 * To-do:
 * - Acquire access_token and access_token_secret via redirect to Twitter
 * 
 */

var sys = require('sys'),
	OAuth = require('./lib/oauth.js').OAuth,
	consumer_key = "wouldn't you like to know?",
	consumer_secret = "wouldn't you like to know?",
	
	oa = new OAuth("https://twitter.com/oauth/request_token",
    	"https://twitter.com/oauth/access_token",
    	consumer_key, consumer_secret,
    	"1.0A", "http://localhost:4000/oauth/callback", "HMAC-SHA1"),
    
	access_token = "acquired on-the-fly",
	access_token_secret = "acquired on-the-fly";

oa.get("https://api.twitter.com/1/statuses/home_timeline.json", access_token, access_token_secret, 
    function(error, data) {
        console.log(sys.inspect(data));
    });

/* Links:
 * https://dev.twitter.com/docs
 *     Implementing Sign in with Twitter
 * 
 * https://github.com/ciaranj/node-oauth
 * http://stackoverflow.com/questions/5428745/problems-with-oauth-on-node-js
 * 
 */