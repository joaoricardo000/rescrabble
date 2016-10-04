'use strict';
(function () {
    var app = angular.module('RegexGame.services', []);

    app.factory('LevelsFactory', function (GameStatusService, WordsFactory) {
        var Levels = {};

        Levels.getRandomLevel = function (args, next) {
            var size = args.size || 5;
            WordsFactory.getDictionary({lang: args.lang}, function (err, words) {
                var all = {};
                var totalWords = words.length;

                var levelData = {
                    labels: {title: "golf"},
                    goodWords: [],
                    badWords: []
                };

                var w = "";
                while (levelData.goodWords.length < size) {
                    w = words[parseInt(Math.random() * totalWords)];
                    if (!all[w] && w.length < 14) {
                        levelData.goodWords.push(w);
                        all[w] = true;
                    }
                }

                while (levelData.badWords.length < size) {
                    w = words[parseInt(Math.random() * totalWords)];
                    if (!all[w] && w.length < 14) {
                        levelData.badWords.push(w);
                        all[w] = true;
                    }
                }

                next(null, levelData);
            })
        };

        return Levels;
    });

    app.factory('WordsFactory', function ($http) {
        var Words = {};
        var db_url = window.staticBaseUrl + "js/db/";
        var cache = {};

        Words.getDictionary = function (args, next) {
            var lang = 'scrabble';

            if (cache[lang])
                next(null, cache[lang]);
            else
                $http.get(db_url + lang)
                    .then(function (response) {
                        cache[lang] = response.data.split("\n");
                        next(null, cache[lang])
                    });

        };

        Words.exec = function (words, regex) {
            var matches = [];

            function doMatch(word) {
                var m = regex.exec(word);
                if (m) {
                    if (m[0].length) {
                        return {text: m.input.replace(regex, "<span class='search-match'>" + m[0] + "</span>")};
                    } else
                        return {text: m.input}

                }

            }

            for (var i = 0; i < words.length; i++) {
                var m = doMatch(words[i]);
                if (m) {
                    matches.push(m);
                    if (matches.length > 50)
                        break
                }
            }

            if (i < words.length) {
                matches.push({text: "..."});
                matches.push({text: "..."});
                matches.push({text: "..."});
                for (var j = words.length; j > i; j--) {
                    var m = doMatch(words[j]);
                    if (m) {
                        matches.push(m);
                        if (matches.length > 100)
                            break
                    }
                }
            }


            return matches
        };

        return Words;
    });

    app.service('GameStatusService', function () {
        var GameStatus = {};

        function _buildSpanMatch(match) {
            return [escapeHtml(match.input.substr(0, match.index)),
                "<span class='regex-match'>" + escapeHtml(match[0]) + "</span>",
                escapeHtml(match.input.substr(match.index + match[0].length))].join('')
        }

        function _getWordListStatus(words, regex, spanMatch) {
            var wordsStatus = [];
            var validWordCount = 0;
            var matchCount = 0;

            for (var i = 0; i < words.length; i++) {
                var word = words[i];
                if (word.length) {
                    validWordCount++;
                    var match = regex.exec(word);
                    if (match) {
                        matchCount++;
                        wordsStatus[i] = {
                            text: spanMatch ? _buildSpanMatch(match) : escapeHtml(word),
                            match: match
                        };
                        continue
                    }
                }
                wordsStatus[i] = {text: escapeHtml(word), match: false};
            }

            return {
                words: wordsStatus,
                percentage: parseInt(matchCount * 100 / validWordCount)
            };
        }

        GameStatus.getInitialStatus = function (levelData) {
            var levelStatus = {
                goodWords: [],
                badWords: [],
                percentage: 0
            };

            for (var i = 0; i < levelData.goodWords.length; i++) {
                levelStatus.goodWords.push({text: escapeHtml(levelData.goodWords[i] || ''), match: false})
            }
            if (levelData.badWords)
                for (i = 0; i < levelData.badWords.length; i++) {
                    levelStatus.badWords.push({text: escapeHtml(levelData.badWords[i] || ''), match: false})
                }
            return levelStatus;
        };

        GameStatus.getLevelStatus = function (levelData, regex, spanMatch) {
            var statusGood = _getWordListStatus(levelData.goodWords, regex, spanMatch);
            var statusBad = levelData.badWords ? _getWordListStatus(levelData.badWords, regex, spanMatch) : null;

            return {
                goodWords: statusGood.words,
                badWords: statusBad ? statusBad.words : [],
                percentage: (statusBad && statusBad.percentage) ? 0 : statusGood.percentage
            }
        };

        return GameStatus;
    });
}());