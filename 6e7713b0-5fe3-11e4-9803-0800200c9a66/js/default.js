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
            $scope.connection = gadget.getContract("ischool.CooperationExam.Input.teacher");
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
                        course_id: course.id
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
                                    var key = student.id + "#" + exam.id;
                                    exams.push({
                                        idx: 0 + j * 2,
                                        id: exam.id,
                                        name: exam.exam_name,
                                        seq: 1,
                                        score: (score_map[key] ? score_map[key].score1 : null),
                                    });
                                    exams.push({
                                        idx: 1 + j * 2,
                                        id: exam.id,
                                        name: exam.exam_name,
                                        seq: 2,
                                        score: (score_map[key] ? score_map[key].score2 : null),
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
                var temp = Math.ceil(currentStudentExam.tmp_score);
                if (temp >= 0 && temp <= 100) {
                    $scope.saveGrade( /*student.id, course.id, exam.id, seq, temp*/ )
                        .then(function() {
                            //alert('Success');
                            currentStudentExam.score = currentStudentExam.tmp_score ;
                            if ($scope.currentStudent.idx + 1 < $scope.currentCourse.students.length)
                                $scope.setCurrentStudent($scope.currentCourse.students[$scope.currentStudent.idx + 1],currentStudentExam.idx);
                            $('#seatno-textbox').focus();
                        }, function() {
                            alert('Failed');
                        });

                }
            }
            $scope.saveGrade = function() {
                var deferred = $q.defer();
                setTimeout(function() {
                            deferred.resolve('Hello, ' + name + '!');
                            //deferred.reject('Greeting ' + name + ' is not allowed.');
                    }, 500);
                return deferred.promise;
                
                    // $scope.connection.send({
                    //     service: "SetSeqScore",
                    //     body: {
                    //         CourseID: $scope.currentCourse.CourseID,
                    //         Period: $scope.current.Period,
                    //         StudentID: $scope.currentStudent.StudentID,
                    //         Score: $scope.currentStudent.tempGrade
                    //     },
                    //     result: function(response, error, http) {
                    //         if (error !== null) {
                    //             reject('Greeting is not allowed.');
                    //         } else {
                    //             resolve('Hello,!');

                    //         }
                    //     },
                    // });
            }
        }
    ]);
