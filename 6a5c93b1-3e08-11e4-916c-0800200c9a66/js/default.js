$(document).ready(function () {
    $(window).resize(function () {
        $("#container-nav, #container-main").height($(window).height() - 50);
    });
});

function parseDateUTC(input) {
    var reg = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
    var parts = reg.exec(input);
    return parts ? (new Date(Date.UTC(parts[1], parts[2] - 1, parts[3], parts[4], parts[5], parts[6]))) : null
};
//Expect input as y-m-d
//http://stackoverflow.com/questions/5812220/how-to-validate-a-date
function isValidDate2(s) {
  var bits = s.split('-');
  var y = bits[0], m  = bits[1], d = bits[2];
  // Assume not leap year by default (note zero index for Jan)
  var daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];

  // If evenly divisible by 4 and not evenly divisible by 100,
  // or is evenly divisible by 400, then a leap year
  if ( (!(y % 4) && y % 100) || !(y % 400)) {
    daysInMonth[1] = 29;
  }
  return d <= daysInMonth[--m]
}
var app = angular
    .module("app", ['ui.bootstrap'])
    .filter('myDateFormat', function($filter) {
        return function(text, format) {
            var tempdate = new Date(text.replace(/-/g, "/"));
            if (tempdate && tempdate != 'Invalid Date' && !isNaN(tempdate))
                return $filter('date')(tempdate, format);
        };
    })
    .run(function($rootScope){
        $rootScope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };
        $rootScope.ngObjFixHack = function(ngObj) {
            var output;

            output = angular.toJson(ngObj);
            output = angular.fromJson(output);

            return output;
        };
        $rootScope.contract = gadget.getContract("ischool.behavior.attendanceInput.teacher");
    })
    .controller("Ctrl1", function($scope, $modal,$q) {
        $scope.list = [];
        $scope.init = function() {
            $scope.getPendingRequests();
        }
        $scope.getPendingRequests = function() {
            $scope.list = [];
            $scope.contract.send({
                service: "GetPendingRequests",
                body: {},
                result: function(response, error, http) {
                    if (!error) {
                    	if (response.data)
                            $scope.list = [].concat(response.data);
                    } else {
                        $scope.icon_css = "icon-warning-sign";
                        set_error_message("#mainMsg", "GetPendingRequests", error);
                    }
                    $scope.safeApply();
                }
            });
        }
        $scope.showEditForm = function(uid) {
            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: ModalInstanceCtrl,
                resolve: {
                    uid: function() {
                        return uid;
                    },
                }
            });
            modalInstance.result.then(function(form1) {
                $scope.save(form1);
            }, function() {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        }
        $scope.save = function(form1) {
            $scope.contract.send({
                service: "SetStageStatus",
                body: form1,
                result: function(response, error, http) {
                    if (!error) {
                        if ( response.data == 'success')
                            alert('儲存成功之類');
                        $scope.getPendingRequests();
                    } else {
                        $scope.icon_css = "icon-warning-sign";
                        set_error_message("#mainMsg", "SetFitness1Col", error);
                    }
                }
            });
        }
    });
var set_error_message = function(select_str, serviceName, error) {
    var tmp_msg;

    tmp_msg = "<i class=\"icon-white icon-info-sign \"></i><strong class=\"my-err-info\">呼叫服務失敗或網路異常，請稍候重試!</strong>(" + serviceName + ")";
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
        $(select_str).html("<div class=\"alert alert-danger\"><button class=\"close\" data-dismiss=\"alert\">×</button>" + tmp_msg + "</div>");
        return $(".my-err-info").click(function() {
            return alert("請拍下此圖，並與客服人員連絡，謝謝您。\n" + JSON.stringify(error, null, 2));
        });
    }
};
var ModalInstanceCtrl = function($scope, uid) {
    $scope.form1 = {};
    $scope.contract.send({
        service: "GetRequestDetail",
        body: {uid:uid},
        result: function(response, error, http) {
            if (!error) {
                $scope.form1.uid = uid ;
                if ( response.data.main )
                    $scope.main = response.data.main ;
                $scope.attendance = [];
                if ( response.data.attendance )
                    $scope.attendance = response.data.attendance ;
            } else {
                set_error_message("#mainMsg2", "GetRequestDetail", error);
            }
            $scope.$apply();
        }
    });
    var check = function()
    {
        if ( !$scope.form1.uid )
            return false;
        return true;
    };
    $scope.ok = function() {
        if ( check() )
            $scope.$close($scope.form1);
    };
    $scope.beforeok = function(status){
        $scope.form1.status = status ;
        if ( check() )
            $scope.comfirm = true;
    };
    $scope.cancelcomfirm = function(){
        $scope.comfirm = false;
    };
    $scope.cancel = function() {
        $scope.$dismiss('cancel');
    };
};
