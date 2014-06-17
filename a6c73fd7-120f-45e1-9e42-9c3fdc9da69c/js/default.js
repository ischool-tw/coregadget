angular.module('attendance', [])

.controller('MainCtrl', ['$scope',
    function($scope) {

        $scope.system_position = gadget.params.system_position || "student";

        if ($scope.system_position === "student")
            $scope.connection = gadget.getContract("ischool.retake.student");
        else
            $scope.connection = gadget.getContract("ischool.retake.parent");

        //-> 取得學生名單
        $scope.getStudentInfo = function() {
            $scope.connection.send({
                service: "_.GetStudentInfo",
                body: '',
                result: function(response, error, http) {
                    if (error !== null) {
                        $scope.set_error_message('#mainMsg', 'GetStudentInfo', error);
                    } else {
                        //console.log(response);
                        $scope.$apply(function() {
                            $scope.studentsinfo = response.Result.Student;

                            if ($scope.studentsinfo.length > 0) { //長度要大於０，至少要有一筆記錄
                                $scope.currentStudent = $scope.studentsinfo[0]; //預設選取第一筆記錄
                                $scope.selectStudent($scope.studentsinfo[0]); //第一筆記錄詳細資料
                            }
                        });
                    }
                }
            });
        }

        $scope.selectStudent = function(item) {
            delete $scope.notexams;
            delete $scope.currentNotExam;
            delete $scope.currentCourse;
            delete $scope.currentAttendanceDate;

            $scope.currentStudent = item;
            $scope.getNotExam();
            $scope.getAttendance();
        }

        //-> 取得扣考記錄
        $scope.getNotExam = function() {
            $scope.connection.send({
                service: "_.GetNotExam",
                body: {
                    Request: {
                        StudentId: $scope.currentStudent.StudentId
                    }
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'GetNotExam', error);
                    } else {
                        //console.log(response);
                        $scope.$apply(function() {
                            if (response !== null && response.Courses !== null && response.Courses !== '') {
                                $scope.notexams = [].concat(response.Courses.Seme);

                                //-> 排序，由大到小
                                $scope.notexams.sort(function(x,y){
                                    return x.Month < y.Month;
                                });

                                if ($scope.notexams.length > 0) { //長度要大於０，至少要有一筆記錄
                                    $scope.currentNotExam = $scope.notexams[0]; //預設選取第一筆記錄
                                    $scope.selectNotExam($scope.notexams[0]); //第一筆記錄詳細資料
                                }
                            }
                        });
                    }
                }
            });
        }

        $scope.selectNotExam = function(item) {
            $scope.currentNotExam = item;

            angular.forEach($scope.notexams, function(item) {
                item.selected = false; //先設定通通不選取
            })

            item.selected = true;

            $scope.currentNotExam.courses = [{CourseId:0, CourseName:'所有課程'}].concat($scope.currentNotExam.Course);

            $scope.currentNotExam.Course = [].concat($scope.currentNotExam.Course);

            if ($scope.currentNotExam.courses.length > 0) {
                $scope.selectCourse($scope.currentNotExam.courses[0]);
            }
        }

        $scope.selectCourse = function(item) {
            $scope.currentCourse = item;

            angular.forEach($scope.currentNotExam.courses, function(item) {
                item.selected = false; //先設定通通不選取
            })

            item.selected = true;

            $scope.filterAttendance();
        }

        //-> 取得缺曠記錄
        $scope.getAttendance = function() {
            $scope.connection.send({
                service: "_.GetAttendance",
                body: {
                    Request: {
                        StudentId: $scope.currentStudent.StudentId
                    }
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'GetAttendance', error);
                    } else {
                        //console.log(response);
                        $scope.$apply(function() {
                            if (response !== null && response.Attendance !== null && response.Attendance !== '' && response.Attendance.Seme !== null && response.Attendance.Seme !== '') {
                                $scope.attendances = [].concat(response.Attendance.Seme);
                            }
                        });
                    }
                }
            });
        }

        $scope.filterAttendance = function() {
            $scope.currentAttendanceDate = [];
            angular.forEach($scope.attendances,function(attendance){
                if(attendance.SchoolYear === $scope.currentNotExam.SchoolYear &&
                    attendance.Semester === $scope.currentNotExam.Semester &&
                    attendance.Month === $scope.currentNotExam.Month) {
                    angular.forEach(attendance.Course,function(course){
                        if(course.CourseId === $scope.currentCourse.CourseId || $scope.currentCourse.CourseId === 0) {
                            var items = [];
                            course.AttendanceDate = [].concat(course.AttendanceDate);
                            angular.forEach(course.AttendanceDate,function(item){
                                var temp = {
                                    CourseName:course.CourseName,
                                    Date:item.Date,
                                    P1:'',
                                    P2:'',
                                    P3:'',
                                    P4:'',
                                    P5:'',
                                    P6:'',
                                    P7:'',
                                    P8:'',
                                };
                                angular.forEach([].concat(item.Attendance),function(att){
                                    if(att.Period === "1" && att.Type === "缺課")
                                        temp.P1 = "X";
                                    else if(att.Period === "2" && att.Type === "缺課")
                                        temp.P2 = "X";
                                    else if(att.Period === "3" && att.Type === "缺課")
                                        temp.P3 = "X";
                                    else if(att.Period === "4" && att.Type === "缺課")
                                        temp.P4 = "X";
                                    else if(att.Period === "5" && att.Type === "缺課")
                                        temp.P5 = "X";
                                    else if(att.Period === "6" && att.Type === "缺課")
                                        temp.P6 = "X";
                                    else if(att.Period === "7" && att.Type === "缺課")
                                        temp.P7 = "X";
                                    else if(att.Period === "8" && att.Type === "缺課")
                                        temp.P8 = "X";
                                });
                                items.push(temp);
                            });
                            $scope.currentAttendanceDate = $scope.currentAttendanceDate.concat(items);
                        }
                    });

                    //-> 時間排序
                    // $scope.currentAttendanceDate.sort(function(x,y){
                    //     return x.Date < y.Date;
                    // });
                }
            });
        }

        // 錯誤訊息
        var set_error_message = function(select_str, serviceName, error) {
            if (serviceName) {
                var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
                if (error !== null) {
                    if (error.dsaError) {
                        if (error.dsaError.status === "504") {
                            switch (error.dsaError.message) {
                                case '501':
                                    tmp_msg = '<strong>很抱歉，您無讀取資料權限！</strong>';
                                    break;
                                default:
                                    tmp_msg = '<strong>' + error.dsaError.message + '</strong>';
                            }
                        } else if (error.dsaError.message) {
                            tmp_msg = error.dsaError.message;
                        }
                    } else if (error.loginError.message) {
                        tmp_msg = error.loginError.message;
                    } else if (error.message) {
                        tmp_msg = error.message;
                    }
                    $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
                    $('.my-err-info').click(function() {
                        alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))
                    });
                }
            } else {
                $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + error + "\n</div>");
            }
            $('body').scrollTop(0);
        };


        //-> 判斷身份取得資料
        if ($scope.system_position === 'parent') {
            $scope.getStudentInfo();
        }

        else {
            $scope.selectStudent({
                StudentId: null
            });
        }

    }
])


