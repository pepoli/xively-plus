
var bgpage = chrome.extension.getBackgroundPage();
bgpage.init();

var app = window.app || {};

app.showDate = function ( dateString ) {
  var date = new Date( dateString );

  var monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];

  var 
    day    = "" + date.getDate(),
    month  = "" + monthNames[date.getMonth()],
    hour   = "" + date.getHours(),
    minute = "" + date.getMinutes(),
    second = "" + date.getSeconds(),
    year   = "" + date.getFullYear();

  //if (1 === day.length) { day = "0" + day;}
  if (1 === hour.length) {hour = "0" + hour;}
  if (1 === minute.length) {minute = "0" + minute;}
  if (1 === second.length) {second = "0" + second;}

  $(".feed-updated-time")
    .attr( "datetime", dateString )
    .html( hour +":"+ minute +":"+ second +" on "+ day +" "+ month +" "+ year );

};

var $main = $(".feed-content");

app.feed = {
  current   : false,
  list      : [],
  saved     : [],
  getting   : false
};

app.feed.get = function ( feedID, callback ) {
      
  for ( var x = 0, len = app.feed.list.length; x < len; x++ ) {
    if ( app.feed.list[x].id == parseInt(feedID) ) {
      callback && callback(app.feed.list[x]);
      return app.feed.list[x];
    }
  }

  callback && cosm.feed.get( feedID, callback );
};

app.feed.set = function ( feed ) {
      
  for ( var x = 0, len = app.feed.list.length; x < len; x++ ) {
    if ( app.feed.list[x].id == feed.id ) {
      app.feed.list[x] = feed;
      return false;
    }
  }

  app.feed.list.push(feed);

};

app.feed.update = function ( event, feed ) {
  var currentID = $main.attr("data-feedid");
  var datastreams = feed.datastreams;
  var $datastreamList = $(".datastream");

  if ( feed.id != currentID ) {
    return false;
  }

  $datastreamList.each( function( x ) {
    var $value = $(this).find(".datastream-value"),
        targetVal;

    if ( datastreams.length && datastreams[x] ) {
      targetVal = datastreams[ x ]["current_value"];

      if ( $value.html() != targetVal ) {
        $value.html( ich.datastreamValue( datastreams[x] ) );
      }
    }
  });

  app.showDate( feed.updated );

};

app.feed.show = function ( feed, fetch, first ) {
  var currentID = $main.attr("data-feedid");

  app.feed.getting = false;

  if ( !feed || !feed.id || feed.id == currentID ) {
    return false;
  }
  else {
    cosm.feed.unsubscribe ( currentID );
  }

  $(".feed-list-item.active").removeClass("active");
  $(".feed-list-item-"+ feed.id).addClass("active");

  app.feed.current = feed;

  $main.html( ich.feed( feed ) )
    .removeClass("feed-"+ currentID)
    .attr("data-feedid", feed.id )
    .addClass("feed-"+ feed.id);

  app.showDate( feed.updated );

  // make it realtime
  cosm.feed.subscribe ( feed.id , app.feed.update );

  chrome.storage.sync.set({ "lastOpen" : feed.id });
};

app.feed.link = function ( event ) {
  event.preventDefault();

  var $this = $(this),
      feedID = $this.attr("data-feedid"),
      localFeed = app.feed.get( feedID, false );

  if ( localFeed ) {
    app.feed.getting = true;
    app.feed.show( localFeed );
  }

  // update values
  cosm.feed.get( feedID, function ( data ) {
    if ( !app.feed.getting ) {
      app.feed.show( data );
    }

    app.feed.set( data );
  });
};

app.feed.removeSaved = function ( event ) {
  event.preventDefault();

  var 
    $listItem = $(this).closest(".feed-list-item"),
    feedID    = $listItem.attr("data-feedid");

  for ( var x = 0, len = app.feed.saved.length; x < len; x++ ) {
    if ( app.feed.saved[x].id == parseInt(feedID) ) {
      app.feed.saved.splice(x,1);
      break;
    }
  }

  chrome.storage.sync.set({ "saved" : app.feed.saved });

  if ( $listItem.hasClass("active") ) {
    app.feed.show( app.feed.list[0] || app.feed.saved[0] );
  }

  $listItem.hide(150, function(){
    $listItem.remove();
  });
};

app.reset = function () {
  var $feedContent =  $(".feed-content");

  $(".feed-list, .saved-feeds").html("");
  $feedContent.html("").removeClass("feed-"+ $feedContent.attr("data-feedid")).attr("data-feedid","");
  $(".js-user-name").html("Cosm");
  $(".feed-list-item-link").off("app");
  $(".feed-list-item-link").off("app");
  $(".js-console").off("app");
  $(".js-settings").off("app");
  $(".js-unauth").off("app");
  $("#addSavedFeed").off("app");

  app.feed.list = [];
  app.feed.saved = [];
  //chrome.storage.sync.set({ "saved" : app.feed.saved });
  chrome.storage.sync.remove("lastOpen");
};

