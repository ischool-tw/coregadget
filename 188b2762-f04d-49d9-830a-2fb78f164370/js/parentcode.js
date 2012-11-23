var _gg = _gg || {};
_gg.connection = gadget.getContract("campuslite.directory.teacher");

jQuery(function () {
    $('#myTab')
        .click(function() {
            $(this).find('li.active').removeClass('active');
        })
        .find('a').live('click', function(){
            $('#tabName').html($(this).html());
        });

    // TODO:  切換下拉選單
    $('#myTab').on('click', 'a', function() {
        $('#mainMsg').html('');
        _gg.studentlist = {
            cid  : $(this).attr('CID')
        };
        $('#joinlimit').html($(this).attr('joinlimit'))
        _gg.getStudentList();
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

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '';
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                switch (error.dsaError.message) {
                    default:
                        tmp_msg = '<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
                }
            } else {
                tmp_msg = '<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
            }
        } else {
            tmp_msg = '<strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
        }
        $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
    }
};

// TODO: 顯示班級學生的 ParentCode
_gg.getStudentList = function() {
    $('#student1').html('');
    _gg.students = [];
    var studentlist = _gg.studentlist;
    var cid = studentlist.cid;

    if (cid) {
        _gg.connection.send({
            service: '_.GetClassStudent',
            body: '<Request><Condition><ClassID>' + cid + '</ClassID></Condition></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', '_.GetClassStudent', error);
                } else {
                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.Students : void 0) != null) {
                        var ret = [];

                        $(response.Response.Students).each(function(index, item) {

                            ret.push(
                                '<tr>' +
                                '<td>' + (item.StudentName || '&nbsp;') + '</td>' +
                                '<td>' + (item.SeatNo || '&nbsp;') + '</td>' +
                                '<td>' + (item.ParentCode || '&nbsp;') + '</td>' +
                                '</tr>'
                            );
                        });

                        var tmp_html = ret.join('');
                        if (tmp_html) {
                            var tmp_head ='<table class="table my-table2">' +
                                '<thead>' +
                                '<tr>' +
                                '<th>姓名</th><th>座號</th><th>家長代碼</th>' +
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
