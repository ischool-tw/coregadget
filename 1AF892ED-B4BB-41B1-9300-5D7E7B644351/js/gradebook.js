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
                    StudentID: "3597"
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
            analytics: {
                Type: "Number || Enum",
                Target: {
                    Name: 'Midterm',
                    Type: 'Number'
                }
            }
        };

        $scope.showCreateModal = function (index) {
            if (index || index == 0) {
                $('#myList').removeClass('fade').modal('hide').addClass('fade');
            }
            if (index == undefined) {
                $scope.createItem = {
                    Name: '',
                    Type: 'Number',
                    Lock: false,
                    Access: {
                        Teacher: "None",
                        Student: "None",
                        Parent: "None"
                    }
                }
            }
            else {
                //$scope.createItem = {
                //    Name: '',
                //    Type: 'Number',
                //    Lock: false,
                //    targetIndex: index
                //}
                //for (var k in $scope.examList[index]) {
                //    if (k !== "$$hashKey") {
                //        $scope.createItem[k] = $scope.examList[index][k];
                //    }
                //}
                $scope.createItem = angular.copy($scope.examList[index]);

                $scope.createItem.Name = $scope.createItem.Name || '';
                $scope.createItem.Type = $scope.createItem.Type || 'Number';
                $scope.createItem.Lock = $scope.createItem.Lock || false;
                $scope.createItem.targetIndex = index;
                if (!$scope.createItem.Access) {
                    $scope.createItem.Access = {
                        Teacher: "None",
                        Student: "None",
                        Parent: "None"
                    };
                }
            }
            delete $scope.errMsg;
            $('#createModal').modal('show');

            $timeout(function () {
                $('#newColName:visible').focus().select();
            }, 200);
        }

        $scope.showManageModal = function () {
            $('#myList').modal('show').on('hide.bs.modal', function (e) {
                if ($scope.current.ExamOrder && $scope.current.VisibleExam) {
                    var newOrder = [];
                    var oldOrder = $scope.current.ExamOrder;
                    $scope.examList.forEach(function (examItem) {
                        newOrder.push(examItem.Name);
                        var index = oldOrder.indexOf(examItem.Name);
                        if (index >= 0)
                            oldOrder.splice(index, 1);
                    });
                    $scope.current.ExamOrder = newOrder.concat(oldOrder);

                    $.ajax({
                        url: "../api/private/put/config",
                        contentType: "application/json; charset=utf-8",
                        dataType: 'json',
                        type: 'put',
                        data: JSON.stringify({
                            ExamOrder: $scope.current.ExamOrder,
                            VisibleExam: $scope.current.VisibleExam
                        }),
                        success: function (data) {
                            if (data.status !== "success") alert(JSON.stringify(data));
                            //$scope.getExam();
                        }
                    });
                }
            });
        }

        $scope.lockExam = function (index, lock) {
            $scope.examList[index].Lock = lock;

            var data = angular.copy($scope.examList[index]);
            //var data = {};
            //for (var k in $scope.examList[index]) {
            //    if (k !== "$$hashKey") {
            //        data[k] = $scope.examList[index][k];
            //    }
            //}
            $.ajax({
                url: "../api/private/put/exam",
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                type: 'put',
                data: JSON.stringify(data),
                success: function (data) {
                    if (data.status !== "success") alert(JSON.stringify(data));
                }
            });
        }

        $scope.showExam = function (examItem) {
            if ($scope.current && $scope.current.VisibleExam && $scope.current.VisibleExam.indexOf(examItem.Name) < 0)
                $scope.current.VisibleExam.push(examItem.Name);
        }

        $scope.hideExam = function (examItem) {
            if ($scope.current && $scope.current.VisibleExam && $scope.current.VisibleExam.indexOf(examItem.Name) >= 0)
                $scope.current.VisibleExam.splice($scope.current.VisibleExam.indexOf(examItem.Name), 1);
            if ($scope.current.Exam == examItem)
                $scope.current.Exam = null;
        }

        $scope.saveExamItem = function () {
            if ($scope.createItem.Name === '') {
                $scope.errMsg = '名稱不可空白';
                return;
            }

            var flag = false;
            angular.forEach($scope.examList, function (item, index) {
                if (item.Name === $scope.createItem.Name && index !== $scope.createItem.targetIndex)
                    flag = true; //判斷重複
            });
            if (flag) {
                $scope.errMsg = '名稱不可重複';
                return;
            }

            if ($scope.createItem.Type === 'Enum') {
                if ($scope.createItem.Option.length === 0) return;
                var temp = false;
                angular.forEach($scope.createItem.Option, function (item) {
                    if (item.Label === '')
                        temp = true;
                });

                if (temp) {
                    $scope.errMsg = '選項不可為空白';
                    return;
                }
            }
            if ($scope.createItem.targetIndex == undefined) {
                $scope.examList.push($scope.createItem);
                var ex = angular.copy($scope.createItem);
                //var ex = {};
                //for (var k in $scope.createItem) {
                //    if (k !== "$$hashKey") {
                //        ex[k] = $scope.createItem[k];
                //    }
                //}
                $.ajax({
                    url: "../api/private/post/exam",
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    type: 'post',
                    data: JSON.stringify(ex),
                    success: function (data) {
                        if (data.status !== "success") alert(JSON.stringify(data));
                        $scope.getExam();
                    }
                });
            }
            else {
                if ($scope.examList[$scope.createItem.targetIndex].Name !== $scope.createItem.Name) {
                    deleteItem = $scope.examList[$scope.createItem.targetIndex];
                    $scope.studentList.forEach(function (st) {
                        st[$scope.createItem.Name] = st[$scope.examList[$scope.createItem.targetIndex].Name];
                        delete st[$scope.examList[$scope.createItem.targetIndex].Name];
                    })
                }
                $scope.examList[$scope.createItem.targetIndex] = $scope.createItem;
                delete $scope.createItem.targetIndex;

                var data = angular.copy($scope.createItem);
                //var data = {};
                //for (var k in $scope.createItem) {
                //    if (k !== "$$hashKey") {
                //        data[k] = $scope.createItem[k];
                //    }
                //}
                $.ajax({
                    url: "../api/private/put/exam",
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    type: 'put',
                    data: JSON.stringify(data),
                    success: function (data) {
                        if (data.status !== "success") alert(JSON.stringify(data));
                    }
                });
            }
            $('#createModal').modal('hide');
            if ($scope.createItem.Type == "Program")
                $scope.calc();


            var ts = ($scope.current.Student || ($scope.studentList && $scope.studentList.length > 0) ? $scope.studentList[0] : null)
                , te = $scope.createItem;
            if (ts && te) {
                $scope.setCurrent(ts, te, true, true);
            }
            if ($scope.current.ExamOrder.indexOf($scope.createItem.Name) < 0)
                $scope.current.ExamOrder.push($scope.createItem.Name);
            if ($scope.current.VisibleExam.indexOf($scope.createItem.Name) < 0)
                $scope.current.VisibleExam.push($scope.createItem.Name);

            $.ajax({
                url: "../api/private/put/config",
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                type: 'put',
                data: JSON.stringify({
                    ExamOrder: $scope.current.ExamOrder,
                    VisibleExam: $scope.current.VisibleExam
                }),
                success: function (data) {
                    if (data.status !== "success") alert(JSON.stringify(data));
                    //$scope.getExam();
                }
            });
        }

        $scope.deleteExamItem = function () {
            if (window.confirm("確定要刪除？")) {
                $.ajax({
                    url: "../api/private/delete/exam/id/" + $scope.examList[$scope.createItem.targetIndex]._id,
                    type: 'delete',
                    success: function (data) {
                        if (JSON.parse(data).status !== "success") alert(JSON.stringify(data));
                        $scope.getExam();
                    }
                });
                if ($scope.current.Exam == $scope.examList[$scope.createItem.targetIndex])
                    $scope.current.Exam = null;
                $scope.examList.splice($scope.createItem.targetIndex, 1);
            }
        }

        $scope.calc = function () {
            [].concat($scope.examList).reverse().forEach(function (examItem) {
                if (examItem.Permission == "Editor" && !!!examItem.Lock && examItem.Type == "Program") {
                    $scope.studentList.forEach(function (stuRec) {
                        examItem.Fn(stuRec);
                    });
                    ////eval("(function(){return 10;})")();
                    //$scope.studentList.forEach(function (std) {
                    //    var param = "";
                    //    for (var i = 0; i < $scope.examList.length; i++) {
                    //        var e = $scope.examList[i];
                    //        if (e.Type !== "Program") {
                    //            if (e.Type == "Number") {
                    //                if (angular.isNumber(std[e.Name])) {
                    //                    //this[e.Name] = std[e.Name];
                    //                    param += "var " + e.Name + "=" + JSON.stringify(std[e.Name]) + ";\n";
                    //                }
                    //            }
                    //            else {
                    //                //this[e.Name] = std[e.Name];
                    //                param += "var " + e.Name + "=" + JSON.stringify(std[e.Name]) + ";\n";
                    //            }
                    //        }
                    //    }
                    //    try {
                    //        std[examItem.Name] = eval("(function(){" + param + " return " + examItem.Fn + ";})")();
                    //    }
                    //    catch (exc) {
                    //        std[examItem.Name] = null;
                    //    }
                    //});
                }
            });
        }

        $scope.changeSelectMode = function (mode) {
            $scope.current.SelectMode = mode;
            $timeout(function () {
                $('.pg-seatno-textbox:visible').select().focus();
            }, 1);
            $.ajax({
                url: "../api/private/put/config",
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                type: 'put',
                data: JSON.stringify({
                    SelectMode: $scope.current.SelectMode,
                }),
                success: function (data) {
                    if (data.status !== "success") alert(JSON.stringify(data));
                    //$scope.getExam();
                }
            });
        }

        $scope.setCurrent = function (student, exam, setCondition, setFocus) {
            $scope.current.Exam = exam;
            $scope.current.Student = student;

            if (exam) $scope.setAnalytics(exam);

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
            if (event && (event.keyCode !== 13 || $scope.isMobile)) return;
            //if (event.keyCode !== 13) return; // 13是enter按鈕的代碼，return是跳出
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
                if (temp != NaN
                    && (!$scope.current.Exam.Range || (!$scope.current.Exam.Range.Max && $scope.current.Exam.Range.Max !== 0) || temp <= $scope.current.Exam.Range.Max)
                    && (!$scope.current.Exam.Range || (!$scope.current.Exam.Range.Min && $scope.current.Exam.Range.Min !== 0) || temp >= $scope.current.Exam.Range.Min))
                    flag = true;
                if (flag) {
                    if ($scope.current.Value != "")
                        $scope.current.Value = temp;
                }
            }
            else {
                flag = true;
            }
            if (flag) {
                $scope.saveGrade();
            }
        }

        $scope.selectValue = function (val) {
            $scope.current.Value = val;
            $scope.saveGrade();
        }

        $scope.saveGrade = function (matchNext) {

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

            //var updateValue = [];
            //angular.forEach($scope.studentList, function (st) {
            //    if (storageDataIndex[st.StudentID]) {
            //        var hasChanged = false;
            //        for (var key in angular.copy(st)) {
            //            if (key !== "index"
            //                && key !== "SeatNo"
            //                && key !== "StudentName"
            //                && key !== "$$hashKey"
            //                && key !== "selected"
            //                && (storageDataIndex[st.StudentID][key] === 0 ? 0 : (storageDataIndex[st.StudentID][key] || '')) !== (st[key] === 0 ? 0 : (st[key] || ''))
            //                ) {
            //                hasChanged = true;
            //                storageDataIndex[st.StudentID][key] = st[key];
            //            }
            //        }
            //        if (hasChanged) {
            //            updateValue.push(storageDataIndex[st.StudentID]);
            //        }
            //    }
            //    //else {
            //    //    storageData.push(st);
            //    //    storageDataIndex[st.StudentID] = st;
            //    //}
            //});
            //if (updateValue.length > 0) {
            //    $.ajax({
            //        url: "../api/private/put/score",
            //        contentType: "application/json; charset=utf-8",
            //        dataType: 'json',
            //        type: 'put',
            //        data: JSON.stringify(updateValue),
            //        success: function (data) {
            //            if (data.status !== "success") alert(JSON.stringify(data));
            //        }
            //    });
            //}
            ////window.localStorage[application + '/' + groupId + '/studentList'] = JSON.stringify(storageData);
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
                body: body,
                result: function (response, error, http) {

                    if (error) {
                        alert("TeacherAccess.SetCourseExamScoreWithExtension Error");
                    } else {
                        alert("儲存完成。");
                    }
                }
            });
        }

        $scope.isMobile = navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/gi) ? true : false;
        //alert($scope.isMobile)
        $scope.toggleCreateItemType = function (type) {
            $scope.createItem.Type = type;
            if (type === 'Number') {
                //$scope.createItem.Range = {
                //    Max: '100',
                //    Min: '0'
                //}
            } else if (type === 'Enum') {
                $scope.createItem.Option = [{
                    Label: 'A'
                }, {
                    Label: 'B'
                }, {
                    Label: 'C'
                }, {
                    Label: 'D'
                }];
            }
        }

        $scope.addOptionItem = function () {
            $scope.createItem.Option.push({
                Label: ''
            });
            $('.pg-newoption:last-of-type').focus();
            $timeout(function () {
                $('.pg-newoption:last-of-type').select();
            }, 1);
        }

        $scope.removeOptionItem = function (index) {
            $scope.createItem.Option.splice(index, 1);
        }

        $scope.numberValue = function (examItem) {
            if (examItem.Type == 'Number') return true;
            var allNumber = true;
            $scope.studentList.forEach(function (st) {
                if (st[examItem.Name] && !angular.isNumber(st[examItem.Name])) {
                    allNumber = false;
                }
            });
            return allNumber;
        }

        $scope.countRange = function (examItem, max, min) {
            if (!angular.isNumber(max))
                max = Number.MAX_VALUE;
            if (!angular.isNumber(min))
                min = (0 - Number.MAX_VALUE);
            var count = 0;
            $scope.studentList.forEach(function (st) {
                if (angular.isNumber(st[examItem.Name]) && st[examItem.Name] >= min && st[examItem.Name] < max)
                    count++;
            });
            return count;
        }

        $scope.getMax = function (examItem) {
            var result = null;
            $scope.studentList.forEach(function (st) {
                if (angular.isNumber(st[examItem.Name]) && (result == null || st[examItem.Name] > result)) {
                    result = st[examItem.Name];
                }
            });
            return result;
        }

        $scope.getMin = function (examItem) {
            var result = null;
            $scope.studentList.forEach(function (st) {
                if (angular.isNumber(st[examItem.Name]) && (result == null || st[examItem.Name] < result)) {
                    result = st[examItem.Name];
                }
            });
            return result;
        }

        $scope.getAvg = function (examItem) {
            var powseed = 3;
            $scope.studentList.forEach(function (st) {
                try {
                    var seed = ('' + st[examItem.Name]).split('.')[1].length;
                    if (seed > powseed)
                        powseed = seed;
                }
                catch (exc) { }
            });
            powseed = Math.pow(10, powseed);
            var powsum = 0;
            var count = 0;
            $scope.studentList.forEach(function (st) {
                if (angular.isNumber(st[examItem.Name])) {
                    powsum += st[examItem.Name] * powseed;
                    count++;
                }
            });
            if (count > 0)
                return Math.round(powsum / count) / powseed;
            else
                return null;
        }

        $scope.countValue = function (examItem, option) {
            var result = null;
            $scope.studentList.forEach(function (st) {
                if (st[examItem.Name] == option) {
                    if (result == null)
                        result = 1;
                    else
                        result++;
                }
            });
            return result;
        }

        $scope.setAnalytics = function (examItem) {
            if ($scope.numberValue(examItem)) {
                $scope.analytics = {
                    Type: "Number",
                    Target: examItem

                }
            }
            if (examItem.Type == 'Enum') {
                $scope.analytics = {
                    Type: "Enum",
                    Target: examItem
                }
            }
        }

        $scope.filterPermission = function (examItem) {
            return (examItem.Permission == "Read" || examItem.Permission == "Editor") && ($scope.current.VisibleExam && $scope.current.VisibleExam.indexOf(examItem.Name) >= 0);
        }

        //$scope.orderByExamOrder = function (examItem) {
        //    if ($scope.current.ExamOrder) {
        //        var index = $scope.current.ExamOrder.indexOf(examItem.Name);
        //        if (index < 0)
        //            return $scope.examList.length - 1;
        //        else {
        //            return index;
        //        }
        //    }
        //    else {
        //        return $scope.examList.length - 1;
        //    }
        //}

        $scope.sortableOptions = {
            activate: function () {
                //console.log("activate");
            },
            beforeStop: function () {
                //console.log("beforeStop");
            },
            change: function () {
                //console.log("change");
            },
            create: function () {
                //console.log("create");
            },
            deactivate: function () {
                //console.log("deactivate");
            },
            out: function () {
                //console.log("out");
            },
            over: function () {
                //console.log("over");
            },
            receive: function () {
                //console.log("receive");
            },
            remove: function () {
                //console.log("remove");
            },
            sort: function () {
                //console.log("sort");
            },
            start: function () {
                //console.log("start");
            },
            update: function (e, ui) {
                //console.log("update");

                //var logEntry = tmpList.map(function (i) {
                //    return i.value;
                //}).join(', ');
                //$scope.sortingLog.push('Update: ' + logEntry);
            },
            stop: function (e, ui) {
                //console.log("stop");

                //// this callback has the changed model
                //var logEntry = tmpList.map(function (i) {
                //    return i.value;
                //}).join(', ');
                //$scope.sortingLog.push('Stop: ' + logEntry);

                $scope.examList.forEach(function (examItem) {
                    console.log(examItem.Name);
                });
            }
        };

        $scope.getOwnerName = function (examItem) {
            return "";
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

        $scope.sortExamList = function () {
            if ($scope.current.ExamOrder && $scope.examList) {
                var orignOrder = [].concat($scope.examList);
                $scope.examList.sort(function (e1, e2) {
                    var i1 = $scope.current.ExamOrder.indexOf(e1.Name);
                    var i2 = $scope.current.ExamOrder.indexOf(e2.Name);
                    if (i1 == i2) {
                        return orignOrder.indexOf(e1) - orignOrder.indexOf(e2);
                    }
                    else {
                        if (i1 < 0) i1 = orignOrder.length + $scope.current.ExamOrder.length + orignOrder.indexOf(e1);
                        if (i2 < 0) i2 = orignOrder.length + $scope.current.ExamOrder.length + orignOrder.indexOf(e2);

                        return i1 - i2;
                    }
                });
                $scope.setupCurrent();
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

        $scope.setCurrentCourse = function (course) {
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


                //if (examRec.Name != '平時成績') {
                //    var parent = examRec;
                //    parent.SubExamList = [];
                //    [
                //        { ExamID: parent.ExamID + "_" + '讀卡', Name: parent.Name + '-' + '讀卡', SubName: '讀卡', Type: 'Number', Permission: 'Read', Group: parent },
                //        { ExamID: parent.ExamID + "_" + '試卷', Name: parent.Name + '-' + '試卷', SubName: '試卷', Type: 'Number', Permission: 'Editor', Group: parent }
                //    ].forEach(function (subExamRec) {
                //        parent.SubExamList.push(subExamRec);
                //        $scope.examList.push(subExamRec);
                //        $scope.current.VisibleExam.push(subExamRec.Name);
                //    });
                //}
                //else {
                //    var parent = examRec;
                //    parent.SubExamList = [];
                //    [
                //        { ExamID: parent.ExamID + "_" + '1', Name: parent.Name + '-' + '1', SubName: '1', Type: 'Number', Permission: 'Editor', Group: parent },
                //        { ExamID: parent.ExamID + "_" + '2', Name: parent.Name + '-' + '2', SubName: '2', Type: 'Number', Permission: 'Editor', Group: parent },
                //        { ExamID: parent.ExamID + "_" + '3', Name: parent.Name + '-' + '3', SubName: '3', Type: 'Number', Permission: 'Editor', Group: parent },
                //        { ExamID: parent.ExamID + "_" + '4', Name: parent.Name + '-' + '4', SubName: '4', Type: 'Number', Permission: 'Editor', Group: parent },
                //        { ExamID: parent.ExamID + "_" + '5', Name: parent.Name + '-' + '5', SubName: '5', Type: 'Number', Permission: 'Editor', Group: parent },
                //        { ExamID: parent.ExamID + "_" + '6', Name: parent.Name + '-' + '6', SubName: '6', Type: 'Number', Permission: 'Editor', Group: parent },
                //        { ExamID: parent.ExamID + "_" + '7', Name: parent.Name + '-' + '7', SubName: '7', Type: 'Number', Permission: 'Editor', Group: parent },
                //        { ExamID: parent.ExamID + "_" + '8', Name: parent.Name + '-' + '8', SubName: '8', Type: 'Number', Permission: 'Editor', Group: parent },
                //        { ExamID: parent.ExamID + "_" + '9', Name: parent.Name + '-' + '9', SubName: '9', Type: 'Number', Permission: 'Editor', Group: parent }
                //    ].forEach(function (subExamRec) {
                //        parent.SubExamList.push(subExamRec);
                //        $scope.examList.push(subExamRec);
                //        $scope.current.VisibleExam.push(subExamRec.Name);
                //    });
                //}
            });
            var finalScore = { ExamID: '學期成績', Name: '學期成績', Type: 'Number', Permission: 'Editor', Lock: true };
            var finalScorePreview = {
                ExamID: '學期成績_試算',
                Name: '學期成績_試算',
                SubName: '試算',
                Type: 'Program',
                Permission: 'Editor',
                Lock: false,
                Group: finalScore,
                Fn: function (stu) {
                    var total = 0, base = 0, seed = 100;
                    [].concat(course.Scores.Score || []).forEach(function (examRec, index) {
                        var p = Number(examRec.Percentage) || 0;
                        var s = stu["Exam" + examRec.ExamID];
                        if (stu["Exam" + examRec.ExamID]) {
                            total += seed * p * Number(stu["Exam" + examRec.ExamID]);
                            base += p;
                        }
                    });
                    if (base)
                        stu["Exam" + finalScorePreview.ExamID] = Math.floor(total / base) / seed;
                }
            };
            finalScore.SubExamList = [finalScorePreview];

            $scope.examList.splice(0, 0, finalScore, finalScorePreview);
            $scope.current.VisibleExam.push('學期成績', '學期成績_試算');
            $scope.current.ExamOrder.push('學期成績', '學期成績_試算');


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
                                                    examRec.SubExamList.forEach(function (subExamRec) {
                                                        if (stu["Exam" + subExamRec.ExamID]) {
                                                            hasVal = true;
                                                            sum += Number(stu["Exam" + subExamRec.ExamID] || 0);
                                                        }
                                                    });
                                                    stu["Exam" + examRec.ExamID] = hasVal ? sum : '';
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
                                            studentRec.index = index;
                                            $scope.examList.forEach(function (examRec) {
                                                studentRec["Exam" + examRec.ExamID] = '';
                                            });
                                            $scope.studentList.push(studentRec);
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
                                                        studentMapping[examScoreRec.StudentID]["Exam" + examScoreRec.ExamID] = examScoreRec.Score;

                                                        $scope.examList.forEach(function (examRec) {
                                                            if (examRec.ExamID == examScoreRec.ExamID) {
                                                                [].concat(examRec.SubExamList || []).forEach(function (subExamRec) {
                                                                    if (subExamRec.ExtName && examScoreRec.Extension.Extension[subExamRec.ExtName]) {
                                                                        studentMapping[examScoreRec.StudentID]["Exam" + subExamRec.ExamID] = examScoreRec.Extension.Extension[subExamRec.ExtName];
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    });
                                                    $scope.setupCurrent();
                                                });
                                            }
                                        }
                                    });

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
                                                        studentMapping[finalScoreRec.StudentID]["Exam" + finalScore.ExamID] = finalScoreRec.Score;
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
