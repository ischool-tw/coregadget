// 個人資料
$(function() {
    LessonPlanManager.ControlProfile = function(target) {
        var _myInfo;
        var target = $(target);
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
        var sheepItForm1 = $('#teacher_certify').sheepIt(options);
        var sheepItForm2 = $('#education').sheepIt(options);
        var sheepItForm3 = $('#working_experience').sheepIt(options);
        var sheepItForm4 = $('#skill_certify').sheepIt(options);
        var sheepItForm5 = $('#accomplishments').sheepIt(options);

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

        //#region 上傳照片
        target.find('#edit-Photo').click(function() {
            var input_file = $('#upload-photo');
            input_file.val('').trigger('click');
            if (!input_file.hasClass('hasUploader')) {
                input_file.updatePhoto(
                    $('img', $('#edit-Photo')),
                    {
                        oncomplete: function () {
                            if ($('img', $('#edit-Photo')).attr('photo-base64')) {
                                target.find('span.my-trash').show();
                            } else {
                                target.find('span.my-trash').hide();
                            }
                        }
                    }
                );
            }
        });
        //#endregion

        //#region 刪除照片
        target.find('span.my-trash').click(function() {
            $('img', $('#edit-Photo')).attr('src', 'css/images/nophoto.png').attr('photo-base64', '');
        });
        //#endregion

        target.find('[data-action=cancel]').click(function() {
            showProfile(_myInfo);
        });

        target.find('[data-action=save]').click(function() {
            if ($(this).hasClass('disabled')) return;
            if (target.find('form').valid()) {
                $(this).text('儲存中...').addClass('disabled');

                var tmp_req = target.find('form').serializeObject();
                tmp_req.Photo = target.find('[name=Photo]').attr('photo-base64') || '';
                if (tmp_req.TeacherCertify_Number) {
                    tmp_req.TeacherCertify = { TeacherCertifys: { Certify: [] } };
                    $(LessonPlanManager.Util.handleArray(tmp_req.TeacherCertify_Number)).each(function(index, item) {
                        tmp_req.TeacherCertify.TeacherCertifys.Certify.push({
                            Number: item,
                            Subject: LessonPlanManager.Util.handleArray(tmp_req.TeacherCertify_Subject)[index]
                        });
                    });
                } else {
                    tmp_req.TeacherCertify = '';
                }
                if (tmp_req.Education_SchoolName) {
                    tmp_req.Education = { Educations: { Education: [] } };
                    $(LessonPlanManager.Util.handleArray(tmp_req.Education_SchoolName)).each(function(index, item) {
                        tmp_req.Education.Educations.Education.push({
                            SchoolName: item
                        });
                    });
                } else {
                    tmp_req.Education = '';
                }
                if (tmp_req.WorkingExperience_SchoolName) {
                    tmp_req.WorkingExperience = { WorkingExperience: { Experience: [] } };
                    $(LessonPlanManager.Util.handleArray(tmp_req.WorkingExperience_SchoolName)).each(function(index, item) {
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
                    $(LessonPlanManager.Util.handleArray(tmp_req.SkillCertify_Subject)).each(function(index, item) {
                        tmp_req.SkillCertify.SkillCertifys.Certify.push({
                            Subject: item
                        });
                    });
                } else {
                    tmp_req.SkillCertify = '';
                }
                if (tmp_req.Accomplishments_Subject) {
                    tmp_req.Accomplishments = { Accomplishments: { Accomplishment: [] } };
                    $(LessonPlanManager.Util.handleArray(tmp_req.Accomplishments_Subject)).each(function(index, item) {
                        tmp_req.Accomplishments.Accomplishments.Accomplishment.push({
                            Subject: item
                        });
                    });
                } else {
                    tmp_req.Accomplishments = '';
                }

                LessonPlanManager.StartUp.profileSave({Request: { TeacherExt : tmp_req }} , setProfile);
            }
        });

        //#region 處理個人資料
        var showProfile = function(myInfo) {
            _myInfo = myInfo || {};
            target.find('[name=Birthdate]').val(_myInfo.Birthdate);
            target.find('[name=BloodGroup]').val(_myInfo.BloodGroup);
            target.find('[name=CellPhone]').val(_myInfo.CellPhone);
            target.find('[name=ContactPhone]').val(_myInfo.ContactPhone);
            target.find('[name=IdNumber]').val(_myInfo.IdNumber);
            target.find('[name=MaritalStatus]').val(_myInfo.MaritalStatus);

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
                        LessonPlanManager.Util.set_error_message('#mainMsg', 'GetLessonPlanGroupSubject', error);
                    } else {
                        var _ref, options = [];
                        if (((_ref = response.Response) != null ? _ref.GroupSubject : void 0) != null) {
                            $(response.Response.GroupSubject).each(function(index, item) {
                                options.push('<option value="' + item.Uid + '">' + (item.Name || '') + '</option>');
                            });
                        }
                        $('[name=GroupSubjectID]', $('#profile')).append(options.join(''));
                        target.find('[name=GroupSubjectID]').val(_myInfo.GroupSubjectID);
                    }
                }
            });
            //#endregion

            //#region 顯示照片
            var photo;
            var photo_base64 = '';
            if (_myInfo.Photo) {
                photo = '<img src="data:image/png;base64,' + _myInfo.Photo + '" photo-base64="' + _myInfo.Photo + '" name="Photo" />';
            } else {
                photo = '<img src="css/images/nophoto.png" name="Photo">';
                $('span.my-trash', $('#profile')).hide();
            }
            $('#edit-Photo').html(photo);
            //#endregion

            //#region 設定動態新增項目的預設值
            if (_myInfo.TeacherCertify) {
                sheepItForm1.reset(LessonPlanManager.Util.handleArray(_myInfo.TeacherCertify.TeacherCertifys.Certify));
            }
            if (_myInfo.Education) {
                sheepItForm2.reset(LessonPlanManager.Util.handleArray(_myInfo.Education.Educations.Education));
            }
            if (_myInfo.WorkingExperience) {
                sheepItForm3.reset(LessonPlanManager.Util.handleArray(_myInfo.WorkingExperience.WorkingExperience.Experience));
            }
            if (_myInfo.SkillCertify) {
                sheepItForm4.reset(LessonPlanManager.Util.handleArray(_myInfo.SkillCertify.SkillCertifys.Certify));
            }
            if (_myInfo.Accomplishments) {
                sheepItForm5.reset(LessonPlanManager.Util.handleArray(_myInfo.Accomplishments.Accomplishments.Accomplishment));
            }
            //#endregion
        };
        //#endregion

        var setProfile = function(req) {
            req = req || {};
            _myInfo.Accomplishments = req.Accomplishments;
            _myInfo.Birthdate = req.Birthdate;
            _myInfo.BloodGroup = req.BloodGroup;
            _myInfo.CellPhone = req.CellPhone;
            _myInfo.ContactPhone = req.ContactPhone;
            _myInfo.Education = req.Education;
            _myInfo.IdNumber = req.IdNumber;
            _myInfo.MaritalStatus = req.MaritalStatus;
            _myInfo.Photo = req.Photo;
            _myInfo.GroupSubjectID = req.GroupSubjectID;
            _myInfo.SkillCertify = req.SkillCertify;
            _myInfo.TeacherCertify = req.TeacherCertify;
            _myInfo.WorkingExperience = req.WorkingExperience;

            target.find('[data-action=save]').text('儲存變更').removeClass("disabled");
            $('#mainMsg').html('<div class="alert alert-success">\n  儲存成功！\n</div>');
            setTimeout("$('#mainMsg').html('')", 1500);
        };
        LessonPlanManager.StartUp.profileReady(showProfile);
    }('#profile');
});