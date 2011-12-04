/*
 * To-do:
 * - Link up with jsOAuth lib
 * - Get information required for authorization
 * - Make it functional
 * 
 */

var test = function () {
    var oauth = OAuth({
    	// I need to acquire this information... and then hide it
        consumerKey: "<consumer-key>",
        consumerSecret: "<consumer-secret>"
    }),
    
    success = function (data) {
    	var timeline = JSON.parse(data.text);
    	timeline.foreach(function (element) {
    		alert(element.text);
    	});
    },
    
    failure = function (data) {
    	alert("Error")
    },
    
    connect = function () {
    	// Simple example of retrieving recent Tweets
    	oauth.get("http://api.twitter.com/1/statuses/home_timeline.json", success, failure);
    	
    	// encodeURI()
    	oauth.post("https://api.twitter.com/oauth/request_token"/*,*/ /* URI encoded callback location */);
    };
};

/* Links:
 * https://dev.twitter.com/docs
 *     Implementing Sign in with Twitter
 * 
 * bytespider.github.com/jsOAuth/api-reference
 */