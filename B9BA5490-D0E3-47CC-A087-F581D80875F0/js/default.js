var app = angular.module("starter", [])

app.controller('MenuCtrl', function($scope, $timeout) {

    $scope.pageView = "main";
    $scope.data = {};
    $scope.contract = gadget.getContract("ischool.myAddressBook");

    $scope.getData = function() {
        $scope.contract.send({
            service: "_.GetMyAddressBook",
            body: {},
            result: function(response, error, http) {
                if (!error) {
                    if (response.Response && response.Response.Student) {

                        $scope.$apply(function() {

                            response.Response.Student = [].concat(response.Response.Student);
                            angular.forEach(response.Response.Student, function(value, key) {

                                if (!$scope.data[value.ClassName])
                                    $scope.data[value.ClassName] = {
                                        className: value.ClassName,
                                        students: []
                                    };

                                //value.OtherAddresses.AddressList.Address強轉array
                                value.OtherAddresses = value.OtherAddresses || {};
                                value.OtherAddresses.AddressList = value.OtherAddresses.AddressList || {};
                                value.OtherAddresses.AddressList.Address = [].concat(value.OtherAddresses.AddressList.Address || []);

                                $scope.data[value.ClassName].students.push(value);

                            });

                            $scope.selected($scope.getFirstItem());

                        });

                        //console.log($scope.data);

                    } else {
                        alert("查無班級資料");
                    }
                } else {
                    alert("系統無此帳號身分");
                    return;
                }
            }
        });
    };

    $scope.getData();

    $scope.selected = function(text) {
        $scope.activeClass = text;
        $scope.pageView = "main";

        $timeout(function() {

            var file = ["姓名,座號,學號,性別,生日,身分證號,戶籍電話,聯絡電話,行動電話,其他電話1,其他電話2,其他電話3,監護人姓名,監護人電話,父親姓名,父親電話,母親姓名,母親電話,戶籍地址,通訊地址,其他地址"];

            angular.forEach($scope.data[$scope.activeClass].students, function(item) {

                file.push("\r\n");

                var OtherPhones1 = (item.OtherPhones.PhoneList) ? item.OtherPhones.PhoneList.PhoneNumber[0] : "";
                var OtherPhones2 = (item.OtherPhones.PhoneList) ? item.OtherPhones.PhoneList.PhoneNumber[1] : "";
                var OtherPhones3 = (item.OtherPhones.PhoneList) ? item.OtherPhones.PhoneList.PhoneNumber[2] : "";
                var CustodianPhone = (item.CustdoianOtherInfo.CustodianOtherInfo) ? item.CustdoianOtherInfo.CustodianOtherInfo.Phone || "" : "";
                var FatherPhone = (item.FatherOtherInfo.FatherOtherInfo) ? item.FatherOtherInfo.FatherOtherInfo.Phone || "" : "";
                var MotherPhone = (item.MotherOtherInfo.MotherOtherInfo) ? item.MotherOtherInfo.MotherOtherInfo.Phone || "" : "";
                var Address1 = (item.PermanentAddress.AddressList) ? $scope.getAddress(item.PermanentAddress.AddressList.Address) : "";
                var Address2 = (item.MailingAddress.AddressList) ? $scope.getAddress(item.MailingAddress.AddressList.Address) : "";
                var Address3 = (item.OtherAddresses.AddressList) ? $scope.getAddress(item.OtherAddresses.AddressList.Address) : "";

                file.push(item.Name + "," + item.SeatNo + "," + item.StudentNubmer + "," + item.Gender + "," + item.Birthdate + "," + item.IdNumber + "," + item.PermanentPhone + "," + item.ContactPhone + "," + item.SmsPhone + "," + OtherPhones1 + "," + OtherPhones2 + "," + OtherPhones3 + "," + item.CustodianName + "," + CustodianPhone + "," + item.FatherName + "," + FatherPhone + "," + item.MotherName + "," + MotherPhone + "," + Address1 + "," + Address2 + "," + Address3);
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
        $scope.selected($scope.activeClass);
    };

    $scope.studentClick = function(object) {
        $scope.activeStudent = object;
        $scope.pageView = "info";
    };

    $scope.getFirstItem = function() {
        var run = true;
        var retVal;
        angular.forEach($scope.data, function(value, key) {
            if (run) {
                run = false;
                retVal = value.className;
            }
        });

        if (retVal)
            return retVal;
        else
            return 0;
    };

    $scope.getAddress = function(object) {
        var retVal = "";

        if (object) {

          if(angular.isArray(object)){
            for (var key in object) {
                var value = object[key];
                retVal += value.ZipCode || '';
                retVal += value.County || '';
                retVal += value.Town || '';
                retVal += value.District || '';
                retVal += value.Area || '';
                retVal += value.DetailAddress || '';

                if (retVal)
                    break;
            }
          }
          else {
            retVal += object.ZipCode || '';
            retVal += object.County || '';
            retVal += object.Town || '';
            retVal += object.District || '';
            retVal += object.Area || '';
            retVal += object.DetailAddress || '';
        }
      }
      return retVal;
    };

    $scope.detect = function() {
        if (navigator.userAgent.match(/Chrome/i) || navigator.userAgent.match(/Firefox/i) || navigator.userAgent.match(/Safari/i) || navigator.userAgent.match(/Opera/i)) {
            return true;
        } else {
            return false;
        }
    };

});
