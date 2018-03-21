angular.module('gradebook', ['ui.sortable', 'mgcrea.ngStrap.helpers.dimensions', 'mgcrea.ngStrap.helpers.debounce'])

    .controller('MainCtrl', ['$scope', '$timeout',
        function ($scope, $timeout) {
            var $scope長這個樣子 = {
                current: {
                    currentCourse: {
                        Name: "8A英文",
                        TermList: ["Language Art", "Science"]
                    },
                    currentTerm: {
                        Name: "期中考",
                        Ratio: "25%",
                        SubjectList: ["Language Art", "Science"]

                    },
                    currentSubject: {
                        Name: "Language Art",
                        AssessmentList: ["In - Class Score", "Reading Project", "Grammar Exam"]

                    },
                    currentAssessment: {

                    },
                    currentFilterItem: {
                        currentCourseName: "Choose Course",
                        currentTermName: "Choose Term",
                        currentSubjectName: "Choose Subject"
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
                        Exam_template_ID: "1234",
                        TeacherRole: "教師一",
                        TermList: [
                            {
                                TermID: "1",
                                TermName: "mid-Term",
                                RefCourseID: "3597",
                                TermRatio: 35,
                                InputStartTime: "2018/3/1 00:00",
                                InputEndTime: "2018/3/31 23:59",
                                Lock: false,
                                SubjectList: [
                                    {
                                        SubjectID: "1",
                                        SubjectName: "Language Art",
                                        RefTermID: "1",
                                        SubjectRatio: 50,
                                        AssessmentList: [
                                            {
                                                AssessmentID: "1",
                                                AssessmentName: "In-Class Score",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 50,
                                                AllowCostumSubItems: true,
                                                InputType: "Score"

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

                                        ]


                                    },
                                    {
                                        SubjectID: "2",
                                        SubjectName: "Science",
                                        RefTermID: "1",
                                        SubjectRatio: 50,
                                        AssessmentList: [
                                            {
                                                AssessmentID: "1",
                                                AssessmentName: "In-Class Score",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 50,
                                                AllowCostumSubItems: true,
                                                InputType: "Score",
                                                CostumSubItemList: [
                                                    {
                                                        SubItemID: "1",
                                                        SubItemName: "HomeWork1",
                                                        RefAssessmentID: "1",
                                                        Date: "2018/3/12",
                                                        Limit: "100",
                                                        Description: "學生平時作業的紀錄",
                                                        CostumSubItemRatio: 50
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


                                                ]

                                            },
                                            {
                                                AssessmentID: "2",
                                                AssessmentName: "Reading Project",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 50,
                                                AllowCostumSubItems: true,
                                                InputType: "Score",
                                                CostumSubItemList: [
                                                    {
                                                        SubItemID: "1",
                                                        SubItemName: "HomeWork1",
                                                        RefAssessmentID: "1",
                                                        Date: "2018/3/12",
                                                        Limit: "100",
                                                        Description: "學生平時作業的紀錄",
                                                        CostumSubItemRatio: 50
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


                                                ]

                                            },
                                            {
                                                AssessmentID: "3",
                                                AssessmentName: "Homework Completion",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 0,
                                                AllowCostumSubItems: false,
                                                InputType: "Indicator",
                                                CostumSubItemList: []

                                            },
                                            {
                                                AssessmentID: "4",
                                                AssessmentName: "Comment",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 0,
                                                AllowCostumSubItems: false,
                                                InputType: "Text",
                                                CostumSubItemList: []
                                            },

                                        ]

                                    },

                                ]

                            },
                            {
                                TermID: "2",
                                TermName: "final-Term",
                                RefCourseID: "3597",
                                TermRatio: 35,
                                InputStartTime: "2018/3/1 00:00",
                                InputEndTime: "2018/3/31 23:59",
                                Lock: false,
                                SubjectList: [
                                    {
                                        SubjectID: "1",
                                        SubjectName: "Language Art",
                                        RefTermID: "1",
                                        SubjectRatio: 50,
                                        AssessmentList: [
                                            {
                                                AssessmentID: "1",
                                                AssessmentName: "In-Class Score",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 50,
                                                AllowCostumSubItems: true,
                                                InputType: "Score",
                                                CostumSubItemList: []

                                            },
                                            {
                                                AssessmentID: "2",
                                                AssessmentName: "Reading Project",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 50,
                                                AllowCostumSubItems: true,
                                                InputType: "Score",
                                                CostumSubItemList: []

                                            },
                                            {
                                                AssessmentID: "3",
                                                AssessmentName: "Homework Completion",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 0,
                                                AllowCostumSubItems: false,
                                                InputType: "Indicator",
                                                CostumSubItemList: []

                                            },
                                            {
                                                AssessmentID: "4",
                                                AssessmentName: "Comment",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 0,
                                                AllowCostumSubItems: false,
                                                InputType: "Text",
                                                CostumSubItemList: []
                                            },

                                        ]


                                    },
                                    {
                                        SubjectID: "2",
                                        SubjectName: "Science",
                                        RefTermID: "1",
                                        SubjectRatio: 50,
                                        AssessmentList: [
                                            {
                                                AssessmentID: "1",
                                                AssessmentName: "In-Class Score",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 50,
                                                AllowCostumSubItems: true,
                                                InputType: "Score",
                                                CostumSubItemList: [
                                                    {
                                                        SubItemID: "1",
                                                        SubItemName: "HomeWork1",
                                                        RefAssessmentID: "1",
                                                        Date: "2018/3/12",
                                                        Limit: "100",
                                                        Description: "學生平時作業的紀錄",
                                                        CostumSubItemRatio: 50
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


                                                ]

                                            },
                                            {
                                                AssessmentID: "2",
                                                AssessmentName: "Reading Project",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 50,
                                                AllowCostumSubItems: true,
                                                InputType: "Score",
                                                CostumSubItemList: [
                                                    {
                                                        SubItemID: "1",
                                                        SubItemName: "HomeWork1",
                                                        RefAssessmentID: "1",
                                                        Date: "2018/3/12",
                                                        Limit: "100",
                                                        Description: "學生平時作業的紀錄",
                                                        CostumSubItemRatio: 50
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


                                                ]

                                            },
                                            {
                                                AssessmentID: "3",
                                                AssessmentName: "Homework Completion",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 0,
                                                AllowCostumSubItems: false,
                                                InputType: "Indicator",
                                                CostumSubItemList: []

                                            },
                                            {
                                                AssessmentID: "4",
                                                AssessmentName: "Comment",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 0,
                                                AllowCostumSubItems: false,
                                                InputType: "Text",
                                                CostumSubItemList: []
                                            },

                                        ]

                                    },

                                ]

                            },

                        ],
                        StudentList: [
                            {
                                StudentID: "1",
                                StudentChineseName: "王一明",
                                StudentEnglishName: "John Wang1",
                                StudentNumber: "30101",
                                StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                                ClassName: "301",
                                SeatNo: "1",
                                index: 1,
                                Scores: [
                                    {
                                        ScoreID: "1_mid-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "1_mid-Term_Language Art_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "1_mid-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "1_mid-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "1_mid-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "1_mid-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "1_final-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "1_mid-Term_Science_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "1_final-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "1_final-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "1_final-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "1_final-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    }
                                ]
                            },
                            {
                                StudentID: "2",
                                StudentChineseName: "王二明",
                                StudentEnglishName: "John Wang2",
                                StudentNumber: "30102",
                                StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                                ClassName: "301",
                                SeatNo: "2",
                                index: 2,
                                Scores: [
                                    {
                                        ScoreID: "2_mid-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "2_mid-Term_Language Art_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "2_mid-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "2_mid-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "2_mid-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "2_mid-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "2_final-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "2_mid-Term_Science_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "2_final-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "2_final-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "2_final-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "2_final-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    }
                                ]
                            },
                            {
                                StudentID: "3",
                                StudentChineseName: "王三明",
                                StudentEnglishName: "John Wang3",
                                StudentNumber: "30103",
                                StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                                ClassName: "301",
                                SeatNo: "3",
                                index: 3,
                                Scores: [
                                    {
                                        ScoreID: "3_mid-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "3_mid-Term_Language Art_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "3_mid-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "3_mid-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "3_mid-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "3_mid-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "3_final-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "3_mid-Term_Science_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "3_final-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "3_final-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "3_final-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "3_final-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    }
                                ]
                            },
                            {
                                StudentID: "4",
                                StudentChineseName: "王四明",
                                StudentEnglishName: "John Wang4",
                                StudentNumber: "30104",
                                StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                                ClassName: "301",
                                SeatNo: "4",
                                index: 4,
                                Scores: [
                                    {
                                        ScoreID: "4_mid-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "4_mid-Term_Language Art_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "4_mid-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "4_mid-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "4_mid-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "4_mid-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "4_final-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "4_mid-Term_Science_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "4_final-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "4_final-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "4_final-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "4_final-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    }
                                ]
                            },
                            {
                                StudentID: "5",
                                StudentChineseName: "王五明",
                                StudentEnglishName: "John Wang5",
                                StudentNumber: "30105",
                                StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                                ClassName: "301",
                                SeatNo: "5",
                                index: 5,
                                Scores: [
                                    {
                                        ScoreID: "5_mid-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "5_mid-Term_Language Art_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "5_mid-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "5_mid-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "5_mid-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "5_mid-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "5_final-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "5_mid-Term_Science_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "5_final-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "5_final-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "5_final-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "5_final-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    }
                                ]
                            },
                            {
                                StudentID: "6",
                                StudentChineseName: "王六明",
                                StudentEnglishName: "John Wang6",
                                StudentNumber: "30106",
                                StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                                ClassName: "301",
                                SeatNo: "6",
                                index: 6,
                                Scores: [
                                    {
                                        ScoreID: "6_mid-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "6_mid-Term_Language Art_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "6_mid-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "6_mid-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "6_mid-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "6_mid-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "6_final-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "6_mid-Term_Science_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "6_final-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "6_final-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "6_final-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "6_final-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    }
                                ]
                            },
                            {
                                StudentID: "7",
                                StudentChineseName: "王七明",
                                StudentEnglishName: "John Wang7",
                                StudentNumber: "30107",
                                StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                                ClassName: "301",
                                SeatNo: "7",
                                index: 7,
                                Scores: [
                                    {
                                        ScoreID: "7_mid-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "7_mid-Term_Language Art_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "7_mid-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "7_mid-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "7_mid-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "7_mid-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "7_final-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "7_mid-Term_Science_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "7_final-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "7_final-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "7_final-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "7_final-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    }
                                ]
                            },
                            {
                                StudentID: "8",
                                StudentChineseName: "王八明",
                                StudentEnglishName: "John Wang8",
                                StudentNumber: "30108",
                                StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                                ClassName: "301",
                                SeatNo: "8",
                                index: 8,
                                Scores: [
                                    {
                                        ScoreID: "8_mid-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "8_mid-Term_Language Art_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "8_mid-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "8_mid-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "8_mid-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "8_mid-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "8_final-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "8_mid-Term_Science_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "8_final-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "8_final-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "8_final-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "8_final-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    }
                                ]
                            },
                            {
                                StudentID: "9",
                                StudentChineseName: "王九明",
                                StudentEnglishName: "John Wang9",
                                StudentNumber: "30109",
                                StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                                ClassName: "301",
                                SeatNo: "9",
                                index: 9,
                                Scores: [
                                    {
                                        ScoreID: "9_mid-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "9_mid-Term_Language Art_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "9_mid-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "9_mid-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "9_mid-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "9_mid-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "9_final-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "9_mid-Term_Science_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "9_final-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "9_final-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "9_final-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "9_final-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    }
                                ]
                            },
                            {
                                StudentID: "10",
                                StudentChineseName: "王十明",
                                StudentEnglishName: "John Wang10",
                                StudentNumber: "30110",
                                StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                                ClassName: "301",
                                SeatNo: "10",
                                index: 10,
                                Scores: [
                                    {
                                        ScoreID: "10_mid-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "10_mid-Term_Language Art_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "10_mid-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "10_mid-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "10_mid-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "10_mid-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "10_final-Term_Language Art_Reading Project_",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "10_mid-Term_Science_In-Class Score_",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                ScoreID: "10_final-Term_Language Art_In-Class Score_HW1",
                                                Score: "86"
                                            },
                                            {
                                                ScoreID: "10_final-Term_Language Art_In-Class Score_HW2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        ScoreID: "10_final-Term_Language Art_Homework Completion_",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        ScoreID: "10_final-Term_Language Art_Comment_",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    }
                                ]
                            }
                        ]

                    },
                    {
                        CourseID: "3598",
                        CourseName: "8B 英文",
                        TeacherRole: "教師二",
                        TermList: [
                            {
                                TermID: "1",
                                TermName: "mid-Term",
                                RefCourseID: "3597",
                                TermRatio: 35,
                                InputStartTime: "2018/3/1 00:00",
                                InputEndTime: "2018/3/31 23:59",
                                Lock: false,
                                SubjectList: [
                                    {
                                        SubjectID: "1",
                                        SubjectName: "Language Art",
                                        RefTermID: "1",
                                        SubjectRatio: 50,
                                        AssessmentList: [
                                            {
                                                AssessmentID: "1",
                                                AssessmentName: "In-Class Score",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 50,
                                                AllowCostumSubItems: true,
                                                InputType: "Score"

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

                                        ]


                                    },
                                    {
                                        SubjectID: "2",
                                        SubjectName: "Science",
                                        RefTermID: "1",
                                        SubjectRatio: 50,
                                        AssessmentList: [
                                            {
                                                AssessmentID: "1",
                                                AssessmentName: "In-Class Score",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 50,
                                                AllowCostumSubItems: true,
                                                InputType: "Score",
                                                CostumSubItemList: [
                                                    {
                                                        SubItemID: "1",
                                                        SubItemName: "HomeWork1",
                                                        RefAssessmentID: "1",
                                                        Date: "2018/3/12",
                                                        Limit: "100",
                                                        Description: "學生平時作業的紀錄",
                                                        CostumSubItemRatio: 50
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


                                                ]

                                            },
                                            {
                                                AssessmentID: "2",
                                                AssessmentName: "Reading Project",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 50,
                                                AllowCostumSubItems: true,
                                                InputType: "Score",
                                                CostumSubItemList: [
                                                    {
                                                        SubItemID: "1",
                                                        SubItemName: "HomeWork1",
                                                        RefAssessmentID: "1",
                                                        Date: "2018/3/12",
                                                        Limit: "100",
                                                        Description: "學生平時作業的紀錄",
                                                        CostumSubItemRatio: 50
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


                                                ]

                                            },
                                            {
                                                AssessmentID: "3",
                                                AssessmentName: "Homework Completion",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 0,
                                                AllowCostumSubItems: false,
                                                InputType: "Indicator",
                                                CostumSubItemList: []

                                            },
                                            {
                                                AssessmentID: "4",
                                                AssessmentName: "Comment",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 0,
                                                AllowCostumSubItems: false,
                                                InputType: "Text",
                                                CostumSubItemList: []
                                            },

                                        ]

                                    },

                                ]

                            },
                            {
                                TermID: "2",
                                TermName: "fianl-Term",
                                RefCourseID: "3597",
                                TermRatio: 35,
                                InputStartTime: "2018/3/1 00:00",
                                InputEndTime: "2018/3/31 23:59",
                                Lock: false,
                                SubjectList: [
                                    {
                                        SubjectID: "1",
                                        SubjectName: "Language Art",
                                        RefTermID: "1",
                                        SubjectRatio: 50,
                                        AssessmentList: [
                                            {
                                                AssessmentID: "1",
                                                AssessmentName: "In-Class Score",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 50,
                                                AllowCostumSubItems: true,
                                                InputType: "Score",
                                                CostumSubItemList: []

                                            },
                                            {
                                                AssessmentID: "2",
                                                AssessmentName: "Reading Project",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 50,
                                                AllowCostumSubItems: true,
                                                InputType: "Score",
                                                CostumSubItemList: []

                                            },
                                            {
                                                AssessmentID: "3",
                                                AssessmentName: "Homework Completion",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 0,
                                                AllowCostumSubItems: false,
                                                InputType: "Indicator",
                                                CostumSubItemList: []

                                            },
                                            {
                                                AssessmentID: "4",
                                                AssessmentName: "Comment",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 0,
                                                AllowCostumSubItems: false,
                                                InputType: "Text",
                                                CostumSubItemList: []
                                            },

                                        ]


                                    },
                                    {
                                        SubjectID: "2",
                                        SubjectName: "Science",
                                        RefTermID: "1",
                                        SubjectRatio: 50,
                                        AssessmentList: [
                                            {
                                                AssessmentID: "1",
                                                AssessmentName: "In-Class Score",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 50,
                                                AllowCostumSubItems: true,
                                                InputType: "Score",
                                                CostumSubItemList: [
                                                    {
                                                        SubItemID: "1",
                                                        SubItemName: "HomeWork1",
                                                        RefAssessmentID: "1",
                                                        Date: "2018/3/12",
                                                        Limit: "100",
                                                        Description: "學生平時作業的紀錄",
                                                        CostumSubItemRatio: 50
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


                                                ]

                                            },
                                            {
                                                AssessmentID: "2",
                                                AssessmentName: "Reading Project",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 50,
                                                AllowCostumSubItems: true,
                                                InputType: "Score",
                                                CostumSubItemList: [
                                                    {
                                                        SubItemID: "1",
                                                        SubItemName: "HomeWork1",
                                                        RefAssessmentID: "1",
                                                        Date: "2018/3/12",
                                                        Limit: "100",
                                                        Description: "學生平時作業的紀錄",
                                                        CostumSubItemRatio: 50
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


                                                ]

                                            },
                                            {
                                                AssessmentID: "3",
                                                AssessmentName: "Homework Completion",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 0,
                                                AllowCostumSubItems: false,
                                                InputType: "Indicator",
                                                CostumSubItemList: []

                                            },
                                            {
                                                AssessmentID: "4",
                                                AssessmentName: "Comment",
                                                RefSubjectID: "1",
                                                AllowInputTeacherRole: "教師一",
                                                AssessmentRatio: 0,
                                                AllowCostumSubItems: false,
                                                InputType: "Text",
                                                CostumSubItemList: []
                                            },

                                        ]

                                    },

                                ]

                            },

                        ],
                        StudentList: [
                            {
                                StudentID: "3597",
                                StudentChineseName: "凱澤",
                                StudentEnglishName: "John",
                                StudentNumber: "1234",
                                StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                                SeatNo: "5",
                                index: 0,
                                Scores: [
                                    {
                                        AssessmentID: "1",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        AssessmentID: "2",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                SubItemID: "1",
                                                Score: "86"
                                            },
                                            {
                                                SubItemID: "2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        AssessmentID: "3",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        AssessmentID: "4",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    }
                                ]
                            },
                            {
                                StudentID: "3598",
                                StudentChineseName: "晴楷",
                                StudentEnglishName: "Mary",
                                StudentNumber: "1234",
                                StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                                SeatNo: "6",
                                index: 0,
                                Scores: [
                                    {
                                        AssessmentID: "1",
                                        Score: "87",
                                        CostumSubItemList: []
                                    },
                                    {
                                        AssessmentID: "2",
                                        Score: "87",
                                        CostumSubItemList: [
                                            {
                                                SubItemID: "1",
                                                Score: "86"
                                            },
                                            {
                                                SubItemID: "2",
                                                Score: "88"
                                            }
                                        ]
                                    },
                                    {
                                        AssessmentID: "3",
                                        Score: "A",
                                        CostumSubItemList: []
                                    },
                                    {
                                        AssessmentID: "4",
                                        Score: "上課踴躍回答，注意力集中。",
                                        CostumSubItemList: []
                                    }
                                ]
                            },
                        ]
                    }
                ],
                TermList: [
                    {
                        TermID: "1",
                        TermName: "mid-Term",
                        RefCourseID: "3597",
                        TermRatio: 35,
                        InputStartTime: "2018/3/1 00:00",
                        InputEndTime: "2018/3/31 23:59",
                        Lock: false
                    },
                    {
                        TermID: "2",
                        TermName: "final-Term",
                        RefCourseID: "3597",
                        TermRatio: 35,
                        InputStartTime: "2018/3/1 00:00",
                        InputEndTime: "2018/3/31 23:59",
                        Lock: false,
                    }
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
                    }
                ],
                AssessmentList: [
                    {
                        AssessmentID: "1",
                        AssessmentName: "In-Class Score",
                        RefSubjectID: "1",
                        AllowInputTeacherRole: "教師一",
                        AssessmentRatio: 50,
                        AllowCostumSubItems: true,
                        InputType: "Score"

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
                    }
                ],               
                test: true
            };


            $scope.test = true;


            $scope.CourseList = [
                {
                    CourseID: "3597",
                    CourseName: "G6pm-Mr. Nortje",
                    Exam_template_ID: "1234",
                    TeacherRole: "教師一",
                    TermList: [
                        {
                            TermID: "1",
                            TermName: "mid-Term",
                            RefCourseID: "3597",
                            TermRatio: 35,
                            InputStartTime: "2018/3/1 00:00",
                            InputEndTime: "2018/3/31 23:59",
                            Lock: false,
                            SubjectList: [
                                {
                                    SubjectID: "1",
                                    SubjectName: "Language Art",
                                    RefTermID: "1",
                                    SubjectRatio: 50,
                                    AssessmentList: [
                                        {
                                            AssessmentID: "1",
                                            AssessmentName: "In-Class Score",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 50,
                                            AllowCostumSubItems: true,
                                            InputType: "Score"

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
                                            AssessmentName: "Grammar Exam",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 50,
                                            AllowCostumSubItems: false,
                                            InputType: "Score"

                                        },
                                        {
                                            AssessmentID: "4",
                                            AssessmentName: "Homework Completion",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 0,
                                            AllowCostumSubItems: true,
                                            InputType: "Indicator"

                                        },
                                        {
                                            AssessmentID: "5",
                                            AssessmentName: "Works Well Independently",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 0,
                                            AllowCostumSubItems: false,
                                            InputType: "Indicator"

                                        },
                                        {
                                            AssessmentID: "6",
                                            AssessmentName: "Works Well in a Group",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 0,
                                            AllowCostumSubItems: false,
                                            InputType: "Indicator"

                                        },
                                        {
                                            AssessmentID: "7",
                                            AssessmentName: "Behavior",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 0,
                                            AllowCostumSubItems: false,
                                            InputType: "Text"
                                        },

                                    ]


                                },
                                {
                                    SubjectID: "2",
                                    SubjectName: "Science",
                                    RefTermID: "1",
                                    SubjectRatio: 50,
                                    AssessmentList: [
                                        {
                                            AssessmentID: "1",
                                            AssessmentName: "In-Class Score",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 50,
                                            AllowCostumSubItems: true,
                                            InputType: "Score",
                                            CostumSubItemList: [
                                                {
                                                    SubItemID: "1",
                                                    SubItemName: "HomeWork1",
                                                    RefAssessmentID: "1",
                                                    Date: "2018/3/12",
                                                    Limit: "100",
                                                    Description: "學生平時作業的紀錄",
                                                    CostumSubItemRatio: 50
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


                                            ]

                                        },
                                        {
                                            AssessmentID: "2",
                                            AssessmentName: "Reading Project",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 50,
                                            AllowCostumSubItems: true,
                                            InputType: "Score",
                                            CostumSubItemList: [
                                                {
                                                    SubItemID: "1",
                                                    SubItemName: "Project1",
                                                    RefAssessmentID: "1",
                                                    Date: "2018/3/12",
                                                    Limit: "100",
                                                    Description: "學生平時作業的紀錄",
                                                    CostumSubItemRatio: 50
                                                },
                                                {
                                                    SubItemID: "2",
                                                    SubItemName: "Project2",
                                                    RefAssessmentID: "1",
                                                    Date: "2018/3/12",
                                                    Limit: "100",
                                                    Description: "學生平時作業的紀錄",
                                                    CostumSubItemRatio: 50
                                                },


                                            ]

                                        },
                                        {
                                            AssessmentID: "3",
                                            AssessmentName: "Homework Completion",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 0,
                                            AllowCostumSubItems: true,
                                            InputType: "Indicator",
                                            CostumSubItemList: [
                                                {
                                                    SubItemID: "1",
                                                    SubItemName: "Homework1 Completion",
                                                    RefAssessmentID: "1",
                                                    Date: "2018/3/12",
                                                    Limit: "",
                                                    Description: "學生平時作業的紀錄",
                                                    CostumSubItemRatio: 50
                                                },
                                                {
                                                    SubItemID: "2",
                                                    SubItemName: "Homework2 Completion",
                                                    RefAssessmentID: "1",
                                                    Date: "2018/3/12",
                                                    Limit: "",
                                                    Description: "學生平時作業的紀錄",
                                                    CostumSubItemRatio: 50
                                                },
                                            ]

                                        }


                                    ]

                                },

                            ]

                        },
                        {
                            TermID: "2",
                            TermName: "final-Term",
                            RefCourseID: "3597",
                            TermRatio: 35,
                            InputStartTime: "2018/3/1 00:00",
                            InputEndTime: "2018/3/31 23:59",
                            Lock: false,
                            SubjectList: [
                                {
                                    SubjectID: "1",
                                    SubjectName: "Language Art",
                                    RefTermID: "1",
                                    SubjectRatio: 50,
                                    AssessmentList: [
                                        {
                                            AssessmentID: "1",
                                            AssessmentName: "In-Class Score",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 50,
                                            AllowCostumSubItems: true,
                                            InputType: "Score"

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
                                            AssessmentName: "Grammar Exam",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 50,
                                            AllowCostumSubItems: false,
                                            InputType: "Score"

                                        },
                                        {
                                            AssessmentID: "4",
                                            AssessmentName: "Homework Completion",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 0,
                                            AllowCostumSubItems: true,
                                            InputType: "Indicator"

                                        },
                                        {
                                            AssessmentID: "5",
                                            AssessmentName: "Works Well Independently",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 0,
                                            AllowCostumSubItems: false,
                                            InputType: "Indicator"

                                        },
                                        {
                                            AssessmentID: "6",
                                            AssessmentName: "Works Well in a Group",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 0,
                                            AllowCostumSubItems: false,
                                            InputType: "Indicator"

                                        },
                                        {
                                            AssessmentID: "7",
                                            AssessmentName: "Behavior",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 0,
                                            AllowCostumSubItems: false,
                                            InputType: "Text"
                                        },
                                        {
                                            AssessmentID: "8",
                                            AssessmentName: "Comment",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 0,
                                            AllowCostumSubItems: false,
                                            InputType: "Text"
                                        }
                                    ]
                                },
                                {
                                    SubjectID: "2",
                                    SubjectName: "Science",
                                    RefTermID: "1",
                                    SubjectRatio: 50,
                                    AssessmentList: [
                                        {
                                            AssessmentID: "1",
                                            AssessmentName: "In-Class Score",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 50,
                                            AllowCostumSubItems: true,
                                            InputType: "Score",
                                            CostumSubItemList: [
                                                {
                                                    SubItemID: "1",
                                                    SubItemName: "HomeWork1",
                                                    RefAssessmentID: "1",
                                                    Date: "2018/3/12",
                                                    Limit: "100",
                                                    Description: "學生平時作業的紀錄",
                                                    CostumSubItemRatio: 50
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


                                            ]

                                        },
                                        {
                                            AssessmentID: "2",
                                            AssessmentName: "Reading Project",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 50,
                                            AllowCostumSubItems: true,
                                            InputType: "Score",
                                            CostumSubItemList: [
                                                {
                                                    SubItemID: "1",
                                                    SubItemName: "Project1",
                                                    RefAssessmentID: "1",
                                                    Date: "2018/3/12",
                                                    Limit: "100",
                                                    Description: "學生平時作業的紀錄",
                                                    CostumSubItemRatio: 50
                                                },
                                                {
                                                    SubItemID: "2",
                                                    SubItemName: "Project2",
                                                    RefAssessmentID: "1",
                                                    Date: "2018/3/12",
                                                    Limit: "100",
                                                    Description: "學生平時作業的紀錄",
                                                    CostumSubItemRatio: 50
                                                },


                                            ]

                                        },
                                        {
                                            AssessmentID: "3",
                                            AssessmentName: "Homework Completion",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 0,
                                            AllowCostumSubItems: true,
                                            InputType: "Indicator",
                                            CostumSubItemList: [
                                                {
                                                    SubItemID: "1",
                                                    SubItemName: "Homework1 Completion",
                                                    RefAssessmentID: "1",
                                                    Date: "2018/3/12",
                                                    Limit: "",
                                                    Description: "學生平時作業的紀錄",
                                                    CostumSubItemRatio: 50
                                                },
                                                {
                                                    SubItemID: "2",
                                                    SubItemName: "Homework2 Completion",
                                                    RefAssessmentID: "1",
                                                    Date: "2018/3/12",
                                                    Limit: "",
                                                    Description: "學生平時作業的紀錄",
                                                    CostumSubItemRatio: 50
                                                },
                                            ]
                                        },
                                        {
                                            AssessmentID: "4",
                                            AssessmentName: "Comment",
                                            RefSubjectID: "1",
                                            AllowInputTeacherRole: "教師一",
                                            AssessmentRatio: 0,
                                            AllowCostumSubItems: false,
                                            InputType: "Text",
                                            CostumSubItemList: []
                                        }

                                    ]

                                },

                            ]

                        },

                    ],
                    StudentList: [
                        {
                            StudentID: "1",
                            StudentChineseName: "王一明",
                            StudentEnglishName: "John Wang1",
                            StudentNumber: "30101",
                            StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                            ClassName: "301",
                            SeatNo: "1",
                            index: 1,
                            ["1_mid-Term_Language Art_Reading Project_"]: "81",
                            ["1_mid-Term_Language Art_In-Class Score_"]: "81",
                            ["1_mid-Term_Language Art_Homework Completion_"]: "A",
                            ["1_mid-Term_Language Art_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["1_final-Term_Language Art_Reading Project_"]: "81",
                            ["1_final-Term_Language Art_In-Class Score_"]: "81",
                            ["1_final-Term_Language Art_Homework Completion_"]: "B",
                            ["1_final-Term_Language Art_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。",
                            ["1_mid-Term_Science_Reading Project_"]: "51",
                            ["1_mid-Term_Science_In-Class Score_"]: "51",
                            ["1_mid-Term_Science_Homework Completion_"]: "A",
                            ["1_mid-Term_Science_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["1_final-Term_Science_Reading Project_"]: "51",
                            ["1_final-Term_Science_In-Class Score_"]: "51",
                            ["1_final-Term_Science_Homework Completion_"]: "B",
                            ["1_final-Term_Science_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。"

                        },
                        {
                            StudentID: "2",
                            StudentChineseName: "王二明",
                            StudentEnglishName: "John Wang2",
                            StudentNumber: "30102",
                            StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                            ClassName: "301",
                            SeatNo: "2",
                            index: 2,
                            ["2_mid-Term_Language Art_Reading Project_"]: "82",
                            ["2_mid-Term_Language Art_In-Class Score_"]: "82",
                            ["2_mid-Term_Language Art_Homework Completion_"]: "A",
                            ["2_mid-Term_Language Art_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["2_final-Term_Language Art_Reading Project_"]: "82",
                            ["2_final-Term_Language Art_In-Class Score_"]: "82",
                            ["2_final-Term_Language Art_Homework Completion_"]: "B",
                            ["2_final-Term_Language Art_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。",
                            ["2_mid-Term_Science_Reading Project_"]: "72",
                            ["2_mid-Term_Science_In-Class Score_"]: "72",
                            ["2_mid-Term_Science_Homework Completion_"]: "A",
                            ["2_mid-Term_Science_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["2_final-Term_Science_Reading Project_"]: "72",
                            ["2_final-Term_Science_In-Class Score_"]: "72",
                            ["2_final-Term_Science_Homework Completion_"]: "B",
                            ["2_final-Term_Science_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。"
                        },
                        {
                            StudentID: "3",
                            StudentChineseName: "王三明",
                            StudentEnglishName: "John Wang3",
                            StudentNumber: "30103",
                            StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                            ClassName: "301",
                            SeatNo: "3",
                            index: 3,
                            ["3_mid-Term_Language Art_Reading Project_"]: "83",
                            ["3_mid-Term_Language Art_In-Class Score_"]: "83",
                            ["3_mid-Term_Language Art_Homework Completion_"]: "A",
                            ["3_mid-Term_Language Art_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["3_final-Term_Language Art_Reading Project_"]: "83",
                            ["3_final-Term_Language Art_In-Class Score_"]: "83",
                            ["3_final-Term_Language Art_Homework Completion_"]: "B",
                            ["3_final-Term_Language Art_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。",
                            ["3_mid-Term_Science_Reading Project_"]: "73",
                            ["3_mid-Term_Science_In-Class Score_"]: "73",
                            ["3_mid-Term_Science_Homework Completion_"]: "A",
                            ["3_mid-Term_Science_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["3_final-Term_Science_Reading Project_"]: "73",
                            ["3_final-Term_Science_In-Class Score_"]: "73",
                            ["3_final-Term_Science_Homework Completion_"]: "B",
                            ["3_final-Term_Science_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。"
                        },
                        {
                            StudentID: "4",
                            StudentChineseName: "王四明",
                            StudentEnglishName: "John Wang4",
                            StudentNumber: "30104",
                            StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                            ClassName: "301",
                            SeatNo: "4",
                            index: 4,
                            ["4_mid-Term_Language Art_Reading Project_"]: "84",
                            ["4_mid-Term_Language Art_In-Class Score_"]: "84",
                            ["4_mid-Term_Language Art_Homework Completion_"]: "A",
                            ["4_mid-Term_Language Art_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["4_final-Term_Language Art_Reading Project_"]: "84",
                            ["4_final-Term_Language Art_In-Class Score_"]: "84",
                            ["4_final-Term_Language Art_Homework Completion_"]: "B",
                            ["4_final-Term_Language Art_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。",
                            ["4_mid-Term_Science_Reading Project_"]: "74",
                            ["4_mid-Term_Science_In-Class Score_"]: "74",
                            ["4_mid-Term_Science_Homework Completion_"]: "A",
                            ["4_mid-Term_Science_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["4_final-Term_Science_Reading Project_"]: "74",
                            ["4_final-Term_Science_In-Class Score_"]: "74",
                            ["4_final-Term_Science_Homework Completion_"]: "B",
                            ["4_final-Term_Science_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。"
                        },
                        {
                            StudentID: "5",
                            StudentChineseName: "王五明",
                            StudentEnglishName: "John Wang5",
                            StudentNumber: "30105",
                            StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                            ClassName: "301",
                            SeatNo: "5",
                            index: 5,
                            ["5_mid-Term_Language Art_Reading Project_"]: "85",
                            ["5_mid-Term_Language Art_In-Class Score_"]: "85",
                            ["5_mid-Term_Language Art_Homework Completion_"]: "A",
                            ["5_mid-Term_Language Art_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["5_final-Term_Language Art_Reading Project_"]: "85",
                            ["5_final-Term_Language Art_In-Class Score_"]: "85",
                            ["5_final-Term_Language Art_Homework Completion_"]: "B",
                            ["5_final-Term_Language Art_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。",
                            ["5_mid-Term_Science_Reading Project_"]: "75",
                            ["5_mid-Term_Science_In-Class Score_"]: "75",
                            ["5_mid-Term_Science_Homework Completion_"]: "A",
                            ["5_mid-Term_Science_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["5_final-Term_Science_Reading Project_"]: "75",
                            ["5_final-Term_Science_In-Class Score_"]: "75",
                            ["5_final-Term_Science_Homework Completion_"]: "B",
                            ["5_final-Term_Science_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。"
                        },
                        {
                            StudentID: "6",
                            StudentChineseName: "王六明",
                            StudentEnglishName: "John Wang6",
                            StudentNumber: "30106",
                            StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                            ClassName: "301",
                            SeatNo: "6",
                            index: 6,
                            ["6_mid-Term_Language Art_Reading Project_"]: "86",
                            ["6_mid-Term_Language Art_In-Class Score_"]: "86",
                            ["6_mid-Term_Language Art_Homework Completion_"]: "A",
                            ["6_mid-Term_Language Art_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["6_final-Term_Language Art_Reading Project_"]: "86",
                            ["6_final-Term_Language Art_In-Class Score_"]: "86",
                            ["6_final-Term_Language Art_Homework Completion_"]: "B",
                            ["6_final-Term_Language Art_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。",
                            ["6_mid-Term_Science_Reading Project_"]: "76",
                            ["6_mid-Term_Science_In-Class Score_"]: "76",
                            ["6_mid-Term_Science_Homework Completion_"]: "A",
                            ["6_mid-Term_Science_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["6_final-Term_Science_Reading Project_"]: "76",
                            ["6_final-Term_Science_In-Class Score_"]: "76",
                            ["6_final-Term_Science_Homework Completion_"]: "B",
                            ["6_final-Term_Science_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。"
                        },
                        {
                            StudentID: "7",
                            StudentChineseName: "王七明",
                            StudentEnglishName: "John Wang7",
                            StudentNumber: "30107",
                            StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                            ClassName: "301",
                            SeatNo: "7",
                            index: 7,
                            ["7_mid-Term_Language Art_Reading Project_"]: "87",
                            ["7_mid-Term_Language Art_In-Class Score_"]: "87",
                            ["7_mid-Term_Language Art_Homework Completion_"]: "A",
                            ["7_mid-Term_Language Art_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["7_final-Term_Language Art_Reading Project_"]: "87",
                            ["7_final-Term_Language Art_In-Class Score_"]: "87",
                            ["7_final-Term_Language Art_Homework Completion_"]: "B",
                            ["7_final-Term_Language Art_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。",
                            ["7_mid-Term_Science_Reading Project_"]: "77",
                            ["7_mid-Term_Science_In-Class Score_"]: "77",
                            ["7_mid-Term_Science_Homework Completion_"]: "A",
                            ["7_mid-Term_Science_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["7_final-Term_Science_Reading Project_"]: "77",
                            ["7_final-Term_Science_In-Class Score_"]: "77",
                            ["7_final-Term_Science_Homework Completion_"]: "B",
                            ["7_final-Term_Science_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。"
                        },
                        {
                            StudentID: "8",
                            StudentChineseName: "王八明",
                            StudentEnglishName: "John Wang8",
                            StudentNumber: "30108",
                            StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                            ClassName: "301",
                            SeatNo: "8",
                            index: 8,
                            ["8_mid-Term_Language Art_Reading Project_"]: "88",
                            ["8_mid-Term_Language Art_In-Class Score_"]: "88",
                            ["8_mid-Term_Language Art_Homework Completion_"]: "A",
                            ["8_mid-Term_Language Art_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["8_final-Term_Language Art_Reading Project_"]: "88",
                            ["8_final-Term_Language Art_In-Class Score_"]: "88",
                            ["8_final-Term_Language Art_Homework Completion_"]: "B",
                            ["8_final-Term_Language Art_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。",
                            ["8_mid-Term_Science_Reading Project_"]: "78",
                            ["8_mid-Term_Science_In-Class Score_"]: "78",
                            ["8_mid-Term_Science_Homework Completion_"]: "A",
                            ["8_mid-Term_Science_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["8_final-Term_Science_Reading Project_"]: "78",
                            ["8_final-Term_Science_In-Class Score_"]: "78",
                            ["8_final-Term_Science_Homework Completion_"]: "B",
                            ["8_final-Term_Science_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。"
                        },
                        {
                            StudentID: "9",
                            StudentChineseName: "王九明",
                            StudentEnglishName: "John Wang9",
                            StudentNumber: "30109",
                            StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                            ClassName: "301",
                            SeatNo: "9",
                            index: 9,
                            ["9_mid-Term_Language Art_Reading Project_"]: "89",
                            ["9_mid-Term_Language Art_In-Class Score_"]: "89",
                            ["9_mid-Term_Language Art_Homework Completion_"]: "A",
                            ["9_mid-Term_Language Art_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["9_final-Term_Language Art_Reading Project_"]: "89",
                            ["9_final-Term_Language Art_In-Class Score_"]: "89",
                            ["9_final-Term_Language Art_Homework Completion_"]: "B",
                            ["9_final-Term_Language Art_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。",
                            ["9_mid-Term_Science_Reading Project_"]: "79",
                            ["9_mid-Term_Science_In-Class Score_"]: "79",
                            ["9_mid-Term_Science_Homework Completion_"]: "A",
                            ["9_mid-Term_Science_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["9_final-Term_Science_Reading Project_"]: "79",
                            ["9_final-Term_Science_In-Class Score_"]: "79",
                            ["9_final-Term_Science_Homework Completion_"]: "B",
                            ["9_final-Term_Science_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。"
                        },
                        {
                            StudentID: "10",
                            StudentChineseName: "王十明",
                            StudentEnglishName: "John Wang10",
                            StudentNumber: "30110",
                            StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                            ClassName: "301",
                            SeatNo: "10",
                            index: 10,
                            ["10_mid-Term_Language Art_Reading Project_"]: "90",
                            ["10_mid-Term_Language Art_In-Class Score_"]: "90",
                            ["10_mid-Term_Language Art_Homework Completion_"]: "A",
                            ["10_mid-Term_Language Art_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["10_final-Term_Language Art_Reading Project_"]: "90",
                            ["10_final-Term_Language Art_In-Class Score_"]: "90",
                            ["10_final-Term_Language Art_Homework Completion_"]: "B",
                            ["10_final-Term_Language Art_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。",
                            ["10_mid-Term_Science_Reading Project_"]: "80",
                            ["10_mid-Term_Science_In-Class Score_"]: "80",
                            ["10_mid-Term_Science_Homework Completion_"]: "A",
                            ["10_mid-Term_Science_Comment_"]: "期中上課踴躍回答，注意力集中。",
                            ["10_final-Term_Science_Reading Project_"]: "80",
                            ["10_final-Term_Science_In-Class Score_"]: "80",
                            ["10_final-Term_Science_Homework Completion_"]: "B",
                            ["10_final-Term_Science_Comment_"]: "期末上課踴躍回答，注意力集中YOYO。"
                        }
                    ]

                }
            ];
            $scope.current = {
                currentCourse: {},
                currentTerm: {},
                currentSubject: {},
                currentAssessment: {}
                //currentCourseName: "8A 英文",
                //currentTermName: "",
                //currentSubjectName: "",
                //currentAssessmentName: ""
            };

            

            //$scope.connection = gadget.getContract("ta");

            ////2018/3/20  穎驊新增 連接servive 準備取資料
            //$scope.connection.send({
            //    service: "TeacherAccess.GetEffortDegreeMappingTable",
            //    autoRetry: true,
            //    body: {
            //        Content: {}
            //    },
            //    result: function (response, error, http) {
            //        if (error) {
            //            alert("TeacherAccess.GetEffortDegreeMappingTable Error");
            //        } else {

            //            $scope.$apply(function () {
            //                //$scope.setCurrentCourse($scope.CourseList[0]);
            //            });
            //        }
            //    }
            //});
            
            $scope.StudentList = [
                {
                    StudentID: "1",
                    StudentChineseName: "王一明",
                    StudentEnglishName: "John Wang1",
                    StudentNumber: "30101",
                    StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                    ClassName: "301",
                    SeatNo: "1",
                    index: 1,
                    ["1_mid-Term_Language Art_Reading Project_"]: "81",
                    ["1_mid-Term_Language Art_In-Class Score_"]: "81",
                    ["1_mid-Term_Language Art_Homework Completion_"]: "E",
                    ["1_mid-Term_Language Art_Comment_"]: "Good",
                    ["1_final-Term_Language Art_Reading Project_"]: "81",
                    ["1_final-Term_Language Art_In-Class Score_"]: "81",
                    ["1_final-Term_Language Art_Homework Completion_"]: "G",
                    ["1_final-Term_Language Art_Comment_"]: "Good",

                    ["1_mid-Term_Language Art_Grammar Exam_"]: "81",
                    ["1_mid-Term_Language Art_Works Well Independently_"]: "E",
                    ["1_mid-Term_Language Art_Works Well in a Group_"]: "S",
                    ["1_mid-Term_Language Art_Behavior_"]: "N",
                    ["1_final-Term_Language Art_Grammar Exam_"]: "81",
                    ["1_final-Term_Language Art_Works Well Independently_"]: "G",
                    ["1_final-Term_Language Art_Works Well in a Group_"]: "S",
                    ["1_final-Term_Language Art_Behavior_"]: "N",


                    ["1_mid-Term_Science_Reading Project_"]: "51",
                    ["1_mid-Term_Science_In-Class Score_"]: "51",
                    ["1_mid-Term_Science_Homework Completion_"]: "S",                    
                    ["1_final-Term_Science_Reading Project_"]: "51",
                    ["1_final-Term_Science_In-Class Score_"]: "51",
                    ["1_final-Term_Science_Homework Completion_"]: "N",
                    ["1_final-Term_Science_Comment_"]: "Good",

                    ["1_mid-Term_Science_In-Class Score_HomeWork1"]: "51",
                    ["1_mid-Term_Science_In-Class Score_HomeWork2"]: "51",
                    ["1_mid-Term_Science_Reading Project_Project1"]: "91",
                    ["1_mid-Term_Science_Reading Project_Project2"]: "91",

                    ["1_mid-Term_Science_Homework Completion_Homework1 Completion"]: "E",
                    ["1_mid-Term_Science_Homework Completion_Homework2 Completion"]: "S",


                    



                },
                {
                    "StudentID": "2",
                    "StudentChineseName": "王二明",
                    "StudentEnglishName": "John Wang2",
                    "StudentNumber": "30102",
                    "StudentPhotoBase64Code": "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                    "ClassName": "301",
                    "SeatNo": "2",
                    "index": 2,
                    ["2_mid-Term_Language Art_Reading Project_"]: "82",
                    ["2_mid-Term_Language Art_In-Class Score_"]: "82",
                    ["2_mid-Term_Language Art_Homework Completion_"]: "E",
                    ["2_mid-Term_Language Art_Comment_"]: "Good",
                    ["2_final-Term_Language Art_Reading Project_"]: "82",
                    ["2_final-Term_Language Art_In-Class Score_"]: "82",
                    ["2_final-Term_Language Art_Homework Completion_"]: "G",
                    ["2_final-Term_Language Art_Comment_"]: "Good",

                    ["2_mid-Term_Language Art_Grammar Exam_"]: "82",
                    ["2_mid-Term_Language Art_Works Well Independently_"]: "E",
                    ["2_mid-Term_Language Art_Works Well in a Group_"]: "S",
                    ["2_mid-Term_Language Art_Behavior_"]: "N",
                    ["2_final-Term_Language Art_Grammar Exam_"]: "82",
                    ["2_final-Term_Language Art_Works Well Independently_"]: "G",
                    ["2_final-Term_Language Art_Works Well in a Group_"]: "S",
                    ["2_final-Term_Language Art_Behavior_"]: "N",


                    ["2_mid-Term_Science_Reading Project_"]: "52",
                    ["2_mid-Term_Science_In-Class Score_"]: "52",
                    ["2_mid-Term_Science_Homework Completion_"]: "S",
                    ["2_final-Term_Science_Reading Project_"]: "52",
                    ["2_final-Term_Science_In-Class Score_"]: "52",
                    ["2_final-Term_Science_Homework Completion_"]: "N",
                    ["2_final-Term_Science_Comment_"]: "Good",

                    ["2_mid-Term_Science_In-Class Score_HomeWork1"]: "52",
                    ["2_mid-Term_Science_In-Class Score_HomeWork2"]: "52",
                    ["2_mid-Term_Science_Reading Project_Project1"]: "92",
                    ["2_mid-Term_Science_Reading Project_Project2"]: "92",

                    ["2_mid-Term_Science_Homework Completion_Homework1 Completion"]: "E",
                    ["2_mid-Term_Science_Homework Completion_Homework2 Completion"]: "S",
                },
                {
                    StudentID: "3",
                    StudentChineseName: "王三明",
                    StudentEnglishName: "John Wang3",
                    StudentNumber: "30103",
                    StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                    ClassName: "301",
                    SeatNo: "3",
                    index: 3,
                    ["3_mid-Term_Language Art_Reading Project_"]: "83",
                    ["3_mid-Term_Language Art_In-Class Score_"]: "83",
                    ["3_mid-Term_Language Art_Homework Completion_"]: "E",
                    ["3_mid-Term_Language Art_Comment_"]: "Good",
                    ["3_final-Term_Language Art_Reading Project_"]: "83",
                    ["3_final-Term_Language Art_In-Class Score_"]: "83",
                    ["3_final-Term_Language Art_Homework Completion_"]: "G",
                    ["3_final-Term_Language Art_Comment_"]: "Good",

                    ["3_mid-Term_Language Art_Grammar Exam_"]: "83",
                    ["3_mid-Term_Language Art_Works Well Independently_"]: "E",
                    ["3_mid-Term_Language Art_Works Well in a Group_"]: "S",
                    ["3_mid-Term_Language Art_Behavior_"]: "N",
                    ["3_final-Term_Language Art_Grammar Exam_"]: "83",
                    ["3_final-Term_Language Art_Works Well Independently_"]: "G",
                    ["3_final-Term_Language Art_Works Well in a Group_"]: "S",
                    ["3_final-Term_Language Art_Behavior_"]: "N",


                    ["3_mid-Term_Science_Reading Project_"]: "53",
                    ["3_mid-Term_Science_In-Class Score_"]: "53",
                    ["3_mid-Term_Science_Homework Completion_"]: "S",
                    ["3_final-Term_Science_Reading Project_"]: "53",
                    ["3_final-Term_Science_In-Class Score_"]: "53",
                    ["3_final-Term_Science_Homework Completion_"]: "N",
                    ["3_final-Term_Science_Comment_"]: "Good",

                    ["3_mid-Term_Science_In-Class Score_HomeWork1"]: "53",
                    ["3_mid-Term_Science_In-Class Score_HomeWork2"]: "53",
                    ["3_mid-Term_Science_Reading Project_Project1"]: "93",
                    ["3_mid-Term_Science_Reading Project_Project2"]: "93",

                    ["3_mid-Term_Science_Homework Completion_Homework1 Completion"]: "E",
                    ["3_mid-Term_Science_Homework Completion_Homework2 Completion"]: "S",

                },
                {
                    StudentID: "4",
                    StudentChineseName: "王四明",
                    StudentEnglishName: "John Wang4",
                    StudentNumber: "30104",
                    StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                    ClassName: "301",
                    SeatNo: "4",
                    index: 4,
                    ["4_mid-Term_Language Art_Reading Project_"]: "84",
                    ["4_mid-Term_Language Art_In-Class Score_"]: "84",
                    ["4_mid-Term_Language Art_Homework Completion_"]: "E",
                    ["4_mid-Term_Language Art_Comment_"]: "Good",
                    ["4_final-Term_Language Art_Reading Project_"]: "84",
                    ["4_final-Term_Language Art_In-Class Score_"]: "84",
                    ["4_final-Term_Language Art_Homework Completion_"]: "G",
                    ["4_final-Term_Language Art_Comment_"]: "Good",

                    ["4_mid-Term_Language Art_Grammar Exam_"]: "84",
                    ["4_mid-Term_Language Art_Works Well Independently_"]: "E",
                    ["4_mid-Term_Language Art_Works Well in a Group_"]: "S",
                    ["4_mid-Term_Language Art_Behavior_"]: "N",
                    ["4_final-Term_Language Art_Grammar Exam_"]: "84",
                    ["4_final-Term_Language Art_Works Well Independently_"]: "G",
                    ["4_final-Term_Language Art_Works Well in a Group_"]: "S",
                    ["4_final-Term_Language Art_Behavior_"]: "N",


                    ["4_mid-Term_Science_Reading Project_"]: "54",
                    ["4_mid-Term_Science_In-Class Score_"]: "54",
                    ["4_mid-Term_Science_Homework Completion_"]: "S",
                    ["4_final-Term_Science_Reading Project_"]: "54",
                    ["4_final-Term_Science_In-Class Score_"]: "54",
                    ["4_final-Term_Science_Homework Completion_"]: "N",
                    ["4_final-Term_Science_Comment_"]: "Good",

                    ["4_mid-Term_Science_In-Class Score_HomeWork1"]: "54",
                    ["4_mid-Term_Science_In-Class Score_HomeWork2"]: "54",
                    ["4_mid-Term_Science_Reading Project_Project1"]: "94",
                    ["4_mid-Term_Science_Reading Project_Project2"]: "94",

                    ["4_mid-Term_Science_Homework Completion_Homework1 Completion"]: "E",
                    ["4_mid-Term_Science_Homework Completion_Homework2 Completion"]: "S",
                },
                {
                    StudentID: "5",
                    StudentChineseName: "王五明",
                    StudentEnglishName: "John Wang5",
                    StudentNumber: "30105",
                    StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                    ClassName: "301",
                    SeatNo: "5",
                    index: 5,
                    ["5_mid-Term_Language Art_Reading Project_"]: "85",
                    ["5_mid-Term_Language Art_In-Class Score_"]: "85",
                    ["5_mid-Term_Language Art_Homework Completion_"]: "E",
                    ["5_mid-Term_Language Art_Comment_"]: "Good",
                    ["5_final-Term_Language Art_Reading Project_"]: "85",
                    ["5_final-Term_Language Art_In-Class Score_"]: "85",
                    ["5_final-Term_Language Art_Homework Completion_"]: "G",
                    ["5_final-Term_Language Art_Comment_"]: "Good",

                    ["5_mid-Term_Language Art_Grammar Exam_"]: "85",
                    ["5_mid-Term_Language Art_Works Well Independently_"]: "E",
                    ["5_mid-Term_Language Art_Works Well in a Group_"]: "S",
                    ["5_mid-Term_Language Art_Behavior_"]: "N",
                    ["5_final-Term_Language Art_Grammar Exam_"]: "85",
                    ["5_final-Term_Language Art_Works Well Independently_"]: "G",
                    ["5_final-Term_Language Art_Works Well in a Group_"]: "S",
                    ["5_final-Term_Language Art_Behavior_"]: "N",


                    ["5_mid-Term_Science_Reading Project_"]: "55",
                    ["5_mid-Term_Science_In-Class Score_"]: "55",
                    ["5_mid-Term_Science_Homework Completion_"]: "S",
                    ["5_final-Term_Science_Reading Project_"]: "55",
                    ["5_final-Term_Science_In-Class Score_"]: "55",
                    ["5_final-Term_Science_Homework Completion_"]: "N",
                    ["5_final-Term_Science_Comment_"]: "Good",

                    ["5_mid-Term_Science_In-Class Score_HomeWork1"]: "55",
                    ["5_mid-Term_Science_In-Class Score_HomeWork2"]: "55",
                    ["5_mid-Term_Science_Reading Project_Project1"]: "95",
                    ["5_mid-Term_Science_Reading Project_Project2"]: "95",

                    ["5_mid-Term_Science_Homework Completion_Homework1 Completion"]: "E",
                    ["5_mid-Term_Science_Homework Completion_Homework2 Completion"]: "S",
                },
                {
                    StudentID: "6",
                    StudentChineseName: "王六明",
                    StudentEnglishName: "John Wang6",
                    StudentNumber: "30106",
                    StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                    ClassName: "301",
                    SeatNo: "6",
                    index: 6,
                    ["6_mid-Term_Language Art_Reading Project_"]: "86",
                    ["6_mid-Term_Language Art_In-Class Score_"]: "86",
                    ["6_mid-Term_Language Art_Homework Completion_"]: "E",
                    ["6_mid-Term_Language Art_Comment_"]: "Good",
                    ["6_final-Term_Language Art_Reading Project_"]: "86",
                    ["6_final-Term_Language Art_In-Class Score_"]: "86",
                    ["6_final-Term_Language Art_Homework Completion_"]: "G",
                    ["6_final-Term_Language Art_Comment_"]: "Good",

                    ["6_mid-Term_Language Art_Grammar Exam_"]: "86",
                    ["6_mid-Term_Language Art_Works Well Independently_"]: "E",
                    ["6_mid-Term_Language Art_Works Well in a Group_"]: "S",
                    ["6_mid-Term_Language Art_Behavior_"]: "N",
                    ["6_final-Term_Language Art_Grammar Exam_"]: "86",
                    ["6_final-Term_Language Art_Works Well Independently_"]: "G",
                    ["6_final-Term_Language Art_Works Well in a Group_"]: "S",
                    ["6_final-Term_Language Art_Behavior_"]: "N",


                    ["6_mid-Term_Science_Reading Project_"]: "56",
                    ["6_mid-Term_Science_In-Class Score_"]: "56",
                    ["6_mid-Term_Science_Homework Completion_"]: "S",
                    ["6_final-Term_Science_Reading Project_"]: "56",
                    ["6_final-Term_Science_In-Class Score_"]: "56",
                    ["6_final-Term_Science_Homework Completion_"]: "N",
                    ["6_final-Term_Science_Comment_"]: "Good",

                    ["6_mid-Term_Science_In-Class Score_HomeWork1"]: "56",
                    ["6_mid-Term_Science_In-Class Score_HomeWork2"]: "56",
                    ["6_mid-Term_Science_Reading Project_Project1"]: "96",
                    ["6_mid-Term_Science_Reading Project_Project2"]: "96",

                    ["6_mid-Term_Science_Homework Completion_Homework1 Completion"]: "E",
                    ["6_mid-Term_Science_Homework Completion_Homework2 Completion"]: "S",
                },
                {
                    StudentID: "7",
                    StudentChineseName: "王七明",
                    StudentEnglishName: "John Wang7",
                    StudentNumber: "30107",
                    StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                    ClassName: "301",
                    SeatNo: "7",
                    index: 7,
                    ["7_mid-Term_Language Art_Reading Project_"]: "87",
                    ["7_mid-Term_Language Art_In-Class Score_"]: "87",
                    ["7_mid-Term_Language Art_Homework Completion_"]: "E",
                    ["7_mid-Term_Language Art_Comment_"]: "Good",
                    ["7_final-Term_Language Art_Reading Project_"]: "87",
                    ["7_final-Term_Language Art_In-Class Score_"]: "87",
                    ["7_final-Term_Language Art_Homework Completion_"]: "G",
                    ["7_final-Term_Language Art_Comment_"]: "Good",

                    ["7_mid-Term_Language Art_Grammar Exam_"]: "87",
                    ["7_mid-Term_Language Art_Works Well Independently_"]: "E",
                    ["7_mid-Term_Language Art_Works Well in a Group_"]: "S",
                    ["7_mid-Term_Language Art_Behavior_"]: "N",
                    ["7_final-Term_Language Art_Grammar Exam_"]: "87",
                    ["7_final-Term_Language Art_Works Well Independently_"]: "G",
                    ["7_final-Term_Language Art_Works Well in a Group_"]: "S",
                    ["7_final-Term_Language Art_Behavior_"]: "N",


                    ["7_mid-Term_Science_Reading Project_"]: "57",
                    ["7_mid-Term_Science_In-Class Score_"]: "57",
                    ["7_mid-Term_Science_Homework Completion_"]: "S",
                    ["7_final-Term_Science_Reading Project_"]: "57",
                    ["7_final-Term_Science_In-Class Score_"]: "57",
                    ["7_final-Term_Science_Homework Completion_"]: "N",
                    ["7_final-Term_Science_Comment_"]: "Good",

                    ["7_mid-Term_Science_In-Class Score_HomeWork1"]: "57",
                    ["7_mid-Term_Science_In-Class Score_HomeWork2"]: "57",
                    ["7_mid-Term_Science_Reading Project_Project1"]: "97",
                    ["7_mid-Term_Science_Reading Project_Project2"]: "97",

                    ["7_mid-Term_Science_Homework Completion_Homework1 Completion"]: "E",
                    ["7_mid-Term_Science_Homework Completion_Homework2 Completion"]: "S",
                },
                {
                    StudentID: "8",
                    StudentChineseName: "王八明",
                    StudentEnglishName: "John Wang8",
                    StudentNumber: "30108",
                    StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                    ClassName: "301",
                    SeatNo: "8",
                    index: 8,
                    ["8_mid-Term_Language Art_Reading Project_"]: "88",
                    ["8_mid-Term_Language Art_In-Class Score_"]: "88",
                    ["8_mid-Term_Language Art_Homework Completion_"]: "E",
                    ["8_mid-Term_Language Art_Comment_"]: "Good",
                    ["8_final-Term_Language Art_Reading Project_"]: "88",
                    ["8_final-Term_Language Art_In-Class Score_"]: "88",
                    ["8_final-Term_Language Art_Homework Completion_"]: "G",
                    ["8_final-Term_Language Art_Comment_"]: "Good",

                    ["8_mid-Term_Language Art_Grammar Exam_"]: "88",
                    ["8_mid-Term_Language Art_Works Well Independently_"]: "E",
                    ["8_mid-Term_Language Art_Works Well in a Group_"]: "S",
                    ["8_mid-Term_Language Art_Behavior_"]: "N",
                    ["8_final-Term_Language Art_Grammar Exam_"]: "88",
                    ["8_final-Term_Language Art_Works Well Independently_"]: "G",
                    ["8_final-Term_Language Art_Works Well in a Group_"]: "S",
                    ["8_final-Term_Language Art_Behavior_"]: "N",


                    ["8_mid-Term_Science_Reading Project_"]: "58",
                    ["8_mid-Term_Science_In-Class Score_"]: "58",
                    ["8_mid-Term_Science_Homework Completion_"]: "S",
                    ["8_final-Term_Science_Reading Project_"]: "58",
                    ["8_final-Term_Science_In-Class Score_"]: "58",
                    ["8_final-Term_Science_Homework Completion_"]: "N",
                    ["8_final-Term_Science_Comment_"]: "Good",

                    ["8_mid-Term_Science_In-Class Score_HomeWork1"]: "58",
                    ["8_mid-Term_Science_In-Class Score_HomeWork2"]: "58",
                    ["8_mid-Term_Science_Reading Project_Project1"]: "98",
                    ["8_mid-Term_Science_Reading Project_Project2"]: "98",

                    ["8_mid-Term_Science_Homework Completion_Homework1 Completion"]: "E",
                    ["8_mid-Term_Science_Homework Completion_Homework2 Completion"]: "S",
                },
                {
                    StudentID: "9",
                    StudentChineseName: "王九明",
                    StudentEnglishName: "John Wang9",
                    StudentNumber: "30109",
                    StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                    ClassName: "301",
                    SeatNo: "9",
                    index: 9,
                    ["9_mid-Term_Language Art_Reading Project_"]: "89",
                    ["9_mid-Term_Language Art_In-Class Score_"]: "89",
                    ["9_mid-Term_Language Art_Homework Completion_"]: "E",
                    ["9_mid-Term_Language Art_Comment_"]: "Good",
                    ["9_final-Term_Language Art_Reading Project_"]: "89",
                    ["9_final-Term_Language Art_In-Class Score_"]: "89",
                    ["9_final-Term_Language Art_Homework Completion_"]: "G",
                    ["9_final-Term_Language Art_Comment_"]: "Good",

                    ["9_mid-Term_Language Art_Grammar Exam_"]: "89",
                    ["9_mid-Term_Language Art_Works Well Independently_"]: "E",
                    ["9_mid-Term_Language Art_Works Well in a Group_"]: "S",
                    ["9_mid-Term_Language Art_Behavior_"]: "N",
                    ["9_final-Term_Language Art_Grammar Exam_"]: "89",
                    ["9_final-Term_Language Art_Works Well Independently_"]: "G",
                    ["9_final-Term_Language Art_Works Well in a Group_"]: "S",
                    ["9_final-Term_Language Art_Behavior_"]: "N",


                    ["9_mid-Term_Science_Reading Project_"]: "59",
                    ["9_mid-Term_Science_In-Class Score_"]: "59",
                    ["9_mid-Term_Science_Homework Completion_"]: "S",
                    ["9_final-Term_Science_Reading Project_"]: "59",
                    ["9_final-Term_Science_In-Class Score_"]: "59",
                    ["9_final-Term_Science_Homework Completion_"]: "N",
                    ["9_final-Term_Science_Comment_"]: "Good",

                    ["9_mid-Term_Science_In-Class Score_HomeWork1"]: "59",
                    ["9_mid-Term_Science_In-Class Score_HomeWork2"]: "59",
                    ["9_mid-Term_Science_Reading Project_Project1"]: "99",
                    ["9_mid-Term_Science_Reading Project_Project2"]: "99",

                    ["9_mid-Term_Science_Homework Completion_Homework1 Completion"]: "E",
                    ["9_mid-Term_Science_Homework Completion_Homework2 Completion"]: "S",
                },
                {
                    StudentID: "10",
                    StudentChineseName: "王十明",
                    StudentEnglishName: "John Wang10",
                    StudentNumber: "30110",
                    StudentPhotoBase64Code: "YUGUHGBJKBJHKGUKHLHUYGBKJG&*^*GIJBHJKY(*YGUVGJBKBHVFUI...",
                    ClassName: "301",
                    SeatNo: "10",
                    index: 10,
                    ["10_mid-Term_Language Art_Reading Project_"]: "90",
                    ["10_mid-Term_Language Art_In-Class Score_"]: "90",
                    ["10_mid-Term_Language Art_Homework Completion_"]: "E",
                    ["10_mid-Term_Language Art_Comment_"]: "Good",
                    ["10_final-Term_Language Art_Reading Project_"]: "90",
                    ["10_final-Term_Language Art_In-Class Score_"]: "90",
                    ["10_final-Term_Language Art_Homework Completion_"]: "G",
                    ["10_final-Term_Language Art_Comment_"]: "Good",

                    ["10_mid-Term_Language Art_Grammar Exam_"]: "90",
                    ["10_mid-Term_Language Art_Works Well Independently_"]: "E",
                    ["10_mid-Term_Language Art_Works Well in a Group_"]: "S",
                    ["10_mid-Term_Language Art_Behavior_"]: "N",
                    ["10_final-Term_Language Art_Grammar Exam_"]: "90",
                    ["10_final-Term_Language Art_Works Well Independently_"]: "G",
                    ["10_final-Term_Language Art_Works Well in a Group_"]: "S",
                    ["10_final-Term_Language Art_Behavior_"]: "N",


                    ["10_mid-Term_Science_Reading Project_"]: "60",
                    ["10_mid-Term_Science_In-Class Score_"]: "60",
                    ["10_mid-Term_Science_Homework Completion_"]: "S",
                    ["10_final-Term_Science_Reading Project_"]: "60",
                    ["10_final-Term_Science_In-Class Score_"]: "60",
                    ["10_final-Term_Science_Homework Completion_"]: "N",
                    ["10_final-Term_Science_Comment_"]: "Good",

                    ["10_mid-Term_Science_In-Class Score_HomeWork1"]: "60",
                    ["10_mid-Term_Science_In-Class Score_HomeWork2"]: "60",
                    ["10_mid-Term_Science_Reading Project_Project1"]: "100",
                    ["10_mid-Term_Science_Reading Project_Project2"]: "100",

                    ["10_mid-Term_Science_Homework Completion_Homework1 Completion"]: "E",
                    ["10_mid-Term_Science_Homework Completion_Homework2 Completion"]: "S",
                }
            ];
            //$scope.TermList = [
            //    {
            //        TermID: "1",
            //        TermName: "mid-Term",
            //        RefCourseID: "3597",
            //        TermRatio: 35,
            //        InputStartTime: "2018/3/1 00:00",
            //        InputEndTime: "2018/3/31 23:59",
            //        Lock: false
            //    },
            //    {
            //        TermID: "2",
            //        TermName: "final-Term",
            //        RefCourseID: "3597",
            //        TermRatio: 35,
            //        InputStartTime: "2018/3/1 00:00",
            //        InputEndTime: "2018/3/31 23:59",
            //        Lock: false,
            //    }
            //];
            //$scope.SubjectList = [
            //    {
            //        SubjectID: "1",
            //        SubjectName: "Language Art",
            //        RefTermID: "1",
            //        SubjectRatio: 50
            //    },
            //    {
            //        SubjectID: "2",
            //        SubjectName: "Science",
            //        RefTermID: "1",
            //        SubjectRatio: 50
            //    }
            //];
            //$scope.AssessmentList = [
            //    {
            //        AssessmentID: "1",
            //        AssessmentName: "In-Class Score",
            //        RefSubjectID: "1",
            //        AllowInputTeacherRole: "教師一",
            //        AssessmentRatio: 50,
            //        AllowCostumSubItems: true,
            //        InputType: "Score"

            //    },
            //    {
            //        AssessmentID: "2",
            //        AssessmentName: "Reading Project",
            //        RefSubjectID: "1",
            //        AllowInputTeacherRole: "教師一",
            //        AssessmentRatio: 50,
            //        AllowCostumSubItems: true,
            //        InputType: "Score"

            //    },
            //    {
            //        AssessmentID: "3",
            //        AssessmentName: "Homework Completion",
            //        RefSubjectID: "1",
            //        AllowInputTeacherRole: "教師一",
            //        AssessmentRatio: 0,
            //        AllowCostumSubItems: true,
            //        InputType: "Indicator"

            //    },
            //    {
            //        AssessmentID: "4",
            //        AssessmentName: "Comment",
            //        RefSubjectID: "1",
            //        AllowInputTeacherRole: "教師一",
            //        AssessmentRatio: 0,
            //        AllowCostumSubItems: false,
            //        InputType: "Text"
            //    }
            //];
            $scope.setCurrentCourse = function (course) {
                $scope.current.currentCourse = course;
                $scope.current.currentTerm = course.TermList[0];
                $scope.current.currentSubject = course.TermList[0].SubjectList[0];
                $scope.current.currentAssessment = course.TermList[0].SubjectList[0].AssessmentList[0];
                $scope.current.currentTermList = course.TermList;
                $scope.current.currentSubjectList = $scope.current.currentTerm.SubjectList;
                $scope.current.currentAssessmentList = $scope.current.currentSubject.AssessmentList;
                

                //$scope.currentFilterItem.currentCourseName = course.CourseName;
                //$scope.currentFilterItem.currentTermName = $scope.TermList[0].TermName;
                //$scope.currentFilterItem.currentSubjectName = $scope.SubjectList[0].SubjectName;
                //$scope.currentFilterItem.currentAssessmentName = "All";
                $scope.setDropdownAssessmentList();
            };

            $scope.setCurrentTerm = function (term) {

                $scope.current.currentTerm = term;
                $scope.current.currentSubject = term.SubjectList[0];
                $scope.current.currentAssessment = term.SubjectList[0].AssessmentList[0];                
                $scope.current.currentSubjectList = $scope.current.currentTerm.SubjectList;
                $scope.current.currentAssessmentList = $scope.current.currentSubject.AssessmentList;

                //$scope.currentFilterItem.currentTermName = term.TermName;
                //$scope.currentFilterItem.currentSubjectName = $scope.SubjectList[0].SubjectName;
                //$scope.currentFilterItem.currentAssessmentName = "All";
                $scope.setDropdownAssessmentList();
            };

            $scope.setCurrentSubject = function (subject) {

                $scope.current.currentSubject = subject;
                $scope.current.currentAssessment = subject.AssessmentList[0];                
                $scope.current.currentAssessmentList = $scope.current.currentSubject.AssessmentList;

                //$scope.currentFilterItem.currentSubjectName = subject.SubjectName;
                //$scope.currentFilterItem.currentAssessmentName = "All";
                $scope.setDropdownAssessmentList();
            };

            $scope.setCurrentAssessmentName = function (assessment) {
                $scope.current.currentAssessment = assessment;  
            };

            $scope.setDropdownAssessmentList = function () {
                $scope.dropdownAssessmentList = [
                    {
                        AssessmentID: "",
                        AssessmentName: "All",
                        RefSubjectID: "",
                        AllowInputTeacherRole: "",
                        AssessmentRatio: 0,
                        AllowCostumSubItems: true,
                        InputType: ""
                    }
                ];
                $scope.current.currentAssessmentList.forEach(function (assessment) {
                    
                    $scope.dropdownAssessmentList.push(assessment)
                    
                });

                $scope.current.currentAssessment = $scope.dropdownAssessmentList[0];  

                $scope.setSubItemList();
            };


            $scope.setSubItemList = function ()
            {
                $scope.current.currentSubItemList = [];

                if ($scope.current.currentAssessment.AssessmentName == "All") {

                    $scope.current.currentSubItemList = $scope.current.currentAssessmentList;
                }
                else {

                    $scope.current.currentAssessment.CostumSubItemList.forEach(function (CostumSubItem) {

                        $scope.current.currentSubItemList.push(CostumSubItem)

                    });

                    //CostumSubItemList = [
                    //    {
                    //        SubItemID: "1",
                    //        SubItemName: "HW1",
                    //        RefAssessmentID: "1",
                    //        Date: "2018/3/12",
                    //        Limit: "100",
                    //        Description: "學生平時作業的紀錄",
                    //        CostumSubItemRatio: 50
                    //    },
                    //    {
                    //        SubItemID: "2",
                    //        SubItemName: "HW2",
                    //        RefAssessmentID: "1",
                    //        Date: "2018/3/12",
                    //        Limit: "100",
                    //        Description: "學生平時作業的紀錄",
                    //        CostumSubItemRatio: 50
                    //    },
                    //]
                    //$scope.current.currentSubItemList = CostumSubItemList;

                }

            }

            //$scope.setSubItemList = function () {
            //    $scope.SubItemList = [];

            //    if ($scope.currentFilterItem.currentAssessmentName == "All") {
            //        $scope.SubItemList = $scope.AssessmentList;
            //    }
            //    else {

            //        CostumSubItemList = [
            //            {
            //                SubItemID: "1",
            //                SubItemName: "HW1",
            //                RefAssessmentID: "1",
            //                Date: "2018/3/12",
            //                Limit: "100",
            //                Description: "學生平時作業的紀錄",
            //                CostumSubItemRatio: 50
            //            },
            //            {
            //                SubItemID: "2",
            //                SubItemName: "HW2",
            //                RefAssessmentID: "1",
            //                Date: "2018/3/12",
            //                Limit: "100",
            //                Description: "學生平時作業的紀錄",
            //                CostumSubItemRatio: 50
            //            },


            //        ]

            //        $scope.SubItemList = CostumSubItemList;

            //    }


            //    //$scope.AssessmentList.forEach(function (assessment) {
            //    //    if (assessment.AllowCostumSubItems == true) {
            //    //        $scope.dropdownAssessmentList.push(assessment)
            //    //    }
            //    //});

            //};





            $scope.setStudentList = function (course) {
                $scope.currentFilterItem.currentCourseName = course.CourseName;
            };

            $scope.setAssessmentList = function (course) {
                $scope.currentFilterItem.currentCourseName = course.CourseName;
            };

            
            $scope.setCurrentCourse($scope.CourseList[0]);

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
