// ------------------------------------------
// APP NAMESPACE

var app = window.app || {};


// ------------------------------------------
// PRE-STRUCTURING

app.feed = {
  list      : [],
  saved     : []
};

app.auth = {
  data : false
};


// ------------------------------------------
// HELPERS

app.helpers = {};


// ------------------------------------------
// SHOW DATE

app.helpers.showDate = function ( dateString ) {
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


// ------------------------------------------
// APP RESET        !!! careful with this one

app.reset = function ( callback ) {
  var $feedContent =  $(".feed-content");

  // Reset lists

  $(".feed-list, .saved-feeds").html("");

  // Reset feed in view

  $feedContent.html("").removeClass("feed-"+ $feedContent.attr("data-feedid")).attr("data-feedid","");

  // Reset user name

  $(".js-user-name").html("Cosm");

  app.feed.list = [];
  app.feed.saved = [];
  app.auth.data = false;
  location.search = "";
  chrome.storage.sync.remove(["token", "user", "access_token", "permissions", "token_type", "saved", "lastOpen"], function(){
    callback && callback();
  });
};