// jQuery(function () {
//     Attendance.init();

//     $('body').on('click', '#children li', function() {
//         $('#child_name').html($(this).html());
//         $('#select1, #select2').html('');
//         $('#Attendance tbody').html('載入中...');
//         Attendance.childrenChange($(this).attr('index'));
//     });
// });

// Attendance = function() {
//     var _system_position = gadget.params.system_position || "student";
//     var _connection = (_system_position === "student" ? gadget.getContract("ischool.retake.student") : gadget.getContract("ischool.retake.parent"));
//     var _students = [];
//     var _student = {};


//     var main = function() {
//         if (_system_position === 'parent') {
//             _connection.send({
//                 service: "_.GetStudentInfo",
//                 body: {},
//                 result: function (response, error, http) {
//                     if (error !== null) {
//                         set_error_message('#mainMsg', 'GetStudentInfo', error);
//                     } else {
//                         var ret = [];
//                         if (response.Result && response.Result.Student) {
//                             $(response.Result.Student).each(function(index, item) {
//                                 _students[index] = item;
//                                 ret.push('<li index="' + index + '">' + (item.StudentName || '未設定') + '</li>');
//                             });

//                             $('#children ul')
//                                 .html(ret.join(''))
//                                 .find('li:first').trigger('click');
//                             $('#children').hover(
//                                 function() {
//                                     $('#children .my-childname').height('auto');
//                                 },
//                                 function() {
//                                     $('#children .my-childname').height(0);
//                                 }
//                             );
//                         } else {
//                             $("#children").html('目前無資料');
//                         }
//                     }
//                 }
//             });
//         } else {
//             $("#children").remove();
//             getAttendance();
//         }
//     }

