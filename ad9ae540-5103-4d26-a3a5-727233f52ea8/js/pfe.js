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
            , _number = 0;

        //#region 設定動態新增的plugin
        var options = {
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
            },
            afterAdd: function(source, newForm) {
                newForm.attr('data-type', 'Add');
            }
        };
        var sheepItForm = $('#study').sheepIt(options);
        //#endregion

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
            var form = $('<form />');
            var number, i_name, iframe, url, file, clone;

            if (elem.find('input:file').val()) {
                file = elem.find('input:file');
                clone = file.clone();
                file.after(clone).appendTo(form);

                _number += 1;
                number = _number;
                i_name = 'post_' + number;
                iframe = $('<iframe name="' + i_name + '" id="' + i_name + '" style="display: none" />');

                $('body').append(iframe);

                LessonPlanManager.StartUp.getConfig(function(config) {
                    form.prop('action', (config['upload']) ? config['upload'] : '');
                    form.prop('method', 'post');
                    form.prop('enctype', 'multipart/form-data');
                    form.prop('encoding', 'multipart/form-data');
                    form.prop('target', i_name);
                    url = _location + (_location.indexOf('?') < 0 ? '?' : '&') + 'fn=pfe&num=' + number + '&elem=' + elem[0].id;
                    form.append('<input type="hidden" name="redrictURL" value="' + url + '" />')
                    form.submit();
                });

                $('#' + i_name).load(function () {
                    iframe.remove();
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

            // 驗證通過
            if (target.find('form').valid()) {
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
                                StudyDate: elem.find('[name=StudyDate]').val() || ''
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
                    sheepItForm.reset(LessonPlanManager.Util.handleArray(myPFE));
                } else {
                    // sheepItForm.removeAllForms();
                }
            } else {
                _pfe = null;
                _files = null;
                getData(getPFE);
            }
        };
        //#endregion

        getPFE();

        return {
            //#region 上傳後，取得檔案回傳結果
            fileInfo : function(vars) {
                var resp = vars['resp'];
                var num = vars['num'];
                var elem = vars['elem'];
                LessonPlanManager.StartUp.getConfig(function(config) {
                    if (resp && elem) {
                        var obj = jQuery.parseJSON(decodeURIComponent(resp));
                        var download = config['download'] || '';
                        var info = '<a href="' + download + (obj.key || '') + '"' +
                            ' target="_blank" data-type="AddFile"' +
                            ' data-key="' + (obj.key || '') + '" data-filename="' + obj.file + '">' +
                            (obj.file || '') + '</a>';
                        info += '<span class="my-trash pull-right" title="刪除檔案"></span>';
                        $('#' + elem, target).find('p[data-tmpid=' + (num || '') +']').html(info);
                    }
                });
            }
            //#endregion
        }
    }('#pfe');
});
