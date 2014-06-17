angular.module('learning', []) //ng-app,[外掛模組]

.controller('MainCtrl', ['$scope',
    function($scope) { //scope＝中間人，介紹ng-app與ng-controller認識

        //-> get service
        $scope.connection = gadget.getContract("ischool.service_learning.student");

        //-> 取得學年度學期
        $scope.getSemester = function() {
            $scope.connection.send({
                service: "_.GetSemester",
                body: '',
                result: function(response, error, http) {
                    if (error !== null) {
                        $scope.set_error_message('#mainMsg', 'GetSemester', error);
                    } else {
                        //console.log(response); //檢查元素console用
                        $scope.$apply(function() { //apply用來更新選擇或變動的資料顯示
                            if (response !== null && response.Response !== null && response.Response !== '') {
                                $scope.semesters = [].concat(response.Response.Semester);

                                if ($scope.semesters.length > 0) { //長度要大於０，至少要有一筆記錄
                                    $scope.currentSemester = $scope.semesters[0]; //預設選取第一筆記錄
                                    $scope.selectSemester($scope.semesters[0]); //第一筆記錄詳細資料
                                }
                            }
                        });
                    }
                }
            });
        }

        $scope.selectSemester = function(item) { //selectSemester=item
            $scope.currentSemester = item; //指定選擇的學年度學期＝item


            //-> 學年度學期選取下拉變色
            angular.forEach($scope.semesters, function(item) {
                item.selected = false; //先設定通通不選取
            })

            item.selected = true; //設定被選取

            //-> 取得資料
            $scope.connection.send({
                service: "_.GetStudentDetail",
                body: {
                    Request: {
                        Condition: {
                            SchoolYear: item.SchoolYear,
                            Semester: item.Semester //最後一行給逗號，ＩＥ會爆炸
                        }
                    }
                }, //物件的寫法
                result: function(response, error, http) {
                    if (error !== null) {
                        $scope.set_error_message('#mainMsg', 'GetStudentDetail', error);
                    } else {
                        //console.log(response); //檢查元素console用

                        //-> 計算總時數
                        $scope.$apply(function() {
                            if (response !== null && response.Response !== null && response.Response !== '') {
                                $scope.records = [].concat(response.Response.Record); //當回傳得項目只有一個時，service會判斷成物件（多個時會是陣列），這裡寫法是將物件轉為陣列
                                $scope.totalHours = 0; //預設總時數為０
                                angular.forEach($scope.records, function(item) {
                                    $scope.totalHours += Math.abs(item.Hours * 100); //字串轉成數字，小數點２位計算，先變整數計算
                                })

                                $scope.totalHours = $scope.totalHours / 100; //還原為小數
                            }
                        });
                    }
                }
            });
        }

        // TODO: 錯誤訊息
        $scope.set_error_message = function(select_str, serviceName, error) {
            var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
            if (error !== null) {
                if (error.dsaError) {
                    if (error.dsaError.status === "504") {
                        switch (error.dsaError.message) {
                            case '501':
                                tmp_msg = '<strong>很抱歉，您無讀取資料權限！</strong>';
                                break;
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
        };

        $scope.getSemester();
    }
])




// var _gg = _gg || {};
// _gg.connection = gadget.getContract("ischool.service_learning.student");

// jQuery(function () {
//     _gg.GetSemester();
//     $('body').on('change', 'select[name=semester]', function() {
//         $('table[data-type=total] td').html('&nbsp;');
//         $('table[data-type=detail] tbody').html('');
//         _gg.list_schoolyear = $(this).find('option:selected').attr('school-year');
//         _gg.list_semester = $(this).find('option:selected').attr('semester');
//         _gg.GetStudentDetail();
//     })
// });


// // TODO: 載入具服務學習時數的學年度
// _gg.GetSemester = function() {
//     _gg.connection.send({
//         service: "_.GetSemester",
//         body: '',
//         result: function (response, error, http) {
//             if (error !== null) {
//                 _gg.set_error_message('#mainMsg', 'GetSemester', error);
//             } else {
//                 var _ref, items = [];
//                 if (((_ref = response.Response) != null ? _ref.Semester : void 0) != null) {
//                     $(response.Response.Semester).each(function(index, item) {
//                         items.push(
//                             '<option value="' + (item.SchoolYear || '') + (item.Semester || '') + '"' +
//                             ' school-year="' + (item.SchoolYear || '') + '"' +
//                             ' semester="' + (item.Semester || '') + '"' +
//                             '>' + (item.SchoolYear || '') + '學年度第' + (item.Semester || '') + '學期</option>'
//                         );
//                     });
//                 }
//                 $('select[name=semester]')
//                     .html(items.join('') || '<option value="">目前無資料</option>')
//                     .find('option:first').prop('selected', true).trigger('change');
//             }
//         }
//     });
// };

// // TODO: 載入個人服務學習時間
// _gg.GetStudentDetail = function() {
//     $('table[data-type=total] td').html('&nbsp;');
//     $('table[data-type=detail] tbody').html('');

//     if (_gg.list_schoolyear && _gg.list_semester) {
//         _gg.connection.send({
//             service: "_.GetStudentDetail",
//             body: '<Request><Condition>' +
//                 '<SchoolYear>' + _gg.list_schoolyear + '</SchoolYear>' +
//                 '<Semester>' + _gg.list_semester + '</Semester></Condition></Request>',
//             result: function (response, error, http) {
//                 if (error !== null) {
//                     _gg.set_error_message('#mainMsg', 'GetStudentDetail', error);
//                 } else {
//                     var _ref, items = [], count_hour = 0;
//                     if (((_ref = response.Response) != null ? _ref.Record : void 0) != null) {
//                         $(response.Response.Record).each(function(index, item) {
//                             items.push(
//                                 '<tr>' +
//                                 '    <td>' + (item.OccurDate || '') + '</td>' +
//                                 '    <td>' +
//                                 '        <ul>' +
//                                 '            <li>' + (item.Reason || '') + '</li>' +
//                                 '        </ul>' +
//                                 '    </td>' +
//                                 '    <td>' + (item.Hours || '') + '</td>' +
//                                 '    <td>' + (item.Organizers || '') + '</td>' +
//                                 '    <td>' + (item.Remark || '') + '</td>' +
//                                 '</tr>'
//                             );

//                             if ($.isNumeric(item.Hours)) {
//                                 count_hour = _gg.FloatMath(count_hour, '+', parseFloat(item.Hours, 10));
//                             }
//                         });
//                     }
//                     var tmp = items.join('');
//                     if (tmp) {
//                         $('table[data-type=detail] tbody').html(tmp);
//                     } else {
//                         $('table[data-type=detail] tbody').html('<tr><td colspan="5">目前無資料</td></tr>');
//                     }

//                     $('table[data-type=total] td').html(count_hour);
//                 }
//             }
//         });
//     }
// };

// // 浮點運算
// _gg.FloatMath = function(x, operators, y) {
//   var arg1, arg2, e, m, r1, r2;

//   x = Number(x);
//   y = Number(y);
//   arg1 = x + '';
//   arg2 = y + '';
//   try {
//     r1 = arg1.split(".")[1].length;
//   } catch (_error) {
//     e = _error;
//     r1 = 0;
//   }
//   try {
//     r2 = arg2.split(".")[1].length;
//   } catch (_error) {
//     e = _error;
//     r2 = 0;
//   }
//   m = Math.max(r1, r2);
//   switch (operators) {
//     case "+":
//       return (_gg.FloatMath(x, '*', Math.pow(10, m)) + _gg.FloatMath(y, '*', Math.pow(10, m))) / Math.pow(10, m);
//     case "-":
//       return (_gg.FloatMath(x, '*', Math.pow(10, m)) - _gg.FloatMath(y, '*', Math.pow(10, m))) / Math.pow(10, m);
//     case "*":
//       m = r1 + r2;
//       return (Number(arg1.replace(".", "")) * Number(arg2.replace(".", ""))) / Math.pow(10, m);
//     case "/":
//       return _gg.FloatMath(x, '*', Math.pow(10, m)) / _gg.FloatMath(y, '*', Math.pow(10, m));
//     default:
//       return '';
//   }
// };


// // TODO: 錯誤訊息
// _gg.set_error_message = function(select_str, serviceName, error) {
//     var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
//     if (error !== null) {
//         if (error.dsaError) {
//             if (error.dsaError.status === "504") {
//                 switch (error.dsaError.message) {
//                     case '501':
//                         tmp_msg = '<strong>很抱歉，您無讀取資料權限！</strong>';
//                         break;
//                 }
//             } else if (error.dsaError.message) {
//                 tmp_msg = error.dsaError.message;
//             }
//         } else if (error.loginError.message) {
//             tmp_msg = error.loginError.message;
//         } else if (error.message) {
//             tmp_msg = error.message;
//         }
//         $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
//         $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
//     }
// };
