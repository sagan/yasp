'use strict';

var noop = function() {};

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(function (tabId) {
    chrome.pageAction.show(tabId);
});

var t = {
    a: 1,
};

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    sendResponse(t);
    return true;
});

console.log('\'Allo \'Allo! Event Page for Page Action');


(function() {
    var searchEngines = [];

    var getSearchEngines = function(cb) {
        cb = cb || noop;
        chrome.storage.sync.get('searchEngines', function(data) {
            if( data && typeof data.searchEngines != 'undefined' ) {
                console.log('got', data);
                searchEngines.length = 0; 
                searchEngines.push.apply(searchEngines, data.searchEngines.map(function(s) {
                    var a = s.split(/\s+/);
                    return {
                        name: decodeURIComponent(a[0]),
                        url: decodeURIComponent(a[1]),
                    };
                }));
                cb(0, searchEngines);
            }
        });
        return searchEngines;
    };

    var saveSearchEngines = function(cb) {
        cb = cb || noop;
        var serialized = searchEngines.map(function(a) {
            return encodeURIComponent(a.name) + ' ' + encodeURIComponent(a.url);
        });
        chrome.storage.sync.set({'searchEngines': serialized}, function(result) {
            cb(0, searchEngines);
        });
    };

    var addSearchEngine = function(s, cb) {
        cb = cb || noop;
        
        while(
            searchEngines.filter(function(se) {
                return se.name == s.name;
        }).length != 0 ) {
            var g = s.name.match(/^(.*)\s+\((\d+)\)$/);
            if( g ) {
                s.name = g[1] + ' (' + (Number(g[2]) + 1) + ')';
            } else {
                s.name = s.name + ' (1)';
            }
        }
        searchEngines.push(s);
        saveSearchEngines(cb);
    };

    var removeSearchEngine = function(s, cb) {
        cb = cb || noop;
        var newSearchEngines = searchEngines.filter(function(se) {
            return se.name != (s.name || s);
        }); 
        searchEngines.length = 0;
        if( newSearchEngines.length != 0 )
            searchEngines.push.apply(searchEngines, newSearchEngines);
        saveSearchEngines(cb);
    };

    
    var connections = [];

    chrome.runtime.onConnect.addListener(function(port) {
        connections.push(port);
        port.onMessage.addListener(function(msg) {
            var response = function() {
                connections.forEach(function(connectionPort) {
                    connectionPort.postMessage({data: searchEngines}); 
                });
            };
            if( !msg || !msg.cmd || msg.cmd == 'get' ) {
                getSearchEngines(response);
            } else if( msg.cmd == 'add' ) {
                addSearchEngine(msg.data, response);
            } else if( msg.cmd == 'remove' ) {
                removeSearchEngine(msg.data, response);
            }
        });
        port.onDisconnect.addListener(function() {
            connections.splice(connections.indexOf(port), 1);
        });
    });

})();


