// 瀏覽單一教案
$(function() {
    LessonPlanManager.ControlMaterialPage = function(target) {
        var target = $(target)
            , _uid;

        target.find('[data-action=cancel]').click(function() {
            LessonPlanManager.ControlViewMaterial.reload();
            $('<a href="#viewmaterial" data-toggle="tab"></a>').tab('show');
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
            // 1.清除資料
            // 2.顯示一般資料，再顯示檔案資料
            target.find('[data-type]:not([data-type=Content])').html('');
            target.find('[data-type=Content]').remove();
            var items = [];
            if (data) {
                target.find('[data-type=Affective]').html(data.Affective || '');
                target.find('[data-type=Architecture]').html(data.Architecture || '');
                target.find('[data-type=Assessment]').html(data.Assessment || '');
                target.find('[data-type=Capacity]').html(data.Capacity || '');
                target.find('[data-type=ClickRate]').html(data.ClickRate || '');
                target.find('[data-type=Cognition]').html(data.Cognition || '');
                target.find('[data-type=Createdate]').html(data.Createdate || '');
                target.find('[data-type=Domain]').html(data.Domain || '');
                target.find('[data-type=Materials]').html(data.Materials || '');
                target.find('[data-type=Public]').html(data.Public === 't' ? '公開' : '非公開');
                target.find('[data-type=Rationale]').html(data.Rationale || '');
                target.find('[data-type=TeacherID]').html(data.TeacherID || '');
                target.find('[data-type=Reference]').html(data.Reference || '');
                target.find('[data-type=Skill]').html(data.Skill || '');
                target.find('[data-type=Subject]').html(data.Subject || '');
                target.find('[data-type=Target]').html(data.Target || '');
                target.find('[data-type=TimeSpan]').html(data.TimeSpan || '');
                target.find('[data-type=Title]').html(data.Title || '');

                if (data.Content && data.Content.Contents && data.Content.Contents.Content) {
                    $(data.Content.Contents.Content).each(function(index, item) {
                        items.push(
                            '<tr data-type="Content">' +
                                '<td>' + (item.ContentTarget || '') + '</td>' +
                                '<td>' + (item.ContentActivity || '') + '</td>' +
                                '<td>' + (item.ContentTimeSpan || '') + '</td>' +
                                '<td>' + (item.ContentTeachingAid || '') + '</td>' +
                            '</tr>'
                        )
                    });
                }
                target.find('[data-contain=Content]').after(items.join(''));

                if (files) {
                    LessonPlanManager.StartUp.getConfig(function(config) {
                        var sheet = [], attach = [];
                        var download = config['download'] || '';

                        $(files).each(function(index, item) {
                            if (item.OriginType === 'sheet') {
                                sheet.push(
                                    '<p>' +
                                    '<a href="' + download + (item.Key || '') + '" target="_blank">' + (item.Filename || '') + '</a>' +
                                    '</p>'
                                );
                            } else if (item.OriginType === 'attach') {
                                attach.push(
                                    '<p>' +
                                    '<a href="' + download + (item.Key || '') + '" target="_blank">' + (item.Filename || '') + '</a>' +
                                    '</p>'
                                );
                            }
                        });

                        target.find('[data-type=fileSheet]').html(sheet.join(''));
                        target.find('[data-type=fileAttach]').html(attach.join(''));
                    });
                }
            } else {
                target.find('data-type').html('查無此資料');
            }
        };

        var delFixMaterial = function(uid) {
            if ($('#delModal').find('[data-action=del]').hasClass('disabled')) return;
            if (uid) {
                $('#delModal').find('[data-action=del]').text('刪除中...').addClass('disabled');
                connection.send({
                    service: "_.DelLessonPlanFiles",
                    body: {
                        Request: {
                            File: {
                                Condition: {
                                    Uid: uid,
                                    OriginType: 'sheet',
                                    OriginType: 'attach'
                                }
                            }
                        }
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            $('#delModal').find('[data-action=del]').text('我要刪除').removeClass('disabled');
                            LessonPlanManager.Util.set_error_message('#errorMessage', 'DelLessonPlanFiles', error);
                        } else {
                            connection.send({
                                service: "_.DelLessonPlanMain",
                                body: {
                                    Request: {
                                        Main: {
                                            Condition: {
                                                Uid: uid
                                            }
                                        }
                                    }
                                },
                                result: function (response, error, http) {
                                    $('#delModal').find('[data-action=del]').text('我要刪除').removeClass('disabled');
                                    if (error !== null) {
                                        LessonPlanManager.Util.set_error_message('#errorMessage', 'DelLessonPlanMain', error);
                                    } else {
                                        LessonPlanManager.ControlMaterial.reload();
                                        $('<a href="#material" data-toggle="tab"></a>').tab('show');
                                        $('#delModal').modal("hide");
                                        $('#mainMsg').html('<div class="alert alert-success">\n  刪除成功！\n</div>');
                                        $('body').scrollTop(0);
                                        setTimeout("$('#mainMsg').html('')", 1500);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        };

        return {
            loadMaterial: function(uid) {
                target.find('[data-type]:not([data-type=Content])').html('');
                target.find('[data-type=Content]').remove();
                _uid = uid;
                getMaterial(uid, showFixMaterial);
            }
        };
    }('#materialpage');
});
