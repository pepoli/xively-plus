// ------------------------------------------
// FEED NAMESPACE

app.feed = window.app.feed || {};


// ------------------------------------------
// GET FEED

app.feed.get = function ( feedID, callback ) {

  // Try list cache
      
  for ( var x = 0, len = app.feed.list.length; x < len; x++ ) {
    if ( app.feed.list[x].id == parseInt(feedID) ) {
      callback && callback(app.feed.list[x]);
      return app.feed.list[x];
    }
  }

  // Not in cache, get it from Xively

  callback && xively.feed.get( feedID, callback );
};


// ------------------------------------------
// SET FEED

app.feed.set = function ( feed ) {
  var localFeed = app.feed.get( feed.id );

  if ( localFeed ) {

    // If in cache, update it

    localFeed = feed;
  }
  else {

    // If not, add it to the list

    app.feed.list.push(feed);
  }
};


// ------------------------------------------
// UPDATE DATASTREAM VALUES

app.feed.update = function ( event , feed ) {  
  var 
    currentID       = $(".feed-content").attr("data-feedid"),
    datastreams     = feed.datastreams,
    $datastreamList = $(".datastream"),
    $value;

  // Return if the feed we're trying to update does not match the one in view or we it doesn't have datastreams

  if ( feed.id != currentID || !datastreams || !datastreams.length ) {
    return false;
  }

  // Loop the datastreams and update if new value is different from current

  $datastreamList.each( function( x ) {
    $value = $(this).find(".datastream-value");

    if ( datastreams[x] && datastreams[x]["current_value"] && $value.html() != datastreams[x]["current_value"] ) {
      $value.html( ich.datastreamValue( datastreams[x] ) );
    }
  });

  // Refresh last updated

  app.helpers.showDate( feed.updated );

};


// ------------------------------------------
// SHOW FEED IN MAIN

app.feed.show = function ( feed, fetch ) {
  var 
    $main     = $(".feed-content"),
    currentID = $main.attr("data-feedid");

  // Remove loading state

  app.feed.loading = false;

  if ( !feed || !feed.id || feed.id == currentID ) {

    // Return if no feed or feed already in view

    return false;
  }

  // Unsubscribe feed in view

  xively.feed.unsubscribe ( currentID );

  // Update active feed in feed list

  $(".feed-list-item.active").removeClass("active");
  $(".feed-list-item-"+ feed.id).addClass("active");

  // Replace with new feed contents

  $main
    .html( ich.feed( feed ) )
    .removeClass("feed-"+ currentID)
    .attr("data-feedid", feed.id )
    .addClass("feed-"+ feed.id);

  // Refresh last updated

  app.helpers.showDate( feed.updated );

  // Subscribe to updates on new feed

  xively.feed.subscribe ( feed.id , app.feed.update );

  // Save as last open

  chrome.storage.sync.set({ "lastOpen" : feed.id });
};


// ------------------------------------------
// PROCESS FEED LINK

app.feed.link = function ( event ) {
  event.preventDefault();

  var $this = $(this),
      feedID = $this.attr("data-feedid"),
      localFeed = app.feed.get( feedID, false );

  // Use loading state to prevent multiple requests while fetching, especially with saved feeds which aren't cached the first time

  if ( app.feed.loading ) {
    return false;
  }

  app.feed.loading = true;

  app.feed.get( feedID, function ( feed ) {
    app.feed.loading = false;    

    // Show feed

    app.feed.show( feed );

    // Update values in case they were fetched

    app.feed.set( feed );
  });
};


// ------------------------------------------
// REMOVE SAVED FEED

app.feed.removeSaved = function ( event ) {
  event.preventDefault();

  var 
    $listItem = $(this).closest(".feed-list-item"),
    feedID    = $listItem.attr("data-feedid");

  // Remove feed from saved list

  for ( var x = 0, len = app.feed.saved.length; x < len; x++ ) {
    if ( app.feed.saved[x].id == parseInt(feedID) ) {
      app.feed.saved.splice(x,1);
      break;
    }
  }

  // Save changes

  chrome.storage.sync.set({ "saved" : app.feed.saved });

  // If feed was in view, show first in list

  if ( $listItem.hasClass("active") ) {
    app.feed.show( app.feed.list[0] || app.feed.saved[0] );
  }

  // Hide item and remove from DOM

  $listItem.hide(150, function(){
    $listItem.remove();
  });
};


// ------------------------------------------
// ADD SAVED FEED

app.feed.addSaved = function ( event ) {
  event.preventDefault();

  var 
    $newFeedID = $(".add-saved-id"),
    newFeedID  = $newFeedID.val();

  // Return if element has already been added or is part of the users feeds and show the respective feed

  if ( $(".feed-list-item-"+ newFeedID ).length ) {
    $(".feed-list-item-"+ newFeedID ).find(".feed-list-item-link").click();
    $newFeedID.val("");
    return false;
  }

  // Get new feed

  xively.feed.get( newFeedID, function ( feed ) {

    // Append new content and set event

    $(".saved-feeds")
      .append( ich.savedListItem( feed ) )
      .find(".feed-list-item-link")
      .last()
      .on("click.app", app.feed.link );

    // Update saved list

    chrome.storage.sync.get("saved", function (data) {
      app.feed.saved = data.saved || [];
      app.feed.saved.push({ id : feed.id, title : feed.title });
      chrome.storage.sync.set({ "saved" : app.feed.saved });
    });  

    // Show added feed

    app.feed.show( feed );

    // Clear text field value

    $newFeedID.val("");
  });
};