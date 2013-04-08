var LessonPlanManager = LessonPlanManager || {};
$(function() {
    connection = gadget.getContract("wvs.lesson_plan.teacher");
    LessonPlanManager.StartUp = function() {
        var _isTIDReady = false;
        var _teacherID;
        var _tReadyCallBack = [];

        var getTeacherInfo = function() {
            connection.send({
                service: "_.GetMyInfo",
                body: '',
                result: function (response, error, http) {
                    if (error !== null) {
                    } else {
                        _teacherID = (response.Response && response.Response.Teacher) ? response.Response.Teacher.TeacherID : '';
                        _isTIDReady = true;
                        $(_tReadyCallBack).each(function(index, callback) {
                            callback(_teacherID);
                        });
                    }
                }
            });
        }();

        return {
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
});