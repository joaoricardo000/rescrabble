angular.module("RegexGame").run(["$templateCache", function($templateCache) {$templateCache.put("/static/templates/views/game.html","\n<div class=\"container index ng-cloak\">\n  <div id=\"game-container\" ng-show=\"levelData\" class=\"col-md-6 col-md-offset-3\">\n    <div class=\"col-xs-12 title\"><i ng-click=\"solveLevel()\" class=\"fa fa-bolt icon-button solve-button\"></i><i ng-click=\"getRandomLevel()\" class=\"fa fa-forward icon-button random-button\"></i>\n      <h1>golf</h1>\n      <h3 class=\"title percentage\">{{ golfPoints+\' points\'}}</h3>\n    </div>\n    <div class=\"row\">\n      <div ng-class=\"{\'col-xs-6\':gameStatus.badWords.length, \'col-xs-12\':gameStatus.badWords.length == 0}\" class=\"words-list\">\n        <ul class=\"list-group list-good-words\">\n          <li ng-repeat=\"goodWord in gameStatus.goodWords track by $index\" ng-bind-html=\"goodWord.text\" ng-class=\"{\'list-group-item-success\':goodWord.match}\" class=\"list-group-item\"></li>\n        </ul>\n      </div>\n      <div class=\"col-xs-6 words-list\">\n        <ul ng-show=\"gameStatus.badWords.length\" class=\"list-group list-bad-words\">\n          <li ng-repeat=\"badWord in gameStatus.badWords track by $index\" ng-bind-html=\"badWord.text\" ng-class=\"{\'list-group-item-danger\':badWord.match}\" class=\"list-group-item\"></li>\n        </ul>\n      </div>\n    </div>\n    <div ng-include=\"\'/static/templates/views/regex-builder.html\'\" class=\"regex-builder\"></div>\n  </div>\n</div>");
$templateCache.put("/static/templates/views/regex-builder.html","\n<div ng-controller=\"RegexBuilderController\" class=\"regex-builder-container\">\n  <div class=\"raw-regex-input\">\n    <div class=\"quick-tools-view\">\n      <div class=\"btn-group quick-tools\">\n        <button type=\"button\" ng-click=\"addQuickTool(tool)\" ng-repeat=\"tool in quickTools\" class=\"btn btn-sm btn-info\">{{tool}}</button>\n      </div>\n    </div>\n    <input id=\"input-regex\" type=\"text\" placeholder=\"//\" ng-model=\"rawRegex\" ng-change=\"onRawRegexUpdate()\" class=\"input-lg form-control\"/>\n  </div>\n</div>");
$templateCache.put("/static/templates/views/search.html","\n<div class=\"container search ng-cloak\">\n  <div id=\"search-container\" class=\"col-md-6 col-md-offset-3\">\n    <div class=\"title col-xs-12\">\n      <h1>search</h1>\n      <div class=\"load-icon\"><i ng-show=\"wordsList==null\" class=\"fa fa-spin fa-refresh\"></i></div>\n    </div>\n    <div ng-include=\"\'/static/templates/views/regex-builder.html\'\" class=\"regex-builder row\"></div>\n    <div ng-show=\"matches.length\" class=\"words-list col-xs-12\">\n      <h3>{{ totalMatches > 100 ? \'> 100\':totalMatches }}</h3>\n      <ul class=\"list-group list-good-words\">\n        <li ng-repeat=\"match in matches\" ng-bind-html=\"match.text\" class=\"list-group-item\"></li>\n      </ul>\n    </div>\n  </div>\n</div>");}]);