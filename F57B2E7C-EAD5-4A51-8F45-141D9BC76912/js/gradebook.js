angular.module('gradebook', ['ui.sortable', 'mgcrea.ngStrap.helpers.dimensions', 'mgcrea.ngStrap.helpers.debounce'])
    .controller('MainCtrl', ['$scope', '$timeout',
        function ($scope, $timeout) {
            $scope.params = gadget.params;
            $scope.params.DefaultRound = gadget.params.DefaultRound || '2';

            $scope.connection = gadget.getContract("kcis");
            $scope.connection.send({
                service: "gradebook.GetMyCourse",
                autoRetry: true,
                body: {},
                result: function (response, error, http) {
                    if (error) {
                        alert("gradebook.GetMyCourse Error");
                    } else {
                        $scope.$apply(function () {
                            var jumpCourse;
                            var jumpTerm;
                            var jumpSubject;
                            var jumpAssessment;

                            $scope.courseList = [].concat(response.Course || []);
                            $scope.courseList.forEach(function (courseRec) {
                                courseRec.Term = [].concat(courseRec.Term || []);
                                courseRec.Term.forEach(function (termRec) {
                                    termRec.InputStartTimeDate = new Date(parseInt(termRec.InputStartTimeTick));
                                    termRec.InputEndTimeDate = new Date(parseInt(termRec.InputEndTimeTick));
                                    termRec.Subject = [].concat(termRec.Subject || []);
                                    termRec.Subject.forEach(function (subjRec) {
                                        var totalWeight = 0;
                                        subjRec.Assessment = [].concat(subjRec.Assessment || []);
                                        subjRec.Assessment.forEach(function (assessmentRec) {
                                            var weight = Number(assessmentRec.Weight);
                                            if (weight)
                                                totalWeight += weight;
                                        });
                                        subjRec.Assessment.forEach(function (assessmentRec) {
                                            if (assessmentRec.TeacherSequence == courseRec.MySequence && !!!jumpCourse && termRec.InputEndTimeDate >= new Date()) {
                                                jumpCourse = courseRec;
                                                jumpTerm = termRec;
                                                jumpSubject = subjRec;
                                                if (termRec.InputStartTimeDate > new Date())
                                                    jumpAssessment = assessmentRec;
                                            }
                                            var weight = Number(assessmentRec.Weight);
                                            if (weight || weight == 0) {
                                                assessmentRec.Percentage = Math.round(10000 * weight / (totalWeight || 1)) / 100;
                                            }

                                            assessmentRec.TermName = termRec.Name
                                            assessmentRec.SubjectName = subjRec.Name
                                            assessmentRec.AssessmentName = assessmentRec.Name
                                            assessmentRec.CustomAssessmentName = ""
                                            assessmentRec.Key = assessmentRec.TermName + "^_^" + assessmentRec.SubjectName + "^_^" + assessmentRec.AssessmentName + "^_^" + assessmentRec.CustomAssessmentName;

                                            assessmentRec.Editable = false;
                                            //if (assessmentRec.TeacherSequence == courseRec.MySequence) {
                                            //    assessmentRec.Editable = true;
                                            //}
                                            if (assessmentRec.TeacherSequence == courseRec.MySequence && termRec.InputEndTimeDate >= new Date() && termRec.InputStartTimeDate <= new Date()) {
                                                assessmentRec.Editable = true;
                                            }
                                            if (assessmentRec.Type == 'Score') {
                                                assessmentRec.Range = { Max: 100, Min: 0 };
                                            }
                                            if (assessmentRec.Type == "Indicator") {
                                                assessmentRec.Indicators = assessmentRec.Indicators || { Indicator: [] };
                                                //assessmentRec.Indicators.Indicator = ['a', 'b', 'c'].concat(assessmentRec.Indicators.Indicator || []);
                                            }
                                        });
                                    });
                                });
                            });
                            if (jumpCourse)
                                $scope.setCurrentCourse(jumpCourse, jumpTerm, jumpSubject, jumpAssessment);
                            else if ($scope.courseList.length > 0)
                                $scope.setCurrentCourse($scope.courseList[0]);
                            else {
                                $scope.haveNoCourse = true;
                            }
                        });
                    }
                }
            });

            $scope.setCurrentCourse = function (course, term, subject, assessment) {
                if ($scope.courseList.indexOf(course) >= 0) {
                    $scope.studentList = null;
                    if ($scope.current)
                        $scope.current.Course = course;
                    else {
                        $scope.current = {
                            //清單
                            Course: course
                            , Term: null
                            , Subject: null
                            , Assessment: null
                            , AssessmentMode: ""//"ReportCard" || "CustomAssessment"
                            //輸入
                            , Student: null
                            , AssessmentItem: null
                            , Value: null
                        };
                    }

                    if (term)
                        $scope.setCurrentTerm(term, subject, assessment);
                    else {
                        var jumpTerm;
                        if ($scope.current.Term) {
                            course.Term.forEach(function (termRec) {
                                if (termRec.Name == $scope.current.Term.Name)
                                    jumpTerm = termRec;
                            });
                        }
                        $scope.setCurrentTerm(jumpTerm || course.Term[0]);
                    }



                    $scope.connection.send({
                        service: "gradebook.GetStudentScore",
                        autoRetry: true,
                        body: { CourseID: course.CourseID },
                        result: function (response, error, http) {
                            if (error) {
                                alert("gradebook.GetStudentScore Error");
                            } else {
                                $scope.$apply(function () {
                                    response.Student = [].concat(response.Student || []);
                                    response.Student.forEach(function (stuRec, index) {
                                        stuRec.index = index;
                                        stuRec.AssessmentScore = [].concat(stuRec.AssessmentScore || []);
                                        stuRec.AssessmentScore.forEach(function (assessmentRec) {
                                            var key = assessmentRec.TermName + "^_^" + assessmentRec.SubjectName + "^_^" + assessmentRec.AssessmentName + "^_^" + assessmentRec.CustomAssessmentName;
                                            stuRec["Val_" + key] = assessmentRec.Value;
                                            stuRec["Origin_" + key] = assessmentRec.Value;
                                        });
                                    });
                                    $scope.studentList = response.Student;
                                    $scope.setCurrent($scope.studentList[0], null, true, true);
                                    $scope.calc();
                                });

                                $scope.connection.send({
                                    service: "DS.Base.Connect",
                                    autoRetry: true,
                                    body: { RequestSessionID: "" },
                                    result: function (response, error, http) {
                                        if (error) {

                                        } else {
                                            $scope.$apply(function () {
                                                $scope.studentList.forEach(function (stuRec) {
                                                    stuRec.PhotoUrl = $scope.connection.getAccessPoint() + "/gradebook.GetStudentPhoto?stt=Session&sessionid=" + response.SessionID + "&parser=spliter&content=StudentID:" + stuRec.StudentID;
                                                });
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            };

            $scope.setCurrentTerm = function (term, subject, assessment) {
                if ($scope.current.Course.Term.indexOf(term) >= 0) {
                    $scope.current.Term = term;
                    if (subject)
                        $scope.setCurrentSubject(subject, assessment);
                    else {
                        var jumpSubject;
                        if ($scope.current.Subject) {
                            term.Subject.forEach(function (subjRec) {
                                if (subjRec.Name == $scope.current.Subject.Name)
                                    jumpSubject = subjRec;
                            });
                        }
                        $scope.setCurrentSubject(jumpSubject || term.Subject[0]);
                    }
                }
            };

            $scope.setCurrentSubject = function (subject, assessment) {
                if ($scope.current.Term.Subject.indexOf(subject) >= 0) {
                    $scope.current.Subject = subject;
                    if (assessment && subject.Assessment.indexOf(assessment) >= 0)
                        $scope.setAssessment("CustomAssessment", assessment);
                    else {
                        var jumpAssessment;
                        if ($scope.current.Assessment) {
                            subject.Assessment.forEach(function (assRec) {
                                if (assRec.TeacherSequence == $scope.current.Course.MySequence && assRec.Name == $scope.current.Assessment.Name)
                                    jumpAssessment = assRec;
                            });
                        }
                        if (jumpAssessment)
                            $scope.setAssessment("CustomAssessment", jumpAssessment);
                        else
                            $scope.setAssessment("ReportCard");
                    }
                }
            };

            $scope.setAssessment = function (mode, assessment) {
                if (mode == "ReportCard") {
                    $scope.current.Assessment = null;
                    $scope.current.AssessmentMode = "ReportCard";
                    var assessmentAvg = {
                        Name: "Avg."
                        , Key: $scope.current.Term.Name + "^_^" + $scope.current.Subject.Name + "^_^Avg.^_^"
                        , Type: "Program"
                        , Editable: false
                        , Percentage: 0
                        , Calc: function () {
                            [].concat($scope.studentList || []).forEach(function (stuRec) {
                                var totalWeight = 0;
                                var weightSum = 0;
                                $scope.AssessmentItem.forEach(function (assessmentRec) {
                                    if (assessmentRec != assessmentAvg) {
                                        var weight = Number(assessmentRec.Weight);
                                        var score = Number(stuRec["Val_" + assessmentRec.Key]);
                                        if (weight && score) {
                                            totalWeight += weight;
                                            weightSum += score * weight;
                                        }
                                    }
                                });
                                if (totalWeight) {
                                    stuRec["Val_" + assessmentAvg.Key] = stuRec["Origin_" + assessmentAvg.Key] = Math.round(100 * weightSum / (totalWeight || 1)) / 100;
                                }
                                else {
                                    delete stuRec["Val_" + assessmentAvg.Key];
                                    delete stuRec["Origin_" + assessmentAvg.Key];
                                }
                            });
                        }
                    }
                    $scope.AssessmentItem = [assessmentAvg].concat($scope.current.Subject.Assessment || []);
                    if ($scope.studentList) {
                        $scope.AssessmentItem.forEach(function (assessmentItem) {
                            $scope.studentList.forEach(function (stuRec) {
                                stuRec["Val_" + assessmentItem.Key] = stuRec["Origin_" + assessmentItem.Key];
                            });
                        });
                    }
                    while ($scope.AssessmentItem.length < 8) {
                        $scope.AssessmentItem.push({});
                    }
                    if ($scope.current.AssessmentItem && $scope.current.Subject.Assessment.indexOf($scope.current.AssessmentItem) > 0)
                        $scope.setCurrent(null, $scope.current.AssessmentItem, true, true);
                    else {
                        var index = 0;
                        [].concat($scope.AssessmentItem || []).forEach(function (item, i) {
                            if (!index && item.Editable)
                                index = i;
                        });
                        $scope.setCurrent(null, $scope.AssessmentItem[index], true, true);
                    }
                    $scope.calc();
                }
                if (mode == "CustomAssessment" && $scope.current.Subject.Assessment.indexOf(assessment) >= 0 && assessment.TeacherSequence == $scope.current.Course.MySequence) {
                    $scope.current.Assessment = assessment;
                    $scope.current.AssessmentMode = "CustomAssessment";
                    $scope.AssessmentItem = [];
                    while ($scope.AssessmentItem.length < 8) {
                        $scope.AssessmentItem.push({});
                    }

                    $scope.connection.send({
                        service: "gradebook.GetCustomAssessment",
                        autoRetry: true,
                        body: {
                            CourseID: $scope.current.Course.CourseID
                            , TermName: $scope.current.Term.Name
                            , SubjectName: $scope.current.Subject.Name
                            , AssessmentName: $scope.current.Assessment.Name
                        },
                        result: function (response, error, http) {
                            if (error) {
                                alert("gradebook.GetCustomAssessment Error");
                            } else {
                                $scope.$apply(function () {
                                    var assessmentAvg = {
                                        TermName: $scope.current.Term.Name
                                        , SubjectName: $scope.current.Subject.Name
                                        , AssessmentName: $scope.current.Assessment.Name
                                        , CustomAssessmentName: "Avg."
                                        , Type: "Program"
                                        , Editable: false
                                        , Percentage: 0
                                        , Calc: function () {
                                            [].concat($scope.studentList || []).forEach(function (stuRec) {
                                                var totalWeight = 0;
                                                var weightSum = 0;
                                                $scope.AssessmentItem.forEach(function (assessmentRec) {
                                                    if (assessmentRec != assessmentAvg) {
                                                        var weight = Number(assessmentRec.Weight);
                                                        var score = Number(stuRec["Val_" + assessmentRec.Key]);
                                                        if (weight && score) {
                                                            totalWeight += weight;
                                                            weightSum += score * weight;
                                                        }
                                                    }
                                                });
                                                if (totalWeight) {
                                                    stuRec["Val_" + assessmentAvg.Key] = stuRec["Origin_" + assessmentAvg.Key] = Math.round(100 * weightSum / (totalWeight || 1)) / 100;
                                                }
                                                else {
                                                    delete stuRec["Val_" + assessmentAvg.Key];
                                                    delete stuRec["Origin_" + assessmentAvg.Key];
                                                }
                                            });
                                        }
                                    }

                                    assessment.CustomAssessmen = [assessmentAvg].concat(response.CustomAssessmentItem || []);
                                    var totalWeight = 0;
                                    assessment.CustomAssessmen.forEach(function (assessmentRec) {
                                        var weight = Number(assessmentRec.Weight);
                                        if (weight || weight == 0) {
                                            totalWeight += weight;
                                        }
                                    });
                                    assessment.CustomAssessmen.forEach(function (assessmentRec) {
                                        assessmentRec.Name = assessmentRec.CustomAssessmentName;
                                        assessmentRec.Key = assessmentRec.TermName + "^_^" + assessmentRec.SubjectName + "^_^" + assessmentRec.AssessmentName + "^_^" + assessmentRec.CustomAssessmentName;
                                        if (assessmentRec.Type != "Program")
                                            assessmentRec.Editable = true;
                                        var weight = Number(assessmentRec.Weight);
                                        if (weight || weight == 0) {
                                            assessmentRec.Percentage = Math.round(10000 * weight / (totalWeight || 1)) / 100;
                                        }
                                    });
                                    $scope.AssessmentItem = [].concat(assessment.CustomAssessmen || []);
                                    if ($scope.studentList) {
                                        $scope.AssessmentItem.forEach(function (assessmentItem) {
                                            $scope.studentList.forEach(function (stuRec) {
                                                stuRec["Val_" + assessmentItem.Key] = stuRec["Origin_" + assessmentItem.Key];
                                            });
                                        });
                                    }
                                    while ($scope.AssessmentItem.length < 8) {
                                        $scope.AssessmentItem.push({});
                                    }
                                    var jumpAssessmentItem = null
                                    if ($scope.current.AssessmentItem) {
                                        $scope.AssessmentItem.forEach(function (assessmentItem) {
                                            if (assessmentItem.Key == $scope.current.AssessmentItem.Key)
                                                jumpAssessmentItem = assessmentItem;
                                        });
                                    }
                                    if (jumpAssessmentItem)
                                        $scope.setCurrent(null, jumpAssessmentItem, true, true);
                                    else {
                                        var index = 0;
                                        [].concat($scope.AssessmentItem || []).forEach(function (item, i) {
                                            if (!index && item.Editable)
                                                index = i;
                                        });
                                        $scope.setCurrent(null, $scope.AssessmentItem[index], true, true);
                                    }

                                    $scope.calc();
                                });
                            }
                        }
                    });
                }
            };

            $scope.calcCustomAssessment = function (assessment) {
                if ($scope.current.Subject.Assessment.indexOf(assessment) >= 0 && assessment.TeacherSequence == $scope.current.Course.MySequence) {

                    $scope.connection.send({
                        service: "gradebook.GetCustomAssessment",
                        autoRetry: true,
                        body: {
                            CourseID: $scope.current.Course.CourseID
                            , TermName: $scope.current.Term.Name
                            , SubjectName: $scope.current.Subject.Name
                            , AssessmentName: assessment.Name
                        },
                        result: function (response, error, http) {
                            if (error) {
                                alert("gradebook.GetCustomAssessment Error");
                            } else {
                                $scope.$apply(function () {
                                    var totalWeight = 0;
                                    [].concat($scope.studentList || []).forEach(function (stuRec) {
                                        var totalWeight = 0;
                                        var weightSum = 0;
                                        [].concat(response.CustomAssessmentItem || []).forEach(function (assessmentRec) {
                                            assessmentRec.Key = assessmentRec.TermName + "^_^" + assessmentRec.SubjectName + "^_^" + assessmentRec.AssessmentName + "^_^" + assessmentRec.CustomAssessmentName;
                                            var weight = Number(assessmentRec.Weight);
                                            var score = Number(stuRec["Origin_" + assessmentRec.Key]);
                                            if (weight && score) {
                                                totalWeight += weight;
                                                weightSum += score * weight;
                                            }
                                        });
                                        if (totalWeight) {
                                            stuRec["Val_" + assessment.Key] = Math.round(100 * weightSum / (totalWeight || 1)) / 100;
                                        }
                                    });
                                });
                            }
                        }
                    });

                }
            }

            $scope.copyView = function () {
                $("#viewTable").show();
                var range = document.createRange();
                var sel = window.getSelection();
                sel.removeAllRanges();
                try {
                    try {
                        range.selectNodeContents($("#viewTable")[0]);
                        sel.addRange(range);
                    } catch (e) {
                        range.selectNode($("#viewTable")[0]);
                        sel.addRange(range);
                    }
                    document.execCommand("Copy");
                }
                catch (exc) {
                    alert("Browser not support!!");
                }
                finally {
                    $("#viewTable").hide();
                    alert("The table is copied, you can parse to Excel now.");
                }
            }

            $scope.showImport = function (assessmentRec) {
                var importProcess = {
                    Name: 'Import ' + assessmentRec.Name,
                    Parse: function () {
                        importProcess.ParseString = importProcess.ParseString || '';
                        // 2017/11/30穎驊註解，由於Excel 格子內文字若輸入" 其複製到 Web 後，會變成"" ，在此將其移除，避免後續的儲存處理問題
                        //var text_trimmed = importProcess.ParseString.replace('""', '')
                        var text_trimmed = importProcess.ParseString.replace(/""/g, "");
                        function CSVtoArray(text) {
                            //var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
                            var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:\n|$)/g;

                            // 本案不需要驗證
                            // Return NULL if input string is not well formed CSV string.
                            //if (!re_valid.test(text)) return null;

                            var a = [];                     // Initialize array to receive values.
                            text.replace(re_value, // "Walk" the string using replace with callback.
                                function (m0, m1, m2, m3) {
                                    // Remove backslash from \' in single quoted values.
                                    if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
                                    // Remove backslash from \" in double quoted values.
                                    else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
                                    else if (m3 !== undefined) {
                                        var list_1 = [];

                                        list_1 = m3.split("\n")

                                        list_1.forEach(function (text, index) {

                                            a.push(text);
                                        });
                                    }
                                    return ''; // Return empty string.
                                });
                            // Handle special case of empty last value.
                            if (/,\s*$/.test(text)) a.push('');
                            return a;
                        };
                        importProcess.ParseValues = CSVtoArray(text_trimmed);
                        importProcess.HasError = false;
                        for (var i = 0; i < importProcess.ParseValues.length; i++) {
                            var flag = false;
                            if (assessmentRec.Type == 'Score') {
                                var temp = Number(importProcess.ParseValues[i]);
                                if (!isNaN(temp)
                                    && (!$scope.current.AssessmentItem.Range || (!$scope.current.AssessmentItem.Range.Max && $scope.current.AssessmentItem.Range.Max !== 0) || temp <= $scope.current.AssessmentItem.Range.Max)
                                    && (!$scope.current.AssessmentItem.Range || (!$scope.current.AssessmentItem.Range.Min && $scope.current.AssessmentItem.Range.Min !== 0) || temp >= $scope.current.AssessmentItem.Range.Min)) {
                                    flag = true;
                                    var round = Math.pow(10, $scope.params.DefaultRound);
                                    temp = Math.round(temp * round) / round;
                                }
                                // 使用者若知道其學生沒有資料，請在其欄位內輸入 - ，程式碼會將其填上空值 
                                if (importProcess.ParseValues[i] == '-') {
                                    flag = true;
                                    importProcess.ParseValues[i] = '';
                                }
                                if (flag) {
                                    if (!isNaN(temp) && importProcess.ParseValues[i] != '') {
                                        importProcess.ParseValues[i] = temp;
                                    }
                                }
                                else {
                                    importProcess.ParseValues[i] = '錯誤';
                                    importProcess.HasError = true;
                                }
                            }
                            else if (assessmentRec.Type == 'Indicator') {
                                assessmentRec.Indicators.Indicator.forEach(function (val) {
                                    if (val.Name.toLowerCase() == importProcess.ParseValues[i].replace(/^\s+|\s+$/g, '').toLowerCase()) {
                                        importProcess.ParseValues[i] = val.Name;
                                        flag = true;
                                    }
                                });
                                if (flag) {
                                }
                                else {
                                    importProcess.ParseValues[i] = '錯誤';
                                    importProcess.HasError = true;
                                }
                            }
                            else {
                                flag = true;
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
                                stuRec['Val_' + assessmentRec.Key] = '';
                            else
                                stuRec['Val_' + assessmentRec.Key] = importProcess.ParseValues[index];
                        });

                        $scope.calc();
                        $('#importModal').modal('hide');
                    }
                };

                $scope.importProcess = importProcess;
                $('#importModal').modal('show');
            };

            $scope.setCurrent = function (stuRec, assessmentItem, setCondition, setFocus) {
                if ($scope.studentList && $scope.studentList.indexOf(stuRec) >= 0) {
                    $("#stuPhoto").attr("src","");
                    $scope.current.Student = stuRec;
                }
                if ($scope.AssessmentItem && $scope.AssessmentItem.indexOf(assessmentItem) >= 0)
                    $scope.current.AssessmentItem = assessmentItem;
                if ($scope.current.Student && $scope.current.AssessmentItem)
                    $scope.current.Value = $scope.current.Student['Val_' + $scope.current.AssessmentItem.Key];
                else
                    $scope.current.Value = "";
                if (setFocus) {
                    $('.pg-grade-textbox:visible').focus()
                    $timeout(function () {
                        $('.pg-grade-textbox:visible').select();
                    }, 1);
                }
            };

            $scope.goPrev = function () {
                var currentIndex = $scope.current.Student ? $scope.current.Student.index : 0;
                $scope.setCurrent(
                    (currentIndex == 0) ?
                        $scope.studentList[$scope.studentList.length - 1] :
                        $scope.studentList[currentIndex - 1]
                    , null
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
                    , null
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
                if ($scope.current.AssessmentItem.Type == 'Score') {
                    var temp = Number($scope.current.Value);
                    if (!isNaN(temp)
                        && (!$scope.current.AssessmentItem.Range || (!$scope.current.AssessmentItem.Range.Max && $scope.current.AssessmentItem.Range.Max !== 0) || temp <= $scope.current.AssessmentItem.Range.Max)
                        && (!$scope.current.AssessmentItem.Range || (!$scope.current.AssessmentItem.Range.Min && $scope.current.AssessmentItem.Range.Min !== 0) || temp >= $scope.current.AssessmentItem.Range.Min)) {
                        flag = true;
                        var round = Math.pow(10, $scope.params.DefaultRound);
                        temp = Math.round(temp * round) / round;
                    }
                    if ($scope.current.Value == "")
                        flag = true;
                    if (flag) {
                        if ($scope.current.Value != "" && $scope.current.Value != "缺")
                            $scope.current.Value = temp;
                    }
                }
                else if ($scope.current.AssessmentItem.Type == 'Indicator') {
                    $scope.current.AssessmentItem.Indicators.Indicator.forEach(function (val) {
                        if (val.Name.toLowerCase() == $scope.current.Value.replace(/^\s+|\s+$/g, '').toLowerCase()) {
                            $scope.current.Value = val.Name;
                            flag = true;
                        }
                    });
                }
                else {
                    flag = true;
                }
                if (flag) {
                    $scope.submitGrade();
                }
            }

            $scope.selectValue = function (val) {
                $scope.current.Value = val;
                setTimeout(function () { $scope.submitGrade(); }, 300);
            };

            $scope.submitGrade = function (matchNext) {
                $scope.current.Student["Val_" + $scope.current.AssessmentItem.Key] = $scope.current.Value;
                $scope.calc();
                $scope.goNext();
            };

            $scope.calc = function () {
                var list = [].concat($scope.AssessmentItem || []).reverse();
                list.forEach(function (assessmentItem) {
                    if (assessmentItem.Type == "Program") {
                        assessmentItem.Calc();
                    }
                });
            };

            $scope.save = function () {
                var body = {
                    CourseID: $scope.current.Course.CourseID
                    , AssessmentScore: []
                };
                $scope.AssessmentItem.forEach(function (assessmentItem) {
                    if (assessmentItem.Editable) {
                        $scope.studentList.forEach(function (stuRec) {
                            body.AssessmentScore.push({
                                StudentID: stuRec.StudentID
                                , TermName: assessmentItem.TermName
                                , SubjectName: assessmentItem.SubjectName
                                , AssessmentName: assessmentItem.AssessmentName
                                , CustomAssessmentName: assessmentItem.CustomAssessmentName
                                , Value: stuRec["Val_" + assessmentItem.Key]
                            });
                        });
                    }
                });


                $scope.connection.send({
                    service: "gradebook.SetStudentScore",
                    autoRetry: true,
                    body: body,
                    result: function (response, error, http) {
                        if (error) {
                            alert("gradebook.SetStudentScore Error");
                        } else {
                            $scope.$apply(function () {
                                $scope.setCurrentCourse($scope.current.Course);
                            });
                        }
                    }
                });
            };

            $scope.calcAssessmentAvg = function (assessmentRec) {
                if (assessmentRec.Type == "Score" || assessmentRec.Type == "Program") {
                    var sum = 0;
                    var count = 0;
                    [].concat($scope.studentList || []).forEach(function (stuRec) {
                        var value = Number(stuRec["Val_" + assessmentRec.Key]);
                        if (value || stuRec["Val_" + assessmentRec.Key] === "0" || stuRec["Val_" + assessmentRec.Key] === 0) {
                            count++;
                            sum += value;
                        }
                    });
                    return (Math.round(100 * sum / (count || 1)) / 100) || "";
                }
                else
                    return "";
            };

            $scope.countAssessmentRange = function (assessmentRec, min, max) {
                if (assessmentRec.Type == "Score" || assessmentRec.Type == "Program") {
                    var count = 0;
                    [].concat($scope.studentList || []).forEach(function (stuRec) {
                        var value = Number(stuRec["Val_" + assessmentRec.Key]);
                        if (value || stuRec["Val_" + assessmentRec.Key] === "0" || stuRec["Val_" + assessmentRec.Key] === 0) {
                            if (min && max) {
                                if (min <= value && value < max)
                                    count++;
                            }
                            else if (min) {
                                if (min <= value) count++;
                            }
                            else if (max) {
                                if (value < max)
                                    count++;
                            }
                        }
                    });
                    return count || "";
                }
                else
                    return "";
            };

            $scope.showCustomAssessmentConfig = function () {
                $scope.current.ConfigCustomAssessmentItem = [];
                $scope.AssessmentItem.forEach(function (item) {
                    if (item.Name && item.Type != "Program")
                        $scope.current.ConfigCustomAssessmentItem.push(angular.copy(item));
                });
                $scope.current.ConfigCustomAssessmentItem.DeleteItem = function (item) {
                    var index = $scope.current.ConfigCustomAssessmentItem.indexOf(item);
                    if (index > -1) {
                        $scope.current.ConfigCustomAssessmentItem.splice(index, 1);
                    }
                };
                $scope.current.ConfigCustomAssessmentItem.AddItem = function () {
                    $scope.current.ConfigCustomAssessmentItem.push({
                        Name: ""
                        , Date: "" + (new Date().getFullYear()) + "/" + (new Date().getMonth()) + "/" + (new Date().getDate())
                        , Weight: "100"
                        , Limit: "100"
                        , Description: ""
                    });
                }
                $('#customAssessmentConfigModal').modal('show');
            };

            $scope.saveCustomAssessmentConfig = function () {
                var body = {
                    CourseID: $scope.current.Course.CourseID
                    , TermName: $scope.current.Term.Name
                    , SubjectName: $scope.current.Subject.Name
                    , AssessmentName: $scope.current.Assessment.Name
                    , CustomAssessment: []
                };
                $scope.current.ConfigCustomAssessmentItem.forEach(function (item) {
                    if (item.Name) {
                        body.CustomAssessment.push({
                            CustomAssessmentName: item.Name
                            , Date: item.Date
                            , Description: item.Description
                            , Type: "Score"
                            , Weight: item.Weight
                            , Limit: item.Limit
                        });
                    }
                });


                $scope.connection.send({
                    service: "gradebook.SetCustomAssessment",
                    autoRetry: true,
                    body: body,
                    result: function (response, error, http) {
                        if (error) {
                            alert("gradebook.SetCustomAssessment Error");
                        } else {
                            $scope.$apply(function () {
                                $('#customAssessmentConfigModal').modal('hide');
                                $scope.setAssessment("CustomAssessment", $scope.current.Assessment);
                            });
                        }
                    }
                });
            }

            $scope.checkChange = function (next) {
                if (!$scope.checkAllTable()) {
                    return window.confirm("Changes will be lost without saving.");
                }
                else {
                    return true;
                }
            }

            gadget.onLeave(function () {
                var data_changed = !$scope.checkAllTable();

                if (data_changed) {
                    return "Changes will be lost without saving.";
                }
                else {
                    return "";
                }

            });

            $scope.checkAllTable = function () {
                var pass = true;
                [].concat($scope.AssessmentItem || []).forEach(function (assessmentItem) {
                    if (pass) {
                        [].concat($scope.studentList || []).forEach(function (stuRec) {
                            pass = pass && !!$scope.checkOneCell(stuRec, assessmentItem.Key);
                        });
                    }
                });
                return pass;
            }

            $scope.checkOneCell = function (studentRec, key) {
                return (studentRec['Origin_' + key] == studentRec['Val_' + key]);
            }
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
    }).directive('fallbackSrc', function () {
        var fallbackSrc = {
            link: function postLink(scope, iElement, iAttrs) {
                iElement.bind('error', function () {
                    angular.element(this).attr("src", iAttrs.fallbackSrc);
                });
            }
        }
        return fallbackSrc;
    });;
