'use strict';

var app = angular.module('app', [
    'ui.bootstrap',
]);

app.factory('AppService',['$rootScope', function($rootScope) {
    var a = {};

    var defaultSearchEngines = [
        {name: 'Wikipedia (zh)', url: 'http://zh.wikipedia.org/w/index.php?title=Special:Search&search={searchTerms}'},
        {name: 'Wikipedia (ja)', url: 'http://ja.wikipedia.org/w/index.php?title=Special:Search&search={searchTerms}'},
        {name: 'Wikipedia (en)', url: 'http://en.wikipedia.org/w/index.php?title=Special:Search&search={searchTerms}'},
    ];

    var searchEngines = [];

    var searchEnginePort = chrome.runtime.connect({name: 'searchEngine'});

    searchEnginePort.onMessage.addListener(function(msg) {
        console.log('received msg', msg.data);
        searchEngines.length = 0;
        if( msg.data.length != 0 )
            searchEngines.push.apply(searchEngines, msg.data);
        $rootScope.$apply();
    }); 

    var addSearchEngine = function(s) {
        searchEnginePort.postMessage({cmd: 'add', data: s});
    };
    var removeSearchEngine = function(s) {
        searchEnginePort.postMessage({cmd: 'remove', data: s});
    };


    a.searchEngines = searchEngines;
    a.defaultSearchEngines = defaultSearchEngines;
    a.addSearchEngine = addSearchEngine;
    a.removeSearchEngine = removeSearchEngine;

    searchEnginePort.postMessage({cmd: 'get'});

    return a; 
}]);

app.controller('AppController', ['$location', '$scope', '$element', 'AppService', function($location, $scope, $element, AppService) {
        $scope.searchEngines = AppService.searchEngines; 
    $scope.defaultSearchEngines = AppService.defaultSearchEngines;

    $scope.addSearchEngine = AppService.addSearchEngine;
    $scope.removeSearchEngine = AppService.removeSearchEngine;

    $scope.search = function(s) {
        var q= $scope.q;
        if( s )
            location.href = s.url.replace('{searchTerms}', encodeURIComponent(q));
        else
            location.href = 'https://www.google.com/search?q=' + encodeURIComponent(q);
    };
    // not work for new tab page as location bar is already focused
    //angular.element('#q').trigger('focus');
}]);

