angular.module('gradebook', ['ui.sortable', 'mgcrea.ngStrap.helpers.dimensions', 'mgcrea.ngStrap.helpers.debounce'])

.controller('MainCtrl', ['$scope', '$timeout',
    function ($scope, $timeout) {
        var $scope長這個樣子 = {
            current: {
                SelectMode: "No.",
                SelectSeatNo: "",
                Value: "",
                Student: {
                    SeatNo: "5",
                    StudentName: "凱澤",
                    StudentID: "3597",
                    StudentScoreTag :"成績身分:一般生"
                },
                Exam: {
                    Name: 'Midterm',
                    Range: {
                        Max: 100,
                        Min: 0
                    }
                },
                ExamOrder: [],
                Course: {},
                VisibleExam: []
            },
            studentList: [
                {
                    StudentID: "3597",
                    StudentName: "凱澤",
                    SeatNo: "5",
                    Final: "",
                    Midterm: "89",
                    StudentScoreTag: "成績身分:一般生",
                    index: 0
                }
            ],
            examList: [
                {
                    Name: 'Midterm',
                    Type: 'Number',
                    Range: {
                        Max: 100,
                        Min: 0
                    },
                    Lock: true
                },
                {
                    Name: 'Final',
                    Type: 'Number'
                },
                {
                    Name: 'Level',
                    Type: 'Enum',
                    Option: [
                        { Label: 'A' },
                        { Label: 'B' },
                        { Label: 'C' }
                    ]
                },
                {
                    Name: 'Comment',
                    Type: 'Text'
                },
				{
				    Name: 'Avg',
				    Type: 'Function',
				    Fn: function (obj) {
				        return ((obj.Midterm || 0) + (obj.Final || 0)) / 2;
				    }
				}
            ],
            process: [{

            }]
        };

        $scope.params = gadget.params;

        $scope.params.DefaultRound = gadget.params.DefaultRound || '2';

        $scope.calc = function () {
            [].concat($scope.examList).reverse().forEach(function (examItem) {
                if (examItem.Permission == "Editor" && !!!examItem.Lock && examItem.Type == "Program") {
                    $scope.studentList.forEach(function (stuRec) {
                        examItem.Fn(stuRec);
                    });
                }
            });
        }

        $scope.changeSelectMode = function (mode) {
            $scope.current.SelectMode = mode;
            $timeout(function () {
                $('.pg-seatno-textbox:visible').select().focus();
            }, 1);
        }

        $scope.setCurrent = function (student, exam, setCondition, setFocus) {
            $scope.current.Exam = exam;
            $scope.current.Student = student;

            var val = (student || {})['Exam' + (exam || {}).ExamID];
            $scope.current.Value = (angular.isNumber(val) ? val : (val || ""));
            if (setCondition && student) {
                $scope.current.SelectSeatNo = student.SeatNo;
            }
            if (setFocus) {
                $('.pg-grade-textbox:visible').focus()
                $timeout(function () {
                    $('.pg-grade-textbox:visible').select();
                }, 1);
            }
        }

        $scope.submitStudentNo = function (event) {
            if (event && (event.keyCode !== 13 || $scope.isMobile)) return; // 13是enter按鈕的代碼，return是跳出
            if (!$scope.current.Student) return;
            $('.pg-grade-textbox:visible').focus();
            $timeout(function () {
                $('.pg-grade-textbox:visible').select();
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
            $scope.setCurrent(nextStudent2 || nextStudent, $scope.current.Exam, false, false);
            $('.pg-seatno-textbox:visible').focus();
        }

        $scope.goPrev = function () {
            var currentIndex = $scope.current.Student ? $scope.current.Student.index : 0;
            $scope.setCurrent(
                (currentIndex == 0) ?
                    $scope.studentList[$scope.studentList.length - 1] :
                    $scope.studentList[currentIndex - 1]
                , $scope.current.Exam
                , true
                , true);
            $('.pg-grade-textbox:visible').focus();
            $timeout(function () {
                $('.pg-grade-textbox:visible').select();
            }, 1);
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
            $('.pg-grade-textbox:visible').focus();
            $timeout(function () {
                $('.pg-grade-textbox:visible').select();
            }, 1);
        }

        $scope.enterGrade = function (event) {
            if (event && (event.keyCode !== 13 || $scope.isMobile)) return;
            var flag = false;
            if ($scope.current.Exam.Type == 'Number') {
                var temp = Number($scope.current.Value);
                if (!isNaN(temp)
                    && (!$scope.current.Exam.Range || (!$scope.current.Exam.Range.Max && $scope.current.Exam.Range.Max !== 0) || temp <= $scope.current.Exam.Range.Max)
                    && (!$scope.current.Exam.Range || (!$scope.current.Exam.Range.Min && $scope.current.Exam.Range.Min !== 0) || temp >= $scope.current.Exam.Range.Min)) {
                    flag = true;
                    if (!$scope.current.Exam.Group) {
                        var round = Math.pow(10, $scope.params[$scope.current.Exam.Name + 'Round'] || $scope.params.DefaultRound);
                        temp = Math.round(temp * round) / round;
                    }
                }
                if ($scope.current.Value == "缺")
                    flag = true;
                if (flag) {
                    if ($scope.current.Value != "" && $scope.current.Value != "缺")
                        $scope.current.Value = temp;
                }
            }
            else {
                flag = true;
            }
            if (flag) {
                $scope.submitGrade();
            }
        }

        gadget.onLeave(function () {
            var data_changed = !$scope.checkAllTable();

            if (data_changed) {
                return "尚未儲存資料，現在離開視窗將不會儲存本次更動";
            }
            else {
                return "";
            }

        });

        $scope.selectValue = function (val) {
            $scope.current.Value = val;
            $scope.submitGrade();
        }

        $scope.submitGrade = function (matchNext) {

            $scope.Data_is_original = false;
            $scope.Data_has_changed = true;

            $scope.current.Student["Exam" + $scope.current.Exam.ExamID] = $scope.current.Value;
            $scope.calc();
            var nextStudent =
                $scope.studentList.length > ($scope.current.Student.index + 1) ?
                $scope.studentList[$scope.current.Student.index + 1] :
                $scope.studentList[0];

            $scope.setCurrent(nextStudent, $scope.current.Exam, true, false);

            if ($scope.current.SelectMode != 'Seq.')
                $('.pg-seatno-textbox:visible').select().focus();
            else {
                $('.pg-grade-textbox:visible').select().focus();
            }
            $timeout(function () {
                if ($scope.current.SelectMode != 'Seq.')
                    $('.pg-seatno-textbox:visible').select();
                else {
                    $('.pg-grade-textbox:visible').select();
                }
            }, 1);
        }

        $scope.saveAll = function () {
            var body = {
                Content: {
                    '@CourseID': $scope.current.Course.CourseID,
                    Exam: []
                }
            };
            [].concat($scope.current.Course.Scores.Score || []).forEach(function (examRec, index) {
                if (!examRec.Lock) {
                    var eItem = {
                        '@ExamID': examRec.ExamID,
                        Student: []
                    };
                    [].concat($scope.studentList || []).forEach(function (studentRec, index) {
                        var obj = {
                            '@StudentID': studentRec.StudentID,
                            '@Score': studentRec["Exam" + examRec.ExamID],
                            Extension: {
                                Extension: { Score: studentRec["Exam" + examRec.ExamID] }
                            }
                        };
                        [].concat(examRec.SubExamList || []).forEach(function (subExamRec) {
                            if (subExamRec.ExtName) {
                                obj.Extension.Extension[subExamRec.ExtName] = studentRec["Exam" + subExamRec.ExamID];
                            }
                        });
                        eItem.Student.push(obj);
                    });
                    body.Content.Exam.push(eItem);
                }
            });

            $scope.connection.send({
                service: "TeacherAccess.SetCourseExamScoreWithExtension",
                autoRetry: true,
                body: body,
                result: function (response, error, http) {
                    if (error) {
                        alert("TeacherAccess.SetCourseExamScoreWithExtension Error");
                    } else {
                        if ($scope.current.Course.AllowUpload == '是' && new Date($scope.current.Course.InputStartTime) < new Date() && new Date() < new Date($scope.current.Course.InputEndTime)) {
                            //#region 儲存學期成績
                            var body = {
                                Content: {
                                    Course: {
                                        '@CourseID': $scope.current.Course.CourseID,
                                        Student: []
                                    }
                                }
                            };
                            [].concat($scope.studentList || []).forEach(function (studentRec, index) {
                                var obj = {
                                    '@StudentID': studentRec.StudentID,
                                    '@Score': studentRec["Exam" + '學期成績']
                                };
                                body.Content.Course.Student.push(obj);
                            });
                            $scope.connection.send({
                                service: "TeacherAccess.SetCourseSemesterScore",
                                autoRetry: true,
                                body: body,
                                result: function (response, error, http) {
                                    if (error) {
                                        //失敗但評量成績已儲存
                                        $scope.$apply(function () {
                                            $scope.studentList.forEach(function (studentRec, index) {
                                                var rawStudentRec = angular.copy(studentRec);
                                                for (var key in rawStudentRec) {
                                                    if (!key.match(/(學期成績|Origin)$/gi))
                                                        studentRec[key + 'Origin'] = studentRec[key];
                                                }
                                            });
                                        });
                                        alert("TeacherAccess.SetCourseSemesterScore Error");
                                    } else {
                                        $scope.$apply(function () {
                                            $scope.studentList.forEach(function (studentRec, index) {
                                                var rawStudentRec = angular.copy(studentRec);
                                                for (var key in rawStudentRec) {
                                                    if (!key.match(/Origin$/gi))
                                                        studentRec[key + 'Origin'] = studentRec[key];
                                                }
                                            });
                                        });
                                        alert("儲存完成。");
                                    }
                                }
                            });
                            //#endregion
                        }
                        else {
                            $scope.$apply(function () {
                                $scope.studentList.forEach(function (studentRec, index) {
                                    var rawStudentRec = angular.copy(studentRec);
                                    for (var key in rawStudentRec) {
                                        if (!key.match(/(學期成績|Origin)$/gi))
                                            studentRec[key + 'Origin'] = studentRec[key];
                                    }
                                });
                            });
                            alert("儲存完成。");
                        }
                    }
                }
            });
        }

        $scope.isMobile = navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/gi) ? true : false;

        $scope.filterPermission = function (examItem) {
            return (examItem.Permission == "Read" || examItem.Permission == "Editor") && ($scope.current.VisibleExam && $scope.current.VisibleExam.indexOf(examItem.Name) >= 0);
        }

        $scope.setupCurrent = function () {
            if ($scope.studentList && $scope.examList && $scope.current.ExamOrder) {
                $scope.calc();
                if (!$scope.current.Student && !$scope.current.Exam) {
                    //#region 設定預設資料顯示
                    var ts, te;
                    if ($scope.studentList) ts = $scope.studentList[0];
                    $scope.examList.forEach(function (e) {
                        if (!te && !e.Lock && e.Permission == "Editor" && e.Type !== 'Program')
                            te = e;
                    });
                    if (ts && te) {
                        $scope.setCurrent(ts, te, true, true);
                    }
                    if ($scope.examList.length == 0) {
                        $scope.showCreateModal();
                    }
                    //#endregion
                }
                else {
                    var ts = $scope.current.Student,
                        te;
                    if (!ts && $scope.studentList && $scope.studentList.length > 0) ts = $scope.studentList[0];

                    if ($scope.current.Exam) {
                        var currentExamName = $scope.current.Exam.Name;
                        $scope.examList.forEach(function (e) {
                            if (currentExamName == e.Name)
                                te = e;
                        });
                    }
                    else {
                        $scope.examList.forEach(function (e) {
                            if (!te && !e.Lock && e.Permission == "Editor")
                                te = e;
                        });
                    }
                    $scope.setCurrent(ts, te, true, true);
                }
                $(function () {
                    $("#affixPanel").affix({
                        offset: {
                            top: 100,
                            bottom: function () {
                                return (this.bottom = $('.footer').outerHeight(true));
                            }
                        }
                    });
                });
            }
        }

        $scope.current = {
            SelectMode: "Seq.",
            SelectSeatNo: "",
            Value: "",
            Student: null,
            Exam: null,
            Course: null
        };

        $scope.connection = gadget.getContract("ta");

        $scope.connection.send({
            service: "TeacherAccess.GetCurrentSemester",
            autoRetry: true,
            body: '',
            result: function (response, error, http) {

                if (error) {
                    alert("TeacherAccess.GetCurrentSemester Error");
                } else {
                    var schoolYear = response.Current.SchoolYear;
                    var semester = response.Current.Semester;

                    $scope.connection.send({
                        service: "TeacherAccess.GetMyCourses",
                        autoRetry: true,
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
                                    $scope.courseList = [];

                                    [].concat(response.Courses.Course || []).forEach(function (courseRec, index) {
                                        if (courseRec.SchoolYear == schoolYear && courseRec.Semester == semester) {
                                            $scope.courseList.push(courseRec);
                                        }
                                    });
                                    $scope.setCurrentCourse($scope.courseList[0]);
                                });
                            }
                        }
                    });
                }
            }
        });

        $scope.getProcess = function () {
            if ($scope.examList && $scope.examList.length > 0 && $scope.examList[0].ExamID == '學期成績') {
                var process = [
                    {
                        Name: '學期成績',
                        Type: 'Header'
                    },
                    {
                        Name: '代入試算成績->學期成績',
                        Type: 'Function',
                        Fn: function () {
                            [].concat($scope.studentList || []).forEach(function (studentRec, index) {
                                studentRec["Exam" + '學期成績'] = studentRec["Exam" + '學期成績_試算'];
                            });
                            alert('學期成績已代入');
                        },
                        Disabled: $scope.examList[0].Lock
                    }
                ];

                //#region 匯入
                var importProcesses = [];
                [].concat($scope.examList).forEach(function (examRec, index) {
                    if (examRec.Type == 'Number' && examRec.Permission == "Editor") {
                        var importProcess = {
                            Name: '匯入' + examRec.Name,
                            Type: 'Function',
                            Fn: function () {
                                delete importProcess.ParseString;
                                delete importProcess.ParseValues;
                                $scope.importProcess = importProcess;
                                $('#importModal').modal('show');
                            },
                            Parse: function () {
                                importProcess.ParseString = importProcess.ParseString || '';
                                importProcess.ParseValues = importProcess.ParseString.split("\n");
                                importProcess.HasError = false;
                                for (var i = 0; i < importProcess.ParseValues.length; i++) {
                                    var flag = false;
                                    var temp = Number(importProcess.ParseValues[i]);
                                    if (!isNaN(temp)
                                        && (!$scope.current.Exam.Range || (!$scope.current.Exam.Range.Max && $scope.current.Exam.Range.Max !== 0) || temp <= $scope.current.Exam.Range.Max)
                                        && (!$scope.current.Exam.Range || (!$scope.current.Exam.Range.Min && $scope.current.Exam.Range.Min !== 0) || temp >= $scope.current.Exam.Range.Min)) {
                                        flag = true;
                                        if (!$scope.current.Exam.Group) {
                                            var round = Math.pow(10, $scope.params[$scope.current.Exam.Name + 'Round'] || $scope.params.DefaultRound);
                                            temp = Math.round(temp * round) / round;
                                        }
                                    }
                                    if (importProcess.ParseValues[i] == "缺")
                                        flag = true;
                                    if (flag) {
                                        if (!isNaN(temp) && importProcess.ParseValues[i] != "")
                                            importProcess.ParseValues[i] = temp;
                                    }
                                    else {
                                        importProcess.ParseValues[i] = '錯誤';
                                        importProcess.HasError = true;
                                    }
                                }

                                $scope.studentList.forEach(function (stuRec, index) {
                                    if (index >= importProcess.ParseValues.length) {
                                        importProcess.ParseValues.push('錯誤');
                                        importProcess.HasError = true;
                                    }
                                });

                            },
                            Clear: function () {
                                delete importProcess.ParseValues;
                            },
                            Import: function () {
                                if (importProcess.HasError == true)
                                    return;
                                $scope.studentList.forEach(function (stuRec, index) {
                                    if (!importProcess.ParseValues[index] && importProcess.ParseValues[index] !== 0)
                                        stuRec['Exam' + examRec.ExamID] = '';
                                    else
                                        stuRec['Exam' + examRec.ExamID] = importProcess.ParseValues[index];
                                });
                                $scope.calc();
                                $('#importModal').modal('hide');
                            },
                            Disabled: examRec.Lock
                        };

                        importProcesses.push(importProcess);
                    }
                });
                if (importProcesses.length > 0) {
                    process = process.concat({
                        Name: '匯入',
                        Type: 'Header'
                    }).concat(importProcesses);
                }
                //#endregion


                $scope.process = process;
            }
            else {
                $scope.process = [];
            }
        }

        $scope.setCurrentCourse = function (course) {
            if ($scope.studentList) {
                var data_changed = !$scope.checkAllTable();
                if (data_changed) {
                    if (!window.confirm("警告:尚未儲存資料，現在離開視窗將不會儲存本次更動"))
                        return;
                }
            }

            $scope.current.Student = null;
            $scope.studentList = null;
            $scope.current.VisibleExam = [];
            $scope.current.ExamOrder = [];
            $scope.current.Course = course;
            $scope.examList = [];

            [].concat(course.Scores.Score || []).forEach(function (examRec, index) {
                examRec.Type = 'Number';
                examRec.Permission = "Editor";
                examRec.Lock = !(new Date(examRec.InputStartTime) < new Date() && new Date() < new Date(examRec.InputEndTime));
                $scope.examList.push(examRec);
                $scope.current.VisibleExam.push(examRec.Name);
                $scope.current.ExamOrder.push(examRec.Name);
            });
            var finalScore = { ExamID: '學期成績', Name: '學期成績', Type: 'Number', Permission: 'Editor', Lock: !(course.AllowUpload == '是' && new Date(course.InputStartTime) < new Date() && new Date() < new Date(course.InputEndTime)) };
            var finalScorePreview = {
                ExamID: '學期成績_試算',
                Name: '學期成績_試算',
                SubName: '試算',
                Type: 'Program',
                Permission: 'Editor',
                Lock: false,
                Group: finalScore,
                Fn: function (stu) {
                    var total = 0, base = 0, seed = 10000;
                    [].concat(course.Scores.Score || []).forEach(function (examRec, index) {
                        var p = Number(examRec.Percentage) || 0;
                        var s = stu["Exam" + examRec.ExamID];
                        if (stu["Exam" + examRec.ExamID] != "缺")
                            if (stu["Exam" + examRec.ExamID] || stu["Exam" + examRec.ExamID] == "0") {
                                total += seed * p * Number(stu["Exam" + examRec.ExamID]);
                                base += p;
                            }
                    });
                    if (base) {
                        var round = Math.pow(10, $scope.params[finalScorePreview.Name + 'Round'] || $scope.params.DefaultRound);
                        stu["Exam" + finalScorePreview.ExamID] = Math.round((Math.floor(total / base) / seed) * round) / round;
                    }
                    else {
                        stu["Exam" + finalScorePreview.ExamID] = "";
                    }
                }
            };

            finalScore.SubExamList = [finalScorePreview];

            $scope.examList.splice(0, 0, finalScore, finalScorePreview);
            $scope.current.VisibleExam.push('學期成績', '學期成績_試算');
            $scope.current.ExamOrder.push('學期成績', '學期成績_試算');


            $scope.connection.send({
                service: "TeacherAccess.GetCourseExtensions",
                autoRetry: true,
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
                        [].concat(response.Response.CourseExtension.Extension || []).forEach(function (extensionRec) {
                            if (extensionRec.Name == 'GradeItemExtension') {
                                [].concat(extensionRec.GradeItemExtension || []).forEach(function (gradeItemExtensionRec) {
                                    $scope.examList.forEach(function (examRec, examIndex) {
                                        if (examRec.ExamID == gradeItemExtensionRec.ExamID) {
                                            examRec.SubExamList = [];
                                            [].concat(gradeItemExtensionRec.SubExam || []).forEach(function (subExamRec) {
                                                subExamRec.ExamID = examRec.ExamID + "_" + subExamRec.SubName;
                                                subExamRec.Name = examRec.Name + "_" + subExamRec.SubName;
                                                subExamRec.Lock = examRec.Lock;
                                                subExamRec.Group = examRec;
                                                examRec.SubExamList.push(subExamRec);


                                                $scope.examList.splice(examIndex + examRec.SubExamList.length, 0, subExamRec);
                                                $scope.current.VisibleExam.splice(examIndex + examRec.SubExamList.length, 0, subExamRec.Name);
                                            });
                                            if (gradeItemExtensionRec.Calc == 'SUM') {
                                                examRec.Type = 'Program';
                                                examRec.Fn = function (stu) {
                                                    var sum = 0;
                                                    var hasVal = false;
                                                    var isAbsent = false;
                                                    var seed = 10000;
                                                    examRec.SubExamList.forEach(function (subExamRec) {
                                                        if (stu["Exam" + subExamRec.ExamID] || stu["Exam" + subExamRec.ExamID] == "0") {
                                                            hasVal = true;
                                                            if (stu["Exam" + subExamRec.ExamID] == "缺") {
                                                                isAbsent = true;
                                                            }
                                                            else {
                                                                sum += Number(stu["Exam" + subExamRec.ExamID] * seed || 0);
                                                            }

                                                        }
                                                    });
                                                    if (isAbsent) {
                                                        stu["Exam" + examRec.ExamID] = "缺";
                                                    }
                                                    else {
                                                        if (hasVal) {
                                                            var round = Math.pow(10, $scope.params[examRec.Name + 'Round'] || $scope.params.DefaultRound);
                                                            stu["Exam" + examRec.ExamID] = Math.round((Math.floor(sum) / seed) * round) / round;
                                                        }
                                                        else {
                                                            if (stu["Exam" + examRec.ExamID] !== "缺")
                                                                stu["Exam" + examRec.ExamID] = '';
                                                        }

                                                    }
                                                };
                                            }
                                            return;
                                        }
                                    });
                                });
                            }
                        });


                        $scope.connection.send({
                            service: "TeacherAccess.GetCourseStudents",
                            autoRetry: true,
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
                                        $scope.studentList = [];
                                        [].concat(response.Students.Student || []).forEach(function (studentRec, index) {
                                            studentRec.SeatNo = studentRec.SeatNumber;

                                            //2017/6/15 穎驊新增，因應 [A09][06] 子成績輸入-顯示成績身分 項目 ，加入顯示身分類別 ，以利老師在輸入成績時作為判別資訊。
                                            if (studentRec.Tags) {
                                                [].concat(studentRec.Tags.Tag || []).forEach(function (tag) {

                                                    if (tag.Name.includes("成績身分")) {
                                                        studentRec.StudentScoreTag = tag.Name;
                                                    }
                                                });
                                            }
                                            
                                            studentRec.index = index;
                                            $scope.examList.forEach(function (examRec) {
                                                studentRec["Exam" + examRec.ExamID] = '';
                                            });
                                            $scope.studentList.push(studentRec);
                                            studentMapping[studentRec.StudentID] = studentRec;
                                        });
                                    });
                                    var getCourseExamScoreFinish = false;
                                    var getCourseSemesterScore = false;

                                    //抓定期評量成績
                                    $scope.connection.send({
                                        service: "TeacherAccess.GetCourseExamScore",
                                        autoRetry: true,
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
                                                        studentMapping[examScoreRec.StudentID]["Exam" + examScoreRec.ExamID] = examScoreRec.Score;

                                                        $scope.examList.forEach(function (examRec) {
                                                            if (examRec.ExamID == examScoreRec.ExamID) {
                                                                [].concat(examRec.SubExamList || []).forEach(function (subExamRec) {
                                                                    if (subExamRec.ExtName && examScoreRec.Extension && examScoreRec.Extension.Extension && examScoreRec.Extension.Extension[subExamRec.ExtName]) {
                                                                        studentMapping[examScoreRec.StudentID]["Exam" + subExamRec.ExamID] = examScoreRec.Extension.Extension[subExamRec.ExtName];
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    });
                                                    getCourseExamScoreFinish = true;
                                                    //定期跟總成績都抓完
                                                    if (getCourseExamScoreFinish && getCourseSemesterScore) {
                                                        $scope.studentList.forEach(function (studentRec, index) {
                                                            var rawStudentRec = angular.copy(studentRec);
                                                            for (var key in rawStudentRec) {
                                                                if (!key.match(/Origin$/gi))
                                                                    studentRec[key + 'Origin'] = studentRec[key];
                                                            }
                                                        });
                                                        $scope.setupCurrent();
                                                    }
                                                });
                                            }
                                        }
                                    });

                                    //抓課程總成績
                                    $scope.connection.send({
                                        service: "TeacherAccess.GetCourseSemesterScore",
                                        autoRetry: true,
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
                                                        studentMapping[finalScoreRec.StudentID]["Exam" + finalScore.ExamID] = finalScoreRec.Score;
                                                    });

                                                    getCourseSemesterScore = true;
                                                    //定期跟總成績都抓完
                                                    if (getCourseExamScoreFinish && getCourseSemesterScore) {
                                                        $scope.studentList.forEach(function (studentRec, index) {
                                                            var rawStudentRec = angular.copy(studentRec);
                                                            for (var key in rawStudentRec) {
                                                                if (!key.match(/Origin$/gi))
                                                                    studentRec[key + 'Origin'] = studentRec[key];
                                                            }
                                                        });
                                                        $scope.setupCurrent();
                                                    }
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

        $scope.checkAllTable = function () {
            var pass = true;
            [].concat($scope.examList || []).forEach(function (examRec) {
                if (pass)
                    [].concat($scope.studentList || []).forEach(function (stuRec) {
                        if (pass)
                            pass = !!$scope.checkOneCell(stuRec, 'Exam' + examRec.ExamID);
                    });
            });
            return pass;
        }

        $scope.checkOneCell = function (studentRec, examKey) {
            var pass = true;
            pass = (studentRec[examKey] == studentRec[examKey + 'Origin']) || (studentRec[examKey + 'Origin'] === undefined) || (examKey == "Exam學期成績_試算");
            return pass;
        }


        //#endregion
        //#endregion

    }
])
.provider('$affix', function () {

    var defaults = this.defaults = {
        offsetTop: 'auto'
    };

    this.$get = function ($window, debounce, dimensions) {

        var bodyEl = angular.element($window.document.body);
        var windowEl = angular.element($window);

        function AffixFactory(element, config) {

            var $affix = {};

            // Common vars
            var options = angular.extend({}, defaults, config);
            var targetEl = options.target;

            // Initial private vars
            var reset = 'affix affix-top affix-bottom',
                initialAffixTop = 0,
                initialOffsetTop = 0,
                offsetTop = 0,
                offsetBottom = 0,
                affixed = null,
                unpin = null;

            var parent = element.parent();
            // Options: custom parent
            if (options.offsetParent) {
                if (options.offsetParent.match(/^\d+$/)) {
                    for (var i = 0; i < (options.offsetParent * 1) - 1; i++) {
                        parent = parent.parent();
                    }
                }
                else {
                    parent = angular.element(options.offsetParent);
                }
            }

            $affix.init = function () {

                $affix.$parseOffsets();
                initialOffsetTop = dimensions.offset(element[0]).top + initialAffixTop;

                // Bind events
                targetEl.on('scroll', $affix.checkPosition);
                targetEl.on('click', $affix.checkPositionWithEventLoop);
                windowEl.on('resize', $affix.$debouncedOnResize);

                // Both of these checkPosition() calls are necessary for the case where
                // the user hits refresh after scrolling to the bottom of the page.
                $affix.checkPosition();
                $affix.checkPositionWithEventLoop();

            };

            $affix.destroy = function () {

                // Unbind events
                targetEl.off('scroll', $affix.checkPosition);
                targetEl.off('click', $affix.checkPositionWithEventLoop);
                windowEl.off('resize', $affix.$debouncedOnResize);

            };

            $affix.checkPositionWithEventLoop = function () {

                setTimeout($affix.checkPosition, 1);

            };

            $affix.checkPosition = function () {
                // if (!this.$element.is(':visible')) return

                var scrollTop = getScrollTop();
                var position = dimensions.offset(element[0]);
                var elementHeight = dimensions.height(element[0]);

                // Get required affix class according to position
                var affix = getRequiredAffixClass(unpin, position, elementHeight);

                // Did affix status changed this last check?
                if (affixed === affix) return;
                affixed = affix;

                // Add proper affix class
                element.removeClass(reset).addClass('affix' + ((affix !== 'middle') ? '-' + affix : ''));

                if (affix === 'top') {
                    unpin = null;
                    element.css('position', (options.offsetParent) ? '' : 'relative');
                    element.css('top', '');
                } else if (affix === 'bottom') {
                    if (options.offsetUnpin) {
                        unpin = -(options.offsetUnpin * 1);
                    }
                    else {
                        // Calculate unpin threshold when affixed to bottom.
                        // Hopefully the browser scrolls pixel by pixel.
                        unpin = position.top - scrollTop;
                    }
                    element.css('position', (options.offsetParent) ? '' : 'relative');
                    element.css('top', (options.offsetParent) ? '' : ((bodyEl[0].offsetHeight - offsetBottom - elementHeight - initialOffsetTop) + 'px'));
                } else { // affix === 'middle'
                    unpin = null;
                    element.css('position', 'fixed');
                    element.css('top', initialAffixTop + 'px');
                }

            };

            $affix.$onResize = function () {
                $affix.$parseOffsets();
                $affix.checkPosition();
            };
            $affix.$debouncedOnResize = debounce($affix.$onResize, 50);

            $affix.$parseOffsets = function () {

                // Reset position to calculate correct offsetTop
                element.css('position', (options.offsetParent) ? '' : 'relative');

                if (options.offsetTop) {
                    if (options.offsetTop === 'auto') {
                        options.offsetTop = '+0';
                    }
                    if (options.offsetTop.match(/^[-+]\d+$/)) {
                        initialAffixTop = -options.offsetTop * 1;
                        if (options.offsetParent) {
                            offsetTop = dimensions.offset(parent[0]).top + (options.offsetTop * 1);
                        }
                        else {
                            offsetTop = dimensions.offset(element[0]).top - dimensions.css(element[0], 'marginTop', true) + (options.offsetTop * 1);
                        }
                    }
                    else {
                        offsetTop = options.offsetTop * 1;
                    }
                }

                if (options.offsetBottom) {
                    if (options.offsetParent && options.offsetBottom.match(/^[-+]\d+$/)) {
                        // add 1 pixel due to rounding problems...
                        offsetBottom = getScrollHeight() - (dimensions.offset(parent[0]).top + dimensions.height(parent[0])) + (options.offsetBottom * 1) + 1;
                    }
                    else {
                        offsetBottom = options.offsetBottom * 1;
                    }
                }

            };

            // Private methods

            function getRequiredAffixClass(unpin, position, elementHeight) {

                var scrollTop = getScrollTop();
                var scrollHeight = getScrollHeight();

                if (scrollTop <= offsetTop) {
                    return 'top';
                } else if (unpin !== null && (scrollTop + unpin <= position.top)) {
                    return 'middle';
                } else if (offsetBottom !== null && (position.top + elementHeight + initialAffixTop >= scrollHeight - offsetBottom)) {
                    return 'bottom';
                } else {
                    return 'middle';
                }

            }

            function getScrollTop() {
                return targetEl[0] === $window ? $window.pageYOffset : targetEl[0].scrollTop;
            }

            function getScrollHeight() {
                return targetEl[0] === $window ? $window.document.body.scrollHeight : targetEl[0].scrollHeight;
            }

            $affix.init();
            return $affix;

        }

        return AffixFactory;

    };

})
.directive('bsAffix', function ($affix, $window) {
    return {
        restrict: 'EAC',
        require: '^?bsAffixTarget',
        link: function postLink(scope, element, attr, affixTarget) {

            var options = { scope: scope, offsetTop: 'auto', target: affixTarget ? affixTarget.$element : angular.element($window) };
            angular.forEach(['offsetTop', 'offsetBottom', 'offsetParent', 'offsetUnpin'], function (key) {
                if (angular.isDefined(attr[key])) options[key] = attr[key];
            });

            var affix = $affix(element, options);
            scope.$on('$destroy', function () {
                affix && affix.destroy();
                options = null;
                affix = null;
            });

        }
    };

})
.directive('bsAffixTarget', function () {
    return {
        controller: function ($element) {
            this.$element = $element;
        }
    };
})
.directive('selectOnClick', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                this.select();
            });
        }
    };
});
