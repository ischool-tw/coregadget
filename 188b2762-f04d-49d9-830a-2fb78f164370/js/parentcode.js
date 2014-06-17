angular.module('code', [])

.controller('MainCtrl', ['$scope',
    function($scope) {
        $scope.connection = gadget.getContract("campuslite.directory.teacher");

        $scope.getClassList = function() {
            $scope.connection.send({
                service: "_.GetMyClassCourseList",
                body: {
                    Request: {
                        Condition: {
                            Kind: 'class'
                        }
                    }
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        $scope.set_error_message('#mainMsg', 'GetMyClassCourseList', error);
                    } else {
                        //console.log(response); //檢查元素console用
                        $scope.$apply(function() { //apply用來更新選擇或變動的資料顯示
                            if (response !== null && response.Response !== null && response.Response !== '') {
                                $scope.classList = [].concat(response.Response.List);

                                if ($scope.classList.length > 0) { //長度要大於０，至少要有一筆記錄
                                    $scope.currentClass = $scope.classList[0]; //預設選取第一筆記錄
                                    $scope.selectClass($scope.classList[0]); //第一筆記錄詳細資料
                                }
                            }
                        });
                    }
                }
            });
        }

        $scope.selectClass = function(item) {
            $scope.currentClass = item;
            delete $scope.classInfo;

            angular.forEach($scope.classList, function(item) {
                item.selected = false;
            })

            item.selected = true;

            $scope.connection.send({
                service: "_.GetMyClassParentCode",
                body: {
                    Request: {
                        Condition: {
                            ClassID: item.CID
                        }
                    }
                }, //物件的寫法
                result: function(response, error, http) {
                    if (error !== null) {
                        $scope.set_error_message('#mainMsg', 'GetMyClassParentCode', error);
                    } else {
                        //console.log(response); //檢查元素console用

                        $scope.$apply(function() { //apply用來更新選擇或變動的資料顯示
                            if (response !== null && response.Response !== null && response.Response !== '') {
                                $scope.classInfo = [].concat(response.Response.Students);

                                angular.forEach($scope.classInfo, function(item){
                                    item.SeatNo = Math.ceil(item.SeatNo);
                                }); //service裡的座號是字串，為了排序將字串轉為數字。
                            }
                        });
                    }
                }
            });

        }

        $scope.sortSeatNoType = 1;
        $scope.sortNameType = 1;
        $scope.sort = function(type) {
            $scope.sortSeatNoType = 1;
            $scope.sortNameType = 1;

            if(type === 'seatNo') {
                $scope.sortSeatNoAsc = !$scope.sortSeatNoAsc;
                if($scope.sortSeatNoAsc) {
                    $scope.sortSeatNoType = 2;
                    $scope.sortTarget = '-SeatNo';
                } else {
                    $scope.sortSeatNoType = 3;
                    $scope.sortTarget = 'SeatNo';
                }

            } else {
                $scope.sortNameAsc = !$scope.sortNameAsc;
                if($scope.sortNameAsc) {
                    $scope.sortNameType = 2;
                    $scope.sortTarget = '-StudentName';
                } else {
                    $scope.sortNameType = 3;
                    $scope.sortTarget = 'StudentName';
                }
            }
        }

        $scope.resetParentCode = function(item) {
            if(!confirm("是否重設家長代碼？")) return;

            $scope.currentStudent = item;

            $scope.connection.send({
                service: "_.ResetParentCode",
                body: {
                    Request: {
                        Condition: {
                            StudentID: item.StudentID
                        }
                    }
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        $scope.set_error_message('#mainMsg', 'ResetParentCode', error);
                    } else {
                        $scope.selectClass($scope.currentClass);
                    }
                }
            });
        }

        $scope.removeParentCode = function(item) {
            if(!confirm("是否刪除家長代碼？")) return;

            $scope.currentStudent = item;
            
            $scope.connection.send({
                service: "_.RemoveParentCode",
                body: {
                    Request: {
                        Student: {
                            StudentID: item.StudentID
                        }
                    }
                },
                result: function(response, error, http) {
                    if (error !== null) {
                        $scope.set_error_message('#mainMsg', 'removeParentCode', error);
                    } else {
                        $scope.selectClass($scope.currentClass);
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
                            case '777':
                                if (serviceName === 'ResetParentCode') {
                                    _gg.resetParentCode();
                                    return false;
                                }
                                break;
                        }
                    }
                }
                $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
                $('.my-err-info').click(function() {
                    alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))
                });
            }
        };

        $scope.getClassList();

    }
])

