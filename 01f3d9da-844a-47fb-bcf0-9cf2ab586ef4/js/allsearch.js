angular.module('allsearch', [])

.controller('MainCtrl', ['$scope','$filter',
    function($scope,$filter) {

        $scope.newIR;

        //console.log($filter('date')('2012/12/21','yyyy-MM-dd'))

        $scope.system_position = gadget.params.system_position || "teacher";

        if ($scope.system_position === "teacher" || $scope.system_position === "counsel_teacher") {
            $scope.teacher_connection = gadget.getContract("ibsh.basic.teacher");
            $scope.custom_connection = gadget.getContract("ibsh.custom");
            $scope.counsel_connection = gadget.getContract("ibsh.careers_counsel.teacher");
        } else if ($scope.system_position === "counsel_teacher") {
            $scope.counsel_connection = gadget.getContract("ibsh.careers_counsel.teacher");
        } else {
            $scope.connection = gadget.getContract("ibsh.custom");
        }

        $scope.getClassList = function() {
            $scope.teacher_connection.send({
                service: "_.GetClassList",
                body: '',
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {
                        //console.log(response);
                        $scope.$apply(function() {
                            if (response !== null && response !== '') {

                                $scope.IsCareersCounselor = response.IsCareersCounselor;
                                $scope.classlist = [].concat(response.Class);

                                if ($scope.classlist.length > 0) {
                                    $scope.selectClass($scope.classlist[0]);
                                }
                            }
                        });
                    }
                }
            });
        };

        $scope.selectClass = function(item) {
            $scope.currentClass = item;

            angular.forEach($scope.classlist, function(item) {
                item.selected = false;
            });
            item.selected = true;

            $scope.getStudentList();
        };

        $scope.getStudentList = function() {
            $scope.teacher_connection.send({
                service: "_.GetStudentInfo",
                body: {
                    ClassID: $scope.currentClass.ClassID,
                    NeedPhoto: true
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        //$scope.set_error_message('#mainMsg', 'GetStudentInfo', error);
                    } else {
                        //console.log(response);
                        $scope.$apply(function() {
                            if (response !== null && response.Class !== undefined && response.Class !== null && response.Class.Student !== undefined && response.Class.Student !== null && response.Class.Student !== '') {
                                $scope.studentList = [].concat(response.Class.Student);


                                angular.forEach($scope.studentList, function(item) {
                                    item.FreshmanPhoto = item.FreshmanPhoto !== '' ? 'data:image/png;base64,' + item.FreshmanPhoto : '';
                                    item.GraduatePhoto = item.GraduatePhoto !== '' ? 'data:image/png;base64,' + item.GraduatePhoto : '';

                                    var address = null;
                                    if (item.MailingAddress !== null && item.MailingAddress !== '' &&
                                        item.MailingAddress.AddressList !== null && item.MailingAddress.AddressList !== '' &&
                                        item.MailingAddress.AddressList.Address !== null && item.MailingAddress.AddressList.Address !== '')
                                        address = [].concat(item.MailingAddress.AddressList.Address)[0];

                                    if (address !== null) {
                                        item.FullAdderss = [
                                            address.ZipCode !== null ? address.ZipCode : '',
                                            address.County !== null ? address.County : '',
                                            address.Town !== null ? address.Town : '',
                                            address.District !== null ? address.District : '',
                                            address.Area !== null ? address.Area : '',
                                            address.DetailAddress !== null ? address.DetailAddress : ''
                                        ].join('');
                                    } else {
                                        item.FullAdderss = '';
                                    }
                                });

                                if ($scope.studentList.length > 0) {
                                    $scope.selectStudent($scope.studentList[0]);
                                }
                            }
                        });
                    }
                }
            });
        };

        $scope.selectStudent = function(item) {
            $scope.currentStudent = item;

            angular.forEach($scope.studentList, function(item) {
                item.selected = false;
            });
            item.selected = true;

            $scope.getConduct();
            $scope.getExam();
            $scope.getInterviewRecord();
            $scope.getAD();
        };

        $scope.getConduct = function() {
            $scope.custom_connection.send({
                service: "_.GetConduct",
                body: {
                    StudentID: $scope.currentStudent.StudentID
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {
                        //console.log(response);
                        $scope.$apply(function() {
                            $scope.conductList = [];
                            if (response !== null && response !== '' && response.ConductScore !== null && response.ConductScore !== '') {
                                $scope.conductList = [].concat(response.ConductScore);

                                angular.forEach($scope.conductList,function(item){
                                    if (item.Conduct !== null && item.Conduct !== '') {
                                        item.Conduct = [].concat(item.Conduct);

                                        angular.forEach(item.Conduct,function(conduct){
                                            if (conduct.MidtermConduct !== undefined && conduct.MidtermConduct !== null && conduct.MidtermConduct !== '' && 
                                                conduct.MidtermConduct.Conducts !== null && conduct.MidtermConduct.Conducts !== '' &&
                                                conduct.MidtermConduct.Conducts.Conduct !== null && conduct.MidtermConduct.Conducts.Conduct !== '') {
                                                conduct.MidtermConduct.Conducts.Conduct = [].concat(conduct.MidtermConduct.Conducts.Conduct);

                                                angular.forEach(conduct.MidtermConduct.Conducts.Conduct, function(x){
                                                    if (x.Item !== null && x.Item !== '')
                                                        x.Item = [].concat(x.Item);
                                                });
                                            } else {
                                                conduct.MidtermConduct = {Conducts:{Conduct:[]}};
                                            }

                                            if (conduct.FinalConduct !== undefined && conduct.FinalConduct !== null && conduct.FinalConduct !== '' && 
                                                conduct.FinalConduct.Conducts !== null && conduct.FinalConduct.Conducts !== '' &&
                                                conduct.FinalConduct.Conducts.Conduct !== null && conduct.FinalConduct.Conducts.Conduct !== '') {
                                                conduct.FinalConduct.Conducts.Conduct = [].concat(conduct.FinalConduct.Conducts.Conduct);
                                            
                                                angular.forEach(conduct.FinalConduct.Conducts.Conduct, function(x){
                                                    if (x.Item !== null && x.Item !== '')
                                                        x.Item = [].concat(x.Item);
                                                });
                                            } else {
                                                conduct.FinalConduct = {Conducts:{Conduct:[]}};
                                            }

                                            conduct.ShowConduct = {Conducts:{Conduct:[]}};

                                            angular.forEach(conduct.MidtermConduct.Conducts.Conduct ,function(x){
                                                var flag = false;

                                                angular.forEach(conduct.ShowConduct.Conducts.Conduct ,function(y){
                                                    if (x.Group === y.Group) 
                                                        flag = true;
                                                });

                                                if (!flag) {
                                                    var temp = {Group:x.Group,Item:[]};

                                                    angular.forEach(x.Item, function(z){
                                                        temp.Item.push({Title:z.Title,MidtermGrade:z.Grade});
                                                    });

                                                    conduct.ShowConduct.Conducts.Conduct.push(temp);
                                                }
                                            });

                                            angular.forEach(conduct.FinalConduct.Conducts.Conduct ,function(x){
                                                var flag = null;

                                                angular.forEach(conduct.ShowConduct.Conducts.Conduct ,function(y){
                                                    if (x.Group === y.Group) {
                                                        flag = y;
                                                        angular.forEach(y.Item,function(z){
                                                            angular.forEach(x.Item,function(a){
                                                                if (z.Title === a.Title)
                                                                    z.FinalGrade = a.Grade;
                                                            });
                                                        });
                                                    }
                                                });

                                                if (!flag) {
                                                    var temp = {Group:x.Group,Item:[]};

                                                    angular.forEach(x.Item, function(z){
                                                        temp.Item.push({Title:z.Title,FinalGrade:z.Grade});
                                                    });

                                                    conduct.ShowConduct.Conducts.Conduct.push(temp);
                                                }
                                            });
                                        });
                                    }
                                });

                                if ($scope.conductList.length > 0) {
                                    $scope.selectConduct($scope.conductList[0]);
                                }
                            }
                        });
                    }
                }
            });
        };

        $scope.selectConduct = function(item) {
            $scope.currentConduct = item;

            angular.forEach($scope.conductList, function(item) {
                item.selected = false;
            });
            item.selected = true;
        };

        $scope.getExam = function() {
            delete $scope.exam;

            $scope.custom_connection.send({
                service: "_.GetExamScore",
                body: {
                    StudentID: $scope.currentStudent.StudentID
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {
                        //console.log(response);
                        $scope.$apply(function() {
                            if (response !== null && response !== '' && response.ExamScore !== null && response.ExamScore !== '') {
                                $scope.exam = [].concat(response.ExamScore);

                                angular.forEach($scope.exam,function(item){
                                    if (item.Exam !== null && item.Exam !== '') {
                                        item.Exam = [].concat(item.Exam);
                                    }
                                });

                                if ($scope.exam.length > 0) {
                                    $scope.selectExam($scope.exam[0]);
                                }
                            }
                        });
                    }
                }
            });
        };

        $scope.selectExam = function(item) {
            $scope.currentExam = item;

            angular.forEach($scope.exam, function(item) {
                item.selected = false;
            });
            item.selected = true;
        };

        $scope.getAD = function() {
            $scope.custom_connection.send({
                service: "_.GetAttendanceDiscipline",
                body: {
                    StudentID: $scope.currentStudent.StudentID
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {
                        //console.log(response);
                        $scope.$apply(function() {
                            if (response !== null && response !== '' && response.InitialSummaryList !== null && response.InitialSummaryList !== '') {
                                $scope.AD = [].concat(response.InitialSummaryList);
                            }

                            if (response !== null && response !== '' && response.Attendance !== null && response.Attendance !== '') {
                                $scope.attendance = [].concat(response.Attendance);

                                if ($scope.attendance.length > 0) {
                                    $scope.selectAD($scope.attendance[0]);
                                }
                            }

                            if (response !== null && response !== '' && response.Discipline !== null && response.Discipline !== '') {
                                $scope.discipline = [].concat(response.Discipline);
                            }
                        });
                    }
                }
            });
        };

        $scope.selectAD = function(item) {
            $scope.currentAD = item;

            angular.forEach($scope.attendance, function(item) {
                item.selected = false;
            });
            item.selected = true;
        };

        $scope.getInterviewRecord = function() {
            $scope.counsel_connection.send({
                service: "_.GetInterviewRecord",
                body: {
                    StudentID: $scope.currentStudent.StudentID
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {

                        $scope.IR = [];
                        if(response.InterviewRecord){

                            response.InterviewRecord = [].concat(response.InterviewRecord);

                            angular.forEach(response.InterviewRecord,function(value){

                            if(value.Attendees.item)
                                value.Attendees = [].concat(value.Attendees.item);
                            else
                                value.Attendees = [];

                            value.IsPublic = false || (value.IsPublic === 't');

                            value.formatDate = $scope.GetDate(value.InterviewDate);

                            $scope.IR.push(value);
                            });

                        }
                    }

                    $scope.backupIR = angular.copy($scope.IR);
                    $scope.$apply();

                    //console.log($scope.backupIR);
                }
            });
        };

        $scope.InsertInterviewRecord = function(){

            if(!$scope.newIR)
            {
                return;
            }

            //console.log($filter('date')($scope.newIR.InterviewDate,'yyyy-MM-dd'));

            $scope.newIR.Attendees = '';
            if($scope.newIR.Student)
                $scope.newIR.Attendees += '<item>Student</item>';
            if($scope.newIR.Parents)
                $scope.newIR.Attendees += '<item>Parents</item>';
            if($scope.newIR.HRT)
                $scope.newIR.Attendees += '<item>Homeroom Teacher</item>';
            if($scope.newIR.Other && $scope.newIR.OtherName)
                $scope.newIR.Attendees += '<item>' + $scope.newIR.OtherName + '</item>';

            $scope.counsel_connection.send({
                service: "_.UpdateInterviewRecord",
                body: {
                    StudentID: $scope.currentStudent.StudentID,
                    Attendees: $scope.newIR.Attendees,
                    Content: $scope.newIR.Content || '',
                    InterviewDate: $filter('date')($scope.newIR.formatDate,'yyyy-MM-dd') || '',
                    InterviewTime: $scope.newIR.InterviewTime || '',
                    IsPublic: $scope.newIR.IsPublic || false,
                    Issue: $scope.newIR.Issue || '',
                    Means: $scope.newIR.Means || '',
                    RecordTaken: $scope.newIR.RecordTaken || '',
                    SerialNo: $scope.newIR.SerialNo || '',
                    Venue: $scope.newIR.Venue || ''
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {
                        $scope.getInterviewRecord();
                        //console.log(response);
                        // $scope.$apply(function() {
                        //     if (response !== null && response !== '' && response.InterviewRecord !== null && response.InterviewRecord !== '') {
                        //         $scope.IR = [].concat(response.InterviewRecord);
                        //     }
                        // });
                    }
                }
            });
        };

        $scope.UpdateInterviewRecord = function(){

            if(!$scope.editIR)
            {
                return;
            }
                
            $scope.editIR.Attendees = '';
            if($scope.editIR.Student)
                $scope.editIR.Attendees += '<item>Student</item>';
            if($scope.editIR.Parents)
                $scope.editIR.Attendees += '<item>Parents</item>';
            if($scope.editIR.HRT)
                $scope.editIR.Attendees += '<item>Homeroom Teacher</item>';
            if($scope.editIR.Other && $scope.editIR.OtherName)
                $scope.editIR.Attendees += '<item>' + $scope.editIR.OtherName + '</item>';

            var body = {
                    UID : $scope.editIR.UID,
                    Attendees: $scope.editIR.Attendees,
                    Content: $scope.editIR.Content || '',
                    InterviewDate: $filter('date')($scope.editIR.formatDate, 'yyyy-MM-dd') || '',
                    InterviewTime: $scope.editIR.InterviewTime || '',
                    IsPublic: $scope.editIR.IsPublic || false,
                    Issue: $scope.editIR.Issue || '',
                    Means: $scope.editIR.Means || '',
                    RecordTaken: $scope.editIR.RecordTaken || '',
                    SerialNo: $scope.editIR.SerialNo || '',
                    Venue: $scope.editIR.Venue || ''
            };

            //console.log($scope.editIR);
            //console.log(body);

            $scope.counsel_connection.send({
                service: "_.UpdateInterviewRecord",
                body: body,
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {
                        $scope.getInterviewRecord();
                        //console.log(response);
                        // $scope.$apply(function() {
                        //     if (response !== null && response !== '' && response.InterviewRecord !== null && response.InterviewRecord !== '') {
                        //         $scope.IR = [].concat(response.InterviewRecord);
                        //     }
                        // });
                    }
                }
            });  
        };

        $scope.DeleteInterviewRecord = function(item,index){

            //alert(item.UID + "index:" + index);

            if(confirm("確認刪除該筆紀錄?")){
                    $scope.counsel_connection.send({
                    service: "_.DelInterviewRecord",
                    body: {
                        UID: item.UID
                    },
                    result: function(response, error, http) {
                        if (error !== null) {
                            // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                        } else {
                            //console.log("deleted IR" + item.UID);
                            $scope.IR.splice(index,1);
                        }

                        $scope.$apply();
                    }
                });
            }
            else{
                return;
            }
        };

        $scope.CreateNewIR = function(){
            $scope.newIR = null;
        };

        $scope.SelectIR = function(item){

            $scope.currentIR = item;
            $scope.currentIR.AttendeesStr = '';

            var lastIndex = $scope.currentIR.Attendees.length - 1;

            angular.forEach($scope.currentIR.Attendees,function(value,index){

                $scope.currentIR.AttendeesStr += value;

                if(index !== lastIndex)
                    $scope.currentIR.AttendeesStr += ', ';
            });

            //console.log($scope.currentIR);
            //console.log($scope.currentIR.AttendeesStr);
        };

        $scope.EditIR = function(item){

            $scope.SelectIR(item);
            $scope.editIR = angular.copy($scope.currentIR);

            if($scope.editIR.Attendees.indexOf('Student') !== -1)
                $scope.editIR.Student = true;

            if($scope.editIR.Attendees.indexOf('Parents') !== -1)
                $scope.editIR.Parents = true;

            if($scope.editIR.Attendees.indexOf('Homeroom Teacher') !== -1)
                $scope.editIR.HRT = true;

            var lastIndex = $scope.editIR.Attendees.length - 1;
            if($scope.editIR.Attendees[lastIndex] && $scope.editIR.Attendees[lastIndex] !== 'Student' && $scope.editIR.Attendees[lastIndex] !== 'Parents' && $scope.editIR.Attendees[lastIndex] !== 'Homeroom Teacher')
            {
                $scope.editIR.Other = true;
                $scope.editIR.OtherName = $scope.editIR.Attendees[lastIndex];
            }

            $scope.editIR.formatDate = $scope.GetDate($scope.editIR.InterviewDate);
            
            //console.log($scope.editIR);
        };

        $scope.GetDate = function(date){
             var dateArr = date.split("/");
             return new Date(dateArr[0],dateArr[1] - 1,dateArr[2]);
        };

        $scope.QueryByDate = function(){

            if($scope.startDate && $scope.endDate){

                $scope.IR = [];

                angular.forEach($scope.backupIR,function(value){
                    if(value.formatDate >= $scope.startDate && value.formatDate <= $scope.endDate)
                        $scope.IR.push(value);
                });
            }
            else{
                $scope.IR = angular.copy($scope.backupIR)
            }

        };

        $scope.getClassList();

    }
])
