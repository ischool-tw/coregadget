var _gg = _gg || {};
_gg.connection = gadget.getContract("ischool.retake.student");
_gg.timelist = {};
_gg.opening_state='no';
_gg.subject = {};

// TODO: 錯誤訊息
_gg.set_error_message = function(select_str, serviceName, error) {
    var tmp_msg = '';
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                switch (error.dsaError.message) {
                    case '502':
                        tmp_msg = '<strong>儲存失敗，尚未開放選擇!</strong>';
                        break;
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

jQuery(function () {
    $('#save-data').bind('click', function() {
        $(this).button('loading'); // TODO: 按鈕為處理中
        _gg.SaveData();
    });

    // TODO: 勾選選課 checkbox
    $('#subject').on('click', 'input:checkbox', function() {
        var uid = $(this).val();
        // TODO: 勾選
        if ($(this).attr('checked')) {
            var periods = $(this).attr('period').split(',');
            var subject_name = '<span uid="' + uid + '">' + $(this).attr('subject-name') + '</span>';
            $(periods).each(function(key, value) {
                $('#period' + value + ' td').append(subject_name);
            });
        } else {
            // TODO: 取消勾選
            $('span[uid=' + uid + ']').remove();
        }

        // TODO: 衝堂
        var tmp_btn_state = 'success';
        $('#subject tr').removeClass('error');
        $('#selectlist tr').each(function() {
            if ($(this).find('span').size() > 1) {
                $(this).find('span').each(function(){
                    $('#p' + $(this).attr('uid')).addClass('error');
                });
                $(this).addClass('error');
                tmp_btn_state = 'danger'
            } else {
                $(this).removeClass('error');
            }
        });

        if (tmp_btn_state === 'success') {
            $('#save-data').removeClass('btn-danger').addClass('btn-success').removeAttr('disabled');
            $('#btn-text').html('選好了，送出');
        } else {
            $('#save-data').removeClass('btn-success').addClass('btn-danger', 'disabled').attr('disabled', 'disabled');
            $('#btn-text').html('衝堂了！');
        }
    });

    // TODO: 取得重補修期間名冊
    _gg.connection.send({
        service: "_.GetTimeList",
        body: '<Request><Condition></Condition></Request>',
        result: function (response, error, http) {
            if (error !== null) {
                set_error_message('#mainMsg', 'GetTimeList', error);
            } else {
                $(response.TimeList).each(function(index, item) {
                    _gg.timelist = item;
                });

                if (!$.isEmptyObject(_gg.timelist)) {
                    // TODO: 取得開放重補修選課時間
                    _gg.connection.send({
                        service: "_.GetSelectCourseDate",
                        body: '<Request><Condition></Condition></Request>',
                        result: function (response, error, http) {
                            if (error !== null) {
                                set_error_message('#mainMsg', 'GetSelectCourseDate', error);
                            } else {
                                var tmp_html;
                                $(response.SelectCourseDate).each(function(index, item) {
                                    if (item.StartDate && item.EndDate) {
                                        var tmp_Date  = new Date();
                                        var Startdate = new Date(item.StartDate);
                                        var Enddate   = new Date(item.EndDate);

                                        if (Startdate <= tmp_Date && Enddate >= tmp_Date) {
                                            _gg.opening_state = 'yes';
                                            tmp_html = '' +
                                                '<div class="alert alert-error">' +
                                                    _gg.timelist.Name + '　選課期間： ' + item.StartDate + ' ~ ' + item.EndDate +
                                                '</div>';
                                            $('#opening').html(tmp_html);
                                        }
                                    }
                                });

                                if (_gg.opening_state !== 'yes') {
                                    tmp_html = '' +
                                        '<div class="alert alert-error">' +
                                            _gg.timelist.Name + '　選課期間：尚未開放' +
                                        '</div>';
                                    $('#btn-text').html('尚未開放');
                                }

                                $('#opening').html(tmp_html);
                                _gg.SetSubject();
                            }
                        }
                    });

                    _gg.connection.send({
                        service: "_.GetSSSelect",
                        body: '<Request><Condition></Condition></Request>',
                        result: function (response, error, http) {
                            if (error !== null) {
                                _gg.set_error_message('#mainMsg', 'GetSSSelect', error);
                            } else {
                                $(response.SSSelect).each(function(index, item) {
                                    if (item.LastUpdate) {
                                        var last_update = $.formatDate(new Date(item.LastUpdate), 'yyyy/MM/dd');
                                        $('#last_update').html('上次儲存時間：' + last_update);
                                    }
                                });
                            }
                        }
                    });

                } else {
                    $('#opening').html('目前未開放重補修');
                }
            }
        }
    });
});



_gg.SetSubject = function() {
    _gg.connection.send({
         service: "_.GetSubject",
         body: '<Request><Condition></Condition></Request>',
         result: function (response, error, http) {
            if (error !== null) {
                set_error_message('#mainMsg', 'GetSubject', error);
            } else {
                var _ref;
                if (((_ref = response.Response) != null ? _ref.Subject : void 0) != null) {
                    var timetableid = '';
                    var items = [];
                    var tmp_checked_uid = '';

                    $(response.Response.Subject).each(function(index, item) {
                        _gg.subject[item.Uid] = item;

                        // TODO: 當課表不同時，建立新的區塊，並關閉舊區塊
                        if (timetableid !== item.TimetableID) {
                            // TODO: 陣列不為空時補上
                            if (items.length > 0) {
                                items.push(
                                    '            </tbody>' +
                                    '        </table>' +
                                    '    </div>' +
                                    '</div>'
                                );
                            }

                            items.push(
                                '<div class="my-widget" data-type="info">' +
                                '    <div class="my-widget-header">' +
                                '        <i class="icon-info-sign"></i>' +
                                '        <h3>' + (item.TimetableName || '') + '</h3>' +
                                '    </div>' +
                                '    <div class="my-widget-content">' +
                                '        <table class="table table-condensed">' +
                                '            <tbody>' +
                                '                <tr>' +
                                '                <th width="10%">選課</th>' +
                                '                <th width="73%">科目名稱</th>' +
                                '                <th width="17%">學分數</th>' +
                                '                </tr>'
                            );
                            timetableid = item.TimetableID;
                        }

                        var tmp_subjectname = (item.SubjectName || '') + $.arabic2roman(item.SubjectLevel || '');
                        var tmp_periods_id = '', _ref, _ref1;
                        if ((_ref = item.PeriodContent) != null ? (_ref1 = _ref.Periods) != null ? _ref1.Period : void 0 : void 0) {
                            var tmp_obj = item.PeriodContent.Periods.Period;

                            if ($(tmp_obj).size() === 0) {
                                tmp_periods_id += tmp_obj;
                            } else {
                                $(tmp_obj).each(function(key, value) {
                                    if (key !== 0 ) {
                                        tmp_periods_id += ',';
                                    }
                                    tmp_periods_id += value;
                                });
                            }
                        }

                        var tmp_checkbox = '', tmp_checked = '';
                        if (_gg.opening_state === 'yes') {
                            if (item.Selected === 'yes') {
                                if (tmp_checked_uid) tmp_checked_uid += ', ';
                                tmp_checked_uid += 'input[value=' + item.Uid + ']';
                            }
                            tmp_checkbox='<input type="checkbox" value="' + item.Uid + '" period="' + tmp_periods_id + '" subject-name="' + tmp_subjectname + '">';
                        }

                        items.push(
                            '<tr id="p' + item.Uid + '">' +
                            '    <td>' + tmp_checkbox + '</td>' +
                            '    <td>' + tmp_subjectname + '</td>' +
                            '    <td>' + (item.Credit || '') + '</td>' +
                            '</tr>'
                        );

                    });
                    $('#subject').html(items.join(''));

                    if (tmp_checked_uid) {
                        //$(tmp_checked_uid).attr("checked", true);
                        $(tmp_checked_uid).attr("checked", true).trigger('click').attr("checked", true);
                    }

                    if (_gg.opening_state === 'yes') {
                        $('#save-data').removeClass('disabled').removeAttr('disabled');
                    }
                } else {
                    $('#subject').html('目前無資料');
                }
            }
        }
    });
    $('#selectlist .my-widget').removeClass('hide');
};

// TODO: 儲存選科紀錄
_gg.SaveData = function() {
    if (_gg.opening_state === 'yes') {
        var requests = [];
        $('input:checkbox:checked').each(function(key, value) {
            var uid = $(this).val();

            if (uid) {
                if (_gg.subject[uid]) {
                    var subject = _gg.subject[uid];
                    var _ref, _ref1;
                    if ((_ref = subject.PeriodContent) != null ? (_ref1 = _ref.Periods) != null ? _ref1.Period : void 0 : void 0) {
                        var tmp_obj = subject.PeriodContent.Periods.Period;

                        if ($(tmp_obj).size() === 0) {
                            requests.push(
                                '<SSSelect>' +
                                '    <SubjectID>' + uid + '</SubjectID>' +
                                '    <SubjectLevel>' + (subject.SubjectLevel || '') + '</SubjectLevel>' +
                                '    <SubjectName>' + (subject.SubjectName || '') + '</SubjectName>' +
                                '    <SubjectType>' + (subject.SubjectType || '') + '</SubjectType>' +
                                '    <Credit>' + (subject.Credit || '') + '</Credit>' +
                                '    <Period>' + (tmp_obj || '') + '</Period>' +
                                '</SSSelect>'
                            );
                        } else {
                            $(tmp_obj).each(function(key, value) {
                                requests.push(
                                    '<SSSelect>' +
                                    '    <SubjectID>' + uid + '</SubjectID>' +
                                    '    <SubjectLevel>' + (subject.SubjectLevel || '') + '</SubjectLevel>' +
                                    '    <SubjectName>' + (subject.SubjectName || '') + '</SubjectName>' +
                                    '    <SubjectType>' + (subject.SubjectType || '') + '</SubjectType>' +
                                    '    <Credit>' + (subject.Credit || '') + '</Credit>' +
                                    '    <Period>' + (value || '') + '</Period>' +
                                    '</SSSelect>'
                                );
                            });
                        }
                    }
                }
            }
        });

        var last_update = $.formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss');
        _gg.connection.send({
            service: "_.InsertSSSelect",
            body: '<Request>' + requests.join('') + '</Request>',
            result: function (response, error, http) {
                if (error !== null) {
                    _gg.set_error_message('#mainMsg', 'InsertSSSelect', error);
                } else {
                    $("#save-data").button("reset");
                    $('#last_update').html('上次儲存時間：' + last_update);
                }
            }
        });
    }
};



