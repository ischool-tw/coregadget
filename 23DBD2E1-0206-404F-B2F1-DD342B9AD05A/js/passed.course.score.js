angular.module('PassedCourseScore', ['ui.sortable', 'mgcrea.ngStrap.helpers.dimensions', 'mgcrea.ngStrap.helpers.debounce'])
.controller('MainCtrl', ['$scope', '$timeout',
    function ($scope, $timeout) {
        var $scope長這個樣子 = {
            current: {
                semester: {},
                course: {}
            },
            semesterList: [{
                schoolYear: '',
                semester: '',
                courseList: [{
                    SchoolYear: '',
                    Semester: '',
                    CourseName: '',
                    ExamList: [{
                        ExamID: "3",
                        Name: "第三次段考",
                        SubExamList: []
                    }],
                    StudentList: [{

                    }]
                }]
            }]
        };

        $scope.current = {
            semester: null,
            course: null
        };

        $scope.setCurrentSemester = function (semester) {
            $scope.current.semester = semester;
            $scope.setCurrentCourse(semester.courseList[0]);
        }

        $scope.setCurrentCourse = function (course) {
            $scope.current.course = course;
            course.ExamList = [];
            course.ScoreList = [];
            var gradeItemID = {};

            var targetExam = {
                ExamID: "課程總成績",
                Name: "課程總成績",
                colSpan: 2,
                SubExamList: ["分數評量", "努力程度"]
            };

            course.ScoreList.push({
                Name: "分數評量",
                Key: "Exam" + targetExam.ExamID + "///^///" + "分數評量"
            });
            course.ScoreList.push({
                Name: "努力程度",
                Key: "Exam" + targetExam.ExamID + "///^///" + "努力程度"
            });

            course.ExamList.push(targetExam);


            [].concat(course.Scores.Score || []).forEach(function (examRec, index) {
                course.ExamList.push({
                    ExamID: examRec.ExamID,
                    Name: examRec.Name,
                    colSpan: 2,
                    SubExamList: ["分數評量", "努力程度"]
                });
                course.ScoreList.push({
                    Name: "分數評量",
                    Key: "Exam" + examRec.ExamID + "///^///" + "分數評量"
                });
                course.ScoreList.push({
                    Name: "努力程度",
                    Key: "Exam" + examRec.ExamID + "///^///" + "努力程度"
                });
            });

            $scope.connection.send({
                service: "TeacherAccess.GetCourseExtensions",
                body: {
                    Content: {
                        ExtensionCondition: {
                            '@CourseID': '' + course.CourseID,
                            Name: ['GradeItemExtension', 'GradeItem']
                        }
                    }
                },
                result: function (response, error, http) {
                    if (error) {
                        alert("TeacherAccess.GetCourseExtensions Error");
                    } else {

                        $scope.$apply(function () {
                            var targetExam = {
                                ExamID: "平時評量",
                                Name: "平時評量",
                                colSpan: 2,
                                SubExamList: ["分數評量", "努力程度"]
                            };
                            course.ScoreList.push({
                                Name: "分數評量",
                                Key: "Exam" + targetExam.ExamID + "///^///" + "分數評量"
                            });
                            course.ScoreList.push({
                                Name: "努力程度",
                                Key: "Exam" + targetExam.ExamID + "///^///" + "努力程度"
                            });

                            //var gradeItemID = {};

                            course.ExamList.push(targetExam);
                            if (response.Response && response.Response.CourseExtension)
                            [].concat(response.Response.CourseExtension.Extension || []).forEach(function (extensionRec) {
                                if (extensionRec.GradeItem && extensionRec.GradeItem.Item) {
                                    [].concat(extensionRec.GradeItem.Item || []).forEach(function (item, index) {
                                        targetExam.SubExamList.push(item.Name);
                                        targetExam.colSpan++;
                                        course.ScoreList.push({
                                            Name: item.Name,
                                            Key: "Exam" + targetExam.ExamID + "///^///" + item.Name
                                        });
                                        gradeItemID[item.SubExamID] = "Exam" + targetExam.ExamID + "///^///" + item.Name;
                                    });
                                }
                            });

                            var targetExam = {
                                ExamID: "文字評量",
                                Name: "文字評量",
                                colSpan: 3,
                                SubExamList: ["文字評量"]
                            };

                            course.ExamList.push(targetExam);

                            course.ScoreList.push({
                                Name: "文字評量",
                                Key: "文字評量",
                                colSpan: 3
                            });
                        });

                        $scope.connection.send({
                            service: "TeacherAccess.GetCourseStudents",
                            body: {
                                Content: {
                                    Field: { All: '' },
                                    Condition: { CourseID: course.CourseID },
                                    Order: { SeatNumber: '' }
                                }
                            },
                            result: function (response, error, http) {

                                if (error) {
                                    alert("TeacherAccess.GetCourseStudents Error");
                                } else {
                                    var studentMapping = {};
                                    $scope.$apply(function () {
                                        $scope.current.course.StudentList = [];

                                        [].concat(response.Students.Student || []).forEach(function (studentRec, index) {
                                            studentRec.SeatNo = studentRec.SeatNumber;
                                            studentRec.index = index;
                                            $scope.current.course.ExamList.forEach(function (examRec) {
                                                //studentRec["Exam" + examRec.ExamID] = '';
                                                examRec.SubExamList.forEach(function (subExamRec) {
                                                    studentRec["Exam" + examRec.ExamID + "///^///" + subExamRec] = '';
                                                });
                                            });
                                            $scope.current.course.StudentList.push(studentRec);
                                            studentMapping[studentRec.StudentID] = studentRec;
                                        });
                                    });

                                    //抓定期評量成績
                                    $scope.connection.send({
                                        service: "TeacherAccess.GetCourseExamScore",
                                        body: {
                                            Content: {
                                                Field: { All: '' },
                                                Condition: { CourseID: course.CourseID },
                                                Order: { SeatNumber: '' }
                                            }
                                        },
                                        result: function (response, error, http) {

                                            if (error) {
                                                alert("TeacherAccess.GetCourseExamScore Error");
                                            } else {
                                                $scope.$apply(function () {
                                                    [].concat(response.Scores.Item || []).forEach(function (examScoreRec, index) {
                                                        if (examScoreRec.Extension && examScoreRec.Extension.Extension) {

                                                            //2017/12/15 穎驊因應高雄小組項目 [09-02][02] 課程歷年成績查詢 調整，新增四捨五入至小數第二位邏輯
                                                            studentMapping[examScoreRec.StudentID]["Exam" + examScoreRec.ExamID + "///^///" + "分數評量"] = Math.round(examScoreRec.Extension.Extension.Score * 100) / 100 ;

                                                            studentMapping[examScoreRec.StudentID]["Exam" + examScoreRec.ExamID + "///^///" + "努力程度"] = examScoreRec.Extension.Extension.Effort;

                                                        }
                                                    });
                                                    //$scope.setupCurrent();
                                                });
                                            }
                                        }
                                    });


                                    //抓平時評量成績
                                    $scope.connection.send({
                                        service: "TeacherAccess.GetSCAttendExtensions",
                                        body: {
                                            Content: {

                                                ExtensionCondition: {
                                                    '@CourseID': '' + course.CourseID,
                                                    Name: ['GradeBook']
                                                }
                                            }
                                        },
                                        result: function (response, error, http) {

                                            if (error) {
                                                alert("TeacherAccess.GetSCAttendExtensions Error");
                                            } else {
                                                $scope.$apply(function () {
                                                    [].concat(response.Response.SCAttendExtension || []).forEach(function (Objects, index) {

                                                        if (Objects.Extension && Objects.Extension.Exam) {

                                                            [].concat(Objects.Extension.Exam.Item || []).forEach(function (Item, index) {

                                                                //2017/12/15 穎驊因應高雄小組項目 [09-02][02] 課程歷年成績查詢 調整，新增四捨五入至小數第二位邏輯
                                                                studentMapping[Objects.StudentID][gradeItemID[Item.SubExamID]] = Math.round(Item.Score * 100) / 100 ;

                                                            });

                                                        }
                                                    });
                                                    //$scope.setupCurrent();
                                                });
                                            }
                                        }
                                    });

                                    //return;
                                    //抓課程總成績
                                    $scope.connection.send({
                                        service: "TeacherAccess.GetCourseSemesterScore",
                                        body: {
                                            Content: {
                                                Field: {
                                                    All: ''
                                                },
                                                Condition: {
                                                    CourseID: course.CourseID
                                                },
                                                Order: {
                                                    SeatNumber: ''
                                                }
                                            }
                                        },
                                        result: function (response, error, http) {

                                            if (error) {
                                                alert("TeacherAccess.GetCourseSemesterScore Error");
                                            } else {

                                                $scope.$apply(function () {
                                                    [].concat(response.Scores.Item || []).forEach(function (finalScoreRec, index) {

                                                        //2017/12/15 穎驊因應高雄小組項目 [09-02][02] 課程歷年成績查詢 調整，新增四捨五入至小數第二位邏輯
                                                        studentMapping[finalScoreRec.StudentID]["Exam" + "平時評量" + "///^///" + "分數評量"] = Math.round(finalScoreRec.Extension.Extension.OrdinarilyScore * 100) / 100;

                                                        studentMapping[finalScoreRec.StudentID]["Exam" + "平時評量" + "///^///" + "努力程度"] = finalScoreRec.Extension.Extension.OrdinarilyEffort

                                                        //2017/12/15 穎驊因應高雄小組項目 [09-02][02] 課程歷年成績查詢 調整，新增四捨五入至小數第二位邏輯
                                                        studentMapping[finalScoreRec.StudentID]["Exam" + "課程總成績" + "///^///" + "分數評量"] = Math.round(finalScoreRec.Score * 100) / 100;

                                                        studentMapping[finalScoreRec.StudentID]["Exam" + "課程總成績" + "///^///" + "努力程度"] = finalScoreRec.Extension.Extension.Effort;

                                                        studentMapping[finalScoreRec.StudentID]["文字評量"] = finalScoreRec.Extension.Extension.Text;

                                                    });
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }

        $scope.connection = gadget.getContract("ta");

        $scope.connection.send({
            service: "TeacherAccess.GetCurrentSemester",
            body: '',
            result: function (response, error, http) {
                if (error) {
                    alert("TeacherAccess.GetCurrentSemester Error");
                } else {
                    var schoolYear = response.Current.SchoolYear;
                    var semester = response.Current.Semester;

                    $scope.connection.send({
                        service: "TeacherAccess.GetMyCourses",
                        body: {
                            Content: {
                                Field: { All: '' },
                                Order: { CourseName: '' }
                            }
                        },
                        result: function (response, error, http) {
                            if (error) {
                                alert("TeacherAccess.GetMyCourses Error");
                            } else {
                                $scope.$apply(function () {
                                    var courseList = [];

                                    [].concat(response.Courses.Course || []).forEach(function (courseRec, index) {
                                        //if (courseRec.SchoolYear != schoolYear || courseRec.Semester != semester) {
                                        courseList.push(courseRec);
                                        //}
                                    });
                                    courseList.sort(function (b, a) {
                                        if (a.SchoolYear != b.SchoolYear)
                                            return parseInt(a.SchoolYear) - parseInt(b.SchoolYear);
                                        if (a.Semester != b.Semester)
                                            return parseInt(a.Semester) - parseInt(b.Semester);
                                        if (a.CourseName > b.CourseName)
                                            return -1;
                                        else
                                            return 1;
                                    });

                                    $scope.semesterList = [];
                                    var currsentSems = {};
                                    courseList.forEach(function (course) {
                                        if (course.SchoolYear + "學年度" != currsentSems.schoolYear || course.Semester + "學期" != currsentSems.semester) {
                                            currsentSems = {
                                                schoolYear: course.SchoolYear + "學年度",
                                                semester: course.Semester + "學期",
                                                courseList: []
                                            };
                                            $scope.semesterList.push(currsentSems);
                                        }
                                        currsentSems.courseList.push(course);
                                    });

                                    $scope.setCurrentSemester($scope.semesterList[0]);
                                });
                            }
                        }
                    });
                }
            }
        });
    }
]);