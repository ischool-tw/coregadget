$(document).ready(function () {
    $(window).resize(function () {
        $("#container-nav, #container-main").height($(window).height() - 50);
    });
});
angular.module("app", [])
.controller("Cntl", function($scope) {
    $scope.getMyGroup = function() {
        $scope.contract.send({
            service: "beta.GetMyGroup",
            body: {},
            result: function (response, error, http) {
                if (!error) {
                    // console.log(response);
                    if (response.Group) {
                        $scope.myGroups = [].concat(response.Group || []);
                    } else {
                        $scope.myGroups = [];
                    }
                }
                else
                {
                    set_error_message("#mainMsg", "GetMyGroup", error);
                }
                $scope.$apply();
            }
        });
    };

    $scope.changeChild = function(child) {
        $scope.currChild = child;
        $scope.myGroups = [];
        $scope.contract.send({
            service: "beta.GetChildGroup",
            body: {
                StudentId: child.StudentId
            },
            result: function (response, error, http) {
                if (!error) {
                    // console.log(response);
                    if (response.Group) {
                        $scope.myGroups = [].concat(response.Group || []);
                    } else {
                        $scope.myGroups = [];
                    }
                }
                else
                {
                    set_error_message("#mainMsg", "GetChildGroup", error);
                }
                $scope.$apply();
            }
        });
    };

    $scope.currApplication = gadget.getApplication().accessPoint;
    $scope.myGroups = [];
    $scope.currRole = gadget.params.system_position || 'student';
    switch($scope.currRole) {
        case 'teacher':
            $scope.contract = gadget.getContract('cloud.teacher');
            $scope.getMyGroup();
            break;
        case 'student':
            $scope.contract = gadget.getContract('cloud.student');
            $scope.getMyGroup();
            break;
        case 'parent':
            $scope.contract = gadget.getContract('cloud.parent');
            $scope.contract.send({
                service: "beta.GetMyChildren",
                body: {},
                result: function (response, error, http) {
                    if (!error) {
                        // console.log(response);
                        if (response.Student) {
                            $scope.children = [].concat(response.Student || []);
                            $scope.changeChild($scope.children[0]);
                        } else {
                            $scope.children = [];
                        }
                    }
                    else
                    {
                        set_error_message("#mainMsg", "GetMyChildren", error);
                    }
                    $scope.$apply();
                }
            });
            break;
    }
});

var set_error_message = function(select_str, serviceName, error) {
    var tmp_msg;

    tmp_msg = "<i class=\"icon-white icon-info-sign my-err-info\"></i><strong>呼叫服務失敗，請稍候重試!</strong>(" + serviceName + ")";
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                switch (error.dsaError.message) {
                    case "501":
                        tmp_msg = "<strong>很抱歉，您無讀取資料權限！</strong>";
                }
            } else {
                if (error.dsaError.message) {
                    tmp_msg = error.dsaError.message;
                }
            }
        } else if (error.loginError.message) {
            tmp_msg = error.loginError.message;
        } else {
            if (error.message) {
                tmp_msg = error.message;
            }
        }
        $(select_str).html("<div class=\"alert alert-error\"><button class=\"close\" data-dismiss=\"alert\">×</button>" + tmp_msg + "</div>");
        return $(".my-err-info").click(function() {
            return alert("請拍下此圖，並與客服人員連絡，謝謝您。\n" + JSON.stringify(error, null, 2));
        });
    }
};
