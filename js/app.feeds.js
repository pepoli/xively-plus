// ------------------------------------------
// FEEDS NAMESPACE

app.feeds = window.app.feeds || {};


// ------------------------------------------
// FEED LIST CREATION

app.feeds.list = function ( feeds, parent ) {
  
  for ( var x = 0, len = feeds.length; x < len; x++ ) {
    $( parent ).append( ich.feedListItem(feeds[x]) );
  }

};


// ------------------------------------------
// PROCESS FEEDS

app.feeds.process = function ( data, callback ) {

  // Save feeds

  app.feed.list = data.results;

  // Error if no feeds, we don't support fake users

  if ( !app.feed.list || !app.feed.list.length ) {
    $("#messaging-text").html("cosm says no feeds, we got a problem!");
    return false;
  }

  // Set user name

  $(".js-user-name").html( app.feed.list[0].creator.replace(/.*users\//,"") );

  // Create list of user feeds

  app.feeds.list( app.feed.list, $(".feed-list") );

  // Get saved feeds

  chrome.storage.sync.get("saved", function (data) {
    if ( data.saved && data.saved.length ) {

      // Save saved feeds

      app.feed.saved = data.saved || [];

      // Create list of saved feeds
      
      app.feeds.list( data.saved, $(".saved-feeds") );

    }

    // All done

    callback && callback();
  });

};