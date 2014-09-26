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
    .module("app", ['ui.bootstrap','pascalprecht.translate'])
    .filter('myDateFormat', function($filter) {
        return function(text, format) {
            var tempdate = new Date(text.replace(/-/g, "/"));
            if (tempdate && tempdate != 'Invalid Date' && !isNaN(tempdate))
                return $filter('date')(tempdate, format);
        };
    })
    .config(['$translateProvider',function($translateProvider) {
        $translateProvider.translations('en_US', {
            "TITLE"     : "Leave Approve",
            "DATE" : "Date",
            "STARTDATE":"Start Date",
            "ENDDATE":"End Date",
            "SEARCH":"Search",
            "PROCESSING":"Processing",
            "TYPE":"Type",
            "ALL":"All",
            "REASON":"Reason",
            "PLEASEENTERTHEREASON":"Please enter the reason",
            "SELECT":"Select",
            "SECTION":"Section",
            "STATUS":"Status",
            "SAVE":"Save",
            "CANCEL":"Cancel",
            "COMFIRM":"Comfirm",
            "SENDRESULT?":"Send result?",
            "CLASS":"Class",
            "SEATNO":"Seat No",
            "STUDENTNUMBER":"Student No",
            "NAME":"Name",
            "COMMENT":"Comment",
             "PLEASEENTERCOMMENT":"Please enter comment",
             "REMARKMSG":" ",
             "APPROVE":"Approve",
             "REJECT":"Reject",
             "RESULT":"Result",
             "NONE":"None",
             "FORMERTYPE":"Former type",
             "REMARKBYLASTSTAGE":"Remark by laststage",
          });
        $translateProvider.translations('zh_TW', {
            "TITLE"     : "線上請假簽核",
            "DATE" : "日期",
            "STARTDATE":"開始日期",
            "ENDDATE":"結束日期",
            "SEARCH":"查詢",
            "PROCESSING":"簽核",
            "TYPE":"假別",
            "ALL":"全選",
            "REASON":"事由",
            "PLEASEENTERTHEREASON":"請輸入事由",
            "SELECT":"請選擇",
            "SECTION":"節次",
            "STATUS":"狀態",
             "SAVE":"儲存",
            "CANCEL":"取消",
            "COMFIRM":"確認",
            "SENDRESULT?":"確認送出資料？",
            "CLASS":"班級",
            "SEATNO":"座號",
            "STUDENTNUMBER":"學號",
            "NAME":"姓名",
            "COMMENT":"回覆",
             "PLEASEENTERCOMMENT":"請輸入回覆",
             "REMARKMSG":"(回覆之內容,請假流程相關人員與家長均可檢視)",
             "APPROVE":"可",
             "REJECT":"不可",
             "RESULT":"簽核",
             "NONE":"無",
             "FORMERTYPE":"當天請假狀況",
             "REMARKBYLASTSTAGE":"上一簽核者回覆",
          });
        $translateProvider.preferredLanguage('zh_TW');
    }])
    .run(function($rootScope,$translate){
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
        $translate.use(gadget.params.i18n);
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
                            ;//alert('儲存成功之類');
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
