// ------------------------------------------
// NAMESPACE

app.auth = window.app.auth || {};


// ------------------------------------------
// DEV AUTH

app.auth.dev = true;


// ------------------------------------------
// AUTH INIT

app.auth.init = function ( callback ) {

  // check if it's returning from oauth redirect

  if ( location.search !== "" ) {
    function getURLParameter(name) {
        return decodeURI(
            (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
        );
    }
    var stuff = getURLParameter('stuff').split(',');

    app.auth.data = {
      token : stuff[0],
      user  : stuff[1]
    };
  }

  // get sync data

  chrome.storage.sync.get(null, function( data ){

    // try using sync data

    if ( data["token"] && data["user"] ) {
      app.auth.data = data;
      callback && callback( app.auth.data );
    }

    // try using data that came back from URL

    else if ( app.auth.data && app.auth.data["token"] && app.auth.data["user"] ) {
      chrome.storage.sync.set(app.auth.data);
      callback && callback( app.auth.data );
    }

    // no auth, we need to get a token

    else {
      if ( app.auth.dev ) {
        window.location = "https://xively.com/oauth/authenticate?client_id=04ed42f8a59dde98a754";
      }
      else {
        window.location = "https://xively.com/oauth/authenticate?client_id=523e262d8173461e52f1";
      }      
    }

  });  
};