var app = angular.module("app", [])
    .filter('error_css', function() {
      return function(input) {
        return input === false ? 'error' :(input === '' ? 'gray':'');
    }
});
app.controller("InputStatusCntl", function($scope) {
    $scope.contract = gadget.getContract("ischool.exam.inputstatus.teacher");
    $scope.tag_running = false;
    $scope.init = function(){
        $scope.icon_css = "icon-search";
        if ($scope.tag_running == false)
        {
          $scope.tag_running = true ;
          $scope.contract.send({
              service: "GetInputStatus",
              body: {},
              result: function (response, error, http) {
                  if (!error) {
                      $scope.status = [] ;
                      $scope.icon_css = "icon-refresh";
                      if (response.Status)
                          $.each(response.Status,function(key,value){
                                  //開始時間未到
                                  if ( (new Date(value.start_time)) >= (new Date()) ) {
                                    value.done = '' ;
                                  }
                                  else {
                                    value.done = (value.should == value.already);
                                  }
                                  $scope.status.push(value);
                              }
                          );
                  }
                  else
                  {
                      $scope.icon_css = "icon-warning-sign";
                      set_error_message("#mainMsg", "GetInputStatus", error);
                  }
                  $scope.$apply();
                  gadget.setExterior({hint:$scope.undone});
              }
          });
          $scope.tag_running = false ;
        }
    }
    $scope.refresh = function () {
        $scope.init();
    }
});
var set_error_message = function(select_str, serviceName, error) {
      var tmp_msg;

      tmp_msg = "<i class=\"icon-white icon-info-sign my-err-info\"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(" + serviceName + ")";
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
    