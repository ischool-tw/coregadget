var _gg = _gg || {};
_gg.connection = gadget.getContract("campuslite.directory.teacher");

jQuery(function () {
    $('#myTab')
        .click(function() {
            $(this).find('li.active').removeClass('active');
        })
        .on('click', 'a', function() {
            $('#tabName').html($(this).html());
        });

    // TODO:  切換下拉選單
    $('#myTab').on('click', 'a', function() {
        $('#mainMsg').html('');
        _gg.studentlist = {
            cid : $(this).attr('CID')
        };
        $('#joinlimit').html($(this).attr('joinlimit'))
        _gg.getStudentList();
    });

    $("body")
        // TODO: 重設 ParentCode
        .on('click', 'a[action-type=refreshP]', function() {
            _gg.studentID = $(this).attr('studentID');
            _gg.resetParentCode();
        })
        // TODO: 清除 ParentCode
        .on('click', 'a[action-type=removeP]', function() {
            _gg.studentID = $(this).attr('studentID');
            _gg.removeParentCode();
        });

    // TODO: 取得我的班級
    _gg.connection.send({
        service: "_.GetMyClassCourseList",
        body: '<Request><Condition><Kind>class</Kind></Condition></Request>',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetMyClassCourseList', error);
            } else {
                var _ref;
                if (((_ref = response.Response) != null ? _ref.List : void 0) != null) {
                    var dropdown_list = [];
                    $(response.Response.List).each(function(index, item) {
                        dropdown_list.push(
                            '<li>' +
                            '<a href="#student1" data-toggle="tab"' +
                            ' joinlimit="' + (item.JoinLimit || 0) + '"' +
                            ' Kind="' + (item.Kind || '') + '" CID="' + (item.CID || '') + '"' +
                            '>' + (item.CName || '') + '</a></li>'
                        );
                    });
                    // TODO: 下拉選單
                    $('#myTab').html(dropdown_list.join(''));
                    $('#myTab a:first').trigger('click');
                }
            }
        }
    });

});

// TODO: 顯示班級學生的 ParentCode
_gg.getStudentList = function() {
    $('#student1').html('');
    _gg.students = [];
    var studentlist = _gg.studentlist;
    var cid = studentlist.cid;

    if (cid) {
        _gg.connection.send({
            service: '_.GetMyClassParentCode',
            body: '<Request><Condition><ClassID>' + cid + '</ClassID></Condition></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', '_.GetMyClassParentCode', error);
                } else {
                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.Students : void 0) != null) {
                        var ret = [];

                        $(response.Response.Students).each(function(index, item) {

                            ret.push(
                                '<tr>' +
                                '<td>' + (item.StudentName || '&nbsp;') + '</td>' +
                                '<td>' + (item.SeatNo || '&nbsp;') + '</td>' +
                                '<td><span data-type="parentCode" studentID="' + (item.StudentID || '') + '">' + (item.ParentCode || '') + '</spna></td>' +
                                '<td><a href="#" action-type="refreshP" studentID="' + (item.StudentID || '') + '" title="重設代碼"><i class="icon-refresh"></i></a></td>' +
                                '<td><a href="#" action-type="removeP" studentID="' + (item.StudentID || '') + '" title="清除代碼"><i class="icon-trash"></i></a></td>' +
                                '<td>' + (item.ParentsName || '&nbsp;') + '</td>' +
                                '</tr>'
                            );
                        });

                        var tmp_html = ret.join('');
                        if (tmp_html) {
                            var tmp_head ='<table class="table my-table2">' +
                                '<thead>' +
                                '<tr>' +
                                '<th>姓名</th><th>座號</th><th>家長代碼</th><th>重設代碼</th><th>清除代碼</th><th>家長姓名</th>' +
                                '</tr>'
                                '</thead>';

                            $('#student1').html(tmp_head + '<tbody>' + tmp_html + '</tbody></table>');
                        } else {
                            $('#student1').html('目前無資料');
                        }
                    } else {
                        $('#student1').html('目前無資料');
                    }
                }
            }
        });
    }
};

// TODO: 重設 ParentCode
_gg.resetParentCode = function() {
    var studentID = _gg.studentID;
    if (studentID) {
        _gg.connection.send({
            service: "_.ResetParentCode",
            body: '<Request><Condition><StudentID>' + studentID + '</StudentID></Condition></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'ResetParentCode', error);
                } else {
                    if (response.Student !== null) {
                        $(response.Student).each(function(index, item) {
                            var parentCode = (item.ParentCode || '');
                            $('span[data-type=parentCode][studentID=' + studentID + ']').html(parentCode);
                        });
                    }
                }
            }
        });
    }
};

 // TODO: 清除 ParentCode
_gg.removeParentCode = function() {
    var studentID = _gg.studentID;
    if (studentID) {
        _gg.connection.send({
            service: "_.RemoveParentCode",
            body: '<Request><Condition><StudentID>' + studentID + '</StudentID></Condition></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'RemoveParentCode', error);
                } else {
                    $('span[data-type=parentCode][studentID=' + studentID + ']').html('');
                }
            }
        });
    }
};

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
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
        $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
    }
};