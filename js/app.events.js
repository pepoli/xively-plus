// ------------------------------------------
// NAMESPACE

app.events = window.app.events || {};


// ------------------------------------------
// LIST OF EVENTS

app.events.list = [];


// ------------------------------------------
// FEED LISTS

app.events.list.push({ 

  id : "feedLists",

  on : function () {

    // Feed switchers

    $(".feed-list-item-link").on( "click.app", app.feed.link);

    // Delete a feed

    $(".feed-list-item-delete").on( "click.app", app.feed.removeSaved);

    // Add a feed

    $("#addSavedFeed").on( "submit.app", app.feed.addSaved);
  },

  off : function () {
    $(".feed-list-item-link").off("app");
    $(".feed-list-item-delete").off("app");
    $("#addSavedFeed").off("app");
  }
});


// ------------------------------------------
// VIEW SWITCHERS

app.events.list.push({ 
  
  id : "viewSwitchers",

  on : function () {

    // Console

    $(".js-console").on( "click.app", function (event) {
      event.preventDefault();
      app.views.show( "console" );
    });

    // Settings

    $(".js-settings").on( "click.app", function (event) {
      event.preventDefault();
      app.views.show( "settings" );
    });
  },

  off : function () {
    $(".js-console").off("app");
    $(".js-settings").off("app");
  }
});


// ------------------------------------------
// SETTINGS BUTTONS

app.events.list.push({ 
  
  id : "settingsView",

  on : function () {

    // Sign out

    $(".js-unauth").on( "click.app", function (event) {
      event.preventDefault();

      app.views.show( "messaging" );

      app.reset( function () {
        app.auth.data = false;

        // reload to initiate again
        window.setTimeout(function(){
          location.reload();  
        }, 1000);
        
      });
    });
  },

  off : function () {
    $(".js-unauth").off("app");
  }
});


// ------------------------------------------
// SETTINGS BUTTONS

app.events.list.push({ 
  
  id : "authAgain",

  on : function () {

    // Reloader

    $("#auth-again").on("click", function(){
      location.reload();
    });
  },

  off : function () {
    $("#auth-again").off("app");
  }
});


// ------------------------------------------
// SETUP ALL

app.events.all = {

  on : function () {
    for ( var x = 0, len = app.events.list.length; x < len; x++ ) {
      
      app.events.list[x].on();

    }
  },

  off : function () {
    for ( var x = 0, len = app.events.list.length; x < len; x++ ) {
      
      app.events.list[x].off();

    }
  }

};