//     // 取得缺曠資料
//     var getAttendance = function() {
//         var bAttendance = false;
//         var bNotExam = false;
//         var attendances = [];
//         var courses = [];

//         var dataFinish = function() {
//             if (bAttendance && bNotExam) {
//                 if (courses.length > 0) {
//                     // 以課程為主，合併缺曠資料
//                     $(courses).each(function(index, seme){
//                         var key = 'sems' + seme.SchoolYear + '-' + seme.Semester + '-' + seme.Month;
//                         $(seme.Course).each(function(index, course){
//                             if (attendances[key] && attendances[key]['c' + course.CourseId]) {
//                                 course.AttendanceDate = attendances[key]['c' + course.CourseId].AttendanceDate;
//                             }
//                         });

//                         // 合併日期分類缺曠資料
//                         seme.ColDates = (attendances[key] && attendances[key].ColDates) ? attendances[key].ColDates : [];
//                     });

//                     // 排序
//                     courses.sort($.by('desc', 'SchoolYear', $.by('desc', 'Semester', $.by('desc', 'Month'))));

//                     // 加入學生的物件中
//                     _student.courses = courses;

//                     // console.log(courses);
//                     setSemeSelectList();
//                 } else {
//                     $('#Attendance tbody').html('<tr><td colspan="10">目前無資料</td></tr>');
//                     $('#NotExam tbody').html('<tr><td colspan="3">目前無資料</td></tr>');
//                 }
//             }
//         }

//         var getData = function() {
//             // 取得缺曠
//             _connection.send({
//                 service: "_.GetAttendance",
//                 body: {
//                     Request: {
//                         StudentId: (_student.StudentId || '')
//                     }
//                 },
//                 result: function (response, error, http) {
//                     if (error !== null) {
//                         set_error_message('#mainMsg', 'GetAttendance', error);
//                     } else {
//                         if (response.Attendance && response.Attendance.Seme) {
//                             attendances = myHandleArray(response.Attendance.Seme);

//                             $(attendances).each(function(index, seme){
//                                 var key = 'sems' + seme.SchoolYear + '-' + seme.Semester + '-' + seme.Month;
//                                 attendances[key] = seme.Course;
//                                 attendances[key].ColDates = [];


//                                 $(seme.Course).each(function(index, course){
//                                     attendances[key]['c' + course.CourseId] = course;

//                                     // 以日期來分類缺曠資料
//                                     $(course.AttendanceDate).each(function(index, adate){
//                                         if (!attendances[key].ColDates['D' + adate.Date]) {
//                                             attendances[key].ColDates['D' + adate.Date] = {
//                                                 Date: new Date(adate.Date || ''),
//                                                 Courses: []
//                                             };
//                                             attendances[key].ColDates.push(attendances[key].ColDates['D' + adate.Date]);
//                                         }
//                                         if (!attendances[key].ColDates['D' + adate.Date]['Course' + course.CourseId]) {
//                                             var tmp2 = adate;
//                                             tmp2.CourseName = course.CourseName;

//                                             attendances[key].ColDates['D' + adate.Date]['Course' + course.CourseId] = tmp2;
//                                             attendances[key].ColDates['D' + adate.Date]['Courses'].push(tmp2);
//                                         }
//                                     });
//                                     attendances[key].ColDates.sort($.by('desc', 'Date'));
//                                 });
//                             });
//                         }
//                         bAttendance = true;
//                         dataFinish();
//                     }
//                 }
//             });

