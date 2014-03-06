var app = angular.module("starter", [])

app.controller('MenuCtrl', function($scope,$timeout) {

  $scope.pageView = "main";
	$scope.data = {};
	$scope.contract = gadget.getContract("ischool.myAddressBook");

	$scope.getData = function(){
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

                              //value.OtherAddresses.AddressList.Address強轉array
                              value.OtherAddresses = value.OtherAddresses || {};
                              value.OtherAddresses.AddressList = value.OtherAddresses.AddressList||{};
                              value.OtherAddresses.AddressList.Address = [].concat(value.OtherAddresses.AddressList.Address||[]);

                      				$scope.data[value.ClassName].students.push(value);

                              });

                            $scope.selected($scope.getFirstItem());

                      			});

                      			//console.log($scope.data);

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

  $scope.getData();

	$scope.selected = function(text){
    $scope.activeClass = text;
    $scope.pageView = "main";

    $timeout(function() {

      var file = ["姓名,座號,學號,性別,生日,身分證號,戶籍電話,聯絡電話,行動電話,其他電話1,其他電話2,其他電話3,監護人電話,父親電話,母親電話,戶籍地址,通訊地址,其他地址"];

      angular.forEach($scope.data[$scope.activeClass].students,function(item){

        file.push("\r\n");
        file.push(item.Name+","
          +item.SeatNo+","
          +item.StudentNubmer+","
          +item.Gender+","
          +item.Birthdate+","
          +item.IdNumber+","
          +item.PermanentPhone+","
          +item.ContactPhone+","
          +item.SmsPhone+","
          +item.OtherPhones.PhoneList.PhoneNumber[0]+","
          +item.OtherPhones.PhoneList.PhoneNumber[1]+","
          +item.OtherPhones.PhoneList.PhoneNumber[2]+","
          +item.CustdoianOtherInfo.CustodianOtherInfo.Phone+","
          +item.FatherOtherInfo.FatherOtherInfo.Phone+","
          +item.MotherOtherInfo.MotherOtherInfo.Phone+","
          +$scope.getAddress(item.PermanentAddress.AddressList.Address)+","
          +$scope.getAddress(item.MailingAddress.AddressList.Address)+","
          +$scope.getAddress(item.OtherAddresses.AddressList.Address[0]));
      });

      var blob = new Blob(file);
      fileURL = window.URL.createObjectURL(blob);;
      fileName = $scope.activeClass + ".txt";

      var btnDownload = document.getElementById("download");
      btnDownload.href = fileURL;
      btnDownload.download = fileName;
    
    }, 100);
      
	};

  $scope.getBack = function() {
    $scope.pageView="main";
    };

  $scope.studentClick = function(object){
    $scope.activeStudent = object;
    $scope.pageView="info";
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

  $scope.detect = function(){
    if(navigator.userAgent.match(/Chrome/i) || navigator.userAgent.match(/Firefox/i) || navigator.userAgent.match(/Safari/i) || navigator.userAgent.match(/Opera/i)){
      return true;
    }
    else{
      return false;
    }
  };

});