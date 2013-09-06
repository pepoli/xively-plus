// ------------------------------------------
// INIT AUTH

app.auth.init( function ( auth ) {

  // Set loading

  $("#messaging-text").html("loading ...");

  // Set API key on XivelyJS

  xively.setKey( auth.token );

  // Fetch user's feeds

  xively.feed.list({ user: auth.user }, function ( data ) {

    // Process feeds

    app.feeds.process( data, function () {

      // Fetch last open

      chrome.storage.sync.get("lastOpen", function (data) {
        if ( data.lastOpen ) {

          // We got a last open feed ID, lets get the feed and show it 

          app.feed.get( data.lastOpen , function( feed ){
            app.feed.show( feed, true );
          });
        }
        else {

          // Not last open, show the first on list

          app.feed.show( app.feed.list[0] );
        }

        // Setup events

        app.events.all.on();

        // Show the UI

        app.views.show("console");

      });

    });

  });

});