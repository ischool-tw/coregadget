var gradebookModule = angular.module('gradebook', ['ui.sortable', 'mgcrea.ngStrap.helpers.dimensions', 'mgcrea.ngStrap.helpers.debounce', 'pascalprecht.translate']);

var mainCtrl = gradebookModule.controller('MainCtrl',
    function ($scope, $timeout, $translate) {
    
    (function () {
        var $scope長這個樣子 = {
            current: {
                Application: "",
                GroupID: "",
                GroupName: "",
                SelectMode: "No.",
                SelectSeatNo: "",
                Value: "",
                Student: {
                    Final: "",
                    Midterm: "89",
                    SeatNo: "5",
                    StudentName: "凱澤",
                    StudentId: "3597"
                },
                Exam: {
                    Name: 'Midterm',
                    Range: {
                        Max: 100,
                        Min: 0
                    }
                },
                ExamOrder: [],
                VisibleExam: []
            },
            studentList: [
                {
                    StudentId: "3597",
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
            },
            isMobile: true,
            modal: {
                target: "editCol"
            }
        };
    });
    
    
    $scope.current = {
        Application: groupInfo.application,
        GroupID: groupInfo.groupId,
        GroupName: '',
        SelectMode: "Seq.",
        SelectSeatNo: "",
        Value: "",
        Student: null,
        Exam: null
    };
    
    $translate.uses(window.lang);
    //$scope.language = window.lang;
    //$scope.setlang = "ChineseTraditional";
    //if ($scope.setlang == "ChineseSimplified")
    //    $scope.language = "zh-CN";
    //else if ($scope.setlang == "English")
    //    $scope.language = "en-US";
    //else {
    //    if ((navigator.language || navigator.browserLanguage).toLowerCase() == "zh-cn") {
    //        $scope.language = "zh-CN";
    //        $scope.setlang = "ChineseSimplified";
    //    }
    //    if ((navigator.language || navigator.browserLanguage).toLowerCase().substr(0, 2) == "en") {
    //        $scope.language = "en-US";
    //        $scope.setlang = "English";
    //    }
    ////}
    //$translate.uses($scope.language);
    
    //$scope.click_cht = function () { $scope.language = "zh-TW"; $translate.uses("zh-TW"); $scope.setlang = "ChineseTraditional"; }
    //$scope.click_chs = function () { $scope.language = "zh-CN"; $translate.uses("zh-CN"); $scope.setlang = "ChineseSimplified"; }
    //$scope.click_eng = function () { $scope.language = "en-US"; $translate.uses("en-US"); $scope.setlang = "English"; }
    
    
    $scope.getScoreValue = function (examItem, student) {
        if ($scope.scores)
            return ($scope.scores[examItem._id + "." + student.StudentId] || {}).Value
        else
            return;
    }
    
    $scope.showModal = function (target, index) {
        if (!!!$scope.modal) {
            $scope.modal = {};
            $scope.modal.target = target;
            $scope.modal.index = index;
            $('#modal').modal('show').on('shown.bs.modal', function (e) {
                $('#modal input:visible:first').focus().select();
            });
        }
        else {
            $scope.modal.target = target;
            $scope.modal.index = index;
            $('#modal').modal('show');
        }
        $scope.$broadcast('showModal', { target: target, index: index });
    }
    
    //$scope.calc = function () {
    //    $scope.examList.forEach(function (examItem) {
    //        if (examItem.Permission == "Editor" && !examItem.Lock && examItem.Type == "Program") {
    //            //eval("(function(){return 10;})")();
    //            $scope.studentList.forEach(function (std) {
    //                var param = "";
    //                for (var i = 0; i < $scope.examList.length; i++) {
    //                    var e = $scope.examList[i];
    //                    if (e.Type !== "Program") {
    //                        if (e.Type == "Number") {
    //                            if (angular.isNumber(scores[e._id + "." + std.StudentId].Value)) {
    //                                param += "var " + e.Name + "=" + JSON.stringify(scores[e._id + "." + std.StudentId].Value) + ";\n";
    //                            }
    //                        }
    //                        else {
    //                            param += "var " + e.Name + "=" + JSON.stringify(scores[e._id + "." + std.StudentId].Value) + ";\n";
    //                        }
    //                    }
    //                }
    //                //try {
    //                //    std[examItem.Name] = eval("(function(){" + param + " return " + examItem.Fn + ";})")();
    //                //}
    //                //catch (exc) {
    //                //    std[examItem.Name] = null;
    //                //}
    //            });
    //        }
    //    });
    //}
    
    $scope.setCurrent = function (student, exam, setCondition, setFocus) {
        $scope.current.Exam = exam;
        $scope.current.Student = student;
        
        var val = $scope.getScoreValue(exam, student);
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
        $scope.$broadcast('setCurrent', { student: student, exam: exam });
    }
    
    $scope.isMobile = navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/gi) ? true : false;
    
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
    
    
    $scope.getOwnerName = function (examItem) {
        return "";
    }
    
    $scope.setupCurrent = function () {
        if ($scope.studentList && $scope.examList && $scope.current.ExamOrder) {
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
                    $scope.showModal('editCol');
                }
                    //#endregion
            }
            else {
                var ts = $scope.current.Student,
                    te;
                if (ts) {
                    $scope.studentList.forEach(function (s) {
                        if (s.StudentId == ts.StudentId)
                            ts = s;
                    });
                }
                else if ($scope.studentList && $scope.studentList.length > 0) {
                    ts = $scope.studentList[0];
                }
                
                if ($scope.current.Exam) {
                    var currentExamName = $scope.current.Exam.Name;
                    $scope.examList.forEach(function (e) {
                        if (currentExamName == e.Name)
                            te = e;
                    });
                }
                if (!te) {
                    $scope.examList.forEach(function (e) {
                        if (!te && !e.Lock && e.Permission == "Editor")
                            te = e;
                    });
                }
                $scope.setCurrent(ts, te, true, true);
            }
            //$scope.setupCurrent = function () { };
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
    
    $scope.socket = io('/');
    if ($scope.socket.socket.connected) {
        $scope.socket.emit('require', {
            name: 'setup.group.teacher',
            body: window.groupInfo
        });
    }
    $scope.socket.on('connect', function () {
        $scope.socket.emit('require', {
            name: 'setup.group.teacher',
            body: window.groupInfo
        });
    });
        
    $scope.socket.on('group.teacher.members', function (data) {
        $scope.$apply(function () {
            $scope.current.GroupName = data.GroupName;
            $scope.studentList = data.Student;
            $scope.setupCurrent();

        });
    });
    $scope.socket.on('group.teacher.exams', function (data) {
        $scope.$apply(function () {
            $scope.examList = [].concat(data || []);
            $scope.sortExamList();
        });
    });
    $scope.socket.on('group.teacher.config', function (data) {
        $scope.$apply(function () {
            if (data) {
                $scope.current.SelectMode = data.SelectMode || "Seq.";
                $scope.current.ExamOrder = data.ExamOrder || [];
                $scope.current.VisibleExam = data.VisibleExam || [];
            }
            else {
                $scope.current.ExamOrder = [];
                $scope.current.VisibleExam = [];
            }
            $scope.sortExamList();
        });
    });
    $scope.socket.on('exam.scores', function (scores) {
        $scope.$apply(function () {
            $scope.scores = $scope.scores || {};
            scores.forEach(function (score) {
                $scope.scores[score.ExamID + "." + score.StudentID] = score;
            });
        });
    });
//#endregion
//#endregion

}
)
.config(function ($translateProvider) {
    $translateProvider.preferredLanguage('zh-TW');
    $translateProvider.useLoader('asyncLoaderLang');
})
.directive('dTranslation', function ($compile) {
    return function (scope, elem, attrs) {
        //getting a list of space-separated property names from the attribute.
        var translate = attrs.dTranslation || '',
            translate_value = attrs.dTranslationvalue || '',
            html = '<span>';
        
        //append a bunch of bound values from the list.
        html += '{{' + translate + '| translate' + ((translate_value) ? ':' + translate_value : '') + '}}';
        
        html += '</span>';
        
        //create an angular element. (this is our "view")
        var el = angular.element(html),
            compiled = $compile(el); //compile the view into a function.
        
        //append our view to the element of the directive.
        elem.append(el);
        
        //bind our view to the scope!
        //(try commenting out this line to see what happens!)
        compiled(scope);
    };
})
.factory('asyncLoaderLang', function ($q, $http) {
    return function (options) {
        var deferred = $q.defer(),
            translations,
            lang,
            url;
        
        lang = options.key || 'zh-TW';
        url = '/lang/teacher/' + options.key + '.json';
        
        $http({ method: 'GET', url: url }).
            success(function (data, status, headers, config) {
            translations = data;
            if (window.custom_lang_txt && window.custom_lang_txt[lang]) {
                $.each(window.custom_lang_txt[lang], function (idx, item) {
                    data[idx] = item;
                })
            }
            deferred.resolve(translations);
        });
        
        return deferred.promise;
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
