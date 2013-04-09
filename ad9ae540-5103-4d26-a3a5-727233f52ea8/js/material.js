// 我的教案列表
$(function() {
    LessonPlanManager.ControlMaterial = function(target) {
        var target = $(target)
            , _col_material
            , _all_material
            , _filter;

        target.find('[data-action=add]').click(function() {
            LessonPlanManager.ControlAddmaterial.loadMaterial(null);
            $('<a href="#addmaterial" data-toggle="tab"></a>').tab('show');
        });

        target.find('select').change(function() {
            var filter = $(this).val();
            if (filter === '') {
                showMaterial(_all_material);
            } else {
                showMaterial(_col_material[filter] || []);
            }
        });

        $(target).on('click', 'a[data-id]', function() {
            LessonPlanManager.ControlFixMaterial.loadMaterial($(this).attr('data-id'));
            $('<a href="#fixmaterial" data-toggle="tab"></a>').tab('show');
        });

        //#region 顯示我的教案
        var getMaterial = function(callback) {
            _col_material = {};
            _all_material = [];
            LessonPlanManager.StartUp.getMyTeacherID(function(TeacherID) {
                connection.send({
                    service: "_.GetLessonPlanMain",
                    body: {
                        Request: {
                            Condition: {
                                TeacherID: TeacherID
                            },
                            Order: {
                                Uid: 'DESC'
                            }
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            LessonPlanManager.Util.set_error_message('#mainMsg', 'GetLessonPlanMain', error);
                        } else {
                            if (response.Response && response.Response.Main) {
                                _all_material = LessonPlanManager.Util.handleArray(response.Response.Main);
                                var options = [];
                                $(response.Response.Main).each(function(index, item) {
                                    if (!_col_material[item.Subject]) {
                                        _col_material[item.Subject] = [];
                                        options.push(item.Subject || '');
                                    }
                                    _col_material[item.Subject].push(item);
                                });

                                target.find('select').append( $.map(options.sort(), function(value) {
                                    return '<option value="' + value + '">' + value + '</option>';
                                }).join('') );
                            }
                            if (callback && $.isFunction(callback)) {
                                if (_filter) {
                                    target.find('select').val(_filter);
                                    callback(_col_material[_filter] || '');
                                } else {
                                    callback(_all_material);
                                }
                            }
                        }
                    }
                });
            });
        };
        //#endregion

        var showMaterial = function(data) {
            target.find('tbody').html('');
            var material = data;
            if (material.length > 0) {
                var items = [];
                $(material).each(function(index, item) {
                    items.push(
                        '<tr>' +
                            '<td>' + (item.Createdate || '') + '</td>' +
                            '<td><a href="javascript:void(0);" data-id="' + item.Uid + '">' + (item.Title || '') + '</a></td>' +
                            '<td>' + (item.SheetCount || '0') + '</td>' +
                            '<td>' + (item.AttachCount || '0') + '</td>' +
                            '<td>' + (item.ClickRate || '') + '</td>' +
                            '<td>' + (item.Public === 't' ? '<i class="icon-ok"></i>' : '') + '</td>' +
                        '</tr>'
                    );
                });
                target.find('tbody').html(items.join(''));
            } else {
                target.find('tbody').html('<tr><td colspan="6">無資料</td></tr>');
            }
        };

        getMaterial(showMaterial);

        return {
            reload: function() {
                _filter = target.find('select').val();
                target.find('select[name=MyChooseSubject]').find('option').remove().end().html('<option value="">全部</option>');
                getMaterial(showMaterial);
            }
        };
    }('#material');
});