app.init = function ( auth ) {
  var $messaging = $("#messaging");
  var $messagingText = $("#messaging-text");

  if ( !auth || !auth.token || !auth.user ) {
    $messagingText.html('Failed authentication!');
    $messaging.find("#auth-again").show();
  }
  else {
    $messagingText.html("loading ...");

    cosm.setKey( auth.token );

    cosm.feed.list({ user: auth.user }, function( data ){
      var feeds = data.results,
          $feedList = $(".feed-list");

      if ( !feeds || !feeds.length ) {
        $messagingText.html("cosm says no feeds, we got a problem!");
        $messaging.find("#auth-again").show();
      }

      // set user name
      $(".js-user-name").html( feeds[0].creator.replace(/.*users\//,"") );
      
      for ( var x = 0, len = feeds.length; x < len; x++ ) {
        $feedList.append( ich.feedListItem(feeds[x]) );
      }

      chrome.storage.sync.get("saved", function (data) {
        if ( data.saved && data.saved.length ) {
          var $savedFeeds = $(".saved-feeds");
          for ( var x = 0, len = data.saved.length; x < len; x++ ) {
            $savedFeeds.append( ich.savedListItem( data.saved[x] ) );
          }

          $savedFeeds
            .find(".feed-list-item-link")
            .on( "click.app", app.feed.link);

          $savedFeeds
            .find(".feed-list-item-delete")
            .on( "click.app", app.feed.removeSaved);
        }
      });

      // chrome.storage.sync.remove("saved");

      // save feeds
      app.feed.list = data.results;

      // setup feed switch
      $(".feed-list-item-link").on( "click.app", app.feed.link);

      // setup pane switches
      $(".js-console").on( "click.app", function (event) {
        event.preventDefault();
        var $opener = $(".feed-content, .app-header-bottom");
        var $closer = $(".settings-content");

        $closer.hide();
        $opener.show();

        $(".js-settings").removeClass("active");
        $(this).addClass("active");
      });

      $(".js-settings").on( "click.app", function (event) {
        event.preventDefault();
        var $opener = $(".settings-content");
        var $closer = $(".feed-content, .app-header-bottom");

        $closer.hide();
        $opener.show();

        $(".js-console").removeClass("active");
        $(this).addClass("active");
      });

      $(".js-unauth").on( "click.app", function (event) {
        event.preventDefault();

        $(".app-pane").hide();
        app.reset();

        $messaging.show();
        $(".settings-content").hide();
        $("#auth-again").show();
        bgpage.removeStorage();
        bgpage.init();
      });

      $("#addSavedFeed").on( "submit.app", function (event) {
        event.preventDefault();

        var $newFeedID = $(".add-saved-id"),
            newFeedID = $newFeedID.val();

        if ( $(".feed-list-item-"+ newFeedID ).length ) {
          $(".feed-list-item-"+ newFeedID ).find(".feed-list-item-link").click();
          $newFeedID.val("");
          return false;
        }

        cosm.feed.get( newFeedID, function ( feed ) {
          $(".saved-feeds")
            .append( ich.savedListItem( feed ) )
            .find(".feed-list-item-link")
            .last()
            .on("click.app", app.feed.link );

          chrome.storage.sync.get("saved", function (data) {
            app.feed.saved = data.saved || [];
            app.feed.saved.push({ id : feed.id, title : feed.title });
            chrome.storage.sync.set({ "saved" : app.feed.saved });
          });  

          app.feed.show( feed );
          $newFeedID.val("");
        });
      });   

      // check last open
      chrome.storage.sync.get("lastOpen", function (data) {
        if ( data.lastOpen ) {
          app.feed.get( data.lastOpen , function( feed ){
            app.feed.show( feed, true, true );
          });
          //$(".feed-list-item-"+ data.lastOpen).find(".feed-list-item-link").click();
        }
        else {
          app.feed.show( app.feed.list[0], false, true );
        }

        // all done, show the thing
        $messaging.hide();
        $(".app-pane").removeClass("closed").show();
        $(".app-header-bottom").show();
        $(".app-header-top").show();
        $(".feed-content").show();

      });

      chrome.storage.sync.get("saved", function (data) {
        app.feed.saved = data.saved || [];
      });   
    });
  }
};

$("#auth-again").on("click", function(){
  bgpage.init();
});