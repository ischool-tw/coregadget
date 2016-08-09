gradebookModule.controller('analyticsCtrl', function ($scope, $timeout, $translate, $rootScope) {
    
    $scope.countRange = function (examItem, max, min) {
        if (!angular.isNumber(max))
            max = Number.MAX_VALUE;
        if (!angular.isNumber(min))
            min = (0 - Number.MAX_VALUE);
        var count = 0;
        $scope.studentList.forEach(function (st) {
            if (angular.isNumber($scope.getScoreValue(examItem, st)) && $scope.getScoreValue(examItem, st) >= min && $scope.getScoreValue(examItem, st) < max)
                count++;
        });
        return count;
    }
    
    $scope.getMax = function (examItem) {
        var result = null;
        $scope.studentList.forEach(function (st) {
            if (angular.isNumber($scope.getScoreValue(examItem, st)) && (result == null || $scope.getScoreValue(examItem, st) > result)) {
                result = $scope.getScoreValue(examItem, st);
            }
        });
        return result;
    }
    
    $scope.getMin = function (examItem) {
        var result = null;
        $scope.studentList.forEach(function (st) {
            if (angular.isNumber($scope.getScoreValue(examItem, st)) && (result == null || $scope.getScoreValue(examItem, st) < result)) {
                result = $scope.getScoreValue(examItem, st);
            }
        });
        return result;
    }
    
    $scope.getAvg = function (examItem) {
        var powseed = 3;
        $scope.studentList.forEach(function (st) {
            try {
                var seed = ('' + $scope.getScoreValue(examItem, st)).split('.')[1].length;
                if (seed > powseed)
                    powseed = seed;
            }
                catch (exc) { }
        });
        powseed = Math.pow(10, powseed);
        var powsum = 0;
        var count = 0;
        $scope.studentList.forEach(function (st) {
            if (angular.isNumber($scope.getScoreValue(examItem, st))) {
                powsum += $scope.getScoreValue(examItem, st) * powseed;
                count++;
            }
        });
        if (count > 0)
            return Math.round(powsum / count) / powseed;
        else
            return null;
    }
    
    $scope.countValue = function (examItem, option) {
        var result = null;
        $scope.studentList.forEach(function (st) {
            if ($scope.getScoreValue(examItem, st) == option) {
                if (result == null)
                    result = 1;
                else
                    result++;
            }
        });
        return result;
    }
    
    $scope.setAnalytics = function (examItem) {
        if ($scope.numberValue(examItem)) {
            $scope.analytics = {
                Type: "Number",
                Target: examItem

            }
        }
        if (examItem.Type == 'Enum') {
            $scope.analytics = {
                Type: "Enum",
                Target: examItem
            }
        }
    }
    
    $scope.numberValue = function (examItem) {
        if (examItem && examItem.Type == 'Number')
            return true;
        var allNumber = true;
        $scope.studentList.forEach(function (st) {
            
            if ($scope.getScoreValue(examItem, st) && !angular.isNumber($scope.getScoreValue(examItem, st))) {
                allNumber = false;
            }
        });
        return allNumber;
    }
    
    if ($scope.current&&$scope.current.Exam)
        $scope.setAnalytics($scope.current.Exam);
    $scope.$on('setCurrent', function (event, obj) {
        if (obj.exam) {
            $scope.setAnalytics(obj.exam);
        }
    });
});