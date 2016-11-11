gradebookModule.controller('ManageColsCtrl', function ($scope, $timeout, $translate) {
    var update = false;
    $scope.lockExam = function (index, lock) {
        var data = angular.copy($scope.examList[index]);
        data.Lock = lock;
        $scope.socket.emit('commit', {
            name: 'group.exam',
            body: {
                GroupInfo: window.groupInfo,
                Exam: data
            }
        }, function (data) {
            if (data.status !== "success") alert(JSON.stringify(data));
        });
    }
    
    $scope.showExam = function (examItem) {
        update = true;
        if ($scope.current && $scope.current.VisibleExam && $scope.current.VisibleExam.indexOf(examItem.Name) < 0)
            $scope.current.VisibleExam.push(examItem.Name);
    }
    
    $scope.hideExam = function (examItem) {
        update = true;
        if ($scope.current && $scope.current.VisibleExam && $scope.current.VisibleExam.indexOf(examItem.Name) >= 0)
            $scope.current.VisibleExam.splice($scope.current.VisibleExam.indexOf(examItem.Name), 1);
        if ($scope.current.Exam == examItem)
            $scope.current.Exam = null;
    }
    
    $('#modal').modal().on('hide.bs.modal', function (e) {
        if (update) {
            update = false;
            if ($scope.current.ExamOrder && $scope.current.VisibleExam) {
                var newOrder = [];
                var oldOrder = $scope.current.ExamOrder;
                $scope.examList.forEach(function (examItem) {
                    newOrder.push(examItem.Name);
                    var index = oldOrder.indexOf(examItem.Name);
                    if (index >= 0)
                        oldOrder.splice(index, 1);
                });
                $scope.current.ExamOrder = newOrder.concat(oldOrder);
                $scope.socket.emit('commit', {
                    name: 'group.config',
                    body: {
                        GroupInfo: window.groupInfo,
                        ExamOrder: $scope.current.ExamOrder,
                        VisibleExam: $scope.current.VisibleExam
                    }
                }, function (data) {
                    if (data.status !== "success") alert(JSON.stringify(data));
                });
            }
        }
    });
    
    $scope.sortableOptions = {
        activate: function () {
                //console.log("activate");
        },
        beforeStop: function () {
                //console.log("beforeStop");
        },
        change: function () {
                //console.log("change");
        },
        create: function () {
                //console.log("create");
        },
        deactivate: function () {
                //console.log("deactivate");
        },
        out: function () {
                //console.log("out");
        },
        over: function () {
                //console.log("over");
        },
        receive: function () {
                //console.log("receive");
        },
        remove: function () {
                //console.log("remove");
        },
        sort: function () {
                //console.log("sort");
        },
        start: function () {
                //console.log("start");
        },
        update: function (e, ui) {
            update = true;
                //console.log("update");

                //var logEntry = tmpList.map(function (i) {
                //    return i.value;
                //}).join(', ');
                //$scope.sortingLog.push('Update: ' + logEntry);
        },
        stop: function (e, ui) {
            update = true;
            //console.log("stop");
            
            //// this callback has the changed model
            //var logEntry = tmpList.map(function (i) {
            //    return i.value;
            //}).join(', ');
            //$scope.sortingLog.push('Stop: ' + logEntry);
            
            //$scope.examList.forEach(function (examItem) {
            //    console.log(examItem.Name);
            //});
        }
    };
});