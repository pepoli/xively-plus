//
// OAUTH INFO
//
// Authorize URL  https://cosm.com/oauth/authenticate
// Token URL      https://cosm.com/oauth/token


// APP INFO
//
// Client ID      523e262d8173461e52f1
// Client Secret  MCOESHm9gS-YmOgRkMM-ISUN5GntRycDdp1LLzeRWabSkia-
// Redirect URL   http://tinyurl.com/crzwtsr/

var appWindow;

function initView ( auth ) {
  var viewTabUrl = chrome.extension.getURL('index.html');
  var views      = chrome.extension.getViews();
  var view;
  var auth;

  for (var i = 0; i < views.length; i++) {
    var tempView = views[i];

    if (tempView.location.href == viewTabUrl) {

      view = tempView;
      break;
    }
  }

  if ( view && view.app ) {
    view.app.init( auth );
  }
}

function storeData ( data ) {
  chrome.storage.sync.set(data);
  initView( data );
}

function removeStorage () {
  chrome.storage.sync.remove(["token", "user", "access_token", "permissions", "token_type", "saved"]);
}

function init () {
  // authorize
  chrome.storage.sync.get(null, function( data ){

    if ( !data["token"] ) {
      chrome.tabs.create({ url : "https://cosm.com/oauth/authenticate?client_id=523e262d8173461e52f1" });
    }
    else {
      initView( data );
    }

  });
}