var app = angular.module("starter", ['ionic'])

app.controller('MenuCtrl', function($scope,$ionicModal) {

	$scope.data = {};
	$scope.contract = gadget.getContract("ischool.myAddressBook");

	$scope.init = function(){
          $scope.contract.send({
              service: "_.GetMyAddressBook",
              body: {},
              result: function (response, error, http) {
                  if (!error) {
                      if (response.Response && response.Response.Student){

                      		$scope.$apply(function(){

                      			angular.forEach(response.Response.Student,function(value,key){

                      				if(!$scope.data[value.ClassName])
                      				$scope.data[value.ClassName] = { className:value.ClassName , students:[] };

                      				$scope.data[value.ClassName].students.push(value);

                              });

                            $scope.activeClass = $scope.getFirstItem();

                      			});

                      			console.log($scope.data);

                      	}
                      	else
                      	{
                      		alert("查無班級資料");
                      	}
                  }
                  else
                  {
                  	alert("系統無此帳號身分");
                    return;
                  }
              }
          });
	};
	
	$scope.openLeft = function() {
		$scope.sideMenuController.toggleLeft();
		};

	$scope.selected = function(text){
    $scope.activeClass = text;
    $scope.sideMenuController.close();
	};

  $scope.getBack = function() {
    $scope.taskModal.hide();
    };

  $scope.studentClick = function(object){
    $scope.activeStudent = object;
    $scope.taskModal.show();
  };

  $scope.getFirstItem = function(){
    var run = true;
    var retVal;
    angular.forEach($scope.data,function(value,key){
      if(run){
        run = false;
        retVal = value.className;
      }
    });

    if(retVal)
      return retVal;
    else
      return 0;
  };

  $scope.getAddress = function(object){
    var retVal = "";

    if(object){
        retVal += object.ZipCode;
        retVal += object.County;
        retVal += object.Town;
        retVal += object.District;
        retVal += object.Area;
        retVal += object.DetailAddress;
      }

    return retVal;
  };

  // Create our modal
  $ionicModal.fromTemplateUrl('info.htm', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope
  });
});
	
app.directive('fadeBar', function($timeout) {
			return {
			  restrict: 'E',
			  template: '<div class="fade-bar"></div>',
			  replace: true,
			  link: function($scope, $element, $attr) {
				$timeout(function() {
				  $scope.$watch('sideMenuController.getOpenRatio()', function(ratio) {
					$element[0].style.opacity = Math.abs(ratio);
				  });
				});
			  }
			}
});