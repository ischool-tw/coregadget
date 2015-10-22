angular.module("app", [])
.controller("Cntl", function($scope, $http) {
    $scope.init = function() {
        $scope.current = {};
        $scope.curr_school = null;
        $scope.curr_status = "limit";

        if (location.href.lastIndexOf('?') >= 0) {
            var bookmark = location.href.substr(location.href.lastIndexOf('?') + 1);

            var vars = [], hashes = bookmark.split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = decodeURIComponent(hashes[i]);
                var key = hash.substring(0, hash.indexOf("="));
                vars.push(key);
                vars[key] = hash.substring(hash.indexOf("=") + 1);
            }
            if (vars.token) {
                $http.get(["https://auth.ischool.com.tw/services/me2.php?access_token=", vars.token].join(""), {})
                .success(function(response, status) {
                    if (response && response.userID == "peterwmw@pyps.ntpc.edu.tw") {
                        $scope.token = vars.token;
                        $scope.schools = [
                            { schoolname: '白雲國小', dsa: 'pyps.ntpc.edu.tw' },
                            { schoolname: '澔學國中', dsa: 'demo.ischool.j' }
                        ];
                        $scope.curr_status = "views";
                    }
                })
            }
        }
    };

    $scope.changeDSA = function(s) {
        $scope.curr_school = s.schoolname;
        $scope.curr_status = "loading";
        $scope.current = {};
        // var dsns = "https://104.199.161.236/";
        var dsns = 'https://dsns.1campus.net/';
        var url = [dsns, s.dsa, "/cloud.staff/beta.Analysis?stt=PassportAccessToken&AccessToken=", $scope.token].join("");
        // console.log(url);
        $http.get(url, {})
        .success(function(response, status) {
            response = xml2json.parser(response);
            if (response.Body && response.Body.Response) {
                //console.log(response);
                $scope.current = response.Body.Response;
                if (response.Body.Response.services) {
                    response.Body.Response.services = [].concat(response.Body.Response.services || []);
                    response.Body.Response.services.forEach(function(item) {
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
                    $scope.curr_status = "success";
                }
            }
            else
            {
                $scope.curr_status = "error";
            }
            $scope.$apply();
        })
        .error(function(){
            $scope.curr_status = "error";
        });
    }
});