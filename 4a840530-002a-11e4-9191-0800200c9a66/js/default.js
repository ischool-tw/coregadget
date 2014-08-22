function parseDateUTC(input) {
    var reg = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
    var parts = reg.exec(input);
    return parts ? (new Date(Date.UTC(parts[1], parts[2] -1, parts[3], parts[4], parts[5],parts[6]))) : null
}
var app = angular
  .module("app", [])
  .filter('myDateFormat',function($filter){
  return function(text,format){
    var tempdate= new Date(text.replace(/-/g,"/"));
    // //console.log(tempdate);
    if (tempdate && tempdate!= 'Invalid Date' && !isNaN(tempdate))
      return $filter('date')(tempdate, format);
  };
  })
  .filter('filtList', function() {
    return function(input, type) {
      var returnArray = [];
      if (angular.isArray(input)) {
        for (var i = 0; i < input.length; i++) {
          if (type == 'finished' && parseDateUTC(input[i].regist_end_time) < Date.now() )
            returnArray.push(input[i]);
          else if (type == 'opened' && parseDateUTC(input[i].regist_end_time) > Date.now() )
            returnArray.push(input[i]);
        };
        return returnArray;
      } else return [];
    };
  })
  .controller("ServiceLearningCreationItemsCntl", function($scope) {
    $scope.safeApply = function(fn) {
  var phase = this.$root.$$phase;
  if(phase == '$apply' || phase == '$digest') {
    if(fn && (typeof(fn) === 'function')) {
      fn();
    }
  } else {
    this.$apply(fn);
  }
};
    $scope.contract = gadget.getContract("ischool.service_learning.creationitems.student");
    $scope.list = [];
    $scope.init = function() {
      $scope.contract.send({
        service: "GetList",
        body: {},
        result: function(response, error, http) {
          //console.log(response.data);
          //console.log(response.error);
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
    $scope.save = function(item) {
      if (item.hasOwnProperty('want_participate')) {
        data = {
          slcir_uid: item.slcir_uid,
          slcipr_uid: item.slcipr_uid,
          want_participate: item.want_participate,
        };
        $scope.contract.send({
          service: "SetItem",
          body: data,
          result: function(response, error, http) {
            //console.log(response);
            //console.log(error);
            if (!error) {
              if (response.msg == 'success' || response.msg == 'not changed' ) {
                if ( item.want_participate )
                  alert('已提交');
                else
                  alert('已取消');
              }
              else if (response.msg == 'it is over') {
                alert('此項目已結束');
                item.want_participate = !item.want_participate;
              }
            } else {
              $scope.icon_css = "icon-warning-sign";
              set_error_message("#mainMsg", "SetItem", error);
            }
            $scope.$apply();
          }
        });
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
    $(select_str).html("<div class=\"alert alert-error\"><button class=\"close\" data-dismiss=\"alert\">×</button>" + tmp_msg + "</div>");
    return $(".my-err-info").click(function() {
      return alert("請拍下此圖，並與客服人員連絡，謝謝您。\n" + JSON.stringify(error, null, 2));
    });
  }
};