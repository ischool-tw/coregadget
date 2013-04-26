// util.js @ 共用程式
// profile.js @ 個人資料
// pfe.js @ 進修及研習課程
// memoir.js @ 自傳
// concept.js @ 教育理念
// material.js @ 我的教案列表
// addmaterial.js @ 新增我的教材
// fixmaterial.js @ 瀏覽我的單一教案
// viewmaterial.js @ 所有教案列表
// materialpage.js @ 瀏覽單一教案

var LessonPlanManager = LessonPlanManager || {};
connection = gadget.getContract("wvs.lesson_plan.teacher");
$(function() {

    if ($.browser.msie) { LessonPlanManager.Util.set_error_message('#ieMsg', '', '若照片無法完整呈現，請改用其他瀏覽器！'); }

    $(document)
        .on('click', '#myTab', function() {
            $(this).find('li.active').removeClass('active');
        })
        .on('click', '#myTab a', function() {
            $('#tabName').html($(this).html());
            if ($(this).attr('href') === '#profile') {
                $('#subTab').css('visibility', 'visible').find('li.active').removeClass('active').end().find('li:first').addClass('active');
            } else {
                $('#subTab').css('visibility', 'hidden');
            }
        })
        .on('click', '[data-action=print]', function() {
            var target = $(this).closest('div.tab-pane');
            LessonPlanManager.Util.toPrint(target);
        });
});

LessonPlanManager.StartUp = function() {
    // 1.取得教師基本資料
    // 2.取得上傳下載的網址
    // 3.儲存教師基本資料

    var _isProfileReady = false;
    var _profileValue;
    var _pReadyCallBack = [];
    var _isConfigReady = false;
    var _configValue = {};
    var _cReadyCallBack = [];
    var _isTIDReady = false;
    var _teacherID;
    var _tReadyCallBack = [];

    var getTeacherInfo = function() {
        connection.send({
            service: "_.GetMyInfo",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    LessonPlanManager.Util.set_error_message('#mainMsg', 'GetMyInfo', error);
                } else {
                    _teacherID = (response.Response && response.Response.Teacher) ? response.Response.Teacher.TeacherID : '';
                    _isTIDReady = true;
                    $(_tReadyCallBack).each(function(index, callback) {
                        callback(_teacherID);
                    });

                    if (_teacherID) {
                        //#region 取得個人資料
                        connection.send({
                            service: "_.GetTeacherExt",
                            body: '',
                            result: function (response, error, http) {
                                if (error !== null) {
                                    LessonPlanManager.Util.set_error_message('#mainMsg', 'GetTeacherExt', error);
                                } else {
                                    if (response.Response && response.Response.TeacherExt) {
                                        _profileValue = response.Response.TeacherExt;
                                    }
                                    _profileValue = _profileValue || {};
                                    _profileValue.TeacherID = _teacherID;
                                    _isProfileReady = true;
                                    $(_pReadyCallBack).each(function(index, callback) {
                                        callback(_profileValue);
                                    });
                                }
                            }
                        });
                        //#endregion
                    }
                }
            }
        });
    }();

    // #region 取得上傳下載的網址
    var getWebIP = function() {
        if (_isConfigReady) {
            return _configValue;
        } else {
            connection.send({
                service: "_.GetList",
                body: {
                    Request: {
                        Condition: {
                            Name: '教案資源庫'
                        }
                    }
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        LessonPlanManager.Util.set_error_message('#mainMsg', 'List', error);
                    } else {
                        if (response.List && response.List.Content) {
                            $(response.List.Content).each(function(index, item) {
                                _configValue.upload = item.upload;
                                _configValue.download = item.download;
                            });
                            _isConfigReady = true;
                            $(_cReadyCallBack).each(function(index, callback) {
                                callback(_configValue);
                            });
                        } else {
                            LessonPlanManager.Util.set_error_message('#mainMsg', '', '教案資源庫位址尚未設定，請連絡系統管理員');
                        }
                        return _configValue;
                    }
                }
            })
        }
    }();
    // #endregion

    var saveTeacherInfo = function(data, callback) {
        connection.send({
            service: "_.SetTeacherExt",
            body: data,
            result: function (response, error, http) {
                if (error !== null) {
                    LessonPlanManager.Util.set_error_message('#mainMsg', 'SetTeacherExt', error);
                } else {
                    if (callback && $.isFunction(callback)) {
                        callback(_profileValue);
                    }
                }
            }
        });
    };

    return {
        profileReady: function(callBack) {
            if (callBack && $.isFunction(callBack)) {
                _pReadyCallBack.push(callBack);
                if (_isProfileReady) {
                    callBack(_profileValue);
                }
            }
        },
        profileSave: function(data, callBack) {
            saveTeacherInfo(data, callBack);
        },
        getConfig: function(callBack) {
            if (callBack && $.isFunction(callBack)) {
                _cReadyCallBack.push(callBack);
                if (_isConfigReady) {
                    callBack(_configValue);
                }
            }
        },
        getMyTeacherID: function(callBack) {
            if (callBack && $.isFunction(callBack)) {
                _tReadyCallBack.push(callBack);
                if (_isTIDReady) {
                    callBack(_teacherID);
                }
            }
        }
    };
}();