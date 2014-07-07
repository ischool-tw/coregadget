angular.module('entergrade', [])
.controller('MainCtrl', ['$scope', '$timeout',
    function ($scope, $timeout) {
        var $scope長這個樣子 = {
            config: {
                SchoolYear: "102",
                Semester: "2",
                Config: [
                    {
                        //Conducts: {
                        //    Conduct: [
                        //        {
                        //            Group: "",
                        //            Subject: "物理",
                        //            Item: [
                        //                {
                        //                    Title: "Understands vocabulary"
                        //                }
                        //            ]
                        //        }
                        //    ]
                        //},
                        FinalBegin: "2014-01-01 00:00:00",
                        //FinalBeginC: "2014-01-01 00:00:00",
                        FinalEnd: "2015-01-01 00:00:00",
                        //FinalEndC: "2015-01-01 00:00:00",
                        FinalOpening: "true",
                        //FinalOpeningC: "true",
                        Grade: "2",
                        MiddleBegin: "2013-01-01 00:00:00",
                        //MiddleBeginC: "2014-01-01 00:00:00",
                        MiddleEnd: "2014-01-01 00:00:00",
                        //MiddleEndC: "2015-01-01 00:00:00",
                        MiddleOpening: "false"//,
                        //MiddleOpeningC: "true"
                    }
                ]
            },
            current: {
                SchoolYear: "102",
                Semester: "2",
                SelectMode: "ID",
                SelectSeatNo: "",
                SelectStudentID: "",
                Score: "",
                Course: {
                    CourseID: "4107",
                    CourseName: "101 數學",
                    GradeYear: "1",
                    SubjectChineseName: "數學",
                    SubjectEnglishName: "Math"
                },
                Student: {
                    Final: "",
                    Midterm: "89",
                    SeatNo: "5",
                    StudentChineseName: "凱澤",
                    StudentEnglishName: "Felix Kotlarski",
                    StudentID: "3597",
                    StudentNumber: "238005"
                },
                Exam: {
                    Name: 'Midterm',
                    Opening: true,
                    Begin: "time",
                    End: "time",
                    Message: ""
                }
            },
            courseList: [
                {
                    CourseID: "4107",
                    CourseName: "101 數學",
                    GradeYear: "1",
                    SubjectChineseName: "數學",
                    SubjectEnglishName: "Math"
                }
            ],
            studentList: [
                {
                    Final: "",
                    Midterm: "89",
                    SeatNo: "5",
                    StudentChineseName: "凱澤",
                    StudentEnglishName: "Felix Kotlarski",
                    StudentID: "3597",
                    StudentNumber: "238005"
                }
            ],
            examList: [
                {
                    Name: 'Midterm',
                    Period: "1",
                    Opening: true,
                    Begin: "time",
                    End: "time",
                    Message: ""
                },
                {
                    Name: 'Final',
                    Period: "2",
                    Opening: true,
                    Begin: "time",
                    End: "time",
                    Message: ""
                }
            ]
        };

        $scope.connection = gadget.getContract("ibsh.exam.teacher");

        $scope.init = function () {
            $scope.current = {
                SchoolYear: "",
                Semester: "",
                SelectMode: "ID",
                SelectSeatNo: "",
                SelectStudentID: "",
                Score: ""
            };
            var respConfig = null;
            var respCourse = null;
            $scope.connection.send({
                service: "_.GetConfig",
                body: '',
                result: function (response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetConfig', error);
                    } else {
                        // console.log(response);
                        if (response !== null) {
                            response.Config = [].concat(response.Config);
                            respConfig = response;
                        }
                        next();
                    }
                }
            });
            $scope.connection.send({
                service: "_.GetClassCourseList",
                body: {
                    OnlyCourse: true
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {
                        // console.log(response);
                        if (response !== null && response.Result && response.Result.Course) {
                            respCourse = [].concat(response.Result.Course);
                        }
                        next();
                    }
                }
            });
            function next() {
                if (respConfig && respCourse) {
                    $scope.$apply(function () {
                        $scope.config = respConfig;
                        $scope.courseList = respCourse;
                    });
                    if ($scope.courseList.length) {
                        $scope.selectCourse($scope.courseList[0]);
                    }
                }
            }
        }

        $scope.selectCourse = function (course) {
            delete $scope.studentList;
            delete $scope.current.Student;
            delete $scope.examList;
            if ($scope.current.Course)
                delete $scope.current.Course.selected;
            course.selected = true;
            $scope.current.Course = course;

            var _Grade = 1 * course.GradeYear;

            for (idx in $scope.config.Config) {
                var item = $scope.config.Config[idx];
                if (_Grade <= (1 * item.Grade)) {
                    $scope.current.SchoolYear = $scope.config.SchoolYear;
                    $scope.current.Semester = $scope.config.Semester;
                    $scope.examList = [
                        {
                            Name: 'Midterm',
                            Period: "1",
                            Opening: (item.MiddleOpening == "true"),
                            Begin: item.MiddleBegin,
                            End: item.MiddleEnd,
                            Message: ""
                        },
                        {
                            Name: 'Final',
                            Period: "2",
                            Opening: (item.FinalOpening == "true"),
                            Begin: item.FinalBegin,
                            End: item.FinalEnd,
                            Message: ""
                        }
                    ]
                    break;
                }
            }
            $scope.connection.send({
                service: "_.GetExamScore",
                body: {
                    CourseID: $scope.current.Course.CourseID
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {
                        // console.log(response);
                        $scope.$apply(function () {
                            if (response !== null && response.Course && response.Course.Student) {
                                $scope.studentList = [].concat(response.Course.Student);
                                angular.forEach($scope.studentList, function (item, index) {
                                    item.index = index;
                                    item.Final = item.FinalGrade;
                                    item.Midterm = item.MidtermGrade;
                                    delete item.FinalGrade;
                                    delete item.MidtermGrade;
                                });
                                if ($scope.courseList.length) {
                                    $scope.selectStudent($scope.studentList[0], item.FinalOpening == 'true' ? $scope.examList[1] : $scope.examList[0]);
                                }
                            }
                        });
                    }
                }
            });
        }

        $scope.selectStudent = function (student, exam) {
            student.selected = true;
            if ($scope.current.Student && $scope.current.Student.selected)
                delete $scope.current.Student.selected;

            $scope.current.Exam = exam;
            $scope.current.Student = student;

            $scope.current.SelectStudentID = student.StudentID;
            $scope.current.SelectSeatNo = student.SeatNo;
            $scope.current.Score = student[exam.Name];
            $timeout(function () {
                $('#grade-textbox:visible').focus().select();
            }, 1);
        }

        $scope.changeSelectMode = function (mode) {
            $scope.current.SelectMode = mode;
            $timeout(function () {
                $('#seatno-textbox:visible,#id-textbox:visible').select().focus();
            }, 1);
        }

        $scope.selectStudentID = function (event) { //輸入座號跳到該座號
            if (event.keyCode !== 13) return; // 13是enter按鈕的代碼，return是跳出

            var currentIndex = $scope.current.Student ? $scope.current.Student.index : 0;

            var nextStudent = null;
            var nextStudent2 = null;
            angular.forEach($scope.studentList, function (item, index) {
                if (item.StudentID == $scope.current.SelectStudentID) {
                    if (index > currentIndex) {
                        if (nextStudent2 == null)
                            nextStudent2 = item;
                    }
                    else {
                        if (nextStudent == null)
                            nextStudent = item;
                    }
                }
            });
            if (nextStudent2 || nextStudent)
                $scope.selectStudent(nextStudent2 || nextStudent, $scope.current.Exam);
        }

        $scope.selectStudentNo = function (event) { //輸入座號跳到該座號
            if (event.keyCode !== 13) return; // 13是enter按鈕的代碼，return是跳出

            var currentIndex = $scope.current.Student ? $scope.current.Student.index : 0;

            var nextStudent = null;
            var nextStudent2 = null;
            angular.forEach($scope.studentList, function (item, index) {
                if (item.SeatNo == $scope.current.SelectSeatNo) {
                    if (index > currentIndex) {
                        if (nextStudent2 == null)
                            nextStudent2 = item;
                    }
                    else {
                        if (nextStudent == null)
                            nextStudent = item;
                    }
                }
            });
            if (nextStudent2 || nextStudent)
                $scope.selectStudent(nextStudent2 || nextStudent, $scope.current.Exam);
        }


        $scope.enterGrade = function (event) {
            if (event.keyCode !== 13) return;
            var flag = false;

            var temp = Math.ceil($scope.current.Score);

            if (temp >= 0 && temp <= 100)
                flag = true;

            if (flag)
                $scope.saveGrade();
        }

        $scope.saveGrade = function () {
            $scope.connection.send({
                service: "_.UpdateExamScore",
                body: {
                    CourseID: $scope.current.Course.CourseID,
                    Period: $scope.current.Exam.Period,
                    StudentID: $scope.current.Student.StudentID,
                    Score: $scope.current.Score
                },
                autoRetry: true,
                result: function (response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {
                        $scope.$apply(function () {
                            $scope.current.Student[$scope.current.Exam.Name] = $scope.current.Score;
                        });
                    }
                    var nextStudent =
                        $scope.studentList.length > ($scope.current.Student.index + 1) ?
                        $scope.studentList[$scope.current.Student.index + 1] :
                        $scope.studentList[0];

                    $scope.$apply(function () {
                        $scope.current.SelectStudentID = nextStudent.StudentID;
                        $scope.current.SelectSeatNo = nextStudent.SeatNo;
                    });
                    $timeout(function () {
                        $('#seatno-textbox:visible,#id-textbox:visible').select().focus();
                    }, 1);
                }
            });
        }
        $scope.init();
    }
]).directive('selectOnClick', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                this.select();
            });
        }
    };
});