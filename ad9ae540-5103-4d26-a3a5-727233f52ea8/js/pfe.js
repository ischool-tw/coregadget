// 進修及研習課程
$(function() {
    LessonPlanManager.ControlPFE = function(target) {
        var target = $(target)
            , _location = location.href.replace('content.htm', 'upload_return.html').replace('develope.html', 'upload_return.html').replace('#', '')
            , _isPFEReady = false
            , _pfe
            , _files // 記錄目上傳檔案的筆數
            , _wantDel = {
                StudyCondition: [],
                FileCondition: []
            } //點選刪除時加入，點選取消時清空
            , _number = 0
            , _sheepItForm
            , _category;

        //#region 設定動態新增的plugin
        var _options = {
            separator: '',
            allowRemoveLast: false,
            allowRemoveCurrent: true,
            allowRemoveAll: false,
            allowAdd: true,
            allowAddN: false,
            maxFormsCount: 0,
            minFormsCount: 0,
            iniFormsCount: 1,
            continuousIndex: false,
            insertNewForms: 'before',
            afterAdd: function(source, newForm) {
                newForm.attr('data-type', 'Add');
                //#region 處理研習分類選單
                var category_dropdown = SetCategoryList(_category, '0');
                if (category_dropdown) {
                    $(newForm).find('div[data-type="StudyCategory"]').append('<select>' + category_dropdown + '</select>');
                }
                //#endregion
            },
            afterFill: function(source, form, values) {
                LessonPlanManager.StartUp.getConfig(function(config) {
                    var items = [];
                    var download = config['download'] || '';

                    $(_files).each(function(index, item) {
                        if (item.OriginID === values.Uid) {
                            items.push(
                                '<p><a href="' + download + (item.Key || '') + '"' +
                                ' target="_blank" file-id="' + item.Uid + '">' +
                                (item.Filename || '') + '</a>' +
                                '<span class="my-trash pull-right" title="刪除檔案"></span>' +
                                '</p>'
                            );
                        }
                    });

                    form.attr('data-type', '')
                        .attr('data-id', values.Uid || '')
                        .find('[data-type=fileInfo]').append(items.join(''));
                });

                //#region 處理研習分類的值
                var history = getCategoryHistory(_category, values.CategoryID);
                $(history).each(function(key, value) {
                    $('select:last', form).find('option[value="' + value + '"]').prop('selected', true);
                    var category_dropdown = SetCategoryList(_category, value);
                    if (category_dropdown) {
                        $(form).find('div[data-type="StudyCategory"]').append('<select>' + category_dropdown + '</select>');
                    }
                });
                //#endregion
            }
        };
        //#endregion

        target.on('change', 'select', function() {
            $(this).nextAll('select').remove();
            var parent_id = $(this).val();
            if (parent_id) {
                $(this).closest('td').removeClass('my-error').find('span').remove();
                var category_dropdown = SetCategoryList(_category, parent_id);;
                if (category_dropdown) {
                    $(this).closest('div[data-type="StudyCategory"]').append('<select>' + category_dropdown + '</select>');
                }
            } else {
                $(this).closest('td').addClass('my-error').append('<span class="help-inline">必填</span>');
            }
        });

        target.on('focus', 'input.date:not(.hasDatepicker)', function() {
            $( this ).datepicker({
                dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"]
                ,monthNames: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
                ,monthNamesShort: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
                ,dateFormat: "yy/mm/dd"
                ,changeMonth: true
                ,changeYear: true
                ,showButtonPanel: true
                ,onSelect: function(dateStr) {
                    target.find('form').validate().element(this);
                }
            });
            $( this ).focus();
        });

        //#region 點選刪除表單
        target.on('click', 'button[data-action=remove]', function() {
            var uid = $(this).closest('table').attr('data-id');
            if (uid) {
                _wantDel.StudyCondition.push({
                    // Condition: {
                        Uid: uid
                    // }
                });
                _wantDel.FileCondition.push({
                    // Condition: {
                        OriginType: 'study',
                        OriginType: uid
                    // }
                });
            }
        });
        //#endregion

        //#region 點選上傳檔案
        target.on('click', 'input:submit', function() {
            var elem = $(this).closest('table[idtemplate=study_template]');
            var number, i_name, iframe, url, file, clone, myform, f_name;

            if (elem.find('input:file').val()) {
                _number += 1;
                number = _number;
                i_name = 'study_post_' + number;
                iframe = $('<iframe name="' + i_name + '" id="' + i_name + '" style="display: none" />');

                $('body').append(iframe);

                LessonPlanManager.StartUp.getConfig(function(config) {
                    f_name = 'study_fileform_' + number;
                    myform = $('<form id="' + f_name + '" style="display: none" />');
                    file = elem.find('input:file');
                    clone = file.clone();
                    file.after(clone).appendTo(myform);
                    myform.prop('action', (config['upload']) ? config['upload'] : '');
                    myform.prop('method', 'post');
                    myform.prop('enctype', 'multipart/form-data');
                    myform.prop('encoding', 'multipart/form-data');
                    myform.prop('target', i_name);
                    url = _location + (_location.indexOf('?') < 0 ? '?' : '&') + 'fn=pfe&num=' + number + '&elem=' + elem[0].id;
                    myform.append('<input type="hidden" name="redrictURL" value="' + url + '" />')
                    $('body').append(myform);
                    $('#' + f_name).submit();
                });

                $('#' + i_name).load(function () {
                    myform.remove();
                });

                elem.find('div[data-type=fileInfo]').append('<p data-tmpid="' + number + '">檔案上傳中...</p>');
            }

            return false;
        });
        //#endregion

        target.on('click', '.my-trash', function() {
            var container = $(this).closest('p');
            if (container.find('a').attr('file-id')) {
                container.css('display', 'none').find('a').attr('data-type', 'DelFile');
            } else {
                container.remove();
            }
        });

        target.find('[data-action=cancel]').click(function() {
            _wantDel = {
                StudyCondition: [],
                FileCondition: []
            };
            getPFE(_pfe);
        });

        target.find('[data-action=save]').click(function() {
            var btn = $(this);
            if (btn.hasClass('disabled')) return;

            var valid_dropdown = function() {
                var ret = true;
                $(target.find('table')).each(function(index, elem) {
                    if (!$(elem).find('div[data-type="StudyCategory"] select:last').val()) {
                        ret = false;
                        $(elem).find('td.my-cateogry').addClass('my-error').append('<span class="help-inline">必填</span>');
                    }
                });
                return ret;
            };

            var valid_list = valid_dropdown();
            var valid_form = target.find('form').valid();

            // 驗證通過
            if (valid_list && valid_form) {
                btn.text('儲存中...').addClass('disabled');

                var must_count = 0, run_count = 0;

                var actionEnd = function(status) {
                    if (status) {
                        run_count += 1;
                    }
                    if (must_count === run_count) {
                        _isPFEReady = false;
                        getPFE();

                        btn.text('儲存變更').removeClass('disabled');
                        $('#mainMsg').html('<div class="alert alert-success">\n  儲存成功！\n</div>');
                        $('body').scrollTop(0);
                        setTimeout("$('#mainMsg').html('')", 1500);
                    }
                };

                //#region 新增研習資料
                var addPFE = function(data, callBack) {
                    if (data) {
                        connection.send({
                            service: "_.InsertLessonPlanStudy",
                            body: data,
                            result: function (response, error, http) {
                                if (error !== null) {
                                    LessonPlanManager.Util.set_error_message('#mainMsg', 'InsertLessonPlanStudy', error);
                                    if (callBack && $.isFunction(callBack)) {
                                        callBack(false);
                                    }
                                } else {
                                    if (response.Result && response.Result.NewID) {
                                        if (callBack && $.isFunction(callBack)) {
                                            callBack(response.Result.NewID);
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        if (callBack && $.isFunction(callBack)) {
                            callBack(false);
                        }
                    }
                };
                //#endregion

                //#region 編輯研習資料
                var editPFE = function(data, callBack) {
                    if (data) {
                        connection.send({
                            service: "_.UpdateLessonPlanStudy",
                            body: data,
                            result: function (response, error, http) {
                                if (error !== null) {
                                    LessonPlanManager.Util.set_error_message('#mainMsg', 'UpdateLessonPlanStudy', error);
                                    if (callBack && $.isFunction(callBack)) {
                                        callBack(false);
                                    }
                                } else {
                                    if (callBack && $.isFunction(callBack)) {
                                        callBack(true);
                                    }
                                }
                            }
                        });
                    } else {
                        if (callBack && $.isFunction(callBack)) {
                            callBack(false);
                        }
                    }
                };
                //#endregion

                //#region 刪除研習資料
                var delPFE = function(data, callBack) {
                    if (data) {
                        connection.send({
                            service: "_.DelLessonPlanStudy",
                            body: data,
                            result: function (response, error, http) {
                                if (error !== null) {
                                    LessonPlanManager.Util.set_error_message('#mainMsg', 'DelLessonPlanStudy', error);
                                    if (callBack && $.isFunction(callBack)) {
                                        callBack(false);
                                    }
                                } else {
                                    if (callBack && $.isFunction(callBack)) {
                                        callBack(true);
                                    }
                                }
                            }
                        });
                    } else {
                        if (callBack && $.isFunction(callBack)) {
                            callBack(false);
                        }
                    }
                };
                //#endregion

                var addFile = function(data, callBack) {
                    if (data) {
                        connection.send({
                            service: "_.InsertLessonPlanFiles",
                            body: data,
                            result: function (response, error, http) {
                                if (error !== null) {
                                    LessonPlanManager.Util.set_error_message('#mainMsg', 'InsertLessonPlanFiles', error);
                                    if (callBack && $.isFunction(callBack)) {
                                        callBack(false);
                                    }
                                } else {
                                    if (callBack && $.isFunction(callBack)) {
                                        callBack(true);
                                    }
                                }
                            }
                        });
                    } else {
                        if (callBack && $.isFunction(callBack)) {
                            callBack(false);
                        }
                    }
                };

                var delFile = function(data, callBack) {
                    if (data) {
                        connection.send({
                            service: "_.DelLessonPlanFiles",
                            body: data,
                            result: function (response, error, http) {
                                if (error !== null) {
                                    LessonPlanManager.Util.set_error_message('#mainMsg', 'DelLessonPlanFiles', error);
                                    if (callBack && $.isFunction(callBack)) {
                                        callBack(false);
                                    }
                                } else {
                                    if (callBack && $.isFunction(callBack)) {
                                        callBack(true);
                                    }
                                }
                            }
                        });
                    } else {
                        if (callBack && $.isFunction(callBack)) {
                            callBack(false);
                        }
                    }
                };

                // 1.整理被編輯資料
                // 2.整理新增的資料
                // 3.刪除資料
                // 4.確認所有函式執行完畢後，重新載入資料

                $(target.find('table')).each(function(index, elem) {
                    var elem = $(elem);
                    var data, addfile = [], delfile = [];
                    data = {
                        Request : {
                            Study: {
                                Feedback: elem.find('[name=Feedback]').val() || '',
                                StudyName: elem.find('[name=StudyName]').val() || '',
                                StudyDate: elem.find('[name=StudyDate]').val() || '',
                                CategoryID: elem.find('div[data-type="StudyCategory"] select:last').val() || '',
                            }
                        }
                    };

                    if (elem.attr('data-id')) {
                        // 編輯
                        data.Request.Study.Condition = {
                            Uid: elem.attr('data-id') || ''
                        };

                        elem.find('a[data-type=AddFile]').each(function(key, oneFile) {
                            addfile.push({
                                Filename: $(oneFile).attr('data-filename') || '',
                                OriginID: elem.attr('data-id') || '',
                                OriginType: 'study',
                                Key: $(oneFile).attr('data-key') || ''
                            });
                        });

                        elem.find('a[data-type=DelFile]').each(function(key, oneFile) {
                            delfile.push({
                                Uid: $(oneFile).attr('file-id') || ''
                            });
                        });

                        must_count += 3;
                        editPFE(data, actionEnd);
                        (addfile.length > 0) ? addFile({ Request : { File: addfile } }, actionEnd) : actionEnd(true);
                        (delfile.length > 0) ? delFile({ Request : { File: delfile } }, actionEnd) : actionEnd(true);
                    } else {
                        // 1. 新增進修資料
                        // 2. 取得進修uid，再新增檔案
                        must_count += 2;
                        addPFE(data, function(newid) {
                            if (newid) {
                                actionEnd(true);
                                elem.find('a[data-type=AddFile]').each(function(key, oneFile) {
                                    addfile.push({
                                        Filename: $(oneFile).attr('data-filename') || '',
                                        OriginID: newid,
                                        OriginType: 'study',
                                        Key: $(oneFile).attr('data-key') || ''
                                    });
                                });
                                if (addfile.length > 0) {
                                    addFile({ Request : { File: addfile } }, actionEnd);
                                } else {
                                    actionEnd(true);
                                }
                            }
                        });
                    }

                    must_count += 2;
                    (_wantDel.StudyCondition.length > 0) ? delPFE({ Request : { Study: _wantDel.StudyCondition } }, actionEnd) : actionEnd(true);
                    (_wantDel.FileCondition.length > 0) ? delFile({ Request : { File: _wantDel.FileCondition } }, actionEnd) : actionEnd(true);
                });
            } else {
                target.find('td.my-error:first').find('input, select').first().focus();
            }
        });

        //#region 顯示研習資料
        var getPFE = function(myPFE) {
            var getData = function(callback) {
                connection.send({
                    service: "_.GetLessonPlanStudy",
                    body: {},
                    result: function (response, error, http) {
                        if (error !== null) {
                            LessonPlanManager.Util.set_error_message('#mainMsg', 'GetLessonPlanStudy', error);
                        } else {
                            if (response.Response && response.Response.Study) {
                                _pfe = response.Response.Study;

                                LessonPlanManager.StartUp.getMyTeacherID(function(TeacherID) {
                                    connection.send({
                                        service: "_.GetLessonPlanFiles",
                                        body: {
                                            Request: {
                                                Condition: {
                                                    TeacherID: TeacherID,
                                                    OriginType: 'study'
                                                }
                                            }
                                        },
                                        result: function (response, error, http) {
                                            if (error !== null) {
                                                LessonPlanManager.Util.set_error_message('#mainMsg', 'GetLessonPlanFiles', error);
                                            } else {
                                                if (response.Response && response.Response.File) {
                                                    _files = response.Response.File;
                                                }
                                                _isPFEReady = true;
                                                if (callback && $.isFunction(callback)) {
                                                    callback(_pfe);
                                                }
                                            }
                                        }
                                    });
                                });
                            } else {
                                _isPFEReady = true;
                                if (callback && $.isFunction(callback)) {
                                    callback(_pfe);
                                }
                            }
                        }
                    }
                });
            };

            if (_isPFEReady) {
                // 設定動態新增項目的預設值
                if (myPFE) {
                    _sheepItForm.reset(LessonPlanManager.Util.handleArray(myPFE));
                } else {
                    // _sheepItForm.removeAllForms();
                }
            } else {
                _pfe = null;
                _files = null;
                getData(getPFE);
            }
        };
        //#endregion

        //#region 取得研習分類
        var getCategory = function() {
            connection.send({
                service: "_.GetLessonPlanCategory",
                body: {
                    Request: {
                        Condition: {
                            Status: 'true'
                        }
                    }
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        LessonPlanManager.Util.set_error_message('#mainMsg', 'GetLessonPlanCategory', error);
                    } else {
                        if (response.Response && response.Response.Category) {
                            _category = response.Response.Category;
                            _sheepItForm = $('#study').sheepIt(_options);
                            getPFE();
                        } else {
                            $('#pfe').html('尚未設定研習分類資料');
                        }
                    }
                }
            });

            var CategoryListOrder = function(category, parent_id, list, pre_text) {
                if (category) {
                    $(category).each(function(index, item) {
                        if (item.Parent === parent_id) {
                            list.push('<option value="' + item.Uid + '">' + pre_text + (item.Name || '') + '</option>');
                            var curr_text = pre_text + item.Name + ' > ';
                            CategoryListOrder(category, item.Uid, list, curr_text);
                        }
                    });
                } else {
                    return '';
                }
            };
        };
        //#endregion

        //#region 設定研習分類選單
        var SetCategoryList = function(category, parent_id) {
            var list = (parent_id === '0') ? ['<option value="">請選擇...</option>'] : [];
            $(category).each(function(index, item) {
                if (item.Parent === parent_id) {
                    list.push('<option value="' + item.Uid + '" data-parent="' + item.Parent + '">' + (item.Name || '') + '</option>');
                }
            });
            return list.join('');
        };
        //#endregion

        //#region 取得研習分類所有層次資料
        var getCategoryHistory = function(category, uid) {
            var history = [uid];
            var search_parent = function(uid) {
                $(category).each(function(index, item) {
                    if (item.Uid === uid) {
                        if (item.Parent !== '0') {
                            history.push(item.Parent);
                            search_parent(item.Parent);
                        }
                    }
                });
            };
            search_parent(uid);
            history = history.reverse();
            return history;
        };
        //#endregion

        getCategory();
    }('#pfe');
});

//#region 上傳後，取得檔案回傳結果
var PFEFileInfo = function(vars) {
    var resp = vars['resp'];
    var num = vars['num'];
    var elem = vars['elem'];
    LessonPlanManager.StartUp.getConfig(function(config) {
        if (resp && elem) {
            var filename = resp.file;
            var download = config['download'] || '';
            var info = '<a href="' + download + (resp.key || '') + '"' +
                ' target="_blank" data-type="AddFile"' +
                ' data-key="' + (resp.key || '') + '" data-filename="' + filename + '">' +
                (filename || '') + '</a>';
            info += '<span class="my-trash pull-right" title="刪除檔案"></span>';
            $('#' + elem, '#pfe').find('p[data-tmpid=' + (num || '') +']').html(info);
            $('#study_post_' + num).remove();
        }
    });
}
//#endregion