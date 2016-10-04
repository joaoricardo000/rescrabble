'use strict';
(function () {
    var requirements = [
        'ngRoute',
        'ngSanitize',
        'LocalStorageModule',
        'RegexGame.controllers',
        'RegexGame.services'
    ];

    var app = angular.module('RegexGame', requirements);
    app.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.when('/?', {
                templateUrl: '/static/templates/views/search.html',
                reloadOnSearch: false,
                controller: 'SearchController'
            }).when('/golf/?', {
                templateUrl: '/static/templates/views/game.html',
                controller: 'GameController'
            }).when('/search/?', {
                redirectTo: '/'
            }).otherwise({
                redirectTo: '/'
            });
        }]);


    app.run(function ($rootScope, $location, $timeout) {
        $rootScope.$on('$routeChangeSuccess',
            function (event) {
                document.getElementsByTagName("body")[0].className = "";
                ga('send', 'pageview', {page: $location.path()});
                if (typeof twttr != 'undefined' && $location.path() == "/")
                    $timeout(function () {
                        twttr.widgets.load(document.getElementById("index-container"));
                    });
            });
    });
}());