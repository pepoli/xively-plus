// ------------------------------------------
// VIEWS NAMESPACE

app.views = window.app.views || {};


// ------------------------------------------
// SHOW VIEWS

app.views.show = function ( view ) {
  var 
    $appPane = $(".app-pane"),
    $appHeaderBottom = $(".app-header-bottom"),
    $feed = $(".feed-content"),
    $settings = $(".settings-content"),
    $messaging = $("#messaging");

  if ( view === "console" ) {

    $messaging.hide();
    $settings.hide();
    $appPane.show();
    $appHeaderBottom.show();
    $feed.show();

    $(".user-menu .active").removeClass("active");
    $(".js-console").addClass("active");

  }

  else if ( view === "settings" ) {

    $messaging.hide();
    $appPane.show();
    $appHeaderBottom.hide();
    $feed.hide();
    $settings.show();

    $(".user-menu .active").removeClass("active");
    $(".js-settings").addClass("active");

  }

  else if ( view === "messaging" ) {

    $appPane.hide();
    $appHeaderBottom.hide();
    $feed.hide();
    $settings.hide();
    $messaging.show();

  }
};