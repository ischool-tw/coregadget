angular.module('enterconduct', [])

.controller('MainCtrl', ['$scope', '$timeout',
    function($scope, $timeout) {

        $scope.connection = gadget.getContract("ibsh.exam.teacher");

        $scope.getNow = function() {
            $scope.connection.send({
                service: "_.GetConfig",
                body: '',
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetConfig', error);
                    } else {
                        // console.log(response);
                        $scope.$apply(function() {
                            if (response !== null) {
                                $scope.config = response;
                                $scope.current = {
                                    SchoolYear: response.SchoolYear,
                                    Semester: response.Semester,
                                    Period: '1',
                                    Code: [{
                                        Key: 'M',
                                        Value: '3 = Meets expectations'
                                    }, {
                                        Key: 'S',
                                        Value: '2 = Meets needs with Support'
                                    }, {
                                        Key: 'N',
                                        Value: '1 = Not yet within expectations'
                                    }, {
                                        Key: 'N/A',
                                        Value: '0 = Not available'
                                    }]
                                }
                            }
                            $scope.getCourseList();
                        });
                    }
                }
            });
        };

        $scope.teacherType = '';

        $scope.getCourseList = function(type) {
            $scope.connection.send({
                service: "_.GetClassCourseList",
                body: '',
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {
                        // console.log(response);
                        $scope.$apply(function() {
                            if (response !== null && response.Result) {
                                $scope.current.HomeroomTeacher = response.Result.HomeroomTeacher;
                                $scope.current.SubjectTeacher = response.Result.SubjectTeacher;

                                if ($scope.current.HomeroomTeacher === "true")
                                    $scope.teacherType = 'homeroom';
                                else if ($scope.current.SubjectTeacher === "true")
                                    $scope.teacherType = 'subject';
                                else
                                    $scope.teacherType = '';

                                var _ClassList = [],
                                    _CourseList = [];
                                $scope.courseList = [];
                                if (response.Result.Class)
                                    _ClassList = _ClassList.concat(response.Result.Class);

                                angular.forEach(_ClassList, function(item) {
                                    item.ID = item.ClassID;
                                    item.Title = item.ClassName;
                                    item.Type = 'homeroom';
                                    item.Show = true;
                                });

                                if (response.Result.Course)
                                    _CourseList = _CourseList.concat(response.Result.Course);

                                angular.forEach(_CourseList, function(item) {
                                    item.ID = item.CourseID;
                                    item.Title = item.CourseName + ' ' + item.SubjectEnglishName;
                                    item.Type = 'subject';
                                    item.Show = false;
                                });

                                $scope.courseList = [].concat(_ClassList).concat(_CourseList);

                                // if ($scope.courseList.length) {
                                //     $scope.selectCourse($scope.courseList[0]);
                                // }

                                if ($scope.teacherType === 'homeroom'){
                                    $scope.switchTeacherType('homeroom');
                                }
                                else if ($scope.teacherType === 'subject'){
                                    $scope.switchTeacherType('subject');
                                }
                            }
                        });
                    }
                }
            });
        };

        $scope.switchTeacherType = function(type) {
            $scope.teacherType = type;

            var flag = -1;
            angular.forEach($scope.courseList, function(item, index) {
                if (item.Type === type) {
                    item.Show = true;
                    if (flag === -1) flag = index;
                } else
                    item.Show = false;
            });
            if (flag !== -1)
                $scope.selectCourse($scope.courseList[flag]);
        };

        $scope.selectCourse = function(item) {
            $scope.currentCourse = item;

            angular.forEach($scope.courseList, function(item) {
                item.selected = false;
            });
            item.selected = true;

            delete $scope.currentStudent;
            delete $scope.currentConduct;

            // angular.forEach($scope.conductList, function(c) {
            //     angular.forEach(c.Content, function(temp) {
            //         temp.selected = false;
            //     });
            // });
            $scope.getStudentList();

            var flag = false;

            angular.forEach($scope.config.Config, function(item) {
                if (($scope.currentCourse.GradeYear * 1) <= (item.Grade * 1) && !flag) {
                    $scope.current.MiddleOpeningC = item.MiddleOpeningC;
                    $scope.current.MiddleBeginC = item.MiddleBeginC;
                    $scope.current.MiddleEndC = item.MiddleEndC;
                    $scope.current.FinalOpeningC = item.FinalOpeningC;
                    $scope.current.FinalBeginC = item.FinalBeginC;
                    $scope.current.FinalEndC = item.FinalEndC;
                    $scope.current.ConductList = [].concat(item.Conduct.Conducts.Conduct);
                    angular.forEach($scope.current.ConductList, function(conduct) {
                        conduct.Item = [].concat(conduct.Item);
                    });
                    flag = true;
                }
            });
        };

        $scope.getStudentList = function() {
            delete $scope.studentList;
            delete $scope.currentStudent;

            var _body = '';

            if ($scope.currentCourse.Type === 'homeroom')
                _body = {
                    ClassID: $scope.currentCourse.ID
                };
            else
                _body = {
                    CourseID: $scope.currentCourse.ID
                };

            $scope.connection.send({
                service: "_.GetConductScore",
                body: _body,
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                    } else {
                        // console.log("student list:");
                        // console.log(response);
                        $scope.$apply(function() {
                            if (response !== null) {
                                $scope.studentList = [];
                                if ($scope.currentCourse.Type === 'homeroom') {
                                    if (response.Class && response.Class.Student) {
                                        $scope.studentList = [].concat(response.Class.Student);
                                        angular.forEach($scope.studentList, function(item, index) {
                                            item.order = index;
                                        });
                                    }
                                } else {
                                    if (response.Course && response.Course.Student) {
                                        $scope.studentList = [].concat(response.Course.Student);
                                        angular.forEach($scope.studentList, function(item, index) {
                                            item.order = index;
                                        });
                                    }
                                }

                                angular.forEach($scope.studentList, function(stu) {
                                    stu.EditConduct = {
                                        Conducts: {
                                            Conduct: []
                                        }
                                    }
                                    if (stu.Conduct !== '' && stu.Conduct.Conducts && stu.Conduct.Conducts.Conduct) {
                                        stu.Conduct.Conducts.Conduct = [].concat(stu.Conduct.Conducts.Conduct);
                                        angular.forEach(stu.Conduct.Conducts.Conduct, function(conduct) {
                                            conduct.Item = [].concat(conduct.Item);
                                        });
                                    }
                                    if (stu.MidtermConduct !== '' && stu.MidtermConduct.Conducts && stu.MidtermConduct.Conducts.Conduct) {
                                        stu.MidtermConduct.Conducts.Conduct = [].concat(stu.MidtermConduct.Conducts.Conduct);
                                        angular.forEach(stu.MidtermConduct.Conducts.Conduct, function(conduct) {
                                            conduct.Item = [].concat(conduct.Item);
                                        });
                                    }
                                    if (stu.FinalConduct !== '' && stu.FinalConduct.Conducts && stu.FinalConduct.Conducts.Conduct) {
                                        stu.FinalConduct.Conducts.Conduct = [].concat(stu.FinalConduct.Conducts.Conduct);
                                        angular.forEach(stu.FinalConduct.Conducts.Conduct, function(conduct) {
                                            conduct.Item = [].concat(conduct.Item);
                                        });
                                    }

                                    angular.forEach($scope.current.ConductList, function(conduct) {
                                        if ($scope.teacherType === 'homeroom') {
                                            if (!conduct.Subject || conduct.Subject === '') {
                                                var _conduct = {
                                                    Group: conduct.Group,
                                                    Item: []
                                                };
                                                angular.forEach(conduct.Item, function(item) {
                                                    _conduct.Item.push({
                                                        Title: item.Title || '',
                                                        MidtermGrade: '',
                                                        FinalGrade: '',
                                                        Grade: '',
                                                        Group: conduct.Group
                                                    });
                                                });

                                                stu.EditConduct.Conducts.Conduct.push(_conduct);
                                            }
                                        } else {
                                            if (conduct.Common === 'True' || ($scope.teacherType === 'subject' && $scope.currentCourse.SubjectChineseName === conduct.Subject)) {
                                                var _conduct = {
                                                    Group: conduct.Group,
                                                    Item: []
                                                };
                                                angular.forEach(conduct.Item, function(item) {
                                                    _conduct.Item.push({
                                                        Title: item.Title || '',
                                                        MidtermGrade: '',
                                                        FinalGrade: '',
                                                        Grade: '',
                                                        Group: conduct.Group
                                                    });
                                                });

                                                stu.EditConduct.Conducts.Conduct.push(_conduct);
                                            }
                                        }
                                    });
                                    angular.forEach(stu.EditConduct.Conducts.Conduct, function(ec) {
                                        ec.Item = [].concat(ec.Item);

                                        if (stu.Conduct !== '' && stu.Conduct.Conducts && stu.Conduct.Conducts.Conduct) {
                                            angular.forEach(stu.Conduct.Conducts.Conduct, function(c) {
                                                if (ec.Group === c.Group) {
                                                    angular.forEach(ec.Item, function(ei) {
                                                        angular.forEach(c.Item, function(ci) {
                                                            if (ei.Title === ci.Title) {
                                                                ei.Grade = ci.Grade;
                                                            }
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                        if (stu.MidtermConduct !== '' && stu.MidtermConduct.Conducts && stu.MidtermConduct.Conducts.Conduct) {
                                            angular.forEach(stu.MidtermConduct.Conducts.Conduct, function(c) {
                                                if (ec.Group === c.Group) {
                                                    angular.forEach(ec.Item, function(ei) {
                                                        angular.forEach(c.Item, function(ci) {
                                                            if (ei.Title === ci.Title) {
                                                                ei.MidtermGrade = ci.Grade;
                                                            }
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                        if (stu.FinalConduct !== '' && stu.FinalConduct.Conducts && stu.FinalConduct.Conducts.Conduct) {
                                            angular.forEach(stu.FinalConduct.Conducts.Conduct, function(c) {
                                                if (ec.Group === c.Group) {
                                                    angular.forEach(ec.Item, function(ei) {
                                                        angular.forEach(c.Item, function(ci) {
                                                            if (ei.Title === ci.Title) {
                                                                ei.FinalGrade = ci.Grade;
                                                            }
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                    });
                                });

                                //console.log($scope.studentList);

                                if ($scope.studentList.length) {
                                    $scope.studentList.sort($scope.studentSort);
                                    $scope.selectStudent($scope.studentList[0]);
                                }
                            }
                        });
                    }
                }
            });
        };

        $scope.selectStudent = function(item) {
            if (!item) return;

            $scope.currentStudent = item;
            $scope.currentStudent.tempStudentID = $scope.currentStudent.StudentID;

            angular.forEach($scope.studentList, function(item) {
                item.selected = false;
            });
            item.selected = true;

            if ($scope.currentStudent.EditConduct.Conducts.Conduct.length > 0 && $scope.currentStudent.EditConduct.Conducts.Conduct[0].Item.length > 0) {
                if ($scope.currentCourse.GradeYear < 3) {
                    if ($scope.current.MiddleOpeningC === 'true') {
                        $scope.selectConduct($scope.currentStudent.EditConduct.Conducts.Conduct[0].Item[0], 1);
                    } else if ($scope.current.FinalOpeningC === 'true') {
                        $scope.selectConduct($scope.currentStudent.EditConduct.Conducts.Conduct[0].Item[0], 2);
                    }
                } else {
                    if ($scope.current.FinalOpeningC === 'true') {
                        $scope.selectConduct($scope.currentStudent.EditConduct.Conducts.Conduct[0].Item[0], 3);
                    }
                }
            }
        };

        $scope.selectStudentID = function(event) { //輸入座號跳到該座號
            if (event.keyCode !== 13) return; // 13是enter按鈕的代碼，return是跳出

            if (!$scope.currentStudent) return;

            var nextStudent = null;
            angular.forEach($scope.studentList, function(item) {
                if (item.StudentID === $scope.currentStudent.tempStudentID) {
                    nextStudent = item;
                }
            });

            $scope.selectStudent(nextStudent);
        };

        $scope.selectConduct = function(item, period) {
            if (!item) {
                $scope.currentConduct.selected = false;

                if ($scope.teacherType !== 'homeroom') {
                    $timeout(function() {
                        $('#seatno-textbox').focus().select();
                    }, 100);

                    var tempStudent = null;
                    angular.forEach($scope.studentList, function(item, index) {
                        if (item.StudentID === $scope.currentStudent.tempStudentID) {
                            tempStudent = $scope.studentList[index + 1];
                        }
                    });
                    if (tempStudent) {
                        $scope.currentStudent = tempStudent;
                        $scope.currentStudent.tempStudentID = $scope.currentStudent.StudentID;
                    } else {
                        $scope.currentStudent = $scope.studentList[0];
                        $scope.currentStudent.tempStudentID = $scope.currentStudent.StudentID;
                    }
                    delete $scope.currentConduct;
                } else {
                    $timeout(function() {
                        if (period === 1)
                            $('#mcomment-textbox').focus();
                        else if (period === 2)
                            $('#fcomment-textbox').focus();
                        else
                            $('#comment-textbox').focus();
                    }, 100);
                }

                return;
            }

            $scope.currentConduct = item;
            $scope.currentConduct.Period = period;

            angular.forEach($scope.currentStudent.EditConduct.Conducts.Conduct, function(c) {
                angular.forEach(c.Item, function(temp, index) {
                    temp.selected = false;
                    temp.index = index + 1;
                });
            });
            item.selected = true;

            if (period === 1) {
                $scope.currentConduct.tempGrade = item.MidtermGrade;
                if ($scope.current.MiddleOpeningC === 'true') {
                    item.canInputGrade = true;
                    item.canInputMComment = true;
                    item.canInputFComment = false;
                } else {
                    item.canInputGrade = false;
                    item.canInputMComment = false;
                    item.canInputFComment = false;
                }
            } else if (period === 2) {
                $scope.currentConduct.tempGrade = item.FinalGrade;
                if ($scope.current.FinalOpeningC === 'true') {
                    item.canInputGrade = true;
                    item.canInputMComment = false;
                    item.canInputFComment = true;
                } else {
                    item.canInputGrade = false;
                    item.canInputMComment = false;
                    item.canInputFComment = false;
                }
            } else {
                $scope.currentConduct.tempGrade = item.Grade;
                if ($scope.current.FinalOpeningC === 'true') {
                    item.canInputGrade = true;
                } else {
                    item.canInputGrade = false;
                }
            }

            $('#grade-textbox').focus().select();

        };

        $scope.enterGrade = function(event) {
            if (event.keyCode !== 13) return;

            if (!$scope.currentConduct) return;

            var grade = $scope.currentConduct.tempGrade.toUpperCase();
            if (grade === '3')
                grade = 'M';
            if (grade === '2')
                grade = 'S';
            if (grade === '1')
                grade = 'N';
            if (grade === '0')
                grade = 'N/A';

            $scope.currentConduct.tempGrade = grade;

            var flag = false;
            angular.forEach($scope.current.Code, function(item) {
                if (item.Key.toUpperCase() === grade) {
                    flag = true;
                    $scope.currentConduct.tempGrade = grade;
                }
            });

            if (flag) {
                $scope.saveGrade('conduct');
            }

        };

        $scope.enterComment = function(event) {
            if (event.keyCode !== 13 || event.shiftKey) return;

            $scope.saveGrade('comment');
        };

        $scope.SetDefaultValue = function() {

            var grade = $scope.currentConduct.tempGrade.toUpperCase();
            if (grade === '3')
                grade = 'M';
            if (grade === '2')
                grade = 'S';
            if (grade === '1')
                grade = 'N';
            if (grade === '0')
                grade = 'N/A';

            $scope.currentConduct.tempGrade = grade;

            //var grade = $scope.currentConduct.tempGrade.toUpperCase();

            if (grade !== 'M' && grade !== 'S' && grade !== 'N' && grade !== 'N/A')
                return;

            angular.forEach($scope.currentStudent.EditConduct.Conducts.Conduct, function(conduct) {
                angular.forEach(conduct.Item, function(item) {
                    if ($scope.currentConduct.Period === 1 && $scope.current.MiddleOpeningC === 'true') {
                        item.MidtermGrade = grade;
                        item.tempGrade = grade;
                    }

                    if ($scope.currentConduct.Period === 2 && $scope.current.FinalOpeningC === 'true') {
                        item.FinalGrade = grade;
                        item.tempGrade = grade;
                    }

                    if ($scope.currentConduct.Period === 3 && $scope.current.FinalOpeningC === 'true') {
                        item.Grade = grade;
                        item.tempGrade = grade;
                    }
                });
            });

            $scope.saveGrade('conduct');
        };

        $scope.saveGrade = function(type) {

            var _body = {
                StudentID: $scope.currentStudent.StudentID,
                Period: $scope.currentConduct.Period === 3 ? '' : $scope.currentConduct.Period,
                Comment: $scope.currentConduct.Period === 1 ? $scope.currentStudent.MidtermComment : ($scope.currentConduct.Period === 2 ? $scope.currentStudent.FinalComment : $scope.currentStudent.Comment),
                Conduct: {
                    Conducts: {
                        Conduct: []
                    }
                }
            };

            if ($scope.teacherType === 'subject') {
                _body.Subject = $scope.currentCourse.SubjectChineseName;
            }

            var conductList = [];

            angular.forEach($scope.currentStudent.EditConduct.Conducts.Conduct, function(conduct) {
                var items = [];
                angular.forEach(conduct.Item, function(item) {

                    if (item.Title !== $scope.currentConduct.Title) {
                        items.push({
                            '@Grade': ($scope.currentConduct.Period === 1 ? item.MidtermGrade : ($scope.currentConduct.Period === 2 ? item.FinalGrade : item.Grade)) || '',
                            '@Title': item.Title || ''
                        });
                    } else {
                        items.push({
                            '@Grade': item.tempGrade || '',
                            '@Title': item.Title || ''
                        });
                    }
                });

                conductList.push({
                    '@Group': conduct.Group,
                    Item: items
                });
            });

            _body.Conduct.Conducts.Conduct = conductList;

            //console.log(_body);

            $scope.connection.send({
                service: "_.UpdateConductScore",
                body: _body,
                result: function(response, error, http) {
                    if (error !== null) {
                        // $scope.set_error_message('#mainMsg', 'GetConfig', error);
                    } else {
                        //console.log(response);
                        $scope.$apply(function() {
                            if (type === 'conduct') {
                                if ($scope.currentConduct.Period === 1)
                                    $scope.currentConduct.MidtermGrade = $scope.currentConduct.tempGrade;
                                else if ($scope.currentConduct.Period === 2)
                                    $scope.currentConduct.FinalGrade = $scope.currentConduct.tempGrade;
                                else
                                    $scope.currentConduct.Grade = $scope.currentConduct.tempGrade;

                                var nextConduct = null,
                                    period = $scope.currentConduct.Period;

                                angular.forEach($scope.currentStudent.EditConduct.Conducts.Conduct, function(conduct, i) {
                                    angular.forEach(conduct.Item, function(item, j) {
                                        if ($scope.currentConduct.Title === item.Title && $scope.currentConduct.Group === conduct.Group)
                                            nextConduct = conduct.Item[j + 1];
                                    });

                                    if (!nextConduct && i < $scope.currentStudent.EditConduct.Conducts.Conduct.length - 1) {
                                        if ($scope.currentStudent.EditConduct.Conducts.Conduct[i + 1].Item.length > 0)
                                            nextConduct = $scope.currentStudent.EditConduct.Conducts.Conduct[i + 1].Item[0];
                                    }
                                });

                                $scope.selectConduct(nextConduct, period);
                            } else {
                                var nextStudent = $scope.studentList[$scope.currentStudent.order + 1];
                                if (!nextStudent)
                                    nextStudent = $scope.studentList[0];

                                nextStudent.tempStudentID = nextStudent.StudentID;
                                $scope.currentStudent = nextStudent;

                                $timeout(function() {
                                    //$('#seatno-textbox').focus().select();

                                    var period = $scope.currentConduct.Period;
                                    delete $scope.currentConduct;

                                    if ($scope.currentStudent.EditConduct.Conducts.Conduct.length > 0 && $scope.currentStudent.EditConduct.Conducts.Conduct[0].Item.length > 0)
                                        $scope.selectConduct($scope.currentStudent.EditConduct.Conducts.Conduct[0].Item[0], period);

                                }, 100);
                            }
                        });
                    }
                }
            });
        };

        $scope.padLeft = function(str, length) {
            if (str.length >= length) return str
            else return $scope.padLeft("0" + str, length);
        };

        $scope.studentSort = function(x, y) {
            var xx = $scope.padLeft(x.ClassName, 20);
            xx += $scope.padLeft(x.SeatNo, 3);

            var yy = $scope.padLeft(y.ClassName, 20);
            yy += $scope.padLeft(y.SeatNo, 3);

            if (xx == yy)
                return 0;

            if (xx < yy)
                return -1;
            else
                return 1;
        };

        $scope.PrintPage = function(){

            var html = "";
            var M = false;
            var F = false;
            var ClassOrCourseName = "";

            if($scope.currentCourse.Type === "homeroom")
                ClassOrCourseName = "Class : " + $scope.currentCourse.Title;
            else
                ClassOrCourseName = "Course : " + $scope.currentCourse.Title;

            // StudentChineseName: "好將將"
            // StudentEnglishName: "JIANG, YAO-MING"
            // StudentNickname: "goodGG"
            // StudentNumber: "814201"

            angular.forEach($scope.studentList,function(value){
                    $scope.selectStudent(value);

                    var studentName = "ChineseName: " + value.StudentChineseName + "  EnglishName: " + value.StudentEnglishName + "  NickName: " +  value.StudentNickname + "  StudentNo: " + value.StudentNumber;

                    if($scope.currentConduct.canInputMComment){
                        $scope.currentConduct.canInputMComment = false;
                        M = true;
                    }

                    if($scope.currentConduct.canInputFComment){
                        $scope.currentConduct.canInputFComment = false;
                        F = true;
                    }

                    $scope.$apply();
                    html += "<p>===============================================================================</p>"
                    html += "<p>" + studentName + "</p>";
                    html += $('#printlist').html();
            });

            if(M)
                $scope.currentConduct.canInputMComment = true;
            if(F)
                $scope.currentConduct.canInputFComment = true;

            $scope.$apply();

            var printPage = window.open("", "printPage", "");
                printPage.document.open();
                printPage.document.write("<HTML><head></head><BODY onload='window.print();window.close()'>");
                printPage.document.write("<PRE>");
                printPage.document.write("<p>" + ClassOrCourseName + "</p>");
                printPage.document.write(html);
                printPage.document.write("<br>");
                printPage.document.write("<br>");
                printPage.document.write("Signature:______________________");
                printPage.document.write("</PRE>");
                printPage.document.close("</BODY></HTML>");
        };

        $scope.getNow();

    }
])
