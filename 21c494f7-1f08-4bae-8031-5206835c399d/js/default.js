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
    .directive('initFocus', function() {
        var timer;
        return function(scope, elm, attr) {
            if (timer) clearTimeout(timer);
            
            timer = setTimeout(function() {
                elm.focus();
            }, 0);
        }})
    .controller("Ctrl0", function($scope) {
        $scope.usingPage = '1' ;
        $scope.changePage = function(page){
            $scope.usingPage = page ;
            $scope.$broadcast('pageChanged',page);
        };
        $scope.contract = gadget.getContract("ischool.behavior.disciplineInput.teacher");
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
        $scope.init = function() {
            $scope.getConf();
        }
        $scope.getConf = function() {
            $scope.contract.send({
                service: "GetConf",
                body: {},
                result: function(response, error, http) {
                    if (!error) {
                        if (response.conf)
                            $scope.conf = response.conf;
                    } else {
                        $scope.icon_css = "icon-warning-sign";
                        set_error_message("#mainMsg", "GetMenu", error);
                    }
                    $scope.safeApply();
                }
            });
        }
    })
    .controller("Ctrl1", function($scope, $modal,$q) {
        $scope.pici = {};
        $scope.list = [];
        $scope.menu = [];
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
        $scope.contract = gadget.getContract("ischool.behavior.disciplineInput.teacher");
        $scope.menu = [];
        $scope.init = function() {
            $scope.getMenu();
        }
        $scope.getMenu = function() {
            $scope.contract.send({
                service: "GetMenu",
                body: {},
                result: function(response, error, http) {
                    if (!error) {
                    	if (response.conf)
                            $scope.conf = response.conf;
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
        $scope.getList = function($class_id) {
            $scope.list = [];
            $scope.contract.send({
                service: "GetList",
                body: {class_id:$class_id},
                result: function(response, error, http) {
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
        $scope.showEditForm = function(student_ids,merit_flag) {
            if ( Object.prototype.toString.call(student_ids) == "[object Object]")
            {
                var arr = [];
                var myObj = angular.copy(student_ids) ;
                for( var i in myObj ) {
                    if (myObj.hasOwnProperty(i)){
                        if (myObj[i] && !isNaN(i)){
                            arr.push(i);
                        }
                    }
                }
                student_ids = arr ;
            }
            if ( !student_ids || !student_ids.length || !merit_flag )
                return ;
            var student_ids = angular.copy(student_ids) ;
            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: ModalInstanceCtrl,
                resolve: {
                    merit_flag: function() {
                        return merit_flag;
                    },
                    conf: function() {
                        return $scope.conf;
                    }
                }
            });
            modalInstance.result.then(function(form1) {
                var promiseList = [];
                //form1.occur_date = form1.occur_date.toISOString();
                for (var i = 0; i < student_ids.length; i++) {
                    var tmp = angular.copy(form1);
                    tmp.ref_student_id = student_ids[i];
                    tmp.merit_flag = merit_flag;
                    
                    promiseList.push($scope.save(tmp));
                };
                $q.all(promiseList).then(function(result){
                    var msg = [];
                    for (var i = 0; i < result.length; i++) {
                        if ( result[i].status != 'success' )
                            msg.push(result[i].ref_student_id);
                    };
                    if ( msg.length )
                        set_error_message("#mainMsg", "儲存發生錯誤", {
                                    loginError: {},
                                    message: '下列學生儲存發生錯誤，請確認是否在資料輸入區間或稍後再試一次：<br>' + msg.join(",")
                                });
                });
            }, function() {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        }
        $scope.save = function(form1) {
            //     data = { column : 'test_date',
            //     course_id : $scope.current.id,
            //     detail: [{seat_no:int,value:string},{seat_no:int,value:string},...]
            // };
            var deferred = $q.defer();
            //return;
            data = $scope.ngObjFixHack(form1);
            $scope.contract.send({
                service: "SetDisciplineRequest",
                body: data,
                result: function(response, error, http) {
                    if (!error) {
                        deferred.resolve(response.data);//checkRuningComplete();
                    } else {
                        deferred.resolve(data);
                        //$scope.icon_css = "icon-warning-sign";
                        //set_error_message("#mainMsg", "SetFitness1Col", error);
                    }
                }
            });
            return deferred.promise;
        }
        var CurrentChanged = function(argument) {
            if ( $scope.current == null && $scope.menu[0] )
                $scope.current = $scope.menu[0];
            if ($scope.menu[0]) {
                $scope.getList($scope.current.id);
            } else{
                $scope.current = {
                    course_name: '無授課班級'
                };
                $scope.$apply();
            }
        }
    })
    .controller("Ctrl2", function($scope) {
        $scope.contract = gadget.getContract("ischool.behavior.disciplineInput.teacher");
        $scope.menu = [];
        $scope.list = [];
        $scope.init = function() {
            $scope.getMenu();
        }
         $scope.$on('pageChanged',function(e,d){
            if ( d == 2 )
                $scope.refresh();
        });
        $scope.getMenu = function() {
            $scope.contract.send({
                service: "GetMenu",
                body: {},
                result: function(response, error, http) {
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
        $scope.getList = function($class_id) {
            var meritStringMap = {
                merita :'大功',
                meritb :'小功',
                meritc:'嘉獎',
                demerita:'大過',
                demeritb:'小過',
                demeritc:'警告',
            }
            $scope.list = [];
            $scope.contract.send({
                service: "GetDisciplineRequest",
                body: {class_id:$class_id},
                result: function(response, error, http) {
                    if (!error) {
                        if (response.data)
                        {
                            response.data = [].concat(response.data);
                            for (var i = 0; i < response.data.length; i++) {
                                var tmpArray = [];
                                var tmp = response.data[i] ;
                                for (var tmp_merit in meritStringMap) {
                                    if ( !isNaN(tmp[tmp_merit]) && tmp[tmp_merit] > 0 )
                                        tmpArray.push(meritStringMap[tmp_merit]+":"+tmp[tmp_merit]);
                                };
                                response.data[i].merit_string = tmpArray.join(",");
                            };
                            $scope.list = response.data;
                        }
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
        var CurrentChanged = function(argument) {
            if ( $scope.current == null && $scope.menu[0] )
                $scope.current = $scope.menu[0];
            if ($scope.menu[0]) {
                $scope.getList($scope.current.id);
            } else{
                $scope.current = {
                    course_name: '無授課班級'
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
var ModalInstanceCtrl = function($scope, merit_flag, conf) {
    $scope.opened = false ;
	$scope.datePickerOpen = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };
    $scope.merit_flag = merit_flag;
    $scope.conf = conf;
    $scope.form1 = {};
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
    var check = function()
    {
        $scope.error = {};
        $scope.error.occur_date = Object.prototype.toString.call($scope.form1.occur_date) !== '[object Date]' ;
        $scope.error.reason = !$scope.form1.reason ;
        if ( !$scope.form1.detail )
            $scope.form1.detail = {/*A:0,B:0,C:0*/} ;
        if ( !$scope.form1.detail.A )
            $scope.form1.detail.A = 0 ;
        if ( !$scope.form1.detail.B )
            $scope.form1.detail.B = 0 ;
        if ( !$scope.form1.detail.C )
            $scope.form1.detail.C = 0 ;
        $scope.error.detaila = !$.isNumeric($scope.form1.detail.A) ;
        $scope.error.detailb = !$.isNumeric($scope.form1.detail.B) ;
        $scope.error.detailc = !$.isNumeric($scope.form1.detail.C) ;
        $scope.error.detail = (( $scope.form1.detail.A + $scope.form1.detail.B + $scope.form1.detail.C ) <= 0 ) || ( ( $scope.form1.detail.A + $scope.form1.detail.B + $scope.form1.detail.C ) % 1 !== 0 );
        var pass = true ;
        if ( $scope.error.detail )
            alert('請輸入功過次數(需為數字)');
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
