$(document).ready(function () {
    $(window).resize(function () {
        $("#container-nav, #container-main").height($(window).height() - 50);
        console.log($(window).height() - 50);
    });
});
angular.module("app", [])
.filter('myDateFormat',function($filter){
  return function(text){
    var tempdate= new Date(text.replace(/-/g,"/"));
    console.log(tempdate);
    if (tempdate && tempdate!= 'Invalid Date')
      return $filter('date')(tempdate, "yyyy-MM-dd");
  };
})
.controller("Cntl", function($scope) {
    $scope.contract = gadget.getContract("ischool.fitness.inquire.student");
    $scope.init = function(){
          $scope.contract.send({
              service: "GetFitness",
              body: {},
              result: function (response, error, http) {
                  if (!error) {
                    //console.log(response);
                      $scope.fitness = [] ;
                      if (response.fitness) { 
                        if (!angular.isArray(response.fitness))
                          $scope.fitness.push(response.fitness);
                        else {
                            $.each(response.fitness,function(key,value){
                                    $scope.fitness.push(value);
                                }
                            );
                        }
                      }
                  }
                  else
                  {
                      set_error_message("#mainMsg", "GetInputStatus", error);
                  }
                  $scope.$apply();
              }
          });
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
    