//             // 取得所有課程及扣考/缺課次數
//             _connection.send({
//                 service: "_.GetNotExam",
//                 body: {
//                     Request: {
//                         StudentId: (_student.StudentId || '')
//                     }
//                 },
//                 result: function (response, error, http) {
//                     if (error !== null) {
//                         set_error_message('#mainMsg', 'GetNotExam', error);
//                     } else {
//                         if (response.Courses && response.Courses.Seme) {
//                             courses = myHandleArray(response.Courses.Seme);

//                             $(courses).each(function(index, seme){
//                                 var key = 'sems' + seme.SchoolYear + '-' + seme.Semester + '-' + seme.Month;
//                                 courses[key] = seme.Course;
//                             });
//                         }

//                         bNotExam = true;
//                         dataFinish();
//                     }
//                 }
//             });
//         };

//         if (_student.attendances) {
//             bAttendance = true;
//             bNotExam = true;
//             dataFinish();
//         } else {
//             getData();
//         }
//     }

//     // 顯示梯次的下拉選單
//     var setSemeSelectList = function() {
//         var courses = _student.courses;
//         var optionsSeme = [];
//         $(courses).each(function(index, item){
//             var text = item.SchoolYear + '學年度';
//             text += (item.Semester === '0') ? ' 暑期' : ' 第' + item.Semester + '學期';
//             text += ' ' + item.Month + '梯次';
//             optionsSeme.push('<option value="' + index + '"' +
//                 ' data-schoolYear="' + item.SchoolYear + '"' +
//                 ' data-semester="' + item.Semester + '"' +
//                 ' data-month="' + item.Month + '">' + text + '</option>'
//             );
//         });
//         $('#select1').html(optionsSeme.join(''));
//         $('#select1').change(function(){
//             Attendance.semeChange();
//         });
//         $('#select1 option:first').trigger('change');
//     };

//     // 顯示課程的下拉選單
//     var setCourseSelectList = function() {
//         var attendances = _student.courses;
//         var optionsCourse = [];
//         var key = $('#select1').val();
//         optionsCourse.push('<option value="-1">所有課程</option>');

//         if (attendances[key]) {
//             attendances[key].Course = myHandleArray(attendances[key].Course);
//             $(attendances[key].Course).each(function(index, course){
//                 optionsCourse.push('<option value="' + index + '">' + course.CourseName + '</option>');
//             });
//             $('#select2').html(optionsCourse.join(''));
//             $('#select2').change(function(){
//                 Attendance.courseChange($(this).val());
//             });
//             $('#select2 option:first').trigger('change');
//         }
//     };

//     // 顯示所有課程的扣考情況
//     var showNotExam = function() {
//         var key1 = $('#select1').val();
//         var key2 = $('#select2').val();
//         var items = [];
//         var courses = _student.courses[key1];
//         if (courses) {
//             $(courses.Course).each(function(index, course){
//                 if (key2 === '-1' || key2 === index.toString()) {
//                     items.push('' +
//                         '<tr>' +
//                           '<td>' + (course.CourseName || '') + '</td>' +
//                           '<td>' + (course.SumPeriod || 0) + '</td>' +
//                           '<td>' + (course.NotExam === 't' ? 'V' : '&nbsp;') + '</td>' +
//                         '</tr>'
//                     );
//                 }
//             });
//         }

//         if (items.length > 0) {
//             $('#NotExam tbody').html(items.join(''));
//         } else {
//             $('#NotExam tbody').html('<tr><td colspan="3">目前無資料</td></tr>');
//         }
//     };

//     // 顯示缺曠
//     var showAttendance = function() {
//         var key1 = $('#select1').val();
//         var key2 = $('#select2').val();
//         var items = [];
//         var courseName = '';
//         var courses = _student.courses[key1];

//         var processData = function(data) {
//             $(data).each(function(index, adate){
//                 var periods = {};
//                 $(adate['Attendance']).each(function(index, item){
//                     periods['Periods' + item.Period] = item.Type;
//                 });

