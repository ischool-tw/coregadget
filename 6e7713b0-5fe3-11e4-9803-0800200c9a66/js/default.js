/*
黃文奇 2014/10/31
黃耀明 2014/11/07
*/

$(document).ready(function() {
    $(window).resize(function() {
        $("#container-nav, #container-main").height($(window).height() - 50);
        console.log($(window).height() - 50);
    });
});
angular.module('entergrade', [])
    .filter('filterSeq', function() {
        return function(input, seq) {
            var re = [];
            if (input) {
                for (var i = 0; i < input.length; i++) {
                    if (input[i].seq == seq)
                        re.push(input[i]);
                };
            }
            return re;
        };
    })
    .controller('MainCtrl', ['$scope', '$q',
        function($scope, $q) {
            $scope.connection = gadget.getContract("OneAdmin.CooperationExam.Teacher");
            $scope.courses = [];
            $scope.currentCourse = {};
            $scope.currentStudent = {};
            $scope.currentStudentExam = {};
            $scope.getCourseInfo = function(course) {
                $scope.currentStudent = {};
                $scope.currentStudentExam = {};
                $scope.connection.send({
                    service: "GetCourseInfo",
                    body: {
                        Request: {
                            //SchoolYear: "103",
                            //Semester: "1",
                            CourseID: course.id
                        }
                    },
                    result: function(response, error, http) {
                        if (error !== null) {
                            // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                        } else {
                            console.log(response);
                            var score_map = {};
                            response.students = [].concat(response.students);
                            response.exams = [].concat(response.exams);
                            response.scores = [].concat(response.scores);
                            //整理score成hash
                            for (var i = 0; i < response.scores.length; i++) {
                                var score = response.scores[i];
                                if (!score) {
                                    continue;
                                }

                                if ($scope.currentCourse.sequence == '1')
                                    score.score2 = (score.score2 ? '*' : '');
                                else
                                    score.score1 = (score.score1 ? '*' : '');

                                score_map[score.ref_student_id + '#' + score.ref_exam_id] = score;
                            };

                            for (var i = 0; i < response.students.length; i++) {
                                var student = response.students[i];
                                if (!student) {
                                    continue;
                                }
                                student.idx = i;
                                var exams = [];
                                for (var j = 0; j < response.exams.length; j++) {
                                    var exam = response.exams[j];
                                    if (!exam) {
                                        continue;
                                    }

                                    //exam.start_time
                                    //exam.end_time
                                    //moment() > moment('2014/11/7 17:27:03','YYYY/MM/DD HH:mm:SS')

                                    var startTime = moment(exam.start_time, 'YYYY/MM/DD HH:mm:SS');
                                    var endTime = moment(exam.end_time, 'YYYY/MM/DD HH:mm:SS');
                                    exam.disabled = (moment() > endTime || moment() < startTime);

                                    var key = student.id + "#" + exam.id;
                                    exams.push({
                                        idx: 0 + j * 2,
                                        id: exam.id,
                                        name: exam.exam_name,
                                        seq: 1,
                                        score: (score_map[key] ? score_map[key].score1 : null),
                                        disabled: exam.disabled
                                    });
                                    exams.push({
                                        idx: 1 + j * 2,
                                        id: exam.id,
                                        name: exam.exam_name,
                                        seq: 2,
                                        score: (score_map[key] ? score_map[key].score2 : null),
                                        disabled: exam.disabled
                                    });
                                };
                                student.exams = exams;
                            };

                            $scope.currentCourse.exams = response.exams;
                            $scope.currentCourse.students = response.students;
                            $scope.$apply();
                        }
                    }
                });
            }
            $scope.getCourses = function() {
                $scope.courses = [];
                $scope.currentCourse = {};

                $scope.connection.send({
                    service: "GetCourses",
                    body: {},
                    result: function(response, error, http) {
                        if (error !== null) {
                            // $scope.set_error_message('#mainMsg', 'GetExamScore', error);
                        } else {
                            console.log(response);
                            if (response !== null && response.data) {
                                $scope.courses = [].concat(response.data);
                                if ($scope.courses.length) {
                                    $scope.setCurrentCourse($scope.courses[0]);
                                }
                            }
                            $scope.$apply();
                        }
                    }
                });
            }
            $scope.setCurrentCourse = function(course) {
                $scope.currentCourse = course;
                $scope.getCourseInfo(course);
            }
            $scope.setCurrentStudent = function(student, examIndex) {
                if (student.exams[examIndex].seq != $scope.currentCourse.sequence) {
                    return;
                }

                if (student.exams[examIndex].disabled)
                    return;

                $scope.currentStudent = student;
                student.exams[examIndex].tmp_score = student.exams[examIndex].score;
                $scope.currentStudentExam = student.exams[examIndex];
            }
            $scope.setCurrentStudentExam = function(exam) {
                exam.tmp_score = exam.score;
                $scope.currentStudentExam = exam;
            }
            $scope.enterGrade = function(event) {
                if (event.keyCode !== 13) return;
                if (!$scope.currentStudent) return;
                if (!$scope.currentStudentExam) return;
                var currentStudentExam = $scope.currentStudentExam;

                var temp = $scope.currentStudentExam.tmp_score;
                if (temp) {
                    temp = $scope.FloatMath(temp, 'round', 0);
                    $scope.currentStudentExam.tmp_score = temp;
                }

                if (temp >= 0 && temp <= 100 || temp == '') {
                    $scope.saveGrade({
                            studentID: $scope.currentStudent.id,
                            courseID: $scope.currentCourse.id,
                            examID: $scope.currentStudentExam.id,
                            score: temp
                        })
                        .then(function() {
                            //alert('Success');
                            currentStudentExam.score = currentStudentExam.tmp_score;
                            if ($scope.currentStudent.idx + 1 < $scope.currentCourse.students.length)
                                $scope.setCurrentStudent($scope.currentCourse.students[$scope.currentStudent.idx + 1], currentStudentExam.idx);
                            //$('#grade-textbox').focus();
                            //$('#grade-textbox').select();
                        }, function(info) {
                            if (info && info.dsaError)
                                alert(info.dsaError.message);
                            else
                                alert('儲存發生不明原因錯誤。');
                        });

                }
            }
            $scope.saveGrade = function(req) {
                var deferred = $q.defer();

                $scope.connection.send({
                    service: "SetSeqScore",
                    body: {
                        Request: {
                            CourseID: req.courseID,
                            ExamID: req.examID,
                            StudentID: req.studentID,
                            Score: req.score
                        }
                    },
                    result: function(response, error, http) {
                        if (error !== null) {
                            deferred.reject(error);
                        } else {
                            deferred.resolve('Hello, ' + name + '!');
                        }
                    },
                });
                return deferred.promise;
            }

            $scope.FloatMath = function(arg1, type, places) {
                places = places || 0;
                switch (type) {
                    case "ceil":
                        return (Math.ceil(arg1 * Math.pow(10, places))) / Math.pow(10, places);
                    case "floor":
                        return (Math.floor(arg1 * Math.pow(10, places))) / Math.pow(10, places);
                    case "round":
                        return (Math.round(arg1 * Math.pow(10, places))) / Math.pow(10, places);
                    default:
                        return arg1;
                }
            };
        }
    ]);
