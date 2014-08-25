'use strict';

var app = angular.module('app', [
    'ui.bootstrap',
]);

app.controller('AppController', ['$location', '$scope', function($location, $scope) {
    $scope.search = function() {
        var q = $scope.q;
        location.href = 'https://www.google.com/?q=' + q + '#q=' + q;
    };
}]);