//                 items.push('<tr>' +
//                     '<td>' + courseName + '</td>' +
//                     '<td>' + adate.Date + '</td>' +
//                     '<td>' + (periods['Periods1'] ? 'X' : '&nbsp;') + '</td>' +
//                     '<td>' + (periods['Periods2'] ? 'X' : '&nbsp;') + '</td>' +
//                     '<td>' + (periods['Periods3'] ? 'X' : '&nbsp;') + '</td>' +
//                     '<td>' + (periods['Periods4'] ? 'X' : '&nbsp;') + '</td>' +
//                     '<td>' + (periods['Periods5'] ? 'X' : '&nbsp;') + '</td>' +
//                     '<td>' + (periods['Periods6'] ? 'X' : '&nbsp;') + '</td>' +
//                     '<td>' + (periods['Periods7'] ? 'X' : '&nbsp;') + '</td>' +
//                     '<td>' + (periods['Periods8'] ? 'X' : '&nbsp;') + '</td>' +
//                     '</tr>'
//                 );
//             });
//         };

//         if (courses) {
//             if (key2 === '-1') {
//                 // 所有課程
//                 if (courses.ColDates) {
//                     $(courses.ColDates).each(function(index, adate){
//                         $(adate.Courses).each(function(index, course){
//                             courseName = course.CourseName;
//                             processData(course);
//                         });
//                     });
//                 }
//             } else {
//                 // 單一課程
//                 if (courses.Course && courses.Course[key2] && courses.Course[key2]['AttendanceDate']) {
//                     courseName = courses['Course'][key2]['CourseName'];
//                     processData(courses['Course'][key2]['AttendanceDate']);
//                 }
//             }
//         }

//         if (items.length > 0) {
//             $('#Attendance tbody').html(items.join(''));
//         } else {
//             $('#Attendance tbody').html('<tr><td colspan="10">目前無資料</td></tr>');
//         }
//     };

//     // 轉成陣列
//     var myHandleArray = function(obj) {
//         var result;

//         result = void 0;
//         if (!$.isArray(obj)) {
//             result = [];
//            if (obj) {
//               result.push(obj);
//             }
//         } else {
//             result = obj;
//         }
//         return result;
//     };

//     // 錯誤訊息
//     var set_error_message = function(select_str, serviceName, error) {
//         if (serviceName) {
//             var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
//             if (error !== null) {
//                 if (error.dsaError) {
//                     if (error.dsaError.status === "504") {
//                         switch (error.dsaError.message) {
//                             case '501':
//                                 tmp_msg = '<strong>很抱歉，您無讀取資料權限！</strong>';
//                                 break;
//                             default:
//                                 tmp_msg = '<strong>' + error.dsaError.message + '</strong>';
//                         }
//                     } else if (error.dsaError.message) {
//                         tmp_msg = error.dsaError.message;
//                     }
//                 } else if (error.loginError.message) {
//                     tmp_msg = error.loginError.message;
//                 } else if (error.message) {
//                     tmp_msg = error.message;
//                 }
//                 $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
//                 $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
//             }
//         } else {
//             $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + error + "\n</div>");
//         }
//         $('body').scrollTop(0);
//     };

//     return {
//         init: function() {
//             main();
//         },
//         semeChange: function() {
//             setCourseSelectList();
//         },
//         courseChange: function() {
//             showNotExam();
//             showAttendance();
//         },
//         childrenChange: function(id) {
//             if (id) {
//                 _student = _students[id];
//                 getAttendance();
//             }
//         }
//     }
// }();

// // 排序
// //ex: s.sort($.by('desc', 'last', $.by('asc', 'first')));
// (function($) {
//     return $.by = function(model, name, minor) {
//         return function(o, p) {
//             var a, b;
//             if (o && p && typeof o === "object" && typeof p === "object") {
//                 a = o[name];
//                 b = p[name];
//                 if (a === b) {
//                     return (typeof minor === "function" ? minor(o, p) : 0);
//                 }
//                 if (typeof a === typeof b) {
//                     if (parseInt(a, 10) && parseInt(b, 10)) {
//                         a = parseInt(a, 10);
//                         b = parseInt(b, 10);
//                     }
//                     if (model === "desc") {
//                         return (a > b ? -1 : 1);
//                     } else {
//                         return (a < b ? -1 : 1);
//                     }
//                 }
//                 if (typeof a < typeof b) {
//                     return -1;
//                 } else {
//                     return 1;
//                 }
//             } else {
//                 throw {
//                     name: "Error",
//                     message: "Expected an object when sorting by " + name
//                 };
//             }
//         };
//     };
// })(jQuery);
