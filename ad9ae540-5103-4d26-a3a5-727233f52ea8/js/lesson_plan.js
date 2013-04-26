$(function() {
    var options = {
        separator: '',
        allowRemoveLast: false,
        allowRemoveCurrent: true,
        allowRemoveAll: false,
        allowAdd: true,
        allowAddN: false,
        maxFormsCount: 0,
        minFormsCount: 0,
        iniFormsCount: 1
    };
    _gg.sheepItForm1 = $('#teacher_certify').sheepIt(options);
    _gg.sheepItForm2 = $('#education').sheepIt(options);
    _gg.sheepItForm3 = $('#working_experience').sheepIt(options);
    _gg.sheepItForm4 = $('#skill_certify').sheepIt(options);
    _gg.sheepItForm5 = $('#accomplishments').sheepIt(options);
    _gg.sheepItForm6 = $('#study').sheepIt(options);
    _gg.sheepItForm7 = $('#content').sheepIt(options);

    _gg.on_init();

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
        .on('focus', 'input.date:not(.hasDatepicker)', function() {
            $( this ).datepicker({
                dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"]
                ,monthNames: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
                ,monthNamesShort: ["一","二","三","四","五","六","七","八","九","十","十一","十二"]
                ,dateFormat: "yy/mm/dd"
                ,changeMonth: true
                ,changeYear: true
                ,showButtonPanel: true
            });
        })
        //#region 照片
        .on('click', '#edit-Photo', function() {
            var input_file = $('#upload-photo');
            input_file.val('').trigger('click');
            if (!input_file.hasClass('hasUploader')) {
                input_file.updatePhoto(
                    $('img', $('#edit-Photo')),
                    {
                        oncomplete: function () {
                            if ($('img', $('#edit-Photo')).attr('photo-base64')) {
                                $('span.my-trash', $('#profile')).show();
                            } else {
                                $('span.my-trash', $('#profile')).hide();
                            }
                        }
                    }
                );
            }
        })
        .on('click', 'span.my-trash', function() {
            $('img', $('#edit-Photo')).attr('src', 'css/images/nophoto.png').attr('photo-base64', '');
            $('span.my-trash', $('#profile')).hide();
        })
        //#endregion
        .on('click', 'input[data-action]', function() {
            _gg.on_action($(this));
        });
});