// var _gg = _gg || {};
// _gg.connection = gadget.getContract("campuslite.directory.teacher");

// jQuery(function () {
//     $('#myTab')
//         .click(function() {
//             $(this).find('li.active').removeClass('active');
//         })
//         .on('click', 'a', function() {
//             $('#tabName').html($(this).html());
//         });

//     // TODO:  切換下拉選單
//     $('#myTab').on('click', 'a', function() {
//         $('#mainMsg').html('');
//         _gg.studentlist = {
//             cid : $(this).attr('CID')
//         };
//         $('#joinlimit').html($(this).attr('joinlimit'))
//         _gg.getStudentList();
//     });

//     $("body")
//         // TODO: 重設 ParentCode
//         .on('click', 'a[action-type=refreshP]', function() {
//             _gg.studentID = $(this).attr('studentID');
//             _gg.resetParentCode();
//         })
//         // TODO: 清除 ParentCode
//         .on('click', 'a[action-type=removeP]', function() {
//             _gg.studentID = $(this).attr('studentID');
//             _gg.removeParentCode();
//         });

//     // TODO: 取得我的班級
//     _gg.connection.send({
//         service: "_.GetMyClassCourseList",
//         body: '<Request><Condition><Kind>class</Kind></Condition></Request>',
//         result: function (response, error, http) {
//             if (error !== null) {
//                 _gg.set_error_message('#mainMsg', 'GetMyClassCourseList', error);
//             } else {
//                 var _ref;
//                 if (((_ref = response.Response) != null ? _ref.List : void 0) != null) {
//                     var dropdown_list = [];
//                     $(response.Response.List).each(function(index, item) {
//                         dropdown_list.push(
//                             '<li>' +
//                             '<a href="#student1" data-toggle="tab"' +
//                             ' joinlimit="' + (item.JoinLimit || 0) + '"' +
//                             ' Kind="' + (item.Kind || '') + '" CID="' + (item.CID || '') + '"' +
//                             '>' + (item.CName || '') + '</a></li>'
//                         );
//                     });
//                     // TODO: 下拉選單
//                     $('#myTab').html(dropdown_list.join(''));
//                     $('#myTab a:first').trigger('click');
//                 }
//             }
//         }
//     });

// });

// // TODO: 顯示班級學生的 ParentCode、StudentCode
// _gg.getStudentList = function() {
//     $('#student1').html('');
//     _gg.students = [];
//     var studentlist = _gg.studentlist;
//     var cid = studentlist.cid;

//     if (cid) {
//         _gg.connection.send({
//             service: '_.GetMyClassParentCode',
//             body: '<Request><Condition><ClassID>' + cid + '</ClassID></Condition></Request>',
//             result: function (response, error, http) {
//                 if (error !== null) {
//                     _gg.set_error_message('#mainMsg', '_.GetMyClassParentCode', error);
//                 } else {
//                     var _ref;
//                     if (((_ref = response.Response) != null ? _ref.Students : void 0) != null) {
//                         var ret = [];

//                         $(response.Response.Students).each(function(index, item) {

