angular.module('EnrolmentExcessTeacher', [])
    .controller('Controller', ['$scope', function($scope) {

        $scope.connection = gadget.getContract("kh.EnrolmentExcess.teacher");
        $scope.currClass = {};
        $scope.currStudent = {};

        $scope.SelectClass = function(claxx) {
            $scope.currClass = claxx;
            //console.log($scope.currClass);
        };
        $scope.connection.send({
            service: "_.getClassStudent",
            body: '',
            result: function(response, error, http) {
                //response={}; //測試無班級狀態
                if (error) {
                    if (error.dsaError && error.dsaError.message)
                        alert("查詢過程發生錯誤:\r\n" + error.dsaError.message);
                } else {
                    $scope.Classes = [].concat(response.Classes || []);
                    $scope.Classes.forEach(function(claxx) {
                        claxx.Student = [].concat(claxx.Student || []);
                    });

                    //顯示班級的第一筆資料
                    if ($scope.Classes.length > 0) {
                        $scope.SelectClass($scope.Classes[0]);
                    }
                    //顯示沒有班級的訊息
                    if ($scope.Classes.length === 0) {
                        $scope.Classes[0]={};
                        $scope.Classes[0].ClassName = "無班級";
                        $scope.SelectClass($scope.Classes[0]);
                    }
                    $scope.$apply();
                }
            }
        });
    }]);