var _gg = function() {
    var connection = gadget.getContract("wvs.lesson_plan.teacher"),
        config = {},
        listSubject = [],
        myInfo = {},
        myPlans = [],
        myStudy,
        mySubject = [],
        allPlans,
        allSubject,
        currViewPlan,
        allFiles = {};

    //#region 錯誤訊息
    var set_error_message = function(select_str, serviceName, error) {
        if (serviceName) {
            var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
            if (error !== null) {
                if (error.dsaError) {
                    if (error.dsaError.status === "504") {
                        switch (error.dsaError.message) {
                            case '501':
                                tmp_msg = '<strong>很抱歉，您無讀取資料權限！</strong>';
                                break;
                            default:
                                tmp_msg = '<strong>' + error.dsaError.message + '</strong>';
                        }
                    } else if (error.dsaError.message) {
                        tmp_msg = error.dsaError.message;
                    }
                } else if (error.loginError.message) {
                    tmp_msg = error.loginError.message;
                } else if (error.message) {
                    tmp_msg = error.message;
                }
                $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
                $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
            }
        } else {
            $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + error + "\n</div>");
        }
    };
    //#endregion

    //#region 初始化
    var initialize = function() {
        var retConfig = false,
            retSubject = false,
            retGroupSubject = false,
            retTeacherExt = false,
            retMyPlan = false;
            retMySubject = false;

        var checkRet = function() {
            if (retConfig && retSubject && retGroupSubject && retTeacherExt && retMyPlan && retMySubject) {

            }
        };

        //#region 取得上傳下載的網址
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
                    set_error_message('#mainMsg', 'List', error);
                } else {
                    if (response.List.Content != null) {
                        $(response.List.Content).each(function(index, item) {
                            config.upload = item.upload;
                            config.download = item.download;
                        });
                    }
                    retConfig = true;
                    checkRet();
                }
            }
        });

        //#endregion

        //#region 取得科目
        connection.send({
            service: "_.GetLessonPlanSubject",
            body: {
                Request: {
                    Condition: {}
                }
            },
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetLessonPlanSubject', error);
                } else {
                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.Subject : void 0) != null) {
                        $(response.Response.Subject).each(function(index, item) {
                            listSubject.push({
                                Subject : item.Subject
                            })
                        });
                    }
                    retSubject = true;
                    checkRet();
                }
            }
        });
        //#endregion

        //#region 取得群科
        connection.send({
            service: "_.GetLessonPlanGroupSubject",
            body: {
                Request: {
                    Condition: {
                        Status: 'true'
                    }
                }
            },
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetLessonPlanGroupSubject', error);
                } else {
                    var _ref, options = [];
                    if (((_ref = response.Response) != null ? _ref.GroupSubject : void 0) != null) {
                        $(response.Response.GroupSubject).each(function(index, item) {
                            options.push('<option value="' + item.Uid + '">' + (item.Name || '') + '</option>');
                        });
                    }
                    $('[name=GroupSubjectID]', $('#profile')).append(options.join(''));
                    retGroupSubject = true;
                    checkRet();
                }
            }
        });
        //#endregion

        //#region 取得基本資料
        connection.send({
            service: "_.GetMyInfo",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetMyInfo', error);
                } else {
                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.Teacher : void 0) != null) {
                        $(response.Response.Teacher).each(function(index, item) {
                            myInfo.TeacherID = (item.TeacherID || '');
                        });

                        if (myInfo.TeacherID) {
                            //#region 取得個人資料
                            connection.send({
                                service: "_.GetTeacherExt",
                                body: '',
                                result: function (response, error, http) {
                                    if (error !== null) {
                                        set_error_message('#mainMsg', 'GetTeacherExt', error);
                                    } else {
                                        var _ref;
                                        if (((_ref = response.Response) != null ? _ref.TeacherExt : void 0) != null) {
                                            $(response.Response.TeacherExt).each(function(index, item) {
                                                myInfo.Accomplishments   = item.Accomplishments;
                                                myInfo.Autobiography     = item.Autobiography;
                                                myInfo.Birthdate         = item.Birthdate;
                                                myInfo.BloodGroup        = item.BloodGroup;
                                                myInfo.CellPhone         = item.CellPhone;
                                                myInfo.ContactPhone      = item.ContactPhone;
                                                myInfo.Education         = item.Education;
                                                myInfo.Future            = item.Future;
                                                myInfo.IdNumber          = item.IdNumber;
                                                myInfo.MaritalStatus     = item.MaritalStatus;
                                                myInfo.Motto             = item.Motto;
                                                myInfo.Photo             = item.Photo;
                                                myInfo.Rationale         = item.Rationale;
                                                myInfo.GroupSubjectID    = item.GroupSubjectID;
                                                myInfo.SkillCertify      = item.SkillCertify;
                                                myInfo.TeacherCertify    = item.TeacherCertify;
                                                myInfo.WorkingExperience = item.WorkingExperience;
                                            });
                                        }
                                        controlProfile.showProfile();
                                        controlProfile.showAutobiography();
                                        controlProfile.showIdea();
                                        retTeacherExt = true;
                                        checkRet();
                                    }
                                }
                            });
                            //#endregion

                            //#region 取得我的教案
                            connection.send({
                                service: "_.GetLessonPlanMain",
                                body: {
                                    Request: {
                                        Field: {
                                            All: {}
                                        },
                                        Condition: {
                                            TeacherID: myInfo.TeacherID
                                        },
                                        Order: {
                                            Uid: 'DESC'
                                        }
                                    }
                                },
                                result: function (response, error, http) {
                                    if (error !== null) {
                                        set_error_message('#mainMsg', 'GetLessonPlanMain', error);
                                    } else {
                                        var _ref;
                                        if (((_ref = response.Response) != null ? _ref.Main : void 0) != null) {
                                            $(response.Response.Main).each(function(index, item) {
                                                myPlans.push({
                                                    Uid          : item.Uid,
                                                    Affective    : item.Affective,
                                                    Architecture : item.Architecture,
                                                    Assessment   : item.Assessment,
                                                    Capacity     : item.Capacity,
                                                    ClickRate    : item.ClickRate,
                                                    Cognition    : item.Cognition,
                                                    Content      : item.Content,
                                                    Createdate   : item.Createdate,
                                                    Domain       : item.Domain,
                                                    Materials    : item.Materials,
                                                    Public       : item.Public,
                                                    Rationale    : item.Rationale,
                                                    References   : item.References,
                                                    Skill        : item.Skill,
                                                    Subject      : item.Subject,
                                                    Target       : item.Target,
                                                    TimeSpan     : item.TimeSpan,
                                                    Title        : item.Title
                                                });
                                            });
                                        }
                                        retMyPlan = true;
                                        checkRet();
                                    }
                                }
                            });
                            //#endregion

                            //#region 取得我使用的科目
                            connection.send({
                                service: "_.GetLessonPlanSubject",
                                body: {
                                    Request: {
                                        Condition: {
                                            TeacherID: myInfo.TeacherID
                                        }
                                    }
                                },
                                result: function (response, error, http) {
                                    if (error !== null) {
                                        set_error_message('#mainMsg', 'GetLessonPlanSubject', error);
                                    } else {
                                        var _ref;
                                        if (((_ref = response.Response) != null ? _ref.Subject : void 0) != null) {
                                            $(response.Response.Subject).each(function(index, item) {
                                                if (item.Subject) {
                                                    mySubject.push(item.Subject);
                                                }
                                            });
                                        }
                                        controlPlan.showMySubject(mySubject);
                                        controlPlan.showMyPlanList();
                                        retMySubject = true;
                                        checkRet();
                                    }
                                }
                            });
                            //#endregion
                        }
                    }
                }
            }
        });
        //#endregion
    };
    //#endregion

    //#region 處理個人資料
    var controlProfile = {
        showProfile: function() {
            var parent = $('#profile');
            parent.find('[name=Birthdate]').val(myInfo.Birthdate);
            parent.find('[name=BloodGroup]').val(myInfo.BloodGroup);
            parent.find('[name=CellPhone]').val(myInfo.CellPhone);
            parent.find('[name=ContactPhone]').val(myInfo.ContactPhone);
            parent.find('[name=IdNumber]').val(myInfo.IdNumber);
            parent.find('[name=MaritalStatus]').val(myInfo.MaritalStatus);
            parent.find('[name=GroupSubjectID]').val(myInfo.GroupSubjectID);

            //#region 顯示照片
            var photo;
            var photo_base64 = '';
            if (myInfo.Photo) {
                photo = '<img src="data:image/png;base64,' + myInfo.Photo + '" photo-base64="' + myInfo.Photo + '" name="Photo" />';
            } else {
                photo = '<img src="css/images/nophoto.png" name="Photo">';
                $('span.my-trash', $('#profile')).hide();
            }
            $('#edit-Photo').html(photo);
            //#endregion


            //#region 預設值
            if (myInfo.TeacherCertify) {
                _gg.sheepItForm1.inject(obj2ary(myInfo.TeacherCertify.TeacherCertifys.Certify));
            }
            if (myInfo.Education) {
                _gg.sheepItForm2.inject(obj2ary(myInfo.Education.Educations.Education));
            }
            if (myInfo.WorkingExperience) {
                _gg.sheepItForm3.inject(obj2ary(myInfo.WorkingExperience.WorkingExperience.Experience));
            }
            if (myInfo.SkillCertify) {
                _gg.sheepItForm4.inject(obj2ary(myInfo.SkillCertify.SkillCertifys.Certify));
            }
            if (myInfo.Accomplishments) {
                _gg.sheepItForm5.inject(obj2ary(myInfo.Accomplishments.Accomplishments.Accomplishment));
            }
            //#endregion

        },
        showAutobiography: function() {
            var parent = $('#memoir');
            parent.find('[name=Autobiography]').val(myInfo.Autobiography);
        },
        showIdea: function() {
            var parent = $('#concept');
            parent.find('[name=Rationale]').val(myInfo.Rationale);
            parent.find('[name=Motto]').val(myInfo.Motto);
            parent.find('[name=Future]').val(myInfo.Future);
        },
        setProfile: function(req) {
            myInfo.Accomplishments = req.Accomplishments;
            myInfo.Birthdate = req.Birthdate;
            myInfo.BloodGroup = req.BloodGroup;
            myInfo.CellPhone = req.CellPhone;
            myInfo.ContactPhone = req.ContactPhone;
            myInfo.Education = req.Education;
            myInfo.IdNumber = req.IdNumber;
            myInfo.MaritalStatus = req.MaritalStatus;
            myInfo.Photo = req.Photo;
            myInfo.GroupSubjectID = req.GroupSubjectID;
            myInfo.SkillCertify = req.SkillCertify;
            myInfo.TeacherCertify = req.TeacherCertify;
            myInfo.WorkingExperience = req.WorkingExperience;
        },
        setAutobiography: function(req) {
            myInfo.Autobiography = req.Autobiography;
        },
        setIdea: function(req) {
            myInfo.Rationale = req.Rationale;
            myInfo.Motto = req.Motto;
            myInfo.Future = req.Future;
        },
        saveProfileData: function(data, callback) {
            connection.send({
                service: "_.SetTeacherExt",
                body: data,
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'SetTeacherExt', error);
                    } else {
                        if (typeof callback === "function") {
                            callback();
                        };
                        // var _ref;
                        // if (((_ref = response.Response) != null ? _ref.Weight : void 0) != null) {
                        //     $(response.Response.Weight).each(function(index, item) {
                        //     });
                        // }
                    }
                }
            });
        }
    };
    //#endregion

    //#region 處理教案
    var controlPlan = {
        showMySubject: function(_subject) {
            var options = ['<option value="">全部</option>'];
            if (_subject) {
                $(_subject).each(function(key, val) {
                    options.push(val);
                });
            }
            $('#MyChooseSubject').html(options.join(''));
        },
        showMyPlanList: function(_plans) {
            var items = [];
            if (_plans) {
                getFileList(myInfo.TeacherID, null, null, function(){
                    $(_plans).each(function(index, item) {
                        var count_sheet = (allFiles.sheet[item.OriginID].length || '0');
                        var count_attach = (allFiles.attach[item.OriginID].length || '0');
                        items.push(
                            '<tr>' +
                            '  <td>' + (item.Createdate || '') + '</td>' +
                            '  <td><a href="#fixmaterial" data-toggle="tab" data-uid="' + item.Uid + '">' + (item.Title || '') + '</a></td>' +
                            '  <td>' + count_sheet + '</td>' +
                            '  <td>' + count_attach + '</td>' +
                            '  <td>' + (item.ClickRate || '0' ) + '</td>' +
                            '  <td>' + (item.Public === 't' ? '<i class="icon-ok"></i>' : '') + '</td>' +
                            '</tr>'
                        );
                    });
                });
            } else {
                $('#material tbody').html('<tr><td colspan="6">目前無資料</td></tr>');
            }
        },
        showPlan: function() {

        },
        editPlan: function() {
        },
        setPlan: function() {

        },
        delPlan: function() {
        }
    };
    //#endregion

    //#region 取得進修及研習課程
    var getStudy = function() {
        if (!myStudy) {
        };
    };
    //#endregion

    //#region 取得所有教案
    var getAllPlan = function(_subjectID) {};
    //#endregion

    //#region 點閱數+1
    var setRate = function(_planID) {
        if (_planID) {
            connection.send({
                service: "_.SetClickRate",
                body: {
                    Request: {
                        Condition: {
                            Uid: _planID
                        }
                    }
                },
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message('#mainMsg', 'SetClickRate', error);
                    } else {
                        var _ref;
                        if (((_ref = response.Main) != null ? _ref.ClickRate : void 0) != null) {
                            $().html(resresponse.Main.ClickRate);
                        }
                    }
                }
            });
        }
    };
    //#endregion

    //#region 取得進修及研習課程附件 + 教案學習單 及 附件
    var getFileList = function(_teacherID, _originID, _originType, callback) {
        var tmp_condition = {};
        if (_teacherID) {
            tmp_condition.TeacherID = _teacherID;
        }
        if (_originID) {
            tmp_condition.OriginID = _originID;
        }
        if (_originType) {
            tmp_condition.OriginType = _originType;
        }
        connection.send({
            service: "_.GetLessonPlanFiles",
            body: {
                Request: {
                    Condition: tmp_condition
                }
            },
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message('#mainMsg', 'GetLessonPlanFiles', error);
                } else {
                    var _ref;
                    if (((_ref = response.Response) != null ? _ref.File : void 0) != null) {
                        $(response.Response.File).each(function(index, item) {
                            if (!allFiles[item.OriginType]) {
                                allFiles[item.OriginType] = {};
                            }

                            if (!allFiles[item.OriginType][item.OriginID]) {
                                allFiles[item.OriginType][item.OriginID] = {};
                            }

                            if (!allFiles[item.OriginType][item.OriginID][item.Uid]) {
                                allFiles[item.OriginType][item.OriginID][item.Uid] = {
                                    Uid        : item.Uid,
                                    Filename   : item.Filename,
                                    Filepath   : item.Filepath,
                                    Filesize   : item.Filesize,
                                    Filetype   : item.Filetype,
                                    OriginID   : item.OriginID,
                                    TeacherID  : item.TeacherID,
                                    OriginType : item.OriginType,
                                    Key        : item.Key
                                };
                            }
                        });
                    }
                    if (typeof callback === "function") {
                        callback(allFiles);
                    };
                }
            }
        });
    };
    //#endregion

    //#region 轉換物件為陣列，若已為陣列則直接回傳
    var obj2ary = function(_obj) {
        if (_obj)
        return ($.isArray(_obj)) ? _obj : [_obj];
    };
    //#endregion

    var successmsg = function(_btn) {
        _btn.button('reset');
        $('#mainMsg').html('<div class="alert alert-success">\n  儲存成功！\n</div>');
        setTimeout("$('#mainMsg').html('')", 1500);
    };

    return {
        on_init: function() {
            return initialize();
        },
        on_study: function() {
            return getStudy();
        },
        on_allplan: function(_subjectID) {
            return getAllPlan(_subjectID);
        },
        add_rate: function(_planID) {
            return setRet(_planID);
        },
        on_action: function(_btn) {
            var action = _btn.attr('data-action')
                ,type = _btn.attr('data-type')
                ,req = { Request: { TeacherExt: {} } }
                ,tmp_req
                ,parent;

            if (action === 'save') {
                // _btn.button('loading');
            }

            switch (type) {
                //#region 個人資料
                case 'profile':
                    if (action === 'save') {
                        parent = $('#profile');
                        tmp_req = parent.find('form').serializeObject();
                        tmp_req.Photo = parent.find('[name=Photo]').attr('photo-base64') || '';
                        if (tmp_req.TeacherCertify_Number) {
                            tmp_req.TeacherCertify = { TeacherCertifys: { Certify: [] } };
                            $(obj2ary(tmp_req.TeacherCertify_Number)).each(function(index, item) {
                                tmp_req.TeacherCertify.TeacherCertifys.Certify.push({
                                    Number: item,
                                    Subject: obj2ary(tmp_req.TeacherCertify_Subject)[index]
                                });
                            });
                        } else {
                            tmp_req.TeacherCertify = '';
                        }
                        if (tmp_req.Education_SchoolName) {
                            tmp_req.Education = { Educations: { Education: [] } };
                            $(obj2ary(tmp_req.Education_SchoolName)).each(function(index, item) {
                                tmp_req.Education.Educations.Education.push({
                                    SchoolName: item
                                });
                            });
                        } else {
                            tmp_req.Education = '';
                        }
                        if (tmp_req.WorkingExperience_SchoolName) {
                            tmp_req.WorkingExperience = { WorkingExperience: { Experience: [] } };
                            $(obj2ary(tmp_req.WorkingExperience_SchoolName)).each(function(index, item) {
                                tmp_req.WorkingExperience.WorkingExperience.Experience.push({
                                    SchoolName: item,
                                    Title: tmp_req.WorkingExperience_Title[index],
                                    Seniority: tmp_req.WorkingExperience_Seniority[index]
                                });
                            });
                        } else {
                            tmp_req.WorkingExperience = '';
                        }
                        if (tmp_req.SkillCertify_Subject) {
                            tmp_req.SkillCertify = { SkillCertifys: { Certify: [] } };
                            $(obj2ary(tmp_req.SkillCertify_Subject)).each(function(index, item) {
                                tmp_req.SkillCertify.SkillCertifys.Certify.push({
                                    Subject: item
                                });
                            });
                        } else {
                            tmp_req.SkillCertify = '';
                        }
                        if (tmp_req.Accomplishments_Subject) {
                            tmp_req.Accomplishments = { Accomplishments: { Accomplishment: [] } };
                            $(obj2ary(tmp_req.Accomplishments_Subject)).each(function(index, item) {
                                tmp_req.Accomplishments.Accomplishments.Accomplishment.push({
                                    Subject: item
                                });
                            });
                        } else {
                            tmp_req.Accomplishments = '';
                        }
                        req.Request.TeacherExt = tmp_req;
                        controlProfile.saveProfileData(req, function() {
                            controlProfile.setProfile(tmp_req);
                            successmsg(_btn);
                        });
                    } else if (action === 'cancel') {
                        controlProfile.showProfile();
                    }
                    break;
                //#endregion

                //#region 自傳
                case 'memoir':
                    if (action === 'save') {
                        parent = $('#memoir');
                        tmp_req = parent.find('form').serializeObject();
                        req.Request.TeacherExt = tmp_req;
                        controlProfile.saveProfileData(req, function() {
                            controlProfile.setAutobiography(tmp_req);
                            successmsg(_btn);
                        });
                    } else if (action === 'cancel') {
                        controlProfile.showAutobiography();
                    }
                    break;
                //#endregion

                //#region 教育理念
                case 'concept':
                    if (action === 'save') {
                        parent = $('#concept');
                        tmp_req = parent.find('form').serializeObject();
                        req.Request.TeacherExt = tmp_req;
                        controlProfile.saveProfileData(req, function() {
                            controlProfile.setIdea(tmp_req);
                            successmsg(_btn);
                        });
                    } else if (action === 'cancel') {
                        controlProfile.showIdea();
                    }
                    break;
                //#endregion

                //#region 進修及研習課程
                case 'pfe':
                    if (action === 'save') {

                    } else if (action === 'cancel') {

                    }
                    break;
                //#endregion

                //#region 教案
                case 'addmaterial':
                    if (action === 'save') {

                    } else if (action === 'cancel') {

                    }
                    break;
                //#endregion
            }
        }
    };
}();


