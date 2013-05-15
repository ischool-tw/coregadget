// 新增我的教材
$(function() {
    LessonPlanManager.ControlAddmaterial = function(target) {
        var target = $(target)
            , _location = location.href.replace('content.htm', 'upload_return.html').replace('develope.html', 'upload_return.html').replace('#', '')
            , _addmaterial
            , _files // 記錄目上傳檔案的筆數
            , _number = 0
            , _uid
            , _wantDel = {
                FileCondition: [] //點選刪除時加入，點選取消時清空;
            };


        //#region 設定動態新增的plugin
        var sheepItForm = $('#content').sheepIt({
            separator: '',
            allowRemoveLast: false,
            allowRemoveCurrent: true,
            allowRemoveAll: false,
            allowAdd: true,
            allowAddN: false,
            maxFormsCount: 0,
            minFormsCount: 0,
            iniFormsCount: 1,
            continuousIndex: false
        });
        //#enaregion

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

        //#region 點選上傳檔案
        target.on('click', 'input:submit', function() {
            var elem = $(this).closest('td[data-type=fileContainer]');
            var number, i_name, iframe, url, file, clone, myform, f_name;

            if (elem.find('input:file').val()) {
                _number += 1;
                number = _number;
                i_name = 'material_post_' + number;
                iframe = $('<iframe name="' + i_name + '" id="' + i_name + '" style="display: none" />');

                $('body').append(iframe);

                LessonPlanManager.StartUp.getConfig(function(config) {
                    f_name = 'material_fileform_' + number;
                    myform = $('<form id="' + f_name + '" style="display: none" />');
                    file = elem.find('input:file');
                    clone = file.clone();
                    file.after(clone).appendTo(myform);
                    myform.prop('action', (config['upload']) ? config['upload'] : '');
                    myform.prop('method', 'post');
                    myform.prop('enctype', 'multipart/form-data');
                    myform.prop('encoding', 'multipart/form-data');
                    myform.prop('target', i_name);
                    url = _location + (_location.indexOf('?') < 0 ? '?' : '&') + 'fn=addmaterial&num=' + number + '&elem=' + elem[0].id;
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
                        LessonPlanManager.ControlMaterial.reload();
                        target.find('a[data-action=cancel]').trigger('click');

                        btn.text('儲存變更').removeClass('disabled');
                        $('#mainMsg').html('<div class="alert alert-success">\n  儲存成功！\n</div>');
                        $('body').scrollTop(0);
                        setTimeout("$('#mainMsg').html('')", 1500);
                    }
                };

                //#region 新增教材
                var addMaterial = function(data, callBack) {
                    if (data) {
                        connection.send({
                            service: "_.InsertLessonPlanMain",
                            body: data,
                            result: function (response, error, http) {
                                if (error !== null) {
                                    LessonPlanManager.Util.set_error_message('#mainMsg', 'InsertLessonPlanMain', error);
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

                var editMaterial = function(data, callBack) {
                    if (data) {
                        connection.send({
                            service: "_.UpdateLessonPlanMain",
                            body: data,
                            result: function (response, error, http) {
                                if (error !== null) {
                                    LessonPlanManager.Util.set_error_message('#mainMsg', 'UpdateLessonPlanMain', error);
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
                                actionEnd();
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

                // 1. 新增進修資料
                // 2. 取得進修uid，再新增檔案
                var data, addfile = [], delfile = [];
                data = {
                    Request: {
                        Main: $('form', target).serializeObject()
                    }
                };
                data.Request.Main.Content = { Contents: { Content: [] } };
                data.Request.Main.Public = target.find('[name=Public]').prop('checked');

                $('tr[idtemplate=content_template]', target).each(function(index, item) {
                    data.Request.Main.Content.Contents.Content.push({
                        ContentTarget: $(this).find('[name=ContentTarget]').val() || '',
                        ContentActivity: $(this).find('[name=ContentActivity]').val() || '',
                        ContentTimeSpan: $(this).find('[name=ContentTimeSpan]').val() || '',
                        ContentTeachingAid: $(this).find('[name=ContentTeachingAid]').val() || ''
                    });
                });

                if (_uid) {
                    data.Request.Main.Condition = { Uid: _uid };
                    target.find('a[data-type=AddFile]').each(function(key, oneFile) {
                        addfile.push({
                            Filename: $(oneFile).attr('data-filename') || '',
                            OriginID: _uid,
                            OriginType: 'sheet',
                            Key: $(oneFile).attr('data-key') || ''
                        });
                    });
                    target.find('a[data-type=DelFile]').each(function(key, oneFile) {
                        delfile.push({
                            Uid: $(oneFile).attr('file-id') || ''
                        });
                    });

                    must_count += 3;
                    editMaterial(data, actionEnd);
                    (addfile.length > 0) ? addFile({ Request : { File: addfile } }, actionEnd) : actionEnd(true);
                    (delfile.length > 0) ? delFile({ Request : { File: delfile } }, actionEnd) : actionEnd(true);
                } else {
                    addMaterial(data, function(newid) {
                        must_count = 2;
                        var addfile = [];
                        if (newid) {
                            actionEnd(true);
                            target.find('#fileSheet a[data-type=AddFile]').each(function(key, oneFile) {
                                addfile.push({
                                    Filename: $(oneFile).attr('data-filename') || '',
                                    OriginID: newid,
                                    OriginType: 'sheet',
                                    Key: $(oneFile).attr('data-key') || ''
                                });
                            });
                            target.find('#fileAttach a[data-type=AddFile]').each(function(key, oneFile) {
                                addfile.push({
                                    Filename: $(oneFile).attr('data-filename') || '',
                                    OriginID: newid,
                                    OriginType: 'attach',
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
            } else {
                target.find('td.my-error:first').find('input, select').first().focus();
            }
        });

        //#region 取得教材內容
        var getMaterial = function(uid, callback) {
            LessonPlanManager.StartUp.getMyTeacherID(function(TeacherID) {
                connection.send({
                    service: "_.GetLessonPlanMain",
                    body: {
                        Request: {
                            Condition: {
                                Uid: uid,
                                OriginType: 'sheet',
                                OriginType: 'attach',
                                TeacherID: TeacherID
                            },
                            Field: {
                                All: ''
                            }
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            LessonPlanManager.Util.set_error_message('#mainMsg', 'GetLessonPlanMain', error);
                        } else {
                            var data, files;
                            if (response.Response && response.Response.Main) {
                                data = response.Response.Main;
                            }
                            connection.send({
                                service: "_.GetLessonPlanFiles",
                                body: {
                                    Request: {
                                        Condition: {
                                            OriginID: uid
                                        }
                                    }
                                },
                                result: function (response, error, http) {
                                    if (error !== null) {
                                        LessonPlanManager.Util.set_error_message('#mainMsg', 'GetLessonPlanFiles', error);
                                    } else {
                                        if (response.Response && response.Response.File) {
                                            files = response.Response.File;
                                        }
                                    }
                                    if (callback && $.isFunction(callback)) {
                                        callback(data, files);
                                    }
                                }
                            });
                        }
                    }
                });
            });
        };
        //#endregion

        var showFixMaterial = function(data, files) {
            // 1.顯示一般資料，再顯示檔案資料
            var items = [];
            if (data) {
                target.find('[name=Affective]').val(data.Affective || '');
                target.find('[name=Architecture]').val(data.Architecture || '');
                target.find('[name=Assessment]').val(data.Assessment || '');
                target.find('[name=Capacity]').val(data.Capacity || '');
                target.find('[name=ClickRate]').val(data.ClickRate || '');
                target.find('[name=Cognition]').val(data.Cognition || '');
                target.find('[name=Createdate]').val(data.Createdate || '');
                target.find('[name=Domain]').val(data.Domain || '');
                target.find('[name=Materials]').val(data.Materials || '');
                target.find('[name=Public]').prop('checked', data.Public === 't');
                target.find('[name=Rationale]').val(data.Rationale || '');
                target.find('[name=TeacherID]').val(data.TeacherID || '');
                target.find('[name=Reference]').val(data.Reference || '');
                target.find('[name=Skill]').val(data.Skill || '');
                target.find('[name=Subject]').val(data.Subject || '');
                target.find('[name=Target]').val(data.Target || '');
                target.find('[name=TimeSpan]').val(data.TimeSpan || '');
                target.find('[name=Title]').val(data.Title || '');

                if (data.Content && data.Content.Contents && data.Content.Contents.Content) {
                    sheepItForm.reset(LessonPlanManager.Util.handleArray(data.Content.Contents.Content));
                }

                if (files) {
                    LessonPlanManager.StartUp.getConfig(function(config) {
                        var sheet = [], attach = [];
                        var download = config['download'] || '';

                        $(files).each(function(index, item) {
                            if (item.OriginType === 'sheet') {
                                sheet.push(
                                    '<p>' +
                                    '<a href="' + download + (item.Key || '') + '" target="_blank" file-id="' + item.Uid + '">' +
                                    (item.Filename || '') + '</a>' +
                                    '<span class="my-trash pull-right" title="刪除檔案"></span>' +
                                    '</p>'
                                );
                            } else if (item.OriginType === 'attach') {
                                attach.push(
                                    '<p>' +
                                    '<a href="' + download + (item.Key || '') + '" target="_blank" file-id="' + item.Uid + '">' +
                                    (item.Filename || '') + '</a>' +
                                    '<span class="my-trash pull-right" title="刪除檔案"></span>' +
                                    '</p>'
                                );
                            }
                        });

                        $('#fileSheet', target).find('[data-type=fileInfo]').html(sheet.join(''));
                        $('#fileAttach', target).find('[data-type=fileInfo]').html(attach.join(''));
                    });
                }
            }
        };

        return {
            loadMaterial : function(uid) {
                // 清空所有欄位值
                target.find('td.my-error').removeClass('my-error');
                target.find('span[generated="true"]').remove();
                target.find('input:text, input:file, textarea').val('');
                target.find('[data-type=fileInfo]').html('');
                target.find('input:checkbox').prop('checked', false);
                _uid = uid;
                _number = 0;
                _wantDel = { FileCondition: [] };
                sheepItForm.reset([]);
                target.find('[data-action=save]').text('儲存變更').removeClass('disabled');

                // 設定科目的選單
                var subject = [];
                $('#viewmaterial select[name=subjectList] > option').each(function(index, item) {
                    if ($(item).val()) {
                        subject.push($(item).val());
                    }
                });
                target.find('[name=Subject]').autocomplete({
                    source: subject
                });

                if (uid) {
                    getMaterial(uid, showFixMaterial);
                }
            }

        }
    }('#addmaterial');
});

//#region 上傳後，取得檔案回傳結果
AddmaterialFileInfo = function(vars) {
    var resp = vars['resp'];
    var num = vars['num'];
    var elem = vars['elem'];
    LessonPlanManager.StartUp.getConfig(function(config) {
        if (resp && elem) {
            var download = config['download'] || '';
            var info = '<a href="' + download + (resp.key || '') + '"' +
                ' target="_blank" data-type="AddFile"' +
                ' data-key="' + (resp.key || '') + '" data-filename="' + resp.file + '">' +
                (resp.file || '') + '</a>';
            info += '<span class="my-trash pull-right" title="刪除檔案"></span>';
            $('#' + elem, '#addmaterial').find('p[data-tmpid=' + (num || '') +']').html(info);
            $('#material_post_' + num).remove();
        }
    });
};
//#endregion
