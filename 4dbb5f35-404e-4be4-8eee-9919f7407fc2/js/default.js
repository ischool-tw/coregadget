$(document).ready(function () {
    $(window).resize(function () {
        $("#container-nav, #container-main").height($(window).height() - 50);
        // console.log($(window).height() - 50);
    });
});
angular.module("app", [])
.controller("Cntl", function($scope, $http) {
    $scope.contract = gadget.getContract("cloud.staff");
    $scope.init = function() {
        // $scope.current = {
        //     use_size: 23,
        //     teacher_st1: 138,
        //     teacher_st256: 2,
        //     student_st1: 953,
        //     student_st2: 0,
        //     student_st4: 1,
        //     student_st8: 2,
        //     student_st16: 3175,
        //     student_st256: 5,
        //     services: [
        //         { servicename: '國中學籍' },
        //         { servicename: '國中學務' },
        //         { servicename: '國中校務' },
        //         { servicename: '國中成績' },
        //         { servicename: '國中成績延伸' },
        //         { servicename: '國中成績報表' },
        //         { servicename: '國中學期表現' }
        //     ]
        // }
        $scope.current = {
            use_size: '讀取中...',
            teacher_st1: '讀取中...',
            teacher_st256: '讀取中...',
            student_st1: '讀取中...',
            student_st2: '讀取中...',
            student_st4: '讀取中...',
            student_st8: '讀取中...',
            student_st16: '讀取中...',
            student_st256: '讀取中...',
            services: [
                { servicename: '讀取中...' },
            ]
        }
        $scope.contract.send({
            service: "beta.Analysis",
            body: {},
            result: function (response, error, http) {
                if (!error) {
                    //console.log(response);
                    $scope.current = response.Response;
                    if (response.Response.services) {
                        response.Response.services = [].concat(response.Response.services || []);
                        response.Response.services.forEach(function(item) {
                            if (!item.servicename) {
                                // console.log(item.app_url);
                                if (item.app_url) {
                                    item.servicename = "讀取中...";
                                    $http.get(item.app_url.replace(/http:\/\/|https:\/\//i, '\/\/'), {})
                                    .success(function(response, status) {
                                        if (response) {
                                            // console.log(xml2json.parser(response));
                                            var data = xml2json.parser(response);
                                            item.servicename = (data.APP && data.APP.Title ? data.APP.Title : "");
                                        }
                                    })
                                    .error(function(){
                                        item.servicename = "讀取失敗";
                                    });
                                } else {
                                    item.servicename = "無法讀取";
                                }
                            }
                        });
                    }
                }
                else
                {
                    set_error_message("#mainMsg", "Analysis", error);
                }
                $scope.$apply();
            }
        });
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
