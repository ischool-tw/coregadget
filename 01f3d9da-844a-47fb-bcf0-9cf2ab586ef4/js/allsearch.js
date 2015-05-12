angular.module('allsearch', [])

.controller('MainCtrl', ['$scope', '$filter',
    function($scope, $filter) {

        $scope.originalScoreMode = false;

        //$scope.gradescore = {name:'cloudwu'};
        //$scope.newIR;

        //console.log($filter('date')('2012/12/21','yyyy-MM-dd'))

        $scope.currentGrade;

        $scope.system_position = gadget.params.system_position || "teacher";

        if ($scope.system_position === "teacher") {
            $scope.teacher_connection = gadget.getContract("ibsh.basic.teacher");
            $scope.custom_connection = gadget.getContract("ibsh.custom");
            $scope.counsel_connection = gadget.getContract("ibsh.careers_counsel.teacher");
        } else {
            $scope.custom_connection = gadget.getContract("ibsh.custom");
        }

        $scope.activeStudent = function() {
            if ($scope.system_position === "teacher" || $scope.system_position === "counsel_teacher")
                return 'tab-pane active';
            else
                return 'tab-pane';
        };

        $scope.activeAttend = function() {
            if ($scope.system_position !== "teacher" && $scope.system_position !== "counsel_teacher")
                return 'tab-pane active';
            else
                return 'tab-pane';
        };

        $scope.GetMyChildren = function() {
            $scope.custom_connection.send({
                service: "_.GetMyChildren",
                body: '',
                result: function(response, error, http) {
                    if (error !== null) {
                        //alert("查詢過程發生錯誤");
                    } else {

                        $scope.studentList = [];
                        if (response && response.Student) {
                            response.Student = [].concat(response.Student)
                            angular.forEach(response.Student, function(value) {
                                if (value.StudentStatus === '1' || value.StudentStatus === '2')
                                    $scope.studentList.push(value);
                            });
                        }

                        //$scope.studentList = [].concat(response.Student);

                        if ($scope.studentList.length > 0)
                            $scope.selectStudent($scope.studentList[0]);
                        else
                            alert("Can not find any child data");

                        //console.log($scope.studentList);
                    }
                }
            })
        };

        $scope.getClassList = function() {
            $scope.teacher_connection.send({
                service: "_.GetClassList",
                body: '',
                result: function(response, error, http) {
                    if (error !== null) {
                        alert("An error occurred while trying to send the request, please make sure this is a teacher's account");
                    } else {
                        //console.log(response);
                        $scope.$apply(function() {
                            if (response !== null && response !== '') {

                                $scope.TeacherID = response.TeacherID;

                                $scope.IsHomeroom = response.IsHomeroom === 'true' ? true : false;
                                $scope.IsCareersCounselor = response.IsCareersCounselor === 'true' ? true : false;

                                if (!$scope.IsHomeroom && !$scope.IsCareersCounselor)
                                    alert("This gadget is for homeroom teacher and counselor, your account is not allowed to get student info.");

                                $scope.classlist = [].concat(response.Class);
                                $scope.classlist.sort($scope.classSort);

                                if ($scope.classlist.length > 0)
                                    $scope.selectClass($scope.classlist[0]);
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
                        //alert("查詢過程發生錯誤");
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
            $scope.DataReset();

            $scope.currentStudent = item;

            angular.forEach($scope.studentList, function(item) {
                item.selected = false;
            });
            item.selected = true;

            $scope.getConduct();
            $scope.getExam();
            $scope.getInterviewRecord();
            $scope.getAD();

            if ($scope.defaultGrade)
                $scope.GetGradeScore($scope.defaultGrade)
        };

        $scope.getConduct = function() {

            $scope.custom_connection.send({
                service: "_.GetConduct",
                body: $scope.GetBody(),
                result: function(response, error, http) {
                    if (error !== null) {
                        //alert("查詢過程發生錯誤");
                    } else {
                        //console.log(response);
                        $scope.$apply(function() {
                            //console.log(response);
                            $scope.conductList = [];
                            if (response !== null && response !== '' && response.ConductScore !== null && response.ConductScore !== '') {
                                $scope.conductList = [].concat(response.ConductScore);

                                angular.forEach($scope.conductList, function(item) {
                                    if (item.Conduct !== null && item.Conduct !== '') {
                                        item.Conduct = [].concat(item.Conduct);

                                        angular.forEach(item.Conduct, function(conduct) {
                                            if (conduct.MidtermConduct !== undefined && conduct.MidtermConduct !== null && conduct.MidtermConduct !== '' &&
                                                conduct.MidtermConduct.Conducts !== null && conduct.MidtermConduct.Conducts !== '' &&
                                                conduct.MidtermConduct.Conducts.Conduct !== null && conduct.MidtermConduct.Conducts.Conduct !== '') {
                                                conduct.MidtermConduct.Conducts.Conduct = [].concat(conduct.MidtermConduct.Conducts.Conduct);

                                                angular.forEach(conduct.MidtermConduct.Conducts.Conduct, function(x) {
                                                    if (x.Item !== null && x.Item !== '')
                                                        x.Item = [].concat(x.Item);
                                                });
                                            } else {
                                                conduct.MidtermConduct = {
                                                    Conducts: {
                                                        Conduct: []
                                                    }
                                                };
                                            }

                                            if (conduct.FinalConduct !== undefined && conduct.FinalConduct !== null && conduct.FinalConduct !== '' &&
                                                conduct.FinalConduct.Conducts !== null && conduct.FinalConduct.Conducts !== '' &&
                                                conduct.FinalConduct.Conducts.Conduct !== null && conduct.FinalConduct.Conducts.Conduct !== '') {
                                                conduct.FinalConduct.Conducts.Conduct = [].concat(conduct.FinalConduct.Conducts.Conduct);

                                                angular.forEach(conduct.FinalConduct.Conducts.Conduct, function(x) {
                                                    if (x.Item !== null && x.Item !== '')
                                                        x.Item = [].concat(x.Item);
                                                });
                                            } else {
                                                conduct.FinalConduct = {
                                                    Conducts: {
                                                        Conduct: []
                                                    }
                                                };
                                            }

                                            conduct.ShowConduct = {
                                                Conducts: {
                                                    Conduct: []
                                                }
                                            };

                                            angular.forEach(conduct.MidtermConduct.Conducts.Conduct, function(x) {
                                                var flag = false;

                                                angular.forEach(conduct.ShowConduct.Conducts.Conduct, function(y) {
                                                    if (x.Group === y.Group)
                                                        flag = true;
                                                });

                                                if (!flag) {
                                                    var temp = {
                                                        Group: x.Group,
                                                        Item: []
                                                    };

                                                    angular.forEach(x.Item, function(z) {
                                                        temp.Item.push({
                                                            Title: z.Title,
                                                            MidtermGrade: z.Grade
                                                        });
                                                    });

                                                    conduct.ShowConduct.Conducts.Conduct.push(temp);
                                                }
                                            });

                                            angular.forEach(conduct.FinalConduct.Conducts.Conduct, function(x) {
                                                var flag = null;

                                                angular.forEach(conduct.ShowConduct.Conducts.Conduct, function(y) {
                                                    if (x.Group === y.Group) {
                                                        flag = y;
                                                        angular.forEach(y.Item, function(z) {
                                                            angular.forEach(x.Item, function(a) {
                                                                if (z.Title === a.Title)
                                                                    z.FinalGrade = a.Grade;
                                                            });
                                                        });
                                                    }
                                                });

                                                if (!flag) {
                                                    var temp = {
                                                        Group: x.Group,
                                                        Item: []
                                                    };

                                                    angular.forEach(x.Item, function(z) {
                                                        temp.Item.push({
                                                            Title: z.Title,
                                                            FinalGrade: z.Grade
                                                        });
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
                body: $scope.GetBody(),
                result: function(response, error, http) {
                    if (error !== null) {
                        //alert("查詢過程發生錯誤");
                    } else {
                        //console.log(response);
                        $scope.$apply(function() {
                            if (response !== null && response !== '' && response.ExamScore !== null && response.ExamScore !== '') {
                                $scope.exam = [].concat(response.ExamScore);

                                angular.forEach($scope.exam, function(item) {
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

        //取得假別及節次
        $scope.GetADConfig = function() {
            $scope.custom_connection.send({
                service: "_.GetConfigAttendanceDiscipline",
                body: '',
                result: function(response, error, http) {
                    if (error !== null) {
                        //alert("查詢過程發生錯誤");
                    } else {

                        $scope.AbsenceList = [].concat(response.AbsenceList);
                        $scope.PeriodList = [].concat(response.PeriodList);
                        $scope.PeriodToIndex = {};

                        angular.forEach($scope.PeriodList, function(value, key) {
                            $scope.PeriodToIndex[value.Name] = key;
                        });

                        //console.log($scope.PeriodToIndex);

                        $scope.$apply();
                    }
                }
            });
        };

        $scope.getAD = function() {
            $scope.custom_connection.send({
                service: "_.GetAttendanceDiscipline",
                body: $scope.GetBody(),
                result: function(response, error, http) {
                    if (error !== null) {
                        //alert("查詢過程發生錯誤");
                    } else {

                        var tmp_sysm = [];
                        $scope.AD = [];
                        $scope.attendance = [];
                        $scope.discipline = [];

                        //concat
                        if (response && response.InitialSummaryList)
                            $scope.AD = [].concat(response.InitialSummaryList);

                        if (response && response.Attendance) {
                            $scope.attendance = [].concat(response.Attendance);

                            // if($scope.attendance.length > 0)
                            //     $scope.selectAD($scope.attendance[0]);
                        }

                        if (response && response.Discipline)
                            $scope.discipline = [].concat(response.Discipline);

                        //非明細缺曠
                        angular.forEach($scope.AD, function(value) {
                            //學年度學期聯集
                            var sysm = {};
                            sysm.SchoolYear = value.SchoolYear;
                            sysm.Semester = value.Semester;
                            tmp_sysm.push(sysm);
                        });

                        //明細缺曠
                        angular.forEach($scope.attendance, function(value) {
                            //學年度學期聯集
                            var sysm = {};
                            sysm.SchoolYear = value.SchoolYear;
                            sysm.Semester = value.Semester;
                            tmp_sysm.push(sysm);
                        });

                        //獎懲
                        angular.forEach($scope.discipline, function(value) {
                            //學年度學期聯集
                            var sysm = {};
                            sysm.SchoolYear = value.SchoolYear;
                            sysm.Semester = value.Semester;
                            tmp_sysm.push(sysm);
                        });

                        //排序學年度學期
                        tmp_sysm.sort($scope.mySort);
                        //合併相同學年度學期
                        var tmp_keys = {};
                        angular.forEach(tmp_sysm, function(value) {
                            var key = value.SchoolYear + " " + (value.Semester === '1' ? '1st' : '2nd') + " Semester";
                            tmp_keys[key] = {};
                            tmp_keys[key].Name = key;
                            tmp_keys[key].SchoolYear = value.SchoolYear;
                            tmp_keys[key].Semester = value.Semester;
                        });

                        //將整理好的學年度學期push到$scope.SYSM
                        $scope.SYSM = [];
                        angular.forEach(tmp_keys, function(value) {
                            $scope.SYSM.push(value);
                        });

                        //選取第一筆學年度學期
                        if ($scope.SYSM.length > 0)
                            $scope.selectSYSM($scope.SYSM[0]);

                        // console.log($scope.AD);
                        // console.log($scope.attendance);
                        // console.log($scope.discipline);
                        // console.log("SchoolYearAndSemester");
                        // console.log($scope.SYSM);

                        $scope.$apply();
                    }
                }
            });
        };

        $scope.getInterviewRecord = function() {

            if (!$scope.IsCareersCounselor)
                return;

            $scope.counsel_connection.send({
                service: "_.GetInterviewRecord",
                body: {
                    StudentID: $scope.currentStudent.StudentID
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        //alert("查詢過程發生錯誤");
                    } else {

                        $scope.IR = [];
                        if (response.InterviewRecord) {

                            response.InterviewRecord = [].concat(response.InterviewRecord);

                            angular.forEach(response.InterviewRecord, function(value) {

                                if (value.Attendees.item)
                                    value.Attendees = [].concat(value.Attendees.item);
                                else
                                    value.Attendees = [];

                                value.IsPublic = false || (value.IsPublic === 't');

                                value.formatDate = $scope.GetDate(value.InterviewDate);

                                if (value.IsPublic || value.AuthorID === $scope.TeacherID)
                                    $scope.IR.push(value);
                            });

                        }
                    }

                    $scope.backupIR = angular.copy($scope.IR);
                    if (response)
                        $scope.$apply();

                    //console.log($scope.backupIR);
                }
            });
        };

        $scope.InsertInterviewRecord = function() {

            if (!$scope.IsCareersCounselor || !$scope.newIR)
                return;

            //console.log($filter('date')($scope.newIR.InterviewDate,'yyyy-MM-dd'));

            $scope.newIR.Attendees = '';
            if ($scope.newIR.Student)
                $scope.newIR.Attendees += '<item>Student</item>';
            if ($scope.newIR.Parents)
                $scope.newIR.Attendees += '<item>Parents</item>';
            if ($scope.newIR.HRT)
                $scope.newIR.Attendees += '<item>Homeroom Teacher</item>';
            if ($scope.newIR.Other && $scope.newIR.OtherName)
                $scope.newIR.Attendees += '<item>' + $scope.newIR.OtherName + '</item>';

            if ($scope.newIR.formatDate)
                $scope.newIR.InterviewDate = $filter('date')($scope.newIR.formatDate, 'yyyy-MM-dd');
            else
                $scope.newIR.InterviewDate = $filter('date')(new Date(), 'yyyy-MM-dd');

            var body = {
                StudentID: $scope.currentStudent.StudentID,
                Attendees: $scope.newIR.Attendees,
                Content: $scope.newIR.Content || '',
                InterviewDate: $scope.newIR.InterviewDate,
                InterviewTime: $scope.newIR.InterviewTime || '',
                IsPublic: $scope.newIR.IsPublic || false,
                Issue: $scope.newIR.Issue || '',
                Means: $scope.newIR.Means || '',
                RecordTaken: $scope.newIR.RecordTaken || '',
                SerialNo: $scope.newIR.SerialNo || '',
                Venue: $scope.newIR.Venue || ''
            };

            $scope.counsel_connection.send({
                service: "_.UpdateInterviewRecord",
                body: body,
                result: function(response, error, http) {
                    if (error !== null) {
                        //alert("查詢過程發生錯誤");
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

        $scope.UpdateInterviewRecord = function() {

            if (!$scope.IsCareersCounselor || !$scope.editIR)
                return;

            $scope.editIR.Attendees = '';
            if ($scope.editIR.Student)
                $scope.editIR.Attendees += '<item>Student</item>';
            if ($scope.editIR.Parents)
                $scope.editIR.Attendees += '<item>Parents</item>';
            if ($scope.editIR.HRT)
                $scope.editIR.Attendees += '<item>Homeroom Teacher</item>';
            if ($scope.editIR.Other && $scope.editIR.OtherName)
                $scope.editIR.Attendees += '<item>' + $scope.editIR.OtherName + '</item>';

            var body = {
                UID: $scope.editIR.UID,
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
                        //alert("查詢過程發生錯誤");
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

        $scope.DeleteInterviewRecord = function(item, index) {

            if (!$scope.IsCareersCounselor)
                return;

            //alert(item.UID + "index:" + index);

            if (confirm("確認刪除該筆紀錄?")) {
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
                            $scope.IR.splice(index, 1);
                        }

                        $scope.$apply();
                    }
                });
            } else {
                return;
            }
        };

        $scope.CreateNewIR = function() {
            $scope.newIR = null;
        };

        $scope.SelectIR = function(item) {

            $scope.currentIR = item;
            $scope.currentIR.AttendeesStr = '';

            var lastIndex = $scope.currentIR.Attendees.length - 1;

            angular.forEach($scope.currentIR.Attendees, function(value, index) {

                $scope.currentIR.AttendeesStr += value;

                if (index !== lastIndex)
                    $scope.currentIR.AttendeesStr += ', ';
            });

            //console.log($scope.currentIR);
            //console.log($scope.currentIR.AttendeesStr);
        };

        $scope.EditIR = function(item) {

            $scope.SelectIR(item);
            $scope.editIR = angular.copy($scope.currentIR);

            if ($scope.editIR.Attendees.indexOf('Student') !== -1)
                $scope.editIR.Student = true;

            if ($scope.editIR.Attendees.indexOf('Parents') !== -1)
                $scope.editIR.Parents = true;

            if ($scope.editIR.Attendees.indexOf('Homeroom Teacher') !== -1)
                $scope.editIR.HRT = true;

            var lastIndex = $scope.editIR.Attendees.length - 1;
            if ($scope.editIR.Attendees[lastIndex] && $scope.editIR.Attendees[lastIndex] !== 'Student' && $scope.editIR.Attendees[lastIndex] !== 'Parents' && $scope.editIR.Attendees[lastIndex] !== 'Homeroom Teacher') {
                $scope.editIR.Other = true;
                $scope.editIR.OtherName = $scope.editIR.Attendees[lastIndex];
            }

            $scope.editIR.formatDate = $scope.GetDate($scope.editIR.InterviewDate);

            //console.log($scope.editIR);
        };

        $scope.GetDate = function(date) {
            var dateArr = date.split("/");
            return new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);
        };

        $scope.QueryByDate = function() {

            if ($scope.startDate && $scope.endDate) {

                $scope.IR = [];

                angular.forEach($scope.backupIR, function(value) {
                    if (value.formatDate >= $scope.startDate && value.formatDate <= $scope.endDate)
                        $scope.IR.push(value);
                });
            } else {
                $scope.IR = angular.copy($scope.backupIR)
            }

        };

        $scope.mySort = function(x, y) {
            var xx = $scope.padLeft(x.SchoolYear, 3);
            xx += $scope.padLeft(x.Semester, 2);

            var yy = $scope.padLeft(y.SchoolYear, 3);
            yy += $scope.padLeft(y.Semester, 2);

            if (xx == yy)
                return 0;

            if (xx < yy)
                return -1;
            else
                return 1;
        };

        $scope.classSort = function(x, y) {
            var xx = $scope.padLeft(x.GradeYear, 3);
            var yy = $scope.padLeft(y.GradeYear, 3);

            if (xx == yy) {
                var xx = $scope.padLeft(x.ClassName, 10);
                var yy = $scope.padLeft(y.ClassName, 10);

                if (xx == yy)
                    return 0;

                else if (xx < yy)
                    return -1;
                else
                    return 1;

            } else if (xx < yy)
                return 1;
            else
                return -1;
        };

        $scope.padLeft = function(str, length) {
            if (str.length >= length) return str
            else return $scope.padLeft("0" + str, length);
        };

        $scope.selectSYSM = function(sysm) {
            $scope.currentSYSM = sysm;

            var schoolYear = $scope.currentSYSM.SchoolYear;
            var semester = $scope.currentSYSM.Semester;

            $scope.abCount = {};
            $scope.notdetailCount = {};
            $scope.currentAD = [];
            $scope.currentAttendance = [];
            $scope.currentDiscipline = [];
            $scope.Merit = {
                A: 0,
                B: 0,
                C: 0
            };
            $scope.Demerit = {
                A: 0,
                B: 0,
                C: 0
            };
            $scope.notdetailDs = {};

            //非明細
            angular.forEach($scope.AD, function(value) {
                if (value.SchoolYear === schoolYear && value.Semester === semester) {
                    $scope.currentAD.push(value);

                    //缺曠
                    var abArr;
                    if (value.InitialSummary.InitialSummary.AttendanceStatistics)
                        abArr = [].concat(value.InitialSummary.InitialSummary.AttendanceStatistics.Absence);

                    if (abArr) {
                        angular.forEach(abArr, function(obj) {

                            if (!$scope.abCount[obj.Name])
                                $scope.abCount[obj.Name] = 0;

                            $scope.abCount[obj.Name] += parseInt(obj.Count, 10);
                        });
                    }

                    //獎懲
                    var dsObj = value.InitialSummary.InitialSummary.DisciplineStatistics;

                    if (dsObj) {
                        if (dsObj.Merit) {
                            $scope.Merit.A += parseInt(dsObj.Merit.A, 10);
                            $scope.Merit.B += parseInt(dsObj.Merit.B, 10);
                            $scope.Merit.C += parseInt(dsObj.Merit.C, 10);
                        }
                        if (dsObj.Demerit) {
                            $scope.Demerit.A += parseInt(dsObj.Demerit.A, 10);
                            $scope.Demerit.B += parseInt(dsObj.Demerit.B, 10);
                            $scope.Demerit.C += parseInt(dsObj.Demerit.C, 10);
                        }
                    }
                }
            });

            //非明細獨自加總
            $scope.notdetailCount = angular.copy($scope.abCount);
            $scope.notdetailDs = {
                Merit: angular.copy($scope.Merit),
                Demerit: angular.copy($scope.Demerit)
            };
            //console.log($scope.notdetailDs);

            //明細缺曠
            angular.forEach($scope.attendance, function(value) {
                if (value.SchoolYear === schoolYear && value.Semester === semester) {
                    $scope.currentAttendance.push(value);

                    var arr = [].concat(value.Detail.Attendance.Period);
                    angular.forEach(arr, function(obj) {

                        if (!$scope.abCount[obj.AbsenceType])
                            $scope.abCount[obj.AbsenceType] = 0;

                        $scope.abCount[obj.AbsenceType] ++;
                    });
                }
            });

            //獎懲
            //console.log($scope.discipline);
            angular.forEach($scope.discipline, function(value) {
                if (value.SchoolYear === schoolYear && value.Semester === semester) {

                    var needPush = false;
                    if (value.Detail.Discipline.Merit) {
                        var dsObj = value.Detail.Discipline.Merit;
                        $scope.Merit.A += parseInt(dsObj.A, 10);
                        $scope.Merit.B += parseInt(dsObj.B, 10);
                        $scope.Merit.C += parseInt(dsObj.C, 10);
                        needPush = true;
                    }

                    if (value.Detail.Discipline.Demerit && !value.Detail.Discipline.Demerit.Cleared) {
                        var dsObj = value.Detail.Discipline.Demerit;
                        $scope.Demerit.A += parseInt(dsObj.A, 10);
                        $scope.Demerit.B += parseInt(dsObj.B, 10);
                        $scope.Demerit.C += parseInt(dsObj.C, 10);
                        needPush = true;
                    }

                    if (needPush)
                        $scope.currentDiscipline.push(value);
                }
            });

            $scope.ADTotal = 0;
            angular.forEach($scope.abCount, function(value) {
                $scope.ADTotal += value;
            });

            // console.clear();
            // console.log($scope.Merit);
            // console.log($scope.Demerit);
            // console.log($scope.currentAttendance);
            // console.log($scope.currentDiscipline);
        };

        $scope.viewAttendance = function(name) {

            $scope.viewAttendanceName = name;
            $scope.detailAD = [];

            //console.log($scope.currentAttendance);

            // for (var prop in ) {
            //     if($scope.currentAttendance.hasOwnProperty(prop)){
            //     }
            // };

            angular.forEach($scope.currentAttendance, function(value) {

                var arr = [].concat(value.Detail.Attendance.Period);
                var date = value.OccurDate;

                var detail = {};
                detail.date = date;
                detail.period = [];

                //各節次先建立空白
                angular.forEach($scope.PeriodList, function(period) {
                    detail.period.push('');
                });

                var needAppend = false;
                angular.forEach(arr, function(value) {
                    var index = $scope.PeriodToIndex[value['@text']];
                    if (value.AbsenceType === name && index !== undefined) {
                        needAppend = true;
                        detail.period[index] = "V"
                    }
                });

                if (needAppend)
                    $scope.detailAD.push(detail);
            });

            //console.log($scope.detailAD);
        };

        $scope.viewManagement = function(name, type1, type2) {

            $scope.viewManagementName = name;
            $scope.currentDsType1 = type1;
            $scope.currentDsType2 = type2;
            $scope.Ds = [];

            //console.log($scope.currentDiscipline);

            angular.forEach($scope.currentDiscipline, function(value) {
                if (value.Detail.Discipline[type1]) {
                    var count = parseInt(value.Detail.Discipline[type1][type2], 10) || 0;
                    if (count > 0) {
                        var obj = {};
                        obj.date = value.OccurDate;
                        obj.count = count;
                        obj.reason = value.Reason;
                        $scope.Ds.push(obj);
                    }
                }
            });

            //console.log($scope.Ds);
        };

        $scope.DataReset = function() {
            $scope.AD = null;
            $scope.attendance = null;
            $scope.discipline = null;
            $scope.SYSM = null;
            $scope.currentSYSM = null;
            $scope.abCount = null;
            $scope.notdetailCount = null;
            $scope.currentAD = null;
            $scope.currentAttendance = null;
            $scope.currentDiscipline = null;
            $scope.ADTotal = 0;
            $scope.Merit = {
                A: 0,
                B: 0,
                C: 0
            };
            $scope.Demerit = {
                A: 0,
                B: 0,
                C: 0
            };
            $scope.notdetailDs = {};
            $scope.currentGrade = null;
            $scope.GS = null;
        };

        $scope.GetBody = function() {

            var body = {};
            if ($scope.currentStudent && $scope.currentStudent.StudentID)
                body.StudentID = $scope.currentStudent.StudentID;
            else
                body = '';

            return body;
        };

        $scope.GetGradeScore = function(grade) {

            $scope.defaultGrade = grade;
            $scope.currentGrade = 'Gr.' + grade;

            var body = $scope.GetBody();

            if (body)
                body.Grade = grade;
            else
                body = {
                    Grade: grade
                };

            $scope.custom_connection.send({
                service: "_.GetGradeScore",
                body: body,
                result: function(response, error, http) {
                    $scope.GS = null;
                    if (error !== null) {
                        //alert("查詢過程發生錯誤");
                    } else {

                        if (response.data) {

                            $scope.GS = response.data;
                            $scope.GS.domains = [].concat($scope.GS.domains);

                            angular.forEach($scope.GS.domains, function(value) {
                                if (value.domain === 'Chinese')
                                    value.subject = 'Level ' + value.level;
                            });

                            //四捨五入
                            //$scope.GS.avggpa = Math.round($scope.GS.avggpa * 100) / 100;

                            var sy = parseInt($scope.GS.schoolYear, 10) + 1911;

                            $scope.GS.rang = sy + '~' + (sy + 1);

                            //console.log($scope.GS);


                        }
                    }
                    $scope.$apply();
                }
            });
        };

        $scope.TransferScore = function(score) {

            if ($scope.originalScoreMode || score === "未開放")
                return score;

            score = parseFloat(score, 10);

            if (isNaN(score))
                return "";

            //四捨五入
            score = Math.round(score);

            if (score >= 97)
                return "A+";
            else if (score >= 93)
                return "A";
            else if (score >= 90)
                return "A-";
            else if (score >= 87)
                return "B+";
            else if (score >= 83)
                return "B";
            else if (score >= 80)
                return "B-";
            else if (score >= 77)
                return "C+";
            else if (score >= 73)
                return "C";
            else if (score >= 70)
                return "C-";
            else if (score >= 67)
                return "D+";
            else if (score >= 63)
                return "D";
            else if (score >= 60)
                return "D-";
            else
                return "F";
        }

        $scope.GetADConfig();

        if ($scope.system_position === 'student') {
            $scope.getConduct();
            $scope.getExam();
            $scope.getAD();
        }

        if ($scope.system_position === 'parent')
            $scope.GetMyChildren();

        if ($scope.system_position === 'teacher')
            $scope.getClassList();
    }
])
