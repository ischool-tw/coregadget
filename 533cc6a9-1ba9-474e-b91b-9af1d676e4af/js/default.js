$(document).ready(function () {
    $(window).resize(function () {
        $("#container-nav, #container-main").height($(window).height() - 50);
        // console.log($(window).height() - 50);
    });
});
angular.module("app", ["checklist-model"])
.controller("Cntl", function($scope, $http, $filter) {
    $scope.activity_panel = 'list';
    $scope.history_panel = 'list';
    $scope.curr = {};
    $scope.loadState = 'loading';
    $scope.viewState = 'form';
    $scope.contract = gadget.getContract("emba.activityapply");

    // $scope.activitys = [{
    //     ActivityName: "2016畢業典禮",
    //     ActivityTime: new Date("2016-02-25 12:00:00"),
    //     AnnouncementTime: new Date("2016-03-30 18:00:00"),
    //     CategoryID: "",
    //     Description: "簡簡單單",
    //     EndTime: new Date("2016-03-04 22:00:00"),
    //     MaximumNumber: "50",
    //     NotificationTime: "",
    //     OpeningTime: new Date("2016-02-23 15:00:00"),
    //     RefEventTemplateId: "321768",
    //     SelectTarget: "t",
    //     StatusID: "1",
    //     SuccessTime: "",
    //     Type: "畢業",
    //     Uid: "321778",
    //     Url: "http://123.com.tw/",
    //     Register: "t"
    //     }, {
    //     ActivityName: "2016公共論壇",
    //     ActivityTime: new Date("2016-04-01 00:00:00"),
    //     AnnouncementTime: new Date("2016-05-05 00:00:00"),
    //     CategoryID: "",
    //     Description: "演講人:李大師",
    //     EndTime: new Date("2016-03-17 00:00:00"),
    //     MaximumNumber: "25",
    //     NotificationTime: "",
    //     OpeningTime: new Date("2016-02-22 00:00:00"),
    //     RefEventTemplateId: "321792",
    //     SelectTarget: "t",
    //     StatusID: "",
    //     SuccessTime: "",
    //     Type: "其它",
    //     Uid: "321809",
    //     Url: "https://tw.yahoo.com/",
    //     Register: "f"
    // }];
    // $scope.questions = [{
    //     "Uid": "321769",
    //     "DisplayOrder": "1",
    //     "RefEventTemplateId": "321768",
    //     "Required": "t",
    //     "Title": "您是否要參加",
    //     "Type": "單選題",
    //     "Options": {
    //         "Option": [{ "OptionTitle": "是", "OptionDisplayOrder": "1" },
    //             { "OptionTitle": "否", "OptionDisplayOrder": "2" }
    //         ]
    //     },
    //     "Answer": ""
    //     }, {
    //     "Uid": "321772",
    //     "DisplayOrder": "2",
    //     "RefEventTemplateId": "321768",
    //     "Required": "f",
    //     "Title": "您習慣吃哪些食物",
    //     "Type": "複選題",
    //     "Options": {
    //         "Option": [{ "OptionTitle": "葷食", "OptionDisplayOrder": "1" }, { "OptionTitle": "素食", "OptionDisplayOrder": "2" }, { "OptionTitle": "麥當勞", "OptionDisplayOrder": "3" },
    //             { "OptionTitle": "肯德基", "OptionDisplayOrder": "4" }
    //         ]
    //     },
    //     "Answer": ['葷食', '肯德基']
    //     }, {
    //     "Uid": "321773",
    //     "DisplayOrder": "3",
    //     "RefEventTemplateId": "321769",
    //     "Required": "f",
    //     "Title": "您習慣吃哪些食物",
    //     "Type": "問答題",
    //     "Options": {},
    //     "Answer": ""
    //     }, {
    //     "Uid": "321774",
    //     "DisplayOrder": "4",
    //     "RefEventTemplateId": "321769",
    //     "Required": "f",
    //     "Title": "您午餐吃哪些",
    //     "Type": "問答題",
    //     "Options": {},
    //     "Answer": ""
    // }];

    // 現在時間，比對狀態使用
    $scope.Date = new Date();

    // 取得目前活動清單
    $scope.getActivitys = function() {
        $scope.loadState = 'loading';
        $scope.activitys = [];
        $scope.contract.send({
            service: "default.GetActivityApply",
            body: {},
            result: function (response, error, http) {
                if (!error) {
                    //console.log(response);
                    if (response.Response) {
                        $scope.activitys = [].concat(response.Response.EventRecord || []);
                        $scope.activitys.forEach(function(item) {
                            if (item.ActivityTime) item.ActivityTime = new Date(item.ActivityTime);
                            if (item.AnnouncementTime) item.AnnouncementTime = new Date(item.AnnouncementTime);
                            if (item.EndTime) item.EndTime = new Date(item.EndTime);
                            if (item.OpeningTime) item.OpeningTime = new Date(item.OpeningTime);
                        });
                    }
                    $scope.loadState = 'finish';
                    $scope.$apply();
                }
                else
                {
                    set_error_message("#mainMsg", "GetActivityApply", error);
                }
            }
        });
    };

    // 取得題目加答案，還有目前報名人數
    $scope.getActivity = function(activity) {
        $scope.curr = activity;
        $scope.questions = [];

        var questoins_ready = false, replys_ready = false;
        var questions_tmp = [], replys_tmp = [];
        var finish = function() {
            if (questoins_ready && replys_ready) {
                questions_tmp.forEach(function(item) {
                    if (replys_tmp['q' + item.Uid]) {
                        item.Answer = replys_tmp['q' + item.Uid].Answer || '';
                    } else {
                        item.Answer = null;
                    }
                });
                $scope.questions = questions_tmp;
                $scope.$apply();
            }
        };
        var getQuestions = function() {
            $scope.contract.send({
                service: "default.GetQuestion",
                body: {
                    Request: { Condition: { RefEventTemplateId: activity.RefEventTemplateId || 0 } }
                },
                result: function (response, error, http) {
                    if (!error) {
                        //console.log(response);
                        if (response.Question) {
                            questions_tmp = [].concat(response.Question.Questions || []);
                            questions_tmp.forEach(function(item) {
                                questions_tmp['q' + item.Uid] = item;
                            });
                        }
                        questoins_ready = true;
                        finish();
                    }
                    else
                    {
                        set_error_message("#mainMsg", "GetQuestion", error);
                    }
                }
            });
        };
        var getReplys = function() {
            $scope.contract.send({
                service: "default.GetReply",
                body: {
                    Request: { Condition: { RefEventTemplateId: activity.RefEventTemplateId || 0 } }
                },
                result: function (response, error, http) {
                    if (!error) {
                        //console.log(response);
                        if (response.Response.Reply) {
                            replys_tmp = [].concat(response.Response.Reply || []);
                            replys_tmp.forEach(function(item) {
                                replys_tmp['q' + item.RefQuestionId] = item;
                            });
                        }
                        replys_ready = true;
                        finish();
                    }
                    else
                    {
                        set_error_message("#mainMsg", "GetReply", error);
                    }
                }
            });
        };
        var getReplyCount = function () {
            $scope.contract.send({
                service: "default.GetReplyCount",
                body: {
                    Request: { Condition: { RefEventTemplateId: activity.RefEventTemplateId || 0 } }
                },
                result: function (response, error, http) {
                    if (!error) {
                        //console.log(response);
                        if (response.Response.ReplyCount) {
                            activity.Count = response.Response.ReplyCount.Count || 0;
                        }
                    }
                    else
                    {
                        set_error_message("#mainMsg", "GetReplyCount", error);
                    }
                }
            });
        };
        getQuestions();
        getReplys();
        getReplyCount();
    };

    // 取得歷程
    $scope.getHistorys = function() {
        $scope.historys = [];
        $scope.contract.send({
            service: "default.GetHistoryRegisterActivity",
            body: {},
            result: function (response, error, http) {
                if (!error) {
                    //console.log(response);
                    if (response.Response) {
                        $scope.historys = [].concat(response.Response.EventRecord || []);
                        $scope.historys.forEach(function(item) {
                            if (item.ActivityTime) item.ActivityTime = new Date(item.ActivityTime);
                            if (item.AnnouncementTime) item.AnnouncementTime = new Date(item.AnnouncementTime);
                            if (item.EndTime) item.EndTime = new Date(item.EndTime);
                            if (item.OpeningTime) item.OpeningTime = new Date(item.OpeningTime);
                            if (item.ApplyTime) item.ApplyTime = new Date(item.ApplyTime);
                        });
                        $scope.$apply();
                    }
                }
                else
                {
                    set_error_message("#mainMsg", "GetHistoryRegisterActivity", error);
                }
            }
        });
    };

    // 設定活動頁籤顯示清單或細節 list, detail
    $scope.set_activity_panel = function(type) {
        $scope.activity_panel = type;
    };

    // 設定活動歷程顯示清單或細節 list, detail
    $scope.set_history_panel = function(type) {
        $scope.history_panel = type;
    };

    // 顯示取消報名確認畫面
    $scope.showCheckSignOut = function(item) {
        $scope.curr = item;
        $('#signOutModal').modal('show');
    };

    // 取消報名
    $scope.setDelete = function() {
        var log_actionType = '刪除';
        var log_description = ['學生「@StudentName@」點選「取消報名」。',
            '活動編號「' + $scope.curr.Uid + '」，',
            '活動名稱「' + $scope.curr.ActivityName + '」。',
            '使用者電腦時間「' + $filter('date')(new Date(), 'yyyy/MM/dd HH:mm:ss:sss') + '」。'].join('');

        $('#btnSignOut').button('loading');

        $scope.contract.send({
            service: "default.DeleteReply",
            body: {
                Request: { Reply: { RefEventId: $scope.curr.Uid || 0 } }
            },
            result: function (response, error, http) {
                if (!error) {
                    writeLog(log_actionType, '刪除報名表單資料成功', log_description);
                    $scope.contract.send({
                        service: "default.DeleteRegisterActivity",
                        body: {
                            Request: { RegisterActivity: { RefEventId: $scope.curr.Uid || 0 } }
                        },
                        result: function (response, error, http) {
                            $('#signOutModal').modal('hide');
                            $('#btnSignOut').button('reset');

                            if (!error) {
                                $scope.getActivitys();
                                $scope.$apply();
                                writeLog(log_actionType, '刪除報名記錄成功', log_description);
                            }
                            else
                            {
                                set_error_message("#mainMsg", "UpdateRegisterActivity", error);
                                writeLog(log_actionType, '刪除報名記錄失敗', log_description);
                            }
                        }
                    });
                }
                else
                {
                    set_error_message("#mainMsg", "DeleteReply", error);
                    $('#signOutModal').modal('hide');
                    $('#btnSignOut').button('reset');

                    writeLog(log_actionType, '刪除報名表單資料發生失敗', log_description);
                }
            }
        });
    };

    // 我要報名
    $scope.setSend = function() {
        // 判斷必填
        $('#btnReg').button('loading');
        var requiredAllRight = true;
        $scope.questions.forEach(function(question){
            // 必填未填
            if (question.Required == 't' && !question.Answer) {
                requiredAllRight = false;
            }
            if (question.Type=='問答題') {
                if ((question.Answer || '').replace(/(\r\n|\n|\r)/gm, '').length > 500) {
                    requiredAllRight = false;
                }
            }
        });
        if (!requiredAllRight) {
            $('#alertRequiredModal').modal('show');
            $('#btnReg').button('reset');
        } else {
            var question_queue = $scope.questions.length;
            var reg_queue = false;
            var has_error = false; // 報名過程發生錯誤
            var log_actionType = '新增';

            var finish = function() {
                if (question_queue == 0 && reg_queue == true) {
                    // 發生錯誤，報名記錄、回答內容要全部刪除
                    if (has_error) {
                        $scope.setDelete();
                    } else {
                        $scope.getActivitys();
                        $scope.set_activity_panel('list');
                    }
                    $('#btnReg').button('reset');
                }
            };

            // 送出每題的答案
            $scope.questions.forEach(function(question) {
                var my_answer = (question.Type=='複選題' ? [].concat(question.Answer || []).join(',') : question.Answer || '');
                $scope.contract.send({
                    service: "default.InsertReply",
                    body: {
                        Request: { Reply: {
                            Answer: my_answer,
                            RefEventTemplateId: $scope.curr.RefEventTemplateId,
                            RefEventRecordId: $scope.curr.Uid,
                            RefQuestionId: question.Uid
                        } }
                    },
                    result: function (response, error, http) {
                        if (!error) {
                            var log_description = ['學生「@StudentName@」點選「我要報名」。',
                                '活動編號「' + $scope.curr.Uid + '」，',
                                '活動名稱「' + $scope.curr.ActivityName + '」。',
                                '題項編號「' + question.Uid + '」',
                                '回答「' + my_answer + '」',
                                '使用者電腦時間「' + $filter('date')(new Date(), 'yyyy/MM/dd HH:mm:ss:sss') + '」。'].join('');
                            writeLog(log_actionType, '報名表單新增回答成功', log_description);
                        }
                        else
                        {
                            has_error = true;
                            set_error_message("#mainMsg", "InsertReply", error);

                            var log_description = ['學生「@StudentName@」點選「我要報名」。',
                                '活動編號「' + $scope.curr.Uid + '」，',
                                '活動名稱「' + $scope.curr.ActivityName + '」。',
                                '題項編號「' + question.Uid + '」',
                                '回答「' + my_answer + '」',
                                '使用者電腦時間「' + $filter('date')(new Date(), 'yyyy/MM/dd HH:mm:ss:sss') + '」。'].join('');
                            writeLog(log_actionType, '報名表單新增回答失敗', log_description);
                        }
                        question_queue--;
                        if (question_queue == 0) finish();
                    }
                });
            });

            // 送出報名記錄
            $scope.contract.send({
                service: "default.InsertRegisterActivity",
                body: {
                    Request: { RegisterActivity: {
                        RefEventId: $scope.curr.Uid || '',
                        WhetherPublic: $scope.curr.WhetherPublic || false
                    } }
                },
                result: function (response, error, http) {
                    var log_description = ['學生「@StudentName@」點選「我要報名」。',
                        '活動編號「' + $scope.curr.Uid + '」，',
                        '活動名稱「' + $scope.curr.ActivityName + '」。',
                        '公開姓名「' + ($scope.curr.WhetherPublic ? '同意' : '不同意') + '」。',
                        '使用者電腦時間「' + $filter('date')(new Date(), 'yyyy/MM/dd HH:mm:ss:sss') + '」。'].join('');

                    if (!error) {
                        reg_queue = true;
                        writeLog(log_actionType, '新增報名記錄成功', log_description);
                    }
                    else
                    {
                        has_error = true;
                        set_error_message("#mainMsg", "InsertRegisterActivity", error);

                        var log_action = '新增報名記錄失敗';
                        // 判斷是否已截止
                        if (error && error.dsaError && error.dsaError.status === "504" && error.dsaError.message == "502") {
                            $scope.getActivitys(); // 重新取回活動列表
                            log_action += '(時間已截止)';
                        }
                        writeLog(log_actionType, log_action, log_description);
                    }
                    finish();
                }
            });
        }
    };

    // 取得已報名且公開的名單
    $scope.showPublicMember = function() {
        $scope.curr.Members = [];
        $('#publicMemberModal').modal('show');
        $scope.contract.send({
            service: "default.GetReplyMembers",
            body: {
                RefEventID: $scope.curr.RefEventTemplateId || 0
            },
            result: function (response, error, http) {
                if (!error) {
                    //console.log(response);
                    if (response.Response.ReplyMembers) {
                        $scope.curr.Members = [].concat(response.Response.ReplyMembers || []);
                        $scope.$apply();
                    }
                }
                else
                {
                    set_error_message("#mainMsg", "GetReplyMembers", error);
                }
            }
        });
    };

    // 統計字數，扣掉空白和換行
    $scope.wordCountOf = function(text) {
        if (typeof text === 'string') {
            return (text || '').replace(/(\r\n|\n|\r)/gm, '').length;
        } else {
            return 0;
        }
    };

    // 預覽
    $scope.previewClick = function() {
        var requiredAllRight = true;
        $scope.questions.forEach(function(question){
            // 必填未填
            if (question.Required == 't' && !question.Answer) {
                requiredAllRight = false;
            }
            if (question.Type=='問答題') {
                if ((question.Answer || '').replace(/(\r\n|\n|\r)/gm, '').length > 500) {
                    requiredAllRight = false;
                }
            }
        });
        if (!requiredAllRight) {
            $('#alertRequiredModal').modal('show');
        } else {
            $scope.viewState = 'preview';
            $('#tab_form')
                .find('.my-preview-remove').hide().end()
                .find('form')
                .find('input:radio').each(function(){
                    $(this).hide();
                    if (!this.checked) {
                        $(this).parent('label').hide();
                    }
                }).end()
                .find('input:checkbox').each(function(){
                    $(this).hide();
                    if (!this.checked) {
                        $(this).parent('label').hide();
                    }
                }).end()
                .find('textarea').hide().each(function(){
                    $(this).after('<span style="word-break: break-all;" data-type="preview">' + $('<div/>').text($(this).val()).html().replace(/\n/g, '<br />') + '</span>');
                });
        }
    };

    // 返回編輯
    $scope.previewCancel = function() {
        $scope.viewState = 'form';
        $('#tab_form')
            .find('.my-preview-remove').show().end()
            .find('form')
            .find('label, input:radio').each(function(){
                $(this).show();
            }).end()
            .find('label, input:checkbox').each(function(){
                $(this).show();
            }).end()
            .find('textarea').show().end()
            .find('span[data-type=preview]').remove();
    };

    var contractForLog = gadget.getContract("emba.student");
    var writeLog = function(actionType, action, description) {
        contractForLog.getUserInfo().Property.forEach(function(item){
            var patt = new RegExp('@'+item.Name+'@', 'g');
            description = description.replace(patt, item['@text']);
        })

        contractForLog.send({
            service: "public.AddLog",
            body: {
                Request: {
                    Log: {
                        Actor: contractForLog.getUserInfo().UserName,
                        ActionType: actionType,
                        Action: action,
                        TargetCategory: 'student',
                        ClientInfo: { ClientInfo: '' },
                        ActionBy: 'ischool web 報名小工具',
                        Description: description
                    }
                }
            }
        });
    }

    $scope.init = function() {
        $scope.getActivitys();
        $scope.getHistorys();
    };
});
var set_error_message = function(select_str, serviceName, error) {
    var tmp_msg;

    tmp_msg = "<i class=\"icon-white icon-info-sign my-err-info\"></i><strong>呼叫服務失敗，請稍候重試!</strong>(" + serviceName + ")";
    if (error !== null) {
        if (error.dsaError) {
            if (error.dsaError.status === "504") {
                switch (error.dsaError.message) {
                    case "502":
                        tmp_msg = "<strong>很抱歉，報名已截止，不允許本操作！</strong>";
                }
            } else {
                if (error.dsaError.message) {
                    tmp_msg = error.dsaError.message;
                }
            }
        } else if (error.loginError.message) {
            tmp_msg = error.loginError.message;
        } else {
            if (error.message) {
                tmp_msg = error.message;
            }
        }
        $(select_str).html("<div class=\"alert alert-error\"><button class=\"close\" data-dismiss=\"alert\">×</button>" + tmp_msg + "</div>");
        return $(".my-err-info").click(function() {
            return alert("請拍下此圖，並與客服人員連絡，謝謝您。\n" + JSON.stringify(error, null, 2));
        });
        $('body').scrollTop(0);
    }
};