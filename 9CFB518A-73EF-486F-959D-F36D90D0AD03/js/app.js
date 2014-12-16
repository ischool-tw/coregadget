var app = angular.module('app', ['ngTouch', 'ui.grid', 'ui.grid.edit', 'ui.grid.cellNav']);

app.controller('MainCtrl', ['$scope', '$http', function($scope, $http) {

    $scope.connection = gadget.getContract("ischool.nehs.absence");

    var data = [];
    $scope.gridOptions = {};
    $scope.gridOptions.enableCellEditOnFocus = true;
    
    $scope.gridOptions.columnDefs = [{
        name: 'ClassName',
        enableCellEdit: false,
        enableSorting: false,
        width: '10%'
    }, {
        name: 'SeatNo',
        enableCellEdit: false,
        enableSorting: false,
        width: '10%'
    }, {
        name: 'Name',
        enableCellEdit: false,
        enableSorting: false,
        width: '15%'
    }, {
        name: 'EnglishName',
        enableCellEdit: false,
        enableSorting: false,
        width: '25%'
    }, {
        name: 'NickName',
        enableCellEdit: false,
        enableSorting: false,
        width: '10%'
    }, {
        name: 'PersonalDays',
        displayName:'Personal leave(days)',
        enableSorting: false,
        type: 'number',
        width: '15%'
    }, {
        name: 'SickDays',
        displayName:'Sick leave(days)',
        enableSorting: false,
        type: 'number',
        width: '15%'
    }];

    $scope.gridOptions.data = data;

    $scope.SaveData = function() {

        //console.log(data);

        var del = "";
        var update = "";
        var insert = "<SchoolYear>" + $scope.SchoolYear + "</SchoolYear><Semester>" + $scope.Semester + "</Semester>";

        var del_return = false;
        var update_return = false;
        var insert_return = false;

        for (index = 0; index <= data.length - 1; index++) {

        	data[index].PersonalDays = parseInt(data[index].PersonalDays, 10);
	        data[index].SickDays = parseInt(data[index].SickDays, 10);

	        if(isNaN(data[index].PersonalDays))
	        	data[index].PersonalDays = "";

	        if(isNaN(data[index].SickDays))
	        	data[index].SickDays = "";

            if (data[index].UID) {

                if (data[index].PersonalDays === "" && data[index].SickDays === "") {
                    //delete
                    del += "<UID>" + data[index].UID + "</UID>";
                } else {
                    //update
                    update += "<Student>";
                    update += "<UID>" + data[index].UID + "</UID>";

                    if (data[index].PersonalDays === "")
                    	update += "<Personal>null</Personal>";
                    else
                        update += "<Personal>" + data[index].PersonalDays + "</Personal>";

                    if (data[index].SickDays === "")
                    	update += "<Sick>null</Sick>";
                    else
                        update += "<Sick>" + data[index].SickDays + "</Sick>";

                    update += "</Student>";
                }

            } else if (data[index].PersonalDays !== "" || data[index].SickDays !== "") {
                //insert
                insert += "<Student>";
                insert += "<ID>" + data[index].StudentID + "</ID>";

                if (data[index].PersonalDays === "")
                	insert += "<Personal>null</Personal>";
                else
                    insert += "<Personal>" + data[index].PersonalDays + "</Personal>";

                if (data[index].SickDays === "")
                    insert += "<Sick>null</Sick>";
                else
                    insert += "<Sick>" + data[index].SickDays + "</Sick>";
                
                insert += "</Student>";
            }
        };

        //send insert
        $scope.connection.send({
            service: "_.InsertAbsence",
            body: "<Request>" + insert + "</Request>",
            result: function(response, error, http) {
                if (error) {
                    //alert("insert failed");
                    //console.log(error);
                }

                insert_return = true;
                if(insert_return && update_return && del_return){
                  alert("儲存完成(Saving completed)");
                  $scope.GetData();
                }
            }
        });

        //send update
        $scope.connection.send({
            service: "_.UpdateAbsence",
            body: "<Request>" + update + "</Request>",
            result: function(response, error, http) {
                if (error) {
                    //alert("update failed");
                    //console.log(error);
                }

                update_return = true;
                if(insert_return && update_return && del_return){
                  alert("儲存完成(Saving completed)");
                  $scope.GetData();
                }
            }
        });

        //send delete
        $scope.connection.send({
            service: "_.DeleteAbsence",
            body: "<Request>" + del + "</Request>",
            result: function(response, error, http) {
                if (error) {
                    //alert("delete failed");
                    //console.log(error);
                }

                del_return = true;
                if(insert_return && update_return && del_return){
                  alert("儲存完成(Saving completed)");
                  $scope.GetData();
                }
            }
        });
    };

    $scope.gridOptions.onRegisterApi = function(gridApi) {
        $scope.gridApi = gridApi;
    };

    $scope.CellColor = function(readOnly){
    	if(readOnly)
    		return "blue"
    	else
    		return "green"
    };

    $scope.GetData = function() {
        $scope.connection.send({
            service: "_.GetAbsence",
            body: '',
            result: function(response, error, http) {

                //console.log(response);

                if (error) {
                    console.log(error);

                    if (error.dsaError && error.dsaError.message)
                        alert("查詢過程發生錯誤(An error occurred while trying to send the request):\r\n" + error.dsaError.message);

                    if (error.loginError && error.loginError.message)
                        alert("查詢過程發生錯誤,請確認此帳號為老師身分(An error occurred while trying to send the request, please make sure this is a teacher's account):\r\n" + error.loginError.message);

                } else {
                    if (response) {

                        $scope.startDate = response.OpeningDate;
                        $scope.endDate = response.FinishedDate;
                        $scope.SchoolYear = response.SchoolYear;
                        $scope.Semester = response.Semester;

                        $scope.DisplaySchoolYear = parseInt($scope.SchoolYear, 10) + 1911;
                        if ($scope.Semester == '1')
                            $scope.DisplaySemester = '1st';
                        else
                            $scope.DisplaySemester = '2nd';

                        if (response.CanEdit === "true") {
                            $scope.alertStyle = "alert-info";

                            data = [].concat(response.Student);

                            for (index = 0; index <= data.length - 1; index++) {
                                data[index].PersonalDays = parseInt(data[index].PersonalDays, 10);
                                data[index].SickDays = parseInt(data[index].SickDays, 10);

                                if(isNaN(data[index].PersonalDays))
                                	data[index].PersonalDays = "";

                                if(isNaN(data[index].SickDays))
                                	data[index].SickDays = "";
                            };

                            $scope.gridOptions.data = data;

                            //console.log(data);
                        } else {
                            $scope.alertStyle = "alert-warning";
                            $scope.btnStyle = "disabled";
                            alert("非開放期間無法編輯(During non-opening period/time, users can not edit this page)");
                        }

                        $scope.$apply();
                    }
                }
            }
        });
    };

    $scope.GetData();

}]);
