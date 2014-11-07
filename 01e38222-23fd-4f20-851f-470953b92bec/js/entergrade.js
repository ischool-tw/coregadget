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
                SelectStudentNumber: "",
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
                SelectStudentNumber: "",
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
                            
                            var tmp = [].concat(response.Result.Course);
                            respCourse = [];

                            angular.forEach(tmp,function (value,index){
                                var grade = parseInt(value.GradeYear,10)
                                if (grade && grade > 2){
                                    respCourse.push(value);
                                }
                            });
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
                        //console.log(response);
                        $scope.$apply(function () {
                            if (response !== null && response.Course && response.Course.Student) {
                                $scope.studentList = [].concat(response.Course.Student);
                                $scope.studentList.sort($scope.studentSort);
                                angular.forEach($scope.studentList, function (item, index) {
                                    item.index = index;
                                    item.Final = item.FinalGrade;
                                    item.Midterm = item.MidtermGrade;
                                    item.No = index + 1;
                                    delete item.FinalGrade;
                                    delete item.MidtermGrade;
                                });
                                if ($scope.courseList.length) {
                                    $scope.setCurrent($scope.studentList[0], item.FinalOpening == 'true' ? $scope.examList[1] : $scope.examList[0], true, true);
                                }
                            }
                        });
                    }
                }
            });
        }

        $scope.setCurrent = function (student, exam, setCondition, setFocus) {
            if (student)
                student.selected = true;
            if ($scope.current.Student && $scope.current.Student.selected)
                delete $scope.current.Student.selected;

            $scope.current.Exam = exam;
            $scope.current.Student = student;

            $scope.current.Score = (student || {})[exam.Name] || "";
            if (setCondition) {
                $scope.current.SelectStudentNumber = student.StudentNumber;
                $scope.current.SelectSeatNo = student.SeatNo;
            }
            if (setFocus) {
                $timeout(function () {
                    $('#grade-textbox:visible').focus().select();
                }, 1);
            }
        }

        $scope.changeSelectMode = function (mode) {
            $scope.current.SelectMode = mode;
            $timeout(function () {
                $('#seatno-textbox:visible,#id-textbox:visible').select().focus();
            }, 1);
        }
        $scope.submitStudentID = function (event) {
            if (event.keyCode !== 13) return; // 13是enter按鈕的代碼，return是跳出
            if (!$scope.current.Student) return;
            $timeout(function () {
                $('#grade-textbox:visible').focus().select();
            }, 1);
        }
        $scope.typeStudentID = function () {
            var currentIndex = $scope.current.Student ? $scope.current.Student.index : 0;

            var nextStudent = null;
            var nextStudent2 = null;
            angular.forEach($scope.studentList, function (item, index) {
                if (item.StudentNumber == $scope.current.SelectStudentNumber) {
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
            $scope.setCurrent(nextStudent2 || nextStudent, $scope.current.Exam, true, false);
        }

        $scope.submitStudentNo = function (event) {
            if (event.keyCode !== 13) return; // 13是enter按鈕的代碼，return是跳出
            if (!$scope.current.Student) return;
            $timeout(function () {
                $('#grade-textbox:visible').focus().select();
            }, 1);
        }
        $scope.typeStudentNo = function () {
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
            $scope.setCurrent(nextStudent2 || nextStudent, $scope.current.Exam, true, false);
        }

        $scope.goPrev = function () {
            var currentIndex = $scope.current.Student ? $scope.current.Student.index : 0;
            $scope.setCurrent(
                (currentIndex == 0) ?
                    $scope.studentList[$scope.studentList.length -1] :
                    $scope.studentList[currentIndex - 1]
                , $scope.current.Exam
                , true
                , true);
        }
        $scope.goNext = function () {
            var currentIndex = $scope.current.Student ? $scope.current.Student.index : 0;
            $scope.setCurrent(
                (currentIndex == $scope.studentList.length - 1) ?
                    $scope.studentList[0] :
                    $scope.studentList[currentIndex + 1]
                , $scope.current.Exam
                , true
                , true);
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
                        //$scope.current.SelectStudentNumber = nextStudent.StudentNumber;
                        //$scope.current.SelectSeatNo = nextStudent.SeatNo;
                        $scope.setCurrent(nextStudent, $scope.current.Exam, true, false);
                    });
                    $timeout(function () {
                        if ($scope.current.SelectMode != 'Seq.')
                            $('#seatno-textbox:visible,#id-textbox:visible').select().focus();
                        else {
                            $('#grade-textbox:visible').focus().select();
                        }
                    }, 1);
                }
            });
        }

        $scope.padLeft = function(str, length) {
            if (str.length >= length) return str
            else return $scope.padLeft("0" + str, length);
        };

        $scope.studentSort = function(x, y) {
            var xx = $scope.padLeft(x.ClassName, 20);
            xx += $scope.padLeft(x.SeatNo, 3);
            xx += $scope.padLeft(x.StudentNumber,20);

            var yy = $scope.padLeft(y.ClassName, 20);
            yy += $scope.padLeft(y.SeatNo, 3);
            yy += $scope.padLeft(y.StudentNumber,20);

            if (xx == yy)
                return 0;

            if (xx < yy)
                return -1;
            else
                return 1;
        };

        $scope.PrintPage = function(){
            var value = $('#printlist').html();
            var printPage = window.open("", "printPage", "");
            printPage.document.open();
            printPage.document.write("<HTML><head></head><BODY onload='window.print();window.close()'>");
            printPage.document.write("<PRE>");
            printPage.document.write("<a>" + $scope.current.Course.CourseName + "</a>");
            printPage.document.write(value);
            printPage.document.write("</br>");
            printPage.document.write("</br>");
            printPage.document.write("Signature:______________________");
            printPage.document.write("</PRE>");
            printPage.document.close("</BODY></HTML>");
        };

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