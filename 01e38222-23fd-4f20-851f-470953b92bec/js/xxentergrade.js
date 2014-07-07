angular.module('entergrade', [])

.controller('MainCtrl', ['$scope',
    function($scope) {

        $scope.connection = gadget.getContract("ibsh.exam.teacher");

        $scope.getNow = function() {
            $scope.connection.send({
                service: "_.GetConfig",
                body: '',
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetConfig', error);
                    } else {
                        console.log(response);
                        $scope.$apply(function() {
                            if (response !== null) {
                            	$scope.config = response;
                                $scope.current = {
                                    SchoolYear: response.SchoolYear,
                                    Semester: response.Semester,
                                    Period: '',
                                    StartDate: '',
                                    EndDate: '',
                                    Message: '',
                                    Code: []
                                }
                            }
                            $scope.getCourseList();
                        });
                    }
                }
            });
        }

        $scope.getStudentList = function() {
            delete $scope.studentList;
            delete $scope.currentStudent;

            $scope.connection.send({
                service: "_.GetExamScore",
                body: {
                    CourseID:$scope.currentCourse.CourseID
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {
                        console.log(response);
                        $scope.$apply(function() {
                            if (response !== null && response.Course && response.Course.Student) {
                                $scope.studentList = [].concat(response.Course.Student);
                                angular.forEach($scope.studentList,function(item,index){
                                    item.order = index;
                                });
                                if ($scope.courseList.length) { 
                                    $scope.selectStudent($scope.studentList[0],'1');
                                }
                            }
                        });
                    }
                }
            });
        }

        $scope.getCourseList = function() {
            $scope.connection.send({
                service: "_.GetClassCourseList",
                body: {
                    OnlyCourse: true
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {
                        console.log(response);
                        $scope.$apply(function() {
                            if (response !== null && response.Result && response.Result.Course) {
                                $scope.courseList = [].concat(response.Result.Course);
                                if ($scope.courseList.length) { 
                                    $scope.selectCourse($scope.courseList[0]);
                                }
                            }
                        });
                    }
                }
            });
        }

        $scope.selectCourse = function(item) {
            $scope.currentCourse = item;

            angular.forEach($scope.courseList, function(item) {
                item.selected = false;
            });
            item.selected = true;

            var _Grade = 1 * item.GradeYear;

            $scope.config.Config = [].concat($scope.config.Config);
            for (idx in $scope.config.Config) {
                var item = $scope.config.Config[idx];
                if (_Grade <= (1 * item.Grade)) {
                    $scope.current.MiddleOpening = item.MiddleOpening;
                    $scope.current.MiddleBegin = item.MiddleBegin;
                    $scope.current.MiddleEnd = item.MiddleEnd;
                    $scope.current.FinalOpening = item.FinalOpening;
           			$scope.current.FinalBegin = item.FinalBegin;
           			$scope.current.FinalEnd = item.FinalEnd;
                    break;
                }
            }

            $scope.current.Period = item.GradeYear;

            $scope.getStudentList();
        }

        $scope.selectStudent = function(item, Period) {
            if (!item) {
                $('#seatno-textbox').focus();

                var tempStudent = null;
                angular.forEach($scope.studentList, function(item, index) {
                    if (item.order === $scope.currentStudent.order) {
                        tempStudent = $scope.studentList[index + 1];
                    }
                });
                if (tempStudent) {
                    $scope.currentStudent = tempStudent;
                    $scope.currentStudent.tempSeatNo = $scope.currentStudent.SeatNo;
                } else {
                    $scope.currentStudent = $scope.studentList[0];
                    $scope.currentStudent.tempSeatNo = $scope.currentStudent.SeatNo;
                }

                return;
            }

            $scope.current.Period = Period;
            $scope.currentStudent = item;
            $scope.currentStudent.tempSeatNo = $scope.currentStudent.SeatNo;

            if ($scope.current.Period === '1')
                $scope.currentStudent.tempGrade = $scope.currentStudent.MidtermGrade;
            else if ($scope.current.Period === '2')
                $scope.currentStudent.tempGrade = $scope.currentStudent.FinalGrade;

            angular.forEach($scope.studentList, function(item) {
                item.selected = false;
            });
            item.selected = true;

            $('#grade-textbox').focus();
        }

        $scope.selectStudentNo = function(event) { //輸入座號跳到該座號
            if (event.keyCode !== 13) return; // 13是enter按鈕的代碼，return是跳出

            if (!$scope.currentStudent) return;

            var nextStudent = null;
            angular.forEach($scope.studentList, function(item) {
                if (item.SeatNo === $scope.currentStudent.tempSeatNo) {
                    nextStudent = item;
                }
            });

            $scope.selectStudent(nextStudent,$scope.current.Period);
        }

        $scope.enterGrade = function(event) {
            if (event.keyCode !== 13) return;

            if (!$scope.currentStudent) return;

            var flag = false;

            var temp = Math.ceil($scope.currentStudent.tempGrade);
            if (temp >= 0 && temp <= 100)
                flag = true;

            if (flag)
                $scope.saveGrade();
        }

        $scope.saveGrade = function() {
            $scope.connection.send({
                service: "_.UpdateExamScore",
                body: {
                    CourseID:$scope.currentCourse.CourseID,
                    Period:$scope.current.Period,
                    StudentID:$scope.currentStudent.StudentID,
                    Score:$scope.currentStudent.tempGrade
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {
                        $scope.$apply(function() {
                            angular.forEach($scope.studentList, function(item, index) {
                                if (item.SeatNo === $scope.currentStudent.SeatNo) {
                                    var stu = $scope.studentList[index];
                                    if ($scope.current.Period === '1') {
                                        stu.MidtermGrade = $scope.currentStudent.tempGrade;
                                    } else {
                                        stu.FinalGrade = $scope.currentStudent.tempGrade;
                                    }
                                }
                            });
                        });
                    }
                    var nextStudent = null;
                    angular.forEach($scope.studentList, function(item, index) {
                        if (item.SeatNo === $scope.currentStudent.SeatNo) {
                            nextStudent = $scope.studentList[index + 1];
                        }
                    });

                    $scope.selectStudent(nextStudent,$scope.current.Period);
                    $('#seatno-textbox').focus();
                }
            });
        }

        $scope.getNow();

    }
]);