//                             ret.push(
//                                 '<tr>' +
//                                 '<td>' + (item.SeatNo || '&nbsp;') + '</td>' +
//                                 '<td>' + (item.StudentName || '&nbsp;') + '</td>' +
//                                 '<td>' + (item.StudentCode || '&nbsp;') + '</td>' +
//                                 '<td><span data-type="parentCode" studentID="' + (item.StudentID || '') + '">' + (item.ParentCode || '') + '</spna></td>' +
//                                 '<td><a href="#" action-type="refreshP" studentID="' + (item.StudentID || '') + '" title="重設代碼"><i class="icon-refresh"></i></a></td>' +
//                                 '<td><a href="#" action-type="removeP" studentID="' + (item.StudentID || '') + '" title="清除代碼"><i class="icon-trash"></i></a></td>' +
//                                 '<td>' + (item.ParentsName || '&nbsp;') + '</td>' +
//                                 '</tr>'
//                             );
//                         });

//                         var tmp_html = ret.join('');
//                         if (tmp_html) {
//                             var tmp_head ='<table class="table my-table2">' +
//                                 '<thead>' +
//                                 '<tr>' +
//                                 '<th>座號</th><th>姓名</th><th>學生代碼</th><th>家長代碼</th><th>重設代碼</th><th>清除代碼</th><th>家長姓名</th>' +
//                                 '</tr>'
//                                 '</thead>';

//                             $('#student1').html(tmp_head + '<tbody>' + tmp_html + '</tbody></table>');
//                             $('#student1 table').dataTable({
//                                 "bPaginate" : false,
//                                 "bFilter"   : false,
//                                 "bInfo"     : false,
//                                 "aoColumns": [
//                                   null,
//                                   null,
//                                   { "bSortable": false },
//                                   { "bSortable": false },
//                                   { "bSortable": false },
//                                   { "bSortable": false },
//                                   { "bSortable": false }
//                                 ]
//                             });
//                         } else {
//                             $('#student1').html('目前無資料');
//                         }
//                     } else {
//                         $('#student1').html('目前無資料');
//                     }
//                 }
//             }
//         });
//     }
// };

// // TODO: 重設 ParentCode
// _gg.resetParentCode = function() {
//     var studentID = _gg.studentID;
//     if (studentID) {
//         _gg.connection.send({
//             service: "_.ResetParentCode",
//             body: '<Request><Condition><StudentID>' + studentID + '</StudentID></Condition></Request>',
//             result: function (response, error, http) {
//                 if (error !== null) {
//                     _gg.set_error_message('#mainMsg', 'ResetParentCode', error);
//                 } else {
//                     if (response.Student !== null) {
//                         $(response.Student).each(function(index, item) {
//                             var parentCode = (item.ParentCode || '');
//                             $('span[data-type=parentCode][studentID=' + studentID + ']').html(parentCode);
//                         });
//                     }
//                 }
//             }
//         });
//     }
// };

//  // TODO: 清除 ParentCode
// _gg.removeParentCode = function() {
//     var studentID = _gg.studentID;
//     if (studentID) {
//         _gg.connection.send({
//             service: "_.RemoveParentCode",
//             body: '<Request><Condition><StudentID>' + studentID + '</StudentID></Condition></Request>',
//             result: function (response, error, http) {
//                 if (error !== null) {
//                     _gg.set_error_message('#mainMsg', 'RemoveParentCode', error);
//                 } else {
//                     $('span[data-type=parentCode][studentID=' + studentID + ']').html('');
//                 }
//             }
//         });
//     }
// };

// // TODO: 錯誤訊息
// _gg.set_error_message = function(select_str, serviceName, error) {
//     var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
//     if (error !== null) {
//         if (error.dsaError) {
//             if (error.dsaError.status === "504") {
//                 switch (error.dsaError.message) {
//                     case '777':
//                         if (serviceName === 'ResetParentCode') {
//                             _gg.resetParentCode();
//                             return false;
//                         }
//                         break;
//                 }
//             }
//         }
//         $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
//         $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
//     }
// };
