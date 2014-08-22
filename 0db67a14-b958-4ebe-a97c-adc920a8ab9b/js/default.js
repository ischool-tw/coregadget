$(document).ready(function() {
    $(window).resize(function() {
        $("#container-nav, #container-main").height($(window).height() - 50);
        //console.log($(window).height() - 50);
    });
});

function parseDateUTC(input) {
    var reg = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
    var parts = reg.exec(input);
    return parts ? (new Date(Date.UTC(parts[1], parts[2] - 1, parts[3], parts[4], parts[5], parts[6]))) : null
};
//Expect input as y/m/d
//http://stackoverflow.com/questions/5812220/how-to-validate-a-date
function isValidDate2(s) {
    var bits = s.split('/');
    var y = bits[0],
        m = bits[1],
        d = bits[2];
    // Assume not leap year by default (note zero index for Jan)
    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // If evenly divisible by 4 and not evenly divisible by 100,
    // or is evenly divisible by 400, then a leap year
    if ((!(y % 4) && y % 100) || !(y % 400)) {
        daysInMonth[1] = 29;
    }
    return d <= daysInMonth[--m]
}
var app = angular
    .module("app", ['ui.bootstrap'])
    .filter('myDateFormat', function($filter) {
        return function(text, format) {
            var tempdate = new Date(text.replace(/-/g, "/"));
            // //console.log(tempdate);
            if (tempdate && tempdate != 'Invalid Date' && !isNaN(tempdate))
                return $filter('date')(tempdate, format);
        };
    })
    .directive('selectOnFocus', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                elem.bind('focus', function(e) {
                    $timeout(function() {
                        elem.select();
                    }, 1);
                });
            }
        };
    })
    .directive('keyFocus', function() {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                elem.bind('keyup', function(e) {
                    // up arrow
                    if (e.keyCode == 38) {
                        if (!scope.$first) {
                            angular.element(elem[0]).parent().parent().prev().find('input').focus();
                            //elem[0].previousElementSibling.focus();
                        }
                    }
                    // down arrow
                    else if (e.keyCode == 40 || e.keyCode == 13) {
                        if (!scope.$last) {
                            angular.element(elem[0]).parent().parent().next().find('input').focus();
                            //elem[0].nextElementSibling.focus();
                        }
                    }
                });
            }
        };
        // $('input').on('keydown', function(e) {
        //         var current_td_index = $(this).closest('td').index();
        //         if (e.which === 13 || e.which === 40) {
        //             $(this).closest('td').closest('tr').next().find('td:nth-child(' + (current_td_index + 1) + ')>input').focus();                    
        //             e.preventDefault();
        //         }
        //         if (e.which === 38) {
        //             $(this).closest('td').closest('tr').prev().find('td:nth-child(' + (current_td_index + 1) + ')>input').focus();
        //             e.preventDefault();
        //         }
        //     });
    })
    .directive('initFocus', function() {
        var timer;
        return function(scope, elm, attr) {
            if (timer) clearTimeout(timer);

            timer = setTimeout(function() {
                elm.focus();
                //console.log('focus', elm);
            }, 0);
        }
    })
    .controller("Ctrl", function($scope, $modal, $filter) {
        $scope.ngObjFixHack = function(ngObj) {
            var output;

            output = angular.toJson(ngObj);
            output = angular.fromJson(output);

            return output;
        }
        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };
        $scope.datePickerOpen = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };
        $scope.contract = gadget.getContract("ischool.fitness.input.peteacher");
        $scope.menu = [];
        $scope.init = function() {
            $scope.getMenu();
        }
        $scope.getMenu = function() {
            $scope.contract.send({
                service: "GetMenu",
                body: {},
                result: function(response, error, http) {
                    //console.log(response.data);
                    //console.log(response.error);
                    if (!error) {
                        if (response.data)
                            $scope.menu = [].concat(response.data);
                    } else {
                        $scope.icon_css = "icon-warning-sign";
                        set_error_message("#mainMsg", "GetMenu", error);
                    }
                    $scope.safeApply();
                    CurrentChanged();
                }
            });
        }
        $scope.setCurrent = function(m) {
            $scope.current = m;
            CurrentChanged();
        }
        $scope.getList = function($course_id) {
            $scope.list = [];
            $scope.contract.send({
                service: "GetList",
                body: {
                    course_id: $course_id
                },
                result: function(response, error, http) {
                    //console.log(response);
                    //console.log(error);
                    if (!error) {
                        if (response.data)
                            $scope.list = [].concat(response.data);
                    } else {
                        $scope.icon_css = "icon-warning-sign";
                        set_error_message("#mainMsg", "GetList", error);
                    }
                    $scope.safeApply();
                }
            });
        }
        $scope.refresh = function() {
            $scope.init();
        }
        $scope.showEditForm = function(column, defaultValue) {
            if (!$scope.current || !$scope.current.id)
                return;
            if ($scope.current.start_time && $scope.current.end_time && (
                (new Date($scope.current.start_time)).getTime() >= (new Date()).getTime() ||
                (new Date($scope.current.end_time)).getTime() <= (new Date()).getTime()
            ))
                return;
            if (Object.prototype.toString.call(defaultValue) === '[object Date]')
                defaultValue = $filter('date')(defaultValue, 'yyyy/M/d');
            var tmplist = [];
            for (var i = 0; i < $scope.list.length; i++) {
                tmplist.push({
                    uid: $scope.list[i].uid,
                    student_id: $scope.list[i].student_id,
                    seat_no: $scope.list[i].seat_no,
                    name: $scope.list[i].name,
                    value: defaultValue || $scope.list[i][column],
                });
            };
            if (column == "test_date" && defaultValue && !isValidDate2(defaultValue)) {
                return;
            }
            if (defaultValue) {
                $scope.save({
                    column: column,
                    course_id: $scope.current.id,
                    detail: tmplist
                });
            } else {
                var modalInstance = $modal.open({
                    templateUrl: 'myModalContent.html',
                    controller: ModalInstanceCtrl,
                    resolve: {
                        column: function() {
                            return column;
                        },
                        tmplist: function() {
                            return tmplist;
                        }
                    }
                });
                modalInstance.result.then(function(tmplist) {
                    $scope.save({
                        column: column,
                        course_id: $scope.current.id,
                        detail: tmplist
                    });
                }, function() {
                    //$log.info('Modal dismissed at: ' + new Date());
                });
            }
        }
        $scope.save = function(data) {
            //       data = { column : 'test_date',
            //     course_id : $scope.current.id,
            //     detail: [{seat_no:int,value:string},{seat_no:int,value:string},...]
            // };
            data = $scope.ngObjFixHack(data);
            //console.log(data);
            $scope.contract.send({
                service: "SetFitness1Col",
                body: data,
                result: function(response, error, http) {
                    //console.log(response);
                    //console.log(error);
                    if (!error) {
                        response.data.detail = [].concat(response.data.detail);
                        var tmp = [];
                        var msg = [];
                        for (var i = 0; i < response.data.detail.length; i++) {
                            tmp[response.data.detail[i].uid] = response.data.detail[i].value;
                            if (response.data.detail[i].status != "success")
                                msg.push(response.data.detail[i].name);
                        };
                        if (msg.length > 0)
                            set_error_message("#mainMsg", "儲存發生錯誤", {
                                loginError: {},
                                message: '下列學生儲存發生錯誤，請確認是否在資料輸入區間或稍後再試一次：<br>' + msg.join(",")
                            });
                        for (var i = 0; i < $scope.list.length; i++) {
                            $scope.list[i][response.data.column] = tmp[$scope.list[i].uid];
                        }
                    } else {
                        $scope.icon_css = "icon-warning-sign";
                        set_error_message("#mainMsg", "SetFitness1Col", error);
                    }
                    $scope.$apply();
                }
            });
        }
        var CurrentChanged = function(argument) {
            if ($scope.current == null && $scope.menu[0])
            {
                $scope.current = $scope.menu[0];
                $scope.current.inPeriod = (new Date($scope.current.start_time)).getTime() >= (new Date()).getTime() || (new Date($scope.current.end_time)).getTime() <= (new Date()).getTime();
            }
            if ($scope.menu[0]) {
                $scope.getList($scope.current.id);
            } else {
                $scope.current = {
                    course_name: '無教授體育課程'
                };
                $scope.$apply();
            }
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
var ModalInstanceCtrl = function($scope, column, tmplist) {
    $scope.column = column;
    $scope.column_text = {
        test_date: "測驗日期 EX:2014/08/07",
        height: "身高",
        weight: "體重",
        sit_and_reach: "坐姿體前彎",
        standing_long_jump: "立定跳遠",
        sit_up: "仰臥起坐",
        cardiorespiratory: "心肺適能"
    }[column];
    $scope.tmplist = tmplist;
    $scope.ok = function() {
        var tag = true;
        if (column == "test_date") {
            for (var i = 0; i < $scope.tmplist.length; i++) {
                if (!isValidDate2($scope.tmplist[i].value)) {
                    if (tag == true)
                        $scope.tmplist[i].focus = true;
                    tag = false;
                    $scope.tmplist[i].unvalidated = true;
                } else
                    $scope.tmplist[i].unvalidated = false;
            };
        }
        if (tag) {
            $scope.$close($scope.tmplist);
        } else {
            alert('資料格式不正確，請填入EX:2014/08/07');
        }
    };
    $scope.cancel = function() {
        $scope.$dismiss('cancel');
    };
};
