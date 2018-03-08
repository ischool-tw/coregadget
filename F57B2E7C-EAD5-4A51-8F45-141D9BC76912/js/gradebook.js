angular.module('gradebook', ['ui.sortable', 'mgcrea.ngStrap.helpers.dimensions', 'mgcrea.ngStrap.helpers.debounce'])

    .controller('MainCtrl', ['$scope', '$timeout',
        function ($scope, $timeout) {
            var $scope長這個樣子 = {
                current: {
                    currentCourse:{
                        Name:"8A英文",
                        TermList: ["Language Art", "Science"]
                    },
                    currentTerm: {
                        Name: "期中考",
                        Ratio: "25%",
                        SubjectList: ["Language Art","Science"]

                    },
                    currentSubject: {
                        Name: "Language Art",
                        AssessmentList: ["In - Class Score", "Reading Project", "Grammar Exam"]

                    },
                    currentAssessment: {

                    },
                    currentStudent: {

                    },
                    SelectMode: "No.",
                    SelectSeatNo: "",
                    Value: "",
                    Student: {
                        SeatNo: "5",
                        StudentName: "凱澤",
                        StudentID: "3597",
                        StudentScoreTag: "成績身分:一般生"
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
                CourseList: [
                    {
                        CourseID: "3597",
                        CourseName: "8A英文",
                        TeacherRole:"教師一"
                                                                                                
                    },
                    {
                        CourseID: "3598",
                        CourseName: "8B 英文",
                        TeacherRole: "教師二"

                    }
                ],
                TermList: [
                    {
                        TermID: "1",
                        TermName: "mid-Term",
                        RefCourseID: "3597",
                        TermRatio: 35,
                        InputStartTime: "2018/3/1 00:00",
                        InputEndTime:"2018/3/31 23:59",

                    },
                    {
                        TermID: "2",
                        TermName: "fianl-Term",
                        RefCourseID: "3597",
                        TermRatio: 35,
                        InputStartTime: "2018/3/1 00:00",
                        InputEndTime: "2018/3/31 23:59",

                    },
                    
                ],
                SubjectList: [
                    {
                        SubjectID: "1",
                        SubjectName: "Language Art",
                        RefTermID: "1",
                        SubjectRatio: 50

                    },
                    {
                        SubjectID: "2",
                        SubjectName: "Science",
                        RefTermID: "1",
                        SubjectRatio: 50

                    },
                    
                ],
                AssessmentList: [
                    {
                        AssessmentID: "1",
                        AssessmentName: "In-Class Score",
                        RefSubjectID:"1",
                        AllowInputTeacherRole:"教師一",
                        AssessmentRatio: 50,
                        AllowCostumSubItems: true,
                        InputType:"Score"

                    },
                    {
                        AssessmentID: "2",
                        AssessmentName: "Reading Project",
                        RefSubjectID: "1",
                        AllowInputTeacherRole: "教師一",
                        AssessmentRatio: 50,
                        AllowCostumSubItems: true,
                        InputType: "Score"

                    },
                    {
                        AssessmentID: "3",
                        AssessmentName: "Homework Completion",
                        RefSubjectID: "1",
                        AllowInputTeacherRole: "教師一",
                        AssessmentRatio: 0,
                        AllowCostumSubItems: false,
                        InputType: "Indicator"

                    },
                    {
                        AssessmentID: "4",
                        AssessmentName: "Comment",
                        RefSubjectID: "1",
                        AllowInputTeacherRole: "教師一",
                        AssessmentRatio: 0,
                        AllowCostumSubItems: false,
                        InputType: "Text"
                    },

                ],
                CostumSubItemList: [
                    {
                        SubItemID: "1",
                        SubItemName: "HomeWork1",
                        RefAssessmentID:"1",
                        Date: "2018/3/12",
                        Limit: "100",
                        Description:"學生平時作業的紀錄",
                        CostumSubItemRatio:50
                    },
                    {
                        SubItemID: "2",
                        SubItemName: "HomeWork2",
                        RefAssessmentID: "1",
                        Date: "2018/3/12",
                        Limit: "100",
                        Description: "學生平時作業的紀錄",
                        CostumSubItemRatio: 50
                    },


                ],

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

                }],
                haveNoCourse: true
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
