
var onIcon= "images/icons/icon-on-64.png";
var offIcon= "images/icons/icon-off-64.png";
var icon = "images/icons/icon-64.png";

function setProxyIcon() {

    var icon = {
        path: icon
    };

    chrome.proxy.settings.get(
                {'incognito': false},
        function(config) {
            if (config["value"]["mode"] == "system") {
                chrome.browserAction.setIcon(icon);
            } else if (config["value"]["mode"] == "direct") {
                chrome.browserAction.setIcon(icon);
            } else {
                icon.path = onIcon;
                chrome.browserAction.setIcon(icon);
            }
        }
    );
}

function gotoPage(url) {

    var fullUrl = chrome.extension.getURL(url);
    chrome.tabs.getAllInWindow(undefined, function(tabs) {
        for (var i in tabs) {
            tab = tabs[i];
            if (tab.url == fullUrl) {
                chrome.tabs.update(tab.id, { selected: true });
                return;
            }
        }
        chrome.tabs.getSelected(null, function(tab) {
          chrome.tabs.create({url: url,index: tab.index + 1});
        });
    });
}

function callbackFn(details) {
    var proxySetting = JSON.parse(localStorage.proxySetting);

    if (proxySetting){
        var auth = proxySetting['auth'];
        var username = auth['user'];
        var password = auth['pass'];
    }

    if (proxySetting['auth']['user'] == '' &&
        proxySetting['auth']['pass'] == '')
        return {};

    return details.isProxy === !0 ? {
        authCredentials: {
            username: username,
            password: password
        }
    } : {}
}

chrome.webRequest.onAuthRequired.addListener(
            callbackFn,
            {urls: ["<all_urls>"]},
            ['blocking'] );

var proxySetting = {
    'pac_script_url' : {'http': '', 'https': '', 'file' : ''},
    'pac_type'   : 'file://',
    'http_host'  : '',
    'http_port'  : '',
    'https_host' : '',
    'https_port' : '',
    'socks_host' : '',
    'socks_port' : '',
    'socks_type' : 'socks5',
    'bypasslist' : '<local>,192.168.0.0/16,172.16.0.0/12,169.254.0.0/16,10.0.0.0/8',
    'proxy_rule' : 'singleProxy',
    'internal'   : '',
    'auth'       : {'enable': '', 'user': '', 'pass': ''}
}

var chinaList = [];

function getBypass() {
    var req = new XMLHttpRequest();
    var url = "https://raw.github.com/henices/Chrome-proxy-helper/master/data/cn.bypasslist";
    req.open('GET', url, true);
    req.onreadystatechange = processResponse;
    req.send(null);

    function processResponse() {
        if (req.readyState == 4 &&
            req.status == 200) {
            localStorage.chinaList = JSON.stringify(req.responseText.split(','));
        } else
            localStorage.chinaList = JSON.stringify(chinaList);
    }
}

chrome.runtime.onInstalled.addListener(function(details){
    // if(details.reason == "install") {
    //     localStorage.proxySetting = JSON.stringify(proxySetting);
    //     gotoPage('options.html');
    // }
    // else if(details.reason == "update"){
    //     gotoPage('CHANGELOG');
    // }
});


chrome.commands.onCommand.addListener(function(command) {
  if (command == 'open-option')
      gotoPage('options.html');
});

// sync extension settings from google cloud
chrome.storage.sync.get('proxySetting', function(val) {
    if (typeof val.proxySetting !== "undefined")
        localStorage.proxySetting = val.proxySetting;
});

setProxyIcon();

// sync bypass list from github.com
getBypass();
var interval = 1000 * 60 * 60;
setInterval(function() { getBypass(); }, interval);


