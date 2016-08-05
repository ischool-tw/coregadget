gradebookModule.controller('EditColCtrl', function ($scope, $timeout, $translate) {
    
    $scope.toggleCreateItemType = function (type) {
        $scope.createItem.Type = type;
        if (type === 'Number') {
                //$scope.createItem.Range = {
                //    Max: '100',
                //    Min: '0'
                //}
        } else if (type === 'Enum') {
            $scope.createItem.Option = [{
                    Label: 'A'
                }, {
                    Label: 'B'
                }, {
                    Label: 'C'
                }, {
                    Label: 'D'
                }];
        }
    }
    
    $scope.addOptionItem = function () {
        $scope.createItem.Option.push({
            Label: ''
        });
        $('.pg-newoption:last-of-type').focus();
        $timeout(function () {
            $('.pg-newoption:last-of-type').select();
        }, 1);
    }
    
    $scope.removeOptionItem = function (index) {
        $scope.createItem.Option.splice(index, 1);
    }
    
    $scope.saveExamItem = function () {
        if ($scope.createItem.Name === '') {
            $scope.errMsg = '名稱不可空白';
            return;
        }
        
        var flag = false;
        angular.forEach($scope.examList, function (item, index) {
            if (item.Name === $scope.createItem.Name && index !== $scope.createItem.targetIndex)
                flag = true; //判斷重複
        });
        if (flag) {
            $scope.errMsg = '名稱不可重複';
            return;
        }
        
        if ($scope.createItem.Type === 'Enum') {
            if ($scope.createItem.Option.length === 0) return;
            var temp = false;
            angular.forEach($scope.createItem.Option, function (item) {
                if (item.Label === '')
                    temp = true;
            });
            
            if (temp) {
                $scope.errMsg = '選項不可為空白';
                return;
            }
        }
        
        $('#modal').modal('hide');
        
        //新增exam
        var data = angular.copy($scope.createItem);
        delete data.targetIndex;
        $scope.socket.emit('commit', {
            name: 'group.exam',
            body: {
                GroupInfo: window.groupInfo,
                Exam: data
            }
        }, function (data) {
            if (data.status !== "success") alert(JSON.stringify(data));
        });
        //選取這個新試別
        //var ts = ($scope.current.Student || ($scope.studentList && $scope.studentList.length > 0) ? $scope.studentList[0] : null)
        //        , te = $scope.createItem;
        //if (ts && te) {
        //    $scope.setCurrent(ts, te, true, true);
        //}
        //設定config
        if ($scope.current.ExamOrder.indexOf($scope.createItem.Name) < 0)
            $scope.current.ExamOrder.push($scope.createItem.Name);
        if ($scope.current.VisibleExam.indexOf($scope.createItem.Name) < 0)
            $scope.current.VisibleExam.push($scope.createItem.Name);
        
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
    
    $scope.deleteExamItem = function () {
        if (window.confirm("確定要刪除？")) {
            $scope.socket.emit('commit', {
                name: 'group.exam.delete',
                body: {
                    GroupInfo: window.groupInfo,
                    Exam: angular.copy($scope.examList[$scope.createItem.targetIndex])
                }
            }, function (data) {
                if (data.status !== "success") alert(JSON.stringify(data));
            });
        }
    }
    
    if ($scope.modal && $scope.modal.target == 'editCol') {
        if ($scope.modal.index == undefined) {
            $scope.createItem = {
                Name: '',
                Type: 'Number',
                Lock: false,
                Access: {
                    Teacher: "None",
                    Student: "None", 
                    Parent: "None"
                }
            }
        }
        else {
            $scope.createItem = angular.copy($scope.examList[$scope.modal.index]);
            
            $scope.createItem.Name = $scope.createItem.Name || '';
            $scope.createItem.Type = $scope.createItem.Type || 'Number';
            $scope.createItem.Lock = $scope.createItem.Lock || false;
            $scope.createItem.targetIndex = $scope.modal.index;
            if (!$scope.createItem.Access) {
                $scope.createItem.Access = {
                    Teacher: "None",
                    Student: "None",
                    Parent: "None"
                };
            }
        }
        $scope.errMsg = "";
    }
    $scope.$on('showModal', function (event, obj) {
        if (obj.target == "editCol") {
            if (obj.index == undefined) {
                $scope.createItem = {
                    Name: '',
                    Type: 'Number',
                    Lock: false,
                    Access: {
                        Teacher: "None",
                        Student: "None",
                        Parent: "None"
                    }
                }
            }
            else {
                $scope.createItem = angular.copy($scope.examList[obj.index]);
                
                $scope.createItem.Name = $scope.createItem.Name || '';
                $scope.createItem.Type = $scope.createItem.Type || 'Number';
                $scope.createItem.Lock = $scope.createItem.Lock || false;
                $scope.createItem.targetIndex = obj.index;
                if (!$scope.createItem.Access) {
                    $scope.createItem.Access = {
                        Teacher: "None",
                        Student: "None",
                        Parent: "None"
                    };
                }
            }
            $scope.errMsg = "";
        }
    });
});