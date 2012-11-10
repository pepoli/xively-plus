function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

var stuff = getURLParameter('stuff').split(',');
var data = {
  token : stuff[0],
  user  : stuff[1]
}

chrome.extension.getBackgroundPage().storeData( data );

chrome.tabs.getCurrent(function(tab) {
  chrome.tabs.remove( tab.id );
});