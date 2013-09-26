(function($) {
    var parseTxt = function(options) {
        //處理參數
        var settings = $.extend({
            columns          : null,
            oncomplete       : null,
            haveTitleControl : null,
            inputControl     : null,
            outputControl    : null,
            parseControl     : null,
            importControl    : null,
            errorElement     : null,
            have_title       : false,
            input_txt        : null,
            title_flag       : [],
            all_data         : []
        }, options || {});

        $(settings.importControl).attr('disabled', true);

        var show_error = function(error_txt) {
            $(settings.errorElement).html('<div class="alert alert-error"><a class="close" data-dismiss="alert" href="#">×</a>' + (error_txt || '') + '</div>');
        };

        var mapping_control = function(title) {
            var options = [];
            options.push('<option value="">-不使用-</option>');
            $.each(settings.columns, function(key, value) {
                var def = '';
                if (value) {
                    if (title === value) { def = ' selected'; }
                    options.push('<option value="' + key + '" ' + def + '>' + value + '</option>');
                }
            });
            return '<select style="width: auto; margin-bottom: 0;">' + options.join('') + '</select>';
        };

        //按下按鈕開始parse
        $(settings.parseControl).click(function() {
            $(settings.errorElement).html('');
            settings.have_title = $(settings.haveTitleControl).prop('checked');
            settings.input_txt = $(settings.inputControl).val();
            settings.all_data = [];

            var _thead = [], _tbody = [];
            var max_cols = 0, title = '';

            if (settings.input_txt) {
                //拆成多筆
                var rows = settings.input_txt.split(/\r\n|\r|\n/);
                //去除空白資料
                rows = $.grep(rows, function(n){ return (n); });
                if (settings.have_title) {
                    if (rows.length >= 2) {
                        title = rows.splice(0, 1)[0];
                    } else {
                        show_error('無資料可匯入！');
                        return false;
                    }
                }

                if (rows.length > 0) {
                    $(rows).each(function(index, item) {
                        //拆成多欄
                        var tmp = item.split(/\t/);
                        settings.all_data.push(tmp);

                        //記錄最大欄數
                        max_cols = (tmp.length > max_cols) ? tmp.length : max_cols ;

                        _tbody.push('<tr>');
                        $.map(tmp, function(value) { _tbody.push('<td>' + ($('<div/>').text(value).html() || '') + '</td>'); });
                        _tbody.push('</tr>');
                    });

                    if (title && settings.have_title) {
                        title = title.split(/\t/);
                    }
                    for (var ii=0; ii<max_cols; ii+=1) {
                        _thead.push('<th>' + mapping_control(title[ii] || '') + '</th>');
                    }

                    $(settings.importControl).attr('disabled', false);
                    $(settings.outputControl).html('<table class="table table-condensed table-striped table-bordered my-import-table">' +
                        '<thead>' + _thead.join('') + '</thead><tbody>' + _tbody.join('') + '</tbody></table>');
                } else {
                    show_error('無資料可匯入！');
                }
            } else {
                show_error('請貼上要匯入的資料！');
            }
        });

        $(settings.importControl).click(function() {
            //確認欄位是否重複
            $(settings.errorElement).html('');
            settings.title_flag = [];
            var ret = true;
            $(settings.outputControl).find('select').each(function(index, item) {
                var column_name = $(item).val();
                if (column_name) {
                    if ($.inArray(column_name, settings.title_flag) === -1) {
                        settings.title_flag.push(column_name);
                    } else {
                        show_error('指定的欄位重複');
                        ret = false;
                        return false;
                    }
                } else {
                    settings.title_flag.push(column_name);
                }
            });
            if (ret) {
                finish();
            }
        });

        var finish = function() {
            //重新整理物件
            var ret_list = [];
            $(settings.all_data).each(function(index, item) {
                var rows = {};
                $(item).each(function(key, data) {
                    var column_name = settings.title_flag[key];
                    if (column_name) {
                        rows[column_name] = data;
                    }
                });
                ret_list.push(rows);
            });

            //如有callback，呼叫之
            if ($.isFunction(settings.oncomplete)) {
                settings.oncomplete(ret_list);
            }
        };
    }

    $.fn.extend({
        importlist: function(options) {
            return this.each(function() {
                parseTxt(options);
            });
        }
    });
})(jQuery);