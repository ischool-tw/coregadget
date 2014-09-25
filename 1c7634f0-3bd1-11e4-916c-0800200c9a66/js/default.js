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
function getObjectKeysValueIsTrue (myObj) {
    if ( Object.prototype.toString.call(myObj) == "[object Object]")
    {
        var arr = [];
        for( var i in myObj ) {
            if (myObj.hasOwnProperty(i)){
                if (myObj[i]){
                    arr.push(i);
                }
            }
        }
        return arr.join(",");
    }
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
            "TITLE"     : "Ask for Leave",
            "INPUT"    : "Input",
            "HISTORY" : "History",
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
            "SENDREQUEST?":"Send request?",
            "REMARK":"Remark",
            "notStarted":"Unchecked",
            "pending":"Pending",
            "rejected":"Rejected",
            "completed":"Completed",
          });
        $translateProvider.translations('zh_TW', {
            "TITLE"     : "線上請假",
            "INPUT"    : "輸入",
            "HISTORY" : "歷程",
            "DATE" : "日期",
            "STARTDATE":"開始日期",
            "ENDDATE":"結束日期",
            "SEARCH":"查詢",
            "PROCESSING":"請假",
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
            "SENDREQUEST?":"確認送出資料？",
            "REMARK":"審查回覆",
            "notStarted":"待審查",
            "pending":"待簽核",
            "rejected":"退回",
            "completed":"完成",
          });
        $translateProvider.preferredLanguage('zh_TW');
    }])
    .directive('dTranslation', function ($compile) {
        return function (scope, elem, attrs) {
            var translate = attrs.dTranslation || '',
                translate_value = attrs.dTranslationvalue || '',
                html = '<span>';
            html += '{{' + translate + '| translate' + ((translate_value) ? ':' + translate_value : '') + '}}';
            html += '</span>';
            var el = angular.element(html),
                compiled = $compile(el);
            elem.append(el);
            compiled(scope);
        };
    })
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
        $rootScope.system_position = gadget.params.system_position || "student";
        if ($rootScope.system_position == "parent")
            $rootScope.contract = gadget.getContract("ischool.behavior.attendanceInput.parent");
        else 
            $rootScope.contract = gadget.getContract("ischool.behavior.attendanceInput.student");

        $translate.use(gadget.params.i18n);
    })
    .controller("Ctrl0", function($scope) {
        $scope.usingPage = '1' ;
        $scope.init = function() {
            $scope.getConf();
            $scope.getChilds();
        }
        $scope.getConf = function() {
            $scope.contract.send({
                service: "GetConf",
                body: {},
                result: function(response, error, http) {
                    if (!error) {
                        if (response.conf)
                        {
                            $scope.conf = response.conf;
                            $scope.conf.absencelist = [].concat(response.conf.absencelist);
                            $scope.conf.periods = [].concat(response.conf.periods);
                        }
                    } else {
                        $scope.icon_css = "icon-warning-sign";
                        set_error_message("#mainMsg", "GetMenu", error);
                    }
                    $scope.safeApply();
                }
            });
        }
        if ($scope.system_position == "parent")
        $scope.getChilds = function() {
            $scope.contract.send({
                service: "GetChilds",
                body: {},
                result: function(response, error, http) {
                    if (!error) {
                        if (response.data)
                        {
                            $scope.childs = [].concat(response.data);
                            if ( $scope.childs[0] )
                                $scope.childChanged($scope.childs[0])
                        }
                    } else {
                        $scope.icon_css = "icon-warning-sign";
                        set_error_message("#mainMsg", "GetChilds", error);
                    }
                    $scope.safeApply();
                }
            });
        }
        else 
        $scope.getChilds = function() {
            $scope.contract.send({
                service: "GetSelf",
                body: {},
                result: function(response, error, http) {
                    if (!error) {
                        if (response.data)
                        {
                            $scope.childs = [].concat(response.data);
                            if ( $scope.childs[0] )
                                $scope.childChanged($scope.childs[0])
                        }
                    } else {
                        $scope.icon_css = "icon-warning-sign";
                        set_error_message("#mainMsg", "GetSelf", error);
                    }
                    $scope.safeApply();
                }
            });
        }
        $scope.reloadPage2 = function() {
            $scope.usingPage = '2';
            $scope.$broadcast('reloadPage2');
        }
        $scope.childChanged = function(child) {
            $scope.current_child = child;
            $scope.$broadcast('childChanged');
        };
    })
    .controller("Ctrl1", function($scope, $modal,$q) {
        $scope.$on('childChanged', function(event) {
            $scope.date = [];
            $scope.absencedata = {};
            var start_date = new Date();
            var end_date = new Date();
            start_date.setDate(start_date.getDate() - 7)
            end_date.setDate(end_date.getDate() + 7)
            $scope.filter = {
                start_date : start_date,
                end_date : end_date,
            };
            $scope.getAttendanceRecords({
                ref_student_id:$scope.current_child.id,
                start_date:start_date,
                end_date:end_date,
            });
        });
        $scope.date = [];
        $scope.absencedata = {};
        $scope.datePickerOpen1 = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened1 = true;
        };
        $scope.datePickerOpen2 = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened2 = true;
        };
        $scope.init = function() {
        }
        $scope.getAttendanceRecords = function(filter) {
            //filter={ref_student_id:int,start_date:'yyyy-MM-dd',end_date:'yyyy-MM-dd'};
            $scope.date = [];
            $scope.absencedata = {};
            data = $scope.ngObjFixHack(filter);
            $scope.contract.send({
                service: "GetAttendanceRecords",
                body: data,
                result: function(response, error, http) {
                    if (!error) {
                    	if (response.absencedata)
                            $scope.absencedata = response.absencedata;
                        if (response.date)
                            $scope.date = [].concat(response.date);
                    } else {
                        $scope.icon_css = "icon-warning-sign";
                        set_error_message("#mainMsg", "GetAttendanceRecords", error);
                    }
                    $scope.safeApply();
                }
            });
        }
        $scope.showEditForm = function(date) {
            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: ModalInstanceCtrl,
                resolve: {
                    date: function() {
                        return date;
                    },
                    conf: function() {
                        return $scope.conf;
                    },
                    absencedata: function() {
                        return $scope.absencedata;
                    },
                }
            });
            modalInstance.result.then(function(form1) {
                form1.ref_student_id = $scope.current_child.id;
                $scope.save(form1);
            }, function() {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        }
        $scope.save = function(form1) {
            form1.absencetype = form1.absencetype.name ;
            form1.period = getObjectKeysValueIsTrue(form1.period);
            data = $scope.ngObjFixHack(form1);
            $scope.contract.send({
                service: "SetRequest",
                body: data,
                result: function(response, error, http) {
                    if (!error) {
                        //alert('請假成功之類');
                    } else {
                        $scope.icon_css = "icon-warning-sign";
                        set_error_message("#mainMsg", "SetFitness1Col", error);
                    }
                }
            });
        }
    })
    .controller("Ctrl2", function($scope) {
        $scope.$on('childChanged', function(event) {
            $scope.list = [];
            if($scope.current_child)
                $scope.getRequests($scope.current_child.id);
        });
        $scope.$on('reloadPage2', function(event) {
            $scope.list = [];
            if($scope.current_child)
                $scope.getRequests($scope.current_child.id);
        });
        
        $scope.list = [];
        $scope.init = function() {
        }
        $scope.getRequests = function(id) {
            $scope.list = [];
            $scope.contract.send({
                service: "GetRequests",
                body: {ref_student_id:id},
                result: function(response, error, http) {
                    if (!error) {
                        if (response.data)
                            $scope.list = [].concat(response.data);
                    } else {
                        $scope.icon_css = "icon-warning-sign";
                        set_error_message("#mainMsg", "GetRequests", error);
                    }
                    $scope.safeApply();
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
var ModalInstanceCtrl = function($scope, date,conf,absencedata) {
    $scope.form1 = {period:{}};
    if ( isValidDate2(date) )
        $scope.form1.occur_date = new Date(date) ;
    $scope.conf = conf ;
    $scope.absencedata = absencedata ;
    for (var i = 0; i < conf.periods.length; i++) {
        $scope.form1.period[conf.periods[i].name] = (absencedata[conf.periods[i].name+'--'+date.replace(/\//g, '-')])?true:false;
    };
    $scope.periodBool = false;
    $scope.opened = false ;
	$scope.datePickerOpen = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };
    $scope.ok = function() {
        if ( check() )
            $scope.$close($scope.form1);
    };
    $scope.beforeok = function(){
        if ( check() )
            $scope.comfirm = true;
    };
    $scope.cancelcomfirm = function(){
        $scope.comfirm = false;
    };
    $scope.periodSelectAll = function() {
        for (var i in $scope.form1.period) {
            if ($scope.form1.period.hasOwnProperty(i)){
                $scope.form1.period[i] = $scope.periodBool ;
            }
        };
    }
    var check = function()
    {
        $scope.error = {};
        $scope.error.occur_date = Object.prototype.toString.call($scope.form1.occur_date) !== '[object Date]' ;
        $scope.error.reason = !$scope.form1.reason ;
        $scope.error.absencetype = Object.prototype.toString.call($scope.form1.absencetype) !== '[object Object]' ;
        $scope.error.period = getObjectKeysValueIsTrue($scope.form1.period) == "";
        var pass = true ;
        for(e in $scope.error)
        {
            if ( $scope.error[e] )
                pass = false ;
        }
        return pass ;
    };
    $scope.cancel = function() {
        $scope.$dismiss('cancel');
    };
};
