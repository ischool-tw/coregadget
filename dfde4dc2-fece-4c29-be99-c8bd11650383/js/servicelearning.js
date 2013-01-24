var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.service_learning.student");

jQuery(function () {
    _gg.GetSemester();
    $('body').on('change', 'select[name=semester]', function() {
        $('table[data-type=total] td').html('&nbsp;');
        $('table[data-type=detail] tbody').html('');
        _gg.list_schoolyear = $(this).find('option:selected').attr('school-year');
        _gg.list_semester = $(this).find('option:selected').attr('semester');
        _gg.GetStudentDetail();
    })
});


// TODO: 載入具服務學習時數的學年度
_gg.GetSemester = function() {
    _gg.connection.send({
        service: "_.GetSemester",
        body: '',
        result: function (response, error, http) {
            if (error !== null) {
                _gg.set_error_message('#mainMsg', 'GetSemester', error);
            } else {
                var _ref, items = [];
                if (((_ref = response.Response) != null ? _ref.Semester : void 0) != null) {
                    $(response.Response.Semester).each(function(index, item) {
                        items.push(
                            '<option value="' + (item.SchoolYear || '') + (item.Semester || '') + '"' +
                            ' school-year="' + (item.SchoolYear || '') + '"' +
                            ' semester="' + (item.Semester || '') + '"' +
                            '>' + (item.SchoolYear || '') + '學年度第' + (item.Semester || '') + '學期</option>'
                        );
                    });
                }
                $('select[name=semester]')
                    .html(items.join('') || '<option value="">目前無資料</option>')
                    .find('option:first').prop('selected', true).trigger('change');
            }
        }
    });
};

// TODO: 載入個人服務學習時間
_gg.GetStudentDetail = function() {
    $('table[data-type=total] td').html('&nbsp;');
    $('table[data-type=detail] tbody').html('');

    if (_gg.list_schoolyear && _gg.list_semester) {
        _gg.connection.send({
            service: "_.GetStudentDetail",
            body: '<Request><Condition>' +
                '<SchoolYear>' + _gg.list_schoolyear + '</SchoolYear>' +
                '<Semester>' + _gg.list_semester + '</Semester></Condition></Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'GetStudentDetail', error);
                } else {
                    var _ref, items = [], count_hour = 0;
                    if (((_ref = response.Response) != null ? _ref.Record : void 0) != null) {
                        $(response.Response.Record).each(function(index, item) {
                            items.push(
                                '<tr>' +
                                '    <td>' + (item.OccurDate || '') + '</td>' +
                                '    <td>' +
                                '        <ul>' +
                                '            <li>' + (item.Reason || '') + '</li>' +
                                '        </ul>' +
                                '    </td>' +
                                '    <td>' + (item.Hours || '') + '</td>' +
                                '    <td>' + (item.Organizers || '') + '</td>' +
                                '    <td>' + (item.Remark || '') + '</td>' +
                                '</tr>'
                            );

                            if ($.isNumeric(item.Hours)) {
                                count_hour += (parseFloat(item.Hours, 10) * 100);
                            }
                        });
                    }
                    var tmp = items.join('');
                    if (tmp) {
                        $('table[data-type=detail] tbody').html(tmp);
                    } else {
                        $('table[data-type=detail] tbody').html('<tr><td colspan="5">目前無資料</td></tr>');
                    }

                    count_hour = (count_hour / 100);
                    $('table[data-type=total] td').html(count_hour);
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
        $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
    }
};