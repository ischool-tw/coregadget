$(document).ready(function () {
    $(window).resize(function () {
        $("#container-nav, #container-main").height($(window).height() - 50);
        // console.log($(window).height() - 50);
    });
});
angular.module("app", [])
.filter('myDateFormat',function($filter){
  return function(text){
    var tempdate= new Date(text.replace(/-/g,"/"));
    // console.log(tempdate);
    if (tempdate && tempdate!= 'Invalid Date' && !isNaN(tempdate))
      return $filter('date')(tempdate, "yyyy-MM-dd");
  };
})
.filter('filterEmpty', function() {
  return function( items, prop ) {
    var filtered = [];
    //  console.log(prop);
    angular.forEach(items, function(item) {
      //console.log(item[prop]);
      if(item[prop] !== "") {
        filtered.push(item);
      }
    });
    return filtered;
  };
})
.controller("Cntl", function($scope) {
  $scope.ngObjFixHack = function(ngObj) {
      var output;
      output = angular.toJson(ngObj);
      output = angular.fromJson(output);
      return output;
  }
    $scope.contract = gadget.getContract("ischool.fitness.inquire.teacher");
    $scope.init = function(){
          $scope.contract.send({
              service: "GetMenu",
              body: {},
              result: function (response, error, http) {
                  if (!error) {
                      // console.log(response);
                      $scope.menus = [];
                      if (response.data) {
                        response.data = [].concat(response.data);
                        $scope.menus = response.data;
                        $scope.class_name = response.data[0].class_name;
                        $scope.class_id = response.data[0].class_id;
                        $scope.school_year = response.data[0].school_year;
                        for (var i = 0; i < response.data.length; i++) {
                          if ( response.data[i].school_year )
                          {
                            $scope.class_name = response.data[i].class_name;
                            $scope.class_id = response.data[i].class_id;
                            $scope.school_year = response.data[i].school_year;
                            break;
                          }
                        };
                      }
                  }
                  else
                  {
                      set_error_message("#mainMsg", "GetMenu", error);
                  }
                  $scope.$apply();
                  $scope.get_fitness();
              }
          });
        }
    $scope.get_fitness = function(){
      if ($scope.class_id && $scope.school_year){
          $scope.contract.send({
              service: "GetFitness",
              body: {class_id:$scope.class_id,school_year:$scope.school_year},
              result: function (response, error, http) {
                  if (!error) {
                      // console.log(response);
                      $scope.fitness = [];
                      if (response.data) {
                        $scope.fitness = response.data;
                      }
                  }
                  else
                  {
                      set_error_message("#mainMsg", "GetFitness", error);
                  }
                  $scope.$apply();
              }
          });
        }
    }
    $scope.change_class = function(menu){
      $scope.class_name = menu.class_name;
      $scope.class_id = menu.class_id ;
      $scope.fitness = [] ;
      $scope.school_year = menu.school_year;
      $scope.get_fitness();
    }
    $scope.change_school_year = function(menu){
      $scope.fitness = [] ;
      $scope.school_year = menu.school_year;
      $scope.get_fitness();
    }
    $scope.refresh = function () {
        $scope.init();
    }
    $scope.filter_by_school_year = function(fitness) {
        return (fitness.school_year === $scope.school_year || fitness.school_year === "");
    };
})
/**
 * Filters out all duplicate items from an array by checking the specified key
 * @param [key] {string} the name of the attribute of each object to compare for uniqueness
 if the key is empty, the entire object will be compared
 if the key === false then no filtering will be performed
 * @return {array}
 */
.filter('unique', ['$parse', function ($parse) {

  return function (items, filterOn) {

    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var newItems = [],
        get = angular.isString(filterOn) ? $parse(filterOn) : function (item) { return item; };

      var extractValueToCompare = function (item) {
        return angular.isObject(item) ? get(item) : item;
      };

      angular.forEach(items, function (item) {
        var isDuplicate = false;

        for (var i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }

      });
      items = newItems;
    }
    return items;
  };
}]);
var set_error_message = function(select_str, serviceName, error) {
      var tmp_msg;

      tmp_msg = "<i class=\"icon-white icon-info-sign my-err-info\">i</i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(" + serviceName + ")";
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
