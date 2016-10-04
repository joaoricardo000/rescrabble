'use strict';
(function () {
    var app = angular.module('RegexGame.controllers', []);

    app.controller('SearchController',
        function ($scope, $location, $timeout, WordsFactory) {
            $scope.wordsList = null;
            $scope.matches = [];

            $scope.search = function (regex) {
                $scope.matches = WordsFactory.exec($scope.wordsList, regex);
                $scope.totalMatches = $scope.matches.length;
            };

            var searchTimeout = null;
            $scope.$on('regex-update',
                function (event, regex) {
                    if (regex) {
                        $location.search('q', regex.source);
                        $timeout.cancel(searchTimeout);
                        searchTimeout = $timeout(function () {
                            $scope.search(regex)
                        }, 300);
                    } else {
                        $scope.matches = [];
                        $scope.totalMatches = 0;
                        $location.search('q', null);
                    }
                });

            $scope.updateRegexBuilder = function () {
                $timeout(function () {
                    $scope.$broadcast("set-regex-tools", false);
                    if ($location.search().q && typeof $location.search().q == "string")
                        $scope.$broadcast("set-regex-text", $location.search().q)
                });
            };

            $scope.init = function () {
                WordsFactory.getDictionary({lang: 'pt-br'}, function (err, data) {
                    $scope.wordsList = data;
                });
            };
            $scope.init();
        });

    app.controller('GameController',
        function ($scope, $timeout, $location, $routeParams, LevelsFactory, GameStatusService, localStorageService) {
            $scope.levelData = null;
            $scope.gameMode = "";

            $scope.gameStatus = {};
            $scope.isLevelCompleted = false;
            $scope.hintsCount = 0;

            $scope.golfSize = 5;
            $scope.golfPoints = 0;

            $scope.compiledRegex = null;

            $scope.testWords = function () {
                $scope.gameStatus = GameStatusService.getLevelStatus($scope.levelData, $scope.compiledRegex, true);
                $scope.checkGameStatus();
            };

            $scope.checkGameStatus = function () {
                $scope.updateGolfPoints();
                if ($scope.gameStatus.percentage == 100 && $scope.levelData.id && !$scope.isLevelCompleted) {
                    $timeout(function () {
                        $("#finish-modal").modal("show");
                        $scope.isLevelCompleted = true;
                    }, 500)
                }
            };

            $scope.onLevelLoaded = function (err, levelData) {
                $scope.levelData = levelData;
                $scope.gameStatus = GameStatusService.getInitialStatus(levelData);
            };

            $scope.getRandomLevel = function () {
                LevelsFactory.getRandomLevel({size: $scope.golfSize}, $scope.onLevelLoaded);
                $scope.$broadcast("set-regex-text", "")
            };

            $scope.solveLevel = function () {
                var solution = findregex($scope.levelData.goodWords, $scope.levelData.badWords);
                $scope.$broadcast("set-regex-text", solution)
            };

            $scope._addGolfEventListeners = function () {
                var $btnsGolfSize = $('.li-golfsize .btn');
                var golfSize = localStorageService.get("golfSize");
                $btnsGolfSize.removeClass('active');
                $('.golf-size-' + golfSize).addClass('active');
                $scope.golfSize = golfSize || 5;
                $btnsGolfSize.click(function (e) {
                    $scope.golfSize = parseInt(e.target.innerText);
                    localStorageService.set("golfSize", $scope.golfSize);
                    $scope.getRandomLevel();
                    $scope.$apply();
                });
            };

            $scope.updateGolfPoints = function () {
                var points = 0;
                angular.forEach($scope.gameStatus.goodWords, function (word) {
                    if (word.match) points += 10
                });

                angular.forEach($scope.gameStatus.badWords, function (word) {
                    if (word.match) points -= 10
                });

                points -= $scope.compiledRegex.source.length;
                $scope.golfPoints = points;
            };

            $scope.$on('regex-update',
                function (event, regex) {
                    if (regex) {
                        $scope.compiledRegex = regex;
                        $scope.testWords();
                    } else {
                        $scope.golfPoints = 0;
                        $scope.gameStatus = GameStatusService.getInitialStatus($scope.levelData);
                    }
                });

            $scope.init = function () {
                $scope._addGolfEventListeners();
                LevelsFactory.getRandomLevel({size: $scope.golfSize}, $scope.onLevelLoaded);
                $scope.gameMode = "golf";
                $("body").addClass("game-golf");
            };
            $scope.init();
        });

    app.controller('RegexBuilderController',
        function ($scope) {
            // raw regex input
            $scope.rawRegex = "";
            $scope.quickTools = ['.', '?', '+', '*', '^', '$', '|', '[', ']', '{', '}', '(', ')', '\\', '/'];

            // regex builder input
            $scope.regexText = "";
            $scope.regexCompiled = "";
            $scope.regexElements = [];

            $scope.updateRegex = function (regexText) {
                if (regexText.length)
                    try {
                        $scope.regexCompiled = new RegExp(regexText);
                    } catch (e) {
                    }
                else
                    $scope.regexCompiled = null;
                $scope.$emit('regex-update', $scope.regexCompiled);
            };

            $scope.onRawRegexUpdate = function () {
                $scope.rawRegex = $scope.rawRegex.toLowerCase().replace(" ", "");
                $scope.updateRegex($scope.rawRegex);
            };

            $scope.addQuickTool = function (e) {
                var ipt = document.getElementById('input-regex');
                var i = ipt.selectionStart;
                $scope.rawRegex = $scope.rawRegex.slice(0, i) + e + $scope.rawRegex.slice(i);
                $scope.updateRegex($scope.rawRegex);
                ipt.focus();
                setTimeout(function () {
                    ipt.setSelectionRange(i + 1, i + 1)
                })
            };

            $scope.$on('set-regex-text', function (event, regexText) {
                $scope.rawRegex = regexText;
                $scope.updateRegex($scope.rawRegex);
            });

        });
}());