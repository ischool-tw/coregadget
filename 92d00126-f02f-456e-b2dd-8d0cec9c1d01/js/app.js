var app = angular.module("app", ["checklist-model"]);

app.controller('MainCtrl', ['$scope', function ($scope) {
    $scope.connection = gadget.getContract("emba.student");

    $scope.myInfo = {};
    // StudentInfo
    var _StudentInfo = {
        // 姓名
        'Name': '',
        // 性別
        'Gender': '',
        // 出生日期
        'Birthdate': '',
        // 緊急聯絡人
        'CustodianName': '',
        // 住家電話
        'PermanentPhone': '',
        // 行動電話1
        'SMSPhone': '',
        // 聯絡人電話 CustodianOtherInfo.CustodianOtherInfo.Phone
        'CustodianOtherInfo': {
            'CustodianOtherInfo': {
                'Phone': '',
                'Email': '',
                'Job': '',
                'EducationDegree': '',
                'Relationship': ''
            }
        },
        // 公司電話  OtherPhones.PhoneList.PhoneNumber[0]
        // 行動電話2 OtherPhones.PhoneList.PhoneNumber[1]
        // 秘書電話  OtherPhones.PhoneList.PhoneNumber[2]
        'OtherPhones': {
            'PhoneList': {
                'PhoneNumber': [
                    '',
                    '',
                    ''
                ]
            }
        },
        // 聯絡地址 MailingAddress.AddressList.Address
        'MailingAddress': {
            'AddressList': {
                'Address': {
                    'ZipCode': '',
                    'County': '',
                    'Town': '',
                    'District': '',
                    'Area': '',
                    'DetailAddress': ''
                }
            }
        },
        // 住家地址 PermanentAddress.AddressList.Address
        'PermanentAddress': {
            'AddressList': {
                'Address': {
                    'Area': '',
                    'County': '',
                    'DetailAddress': '',
                    'District': '',
                    'Latitude': '',
                    'Longitude': '',
                    'Town': '',
                    'ZipCode': ''
                }
            }
        },
        // 公司地址 OtherAddresses.AddressList.Address
        'OtherAddresses': {
            'AddressList': {
                'Address': {
                    'ZipCode': '',
                    'County': '',
                    'Town': '',
                    'District': '',
                    'Area': '',
                    'DetailAddress': ''
                }
            }
        },
        // 其它聯絡資訊
        'Line': '',
        'Facebook': '',
        'LinkedIn': '',
        'WhatsApp': '',
        'WeChat': ''
    };
    // StudentBrief2
    var _StudentBrief2 = {
        // e-mail欄-5個
        'EmailList': {
            'email1': '',
            'email2': '',
            'email3': '',
            'email4': '',
            'email5': ''
        }
    };
    // Willingness
    var _Willingness = {
        // 經驗調查-你個人或所屬組織，是否參與「社會企業」相關活動
        'IsSocialEnterprise': '',
        // 經驗調查-分享你個人或所屬組織，是否參與「社會企業」相關活動
        'IsSharingEnterprise': '',
        // 經驗調查-簡述你個人或所屬組織，是否參與「社會企業」相關活動
        'DescriptionEnterprise': '',
        // 經驗調查-你個人或所屬組織，是否參與「非營利組織」相關活動
        'IsNonProfitOrganizations': '',
        // 經驗調查-分享你個人或所屬組織，是否參與「非營利組織」相關活動
        'IsSharingOrganizations': '',
        // 經驗調查-簡述你個人或所屬組織，是否參與「非營利組織」相關活動
        'DescriptionOrganizations': '',
        // 經驗調查-你個人或所屬組織，是否參與「企業社會責任(CSR)」相關活動
        'IsCorporateSocialResponsibility': '',
        // 經驗調查-分享你個人或所屬組織，是否參與「企業社會責任(CSR)」相關活動
        'IsSharingResponsibility': '',
        // 經驗調查-簡述你個人或所屬組織，是否參與「企業社會責任(CSR)」相關活動
        'DescriptionResponsibility': '',
        // 經驗調查-你個人或所屬組織，是否參與「創業」相關活動
        'IsVenture': '',
        // 經驗調查-分享你個人或所屬組織，是否參與「創業」相關活動
        'IsSharingVenture': '',
        // 經驗調查-簡述你個人或所屬組織，是否參與「創業」相關活動
        'DescriptionVenture': '',
        // 意願調查-是否擔任台大管理學院相關課程「業師」意願
        'IsEntrepreneurialTeam': '',
        // 意願調查-分享是否擔任台大管理學院相關課程「業師」意願
        'IsSharingEntrpreneurial': '',
        // 意願調查-簡述是否擔任台大管理學院相關課程「業師」意願
        'DescriptionEntrpreneurial': '',
        // 分享興趣
        'IsSharingInterest': '',
        // 分享EMBA社團
        'IsSharingEMBAGroups': '',
        // 分享參與校外組織
        'IsSharingExternalOrganization': ''
    };
    // StudentInfo - DataSharing
    var _DataSharing = {
        // 要分享的項目
        'DataSharing': {
            'Name': 'true', // 姓名
            'Gender': 'true', // 性別
            'Birthdate': 'false', // 出生日期
            'Custodian': 'false', // 緊急聯絡人
            'CustodianPhone': 'false', // 聯絡人電話
            'ContactPhone': 'false',
            'PermanentPhone': 'false', // 住家電話
            'OtherPhoneList': {
                'PhoneNumber': [{
                        '@text': 'false',
                        '@': [
                            'title'
                        ],
                        'title': '公司電話'
                    },
                    {
                        '@text': 'false',
                        '@': [
                            'title'
                        ],
                        'title': '行動電話2'
                    },
                    {
                        '@text': 'false',
                        '@': [
                            'title'
                        ],
                        'title': '秘書電話'
                    }
                ]
            },
            'SMSPhone': 'false', // 行動電話1
            'EmailList': {
                'Email1': 'false',
                'Email2': 'false',
                'Email3': 'false',
                'Email4': 'false',
                'Email5': 'false'
            },
            'ContactAddress': 'false', // 聯絡地址
            'PermanentAddress': 'false', // 住家地址
            'OtherAddressList': { // 公司地址
                'Address': [
                    'false',
                    'false',
                    'false'
                ]
            },
            // 其它聯絡資訊
            'Line': 'false',
            'Facebook': 'false',
            'LinkedIn': 'false',
            'WhatsApp': 'false',
            'WeChat': 'false'
        }
    };
    // Publicist
    var _Publicist = {
        // 公關姓名
        'PublicistName': '',
        // 公關室電話
        'PublicRelationsOfficeTelephone': '',
        // 公室傳真
        'PublicRelationsOfficeFax': '',
        // 公關室e-amil
        'PublicistEmail': '',
        // 公司網址
        'CompanyWebsite': ''
    };

    // 將地址合併成字串
    $scope.myInfo.mergeAddress = function (address) {
        if (address.AddressList && address.AddressList.Address) {
            return [
                (address.AddressList.Address.ZipCode || ''),
                (address.AddressList.Address.County || ''),
                (address.AddressList.Address.Town || ''),
                (address.AddressList.Address.District || ''),
                (address.AddressList.Address.Area || ''),
                (address.AddressList.Address.DetailAddress || '')
            ].join('');
        } else {
            return '';
        }
    };
    // 設定，值為字串型態， 'true' or 'false'
    $scope.myInfo.toggleSLTF = function (value) {
        return (value != 'true' ? 'true' : 'false');
    };
    $scope.myInfo.validEmail = function (mail) {
        return (!!!mail) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(mail);
    };

    // 個人基本資料管理
    $scope.myInfo.load = function () {
        $scope.connection.send({
            service: "default.GetMyAdvancedInfo",
            body: {},
            result: function (response, error, http) {
                if (!error) {
                    if (response.Result) {
                        $scope.myInfo.StudentInfo = angular.copy(_StudentInfo);
                        $scope.myInfo.StudentBrief2 = angular.copy(_StudentBrief2);
                        $scope.myInfo.Willingness = angular.copy(_Willingness);
                        $scope.myInfo.DataSharing = angular.copy(_DataSharing);
                        $scope.myInfo.Publicist = angular.copy(_Publicist);

                        // 合件右物件至左物件，但不新增左物件
                        var mergeObject = function (x, y) {
                            for (var key in x) {
                                if (y && (angular.isObject(x[key]) || angular.isArray(x[key]))) {
                                    mergeObject(x[key], y[key]);
                                } else {
                                    if (y && y[key]) x[key] = y[key];
                                }
                            }
                        };

                        mergeObject($scope.myInfo.StudentInfo, response.Result);
                        mergeObject($scope.myInfo.StudentBrief2, response.Result);
                        mergeObject($scope.myInfo.Willingness, response.Result);
                        mergeObject($scope.myInfo.DataSharing, response.Result.DataSharing);
                        mergeObject($scope.myInfo.Publicist, response.Result);

                        // 處理資料
                        $scope.myInfo.StudentInfo.MailingAddress_desc = $scope.myInfo.mergeAddress($scope.myInfo.StudentInfo.MailingAddress);
                        $scope.myInfo.StudentInfo.PermanentAddress_desc = $scope.myInfo.mergeAddress($scope.myInfo.StudentInfo.PermanentAddress);
                        $scope.myInfo.StudentInfo.OtherAddresses_desc = $scope.myInfo.mergeAddress($scope.myInfo.StudentInfo.OtherAddresses);

                        $scope.myInfo.Willingness.IsSocialEnterprise = ($scope.myInfo.Willingness.IsSocialEnterprise == 't') ? true : false;
                        $scope.myInfo.Willingness.IsSharingEnterprise = ($scope.myInfo.Willingness.IsSharingEnterprise == 't') ? true : false;
                        $scope.myInfo.Willingness.IsNonProfitOrganizations = ($scope.myInfo.Willingness.IsNonProfitOrganizations == 't') ? true : false;
                        $scope.myInfo.Willingness.IsSharingOrganizations = ($scope.myInfo.Willingness.IsSharingOrganizations == 't') ? true : false;
                        $scope.myInfo.Willingness.IsCorporateSocialResponsibility = ($scope.myInfo.Willingness.IsCorporateSocialResponsibility == 't') ? true : false;
                        $scope.myInfo.Willingness.IsSharingResponsibility = ($scope.myInfo.Willingness.IsSharingResponsibility == 't') ? true : false;
                        $scope.myInfo.Willingness.IsVenture = ($scope.myInfo.Willingness.IsVenture == 't') ? true : false;
                        $scope.myInfo.Willingness.IsSharingVenture = ($scope.myInfo.Willingness.IsSharingVenture == 't') ? true : false;
                        $scope.myInfo.Willingness.IsEntrepreneurialTeam = ($scope.myInfo.Willingness.IsEntrepreneurialTeam == 't') ? true : false;
                        $scope.myInfo.Willingness.IsSharingEntrpreneurial = ($scope.myInfo.Willingness.IsSharingEntrpreneurial == 't') ? true : false;
                        $scope.myInfo.Willingness.IsSharingInterest = ($scope.myInfo.Willingness.IsSharingInterest == 't') ? true : false;
                        $scope.myInfo.Willingness.IsSharingEMBAGroups = ($scope.myInfo.Willingness.IsSharingEMBAGroups == 't') ? true : false;
                        $scope.myInfo.Willingness.IsSharingExternalOrganization = ($scope.myInfo.Willingness.IsSharingExternalOrganization == 't') ? true : false;

                        // 記錄log用
                        $scope.myInfo.oriStudentInfo = angular.copy($scope.myInfo.StudentInfo);
                        $scope.myInfo.oriStudentBrief2 = angular.copy($scope.myInfo.StudentBrief2);
                        $scope.myInfo.oriWillingness = angular.copy($scope.myInfo.Willingness);
                        $scope.myInfo.oriDataSharing = angular.copy($scope.myInfo.DataSharing);
                        $scope.myInfo.oriPublicist = angular.copy($scope.myInfo.Publicist);

                        $scope.myInfo.StudentInfo.saveing = false;

                        $scope.$apply();
                    }
                }
            }
        });
    };
    $scope.myInfo.edit_address = function (type, item) {
        // 編輯聯絡地址 MailingAddress
        // 編輯公司地址 OtherAddresses
        // 住家地址 PermanentAddress
        if (['MailingAddress', 'OtherAddresses', 'PermanentAddress'].indexOf(type) !== -1) {
            $scope.myInfo.current = {
                type: type,
                address: angular.copy(item)
            };
            $("#address").modal("show");
        }
    };
    $scope.myInfo.set_address = function () {
        $scope.myInfo.StudentInfo[$scope.myInfo.current.type] = $scope.myInfo.current.address;
        $scope.myInfo.StudentInfo[$scope.myInfo.current.type + '_desc'] = $scope.myInfo.mergeAddress($scope.myInfo.current.address);
        delete $scope.myInfo.current;
        $("#address").modal("hide");
    };

    $scope.myInfo.save = function () {

        // 判斷是否正在處理中
        if ($scope.myInfo.StudentInfo.saveing) return;

        // 判斷必填未填
        $('#main .has-error').first().find('input').focus();
        // if (!$scope.myInfo.StudentInfo.CustodianName) return;
        // if (!$scope.myInfo.StudentInfo.CustodianOtherInfo.CustodianOtherInfo.Phone) return;
        // if (!$scope.myInfo.StudentInfo.PermanentPhone) return;
        // if (!$scope.myInfo.StudentInfo.SMSPhone) return;
        // if (!$scope.myInfo.StudentBrief2.EmailList.email1) return;
        // if (!$scope.myInfo.StudentInfo.MailingAddress_desc) return;
        // if (!$scope.myInfo.StudentInfo.PermanentAddress_desc) return;
        // if ($scope.myInfo.Willingness.IsSocialEnterprise && !$scope.myInfo.Willingness.DescriptionEnterprise) return;
        // if ($scope.myInfo.Willingness.IsNonProfitOrganizations && !$scope.myInfo.Willingness.DescriptionOrganizations) return;
        // if ($scope.myInfo.Willingness.IsCorporateSocialResponsibility && !$scope.myInfo.Willingness.DescriptionResponsibility) return;
        // if ($scope.myInfo.Willingness.IsVenture && !$scope.myInfo.Willingness.DescriptionVenture) return;
        // if ($scope.myInfo.Willingness.IsEntrepreneurialTeam && !$scope.myInfo.Willingness.DescriptionEntrpreneurial) return;

        if ($scope.myInfo.validEmail($scope.myInfo.StudentBrief2.EmailList.email1) == false) return;
        if ($scope.myInfo.validEmail($scope.myInfo.StudentBrief2.EmailList.email2) == false) return;
        if ($scope.myInfo.validEmail($scope.myInfo.StudentBrief2.EmailList.email3) == false) return;
        if ($scope.myInfo.validEmail($scope.myInfo.StudentBrief2.EmailList.email4) == false) return;
        if ($scope.myInfo.validEmail($scope.myInfo.StudentBrief2.EmailList.email5) == false) return;
        if ($scope.myInfo.validEmail($scope.myInfo.Publicist.PublicistEmail) == false) return;

        // if (!$scope.stu_additionals.result['my_ExternalOrganization_desc']) return;
        // if (!$scope.stu_additionals.result['my_Interest_desc']) return;
        // if (!$scope.stu_additionals.result['my_EMBAGroups_desc']) return;

        // 驗證有無勾選其它，但未填
        var stu_additionals_content = [];
        var stu_addition_valid = true;
        angular.forEach(_Additionals.Species, function (sname) {
            var specie = $scope.AdditionalSetup['S_' + sname];
            stu_addition_valid = $scope.stu_additionals.valid(sname, specie);
            stu_additionals_content = stu_additionals_content.concat($scope.stu_additionals.result['my_' + sname]);
        });

        if (!stu_addition_valid) return;

        // 開始儲存
        var log_desc, requestA, requestB, requestC;

        $scope.myInfo.StudentInfo.saveing = true;

        var requestStudentInfo = {
            Request: {
                Content: $scope.myInfo.StudentInfo
            }
        };
        var requestStudentBrief2 = {
            Request: {
                Content: $scope.myInfo.StudentBrief2
            }
        };
        requestStudentBrief2.Request.Content.DataSharing = $scope.myInfo.DataSharing;
        var requestWillingness = {
            Request: {
                Content: $scope.myInfo.Willingness
            }
        };
        var requestPublicist = {
            Request: {
                Content: $scope.myInfo.Publicist
            }
        };
        var requestAdditional = {
            studentAdditional: {
                Content: stu_additionals_content
            }
        };
        var requestCommunity = {
            Request: {
                Content: {
                    Line: $scope.myInfo.StudentInfo.Line,
                    Facebook: $scope.myInfo.StudentInfo.Facebook,
                    LinkedIn: $scope.myInfo.StudentInfo.LinkedIn,
                    WhatsApp: $scope.myInfo.StudentInfo.WhatsApp,
                    WeChat: $scope.myInfo.StudentInfo.WeChat,
        }
            }
        };


        // 儲存內容
        var saveStu = false,
            saveSB = false,
            saveWi = false,
            saveSA = false,
            // saveSP = false;
            saveSC = false;
        var count = 5;
        var finish = function () {
            count--;
            if (saveStu && saveSB && saveWi && saveSA && saveSC) {
                //alert("儲存成功");
                $('#messageContent').html("儲存成功");
                $('#messageBox').modal();

                $scope.myInfo.load();
                $scope.stu_additionals.load();
                $scope.myInfo.StudentInfo.saveing = false;
            } else {
                if (count == 0) $scope.myInfo.StudentInfo.saveing = true;
            }
        };
        $scope.connection.send({
            service: "default.UpdateStudentInfo",
            body: requestStudentInfo,
            result: function (response, error, http) {
                if (!error) {
                    if (response.Result && parseInt(response.Result.EffectRows, 10) > 0) {
                        saveStu = true;
                        finish();
                    }
                } else {
                    $('#messageContent').html("學生個人資料.更新失敗. 001");
                    $('#messageBox').modal();
                    //alert("更新失敗. 001");
                    $scope.myInfo.StudentInfo.saveing = false;
                }
            }
        });
        $scope.connection.send({
            service: "default.UpdateStudentBrief",
            body: requestStudentBrief2,
            result: function (response, error, http) {
                if (!error) {
                    if (response.Result && parseInt(response.Result.EffectRows, 10) > 0) {
                        saveSB = true;
                        finish();
                    }
                } else {
                    //alert("更新失敗. 002");
                    $('#messageContent').html("學生延伸資料.更新失敗. 002");
                    $('#messageBox').modal();
                    $scope.myInfo.StudentInfo.saveing = false;
                }
            }
        });
        $scope.connection.send({
            service: "default.SetWillingness",
            body: requestWillingness,
            result: function (response, error, http) {
                if (!error) {
                    if (response.Result && parseInt(response.Result.EffectRows, 10) > 0) {
                        saveWi = true;
                        finish();
                    }
                } else {
                    //alert("更新失敗. 003");
                    $('#messageContent').html("意願調查與經驗調查.更新失敗. 003");
                    $('#messageBox').modal();
                    $scope.myInfo.StudentInfo.saveing = false;
                }
            }
        });
        $scope.connection.send({
            service: "default.SetStudentAdditional",
            body: requestAdditional,
            result: function (response, error, http) {
                if (!error) {
                    if (response.Result) {
                        saveSA = true;
                        finish();
                    }
                } else {
                    //alert("更新失敗. 004");
                    $('#messageContent').html("興趣/台大EMBA社團/校外組織.更新失敗. 004");
                    $('#messageBox').modal();
                    $scope.myInfo.StudentInfo.saveing = false;
                }
            }
        });
        // 第六階段第二期取消公關資料填寫
        // $scope.connection.send({
        //     service: "default.SetStudentPublicist",
        //     body: requestPublicist,
        //     result: function (response, error, http) {
        //         if (!error) {
        //             if (response.Result && parseInt(response.Result.EffectRows, 10) > 0) {
        //                 saveSP = true;
        //                 finish();
        //             }
        //         } else {
        //             //alert("更新失敗. 005");
        //             $('#messageContent').html("公關資料.更新失敗. 005");
        //             $('#messageBox').modal();
        //             $scope.myInfo.StudentInfo.saveing = false;
        //         }
        //     }
        // });
        // 第六階段第二期增加其它聯絡資訊填寫
        $scope.connection.send({
            service: "default.SetStudentCommunity",
            body: requestCommunity,
            result: function (response, error, http) {
                if (!error) {
                    if (response.Result && parseInt(response.Result.EffectRows, 10) > 0) {
                        saveSC = true;
                        finish();
                    }
                } else {
                    //alert("更新失敗. 006");
                    $('#messageContent').html("其它聯絡資訊.更新失敗. 006");
                    $('#messageBox').modal();
                    $scope.myInfo.StudentInfo.saveing = false;
                }
            }
        });

        // 記錄 log
        // 修改前
        var ori_StudentInfo = $scope.myInfo.oriStudentInfo;
        var ori_StudentBrief2 = $scope.myInfo.oriStudentBrief2;
        var ori_Willingness = $scope.myInfo.oriWillingness;
        var ori_DataSharing = $scope.myInfo.oriDataSharing.DataSharing;
        var ori_Publicist = $scope.myInfo.oriPublicist;
        var ori_StudentAdditional = $scope.stu_additionals.original;
        // 修改後
        var res_StudentInfo = $scope.myInfo.StudentInfo;
        var res_StudentBrief2 = $scope.myInfo.StudentBrief2;
        var res_Willingness = $scope.myInfo.Willingness;
        var res_DataSharing = $scope.myInfo.DataSharing.DataSharing;
        var res_Publicist = $scope.myInfo.Publicist;
        var res_StudentAdditional = $scope.stu_additionals.result;
        // log 內容
        var log_StudentAdditional = [];
        var log_desc = [
            "---分享設定---",
            "\n出生日期： ", (ori_DataSharing.Birthdate), " -> ", (res_DataSharing.Birthdate),
            "\n住家電話： ", (ori_DataSharing.PermanentPhone), " -> ", (res_DataSharing.PermanentPhone),
            "\n公司電話： ", (ori_DataSharing.OtherPhoneList.PhoneNumber[0]['@text']), " -> ", (res_DataSharing.OtherPhoneList.PhoneNumber[0]['@text']),
            "\n秘書電話： ", (ori_DataSharing.OtherPhoneList.PhoneNumber[2]['@text']), " -> ", (res_DataSharing.OtherPhoneList.PhoneNumber[2]['@text']),
            "\n行動電話 1： ", (ori_DataSharing.SMSPhone), " -> ", (res_DataSharing.SMSPhone),
            "\n行動電話 2： ", (ori_DataSharing.OtherPhoneList.PhoneNumber[1]['@text']), " -> ", (res_DataSharing.OtherPhoneList.PhoneNumber[1]['@text']),
            "\nE-MAIL 1： ", (ori_DataSharing.EmailList.Email1), " -> ", (res_DataSharing.EmailList.Email1),
            "\nE-MAIL 2： ", (ori_DataSharing.EmailList.Email2), " -> ", (res_DataSharing.EmailList.Email2),
            "\nE-MAIL 3： ", (ori_DataSharing.EmailList.Email3), " -> ", (res_DataSharing.EmailList.Email3),
            "\nE-MAIL 4： ", (ori_DataSharing.EmailList.Email4), " -> ", (res_DataSharing.EmailList.Email4),
            "\nE-MAIL 5： ", (ori_DataSharing.EmailList.Email5), " -> ", (res_DataSharing.EmailList.Email5),
            "\n聯絡地址： ", (ori_DataSharing.ContactAddress), " -> ", (res_DataSharing.ContactAddress),
            "\n住家地址： ", (ori_DataSharing.PermanentAddress), " -> ", (res_DataSharing.PermanentAddress),
            "\n公司地址： ", (ori_DataSharing.OtherAddressList.Address[0]), " -> ", (res_DataSharing.OtherAddressList.Address[0]),
            "\n經驗調查-分享「社會企業」相關活動： ", (ori_Willingness.IsSharingEnterprise), " -> ", (res_Willingness.IsSharingEnterprise),
            "\n經驗調查-分享「非營利組織」相關活動 ", (ori_Willingness.IsSharingOrganizations), " -> ", (res_Willingness.IsSharingOrganizations),
            "\n經驗調查-分享「企業社會責任(CSR)」相關活動 ", (ori_Willingness.IsSharingResponsibility), " -> ", (res_Willingness.IsSharingResponsibility),
            "\n經驗調查-分享「創業」相關活動 ", (ori_Willingness.IsSharingVenture), " -> ", (res_Willingness.IsSharingVenture),
            "\n意願調查-分享「業師」意願： ", (ori_Willingness.IsSharingEntrpreneurial), " -> ", (res_Willingness.IsSharingEntrpreneurial),
            "\n參加校外團體： ", (ori_Willingness.IsSharingEntrpreneurial), " -> ", (res_Willingness.IsSharingEntrpreneurial),
            "\n興趣： ", (ori_Willingness.IsSharingInterest), " -> ", (res_Willingness.IsSharingInterest),
            "\n參加台大EMBA團體： ", (ori_Willingness.IsSharingEMBAGroups), " -> ", (res_Willingness.IsSharingEMBAGroups),
            "\n---內容設定---",
            "\n緊急聯絡人： ", (ori_StudentInfo.CustodianName), " -> ", (res_StudentInfo.CustodianName),
            "\n聯絡人電話： ", (ori_StudentInfo.CustodianOtherInfo.CustodianOtherInfo.Phone), " -> ", (res_StudentInfo.CustodianOtherInfo.CustodianOtherInfo.Phone),
            "\n住家電話： ", (ori_StudentInfo.PermanentPhone), " -> ", (res_StudentInfo.PermanentPhone),
            "\n公司電話： ", (ori_StudentInfo.OtherPhones.PhoneList.PhoneNumber[0]), " -> ", (res_StudentInfo.OtherPhones.PhoneList.PhoneNumber[0]),
            "\n秘書電話： ", (ori_StudentInfo.OtherPhones.PhoneList.PhoneNumber[2]), " -> ", (res_StudentInfo.OtherPhones.PhoneList.PhoneNumber[2]),
            "\n行動電話 1： ", (ori_StudentInfo.SMSPhone), " -> ", (res_StudentInfo.SMSPhone),
            "\n行動電話 2： ", (ori_StudentInfo.OtherPhones.PhoneList.PhoneNumber[1]), " -> ", (res_StudentInfo.OtherPhones.PhoneList.PhoneNumber[1]),
            "\nE-MAIL 1： ", (ori_StudentBrief2.EmailList.email1), " -> ", (res_StudentBrief2.EmailList.email1),
            "\nE-MAIL 2： ", (ori_StudentBrief2.EmailList.email2), " -> ", (res_StudentBrief2.EmailList.email2),
            "\nE-MAIL 3： ", (ori_StudentBrief2.EmailList.email3), " -> ", (res_StudentBrief2.EmailList.email3),
            "\nE-MAIL 4： ", (ori_StudentBrief2.EmailList.email4), " -> ", (res_StudentBrief2.EmailList.email4),
            "\nE-MAIL 5： ", (ori_StudentBrief2.EmailList.email5), " -> ", (res_StudentBrief2.EmailList.email5),
            "\n聯絡地址： ", (ori_StudentInfo.MailingAddress_desc), " -> ", (res_StudentInfo.MailingAddress_desc),
            "\n住家地址： ", (ori_StudentInfo.PermanentAddress_desc), " -> ", (res_StudentInfo.PermanentAddress_desc),
            "\n公司地址： ", (ori_StudentInfo.OtherAddresses_desc), " -> ", (res_StudentInfo.OtherAddresses_desc),
            "\n經驗調查-分享「社會企業」相關活動： ", (ori_Willingness.IsSocialEnterprise), " -> ", (res_Willingness.IsSocialEnterprise),
            "\n經驗調查-簡述「社會企業」相關活動： ", (ori_Willingness.DescriptionEnterprise), " -> ", (res_Willingness.DescriptionEnterprise),
            "\n經驗調查-分享「非營利組織」相關活動 ", (ori_Willingness.IsNonProfitOrganizations), " -> ", (res_Willingness.IsNonProfitOrganizations),
            "\n經驗調查-簡述「非營利組織」相關活動 ", (ori_Willingness.DescriptionOrganizations), " -> ", (res_Willingness.DescriptionOrganizations),
            "\n經驗調查-分享「企業社會責任(CSR)」相關活動 ", (ori_Willingness.IsCorporateSocialResponsibility), " -> ", (res_Willingness.IsCorporateSocialResponsibility),
            "\n經驗調查-簡述「企業社會責任(CSR)」相關活動 ", (ori_Willingness.DescriptionResponsibility), " -> ", (res_Willingness.DescriptionResponsibility),
            "\n經驗調查-分享「創業」相關活動 ", (ori_Willingness.IsVenture), " -> ", (res_Willingness.IsVenture),
            "\n經驗調查-簡述「創業」相關活動 ", (ori_Willingness.DescriptionVenture), " -> ", (res_Willingness.DescriptionVenture),
            "\n意願調查-分享「業師」意願： ", (ori_Willingness.IsEntrepreneurialTeam), " -> ", (res_Willingness.IsEntrepreneurialTeam),
            "\n意願調查-簡述「業師」意願： ", (ori_Willingness.DescriptionEntrpreneurial), " -> ", (res_Willingness.DescriptionEntrpreneurial),
            "\n興趣： ", (ori_StudentAdditional.my_Interest_desc), " -> ", (res_StudentAdditional.my_Interest_desc),
            "\n參加台大EMBA團體： ", (ori_StudentAdditional.my_ExternalOrganization_desc), " -> ", (res_StudentAdditional.my_ExternalOrganization_desc),
            "\n參加校外團體： ", (ori_StudentAdditional.my_EMBAGroups_desc), " -> ", (res_StudentAdditional.my_EMBAGroups_desc),
            // 第六階段第二期取消公關資料填寫
            // "\n公關姓名： ", (ori_Publicist.PublicistName), " -> ", (res_Publicist.PublicistName),
            // "\n公關室電話： ", (ori_Publicist.PublicRelationsOfficeTelephone), " -> ", (res_Publicist.PublicRelationsOfficeTelephone),
            // "\n公室傳真： ", (ori_Publicist.PublicRelationsOfficeFax), " -> ", (res_Publicist.PublicRelationsOfficeFax),
            // "\n公關室e-amil： ", (ori_Publicist.PublicistEmail), " -> ", (res_Publicist.PublicistEmail),
            // "\n公司網址： ", (ori_Publicist.CompanyWebsite), " -> ", (res_Publicist.CompanyWebsite),
            "\nLine： ", (ori_StudentInfo.Line), " -> ", (res_StudentInfo.Line),
            "\nFacebook： ", (ori_StudentInfo.Facebook), " -> ", (res_StudentInfo.Facebook),
            "\nLinkedIn： ", (ori_StudentInfo.LinkedIn), " -> ", (res_StudentInfo.LinkedIn),
            "\nWhatsApp： ", (ori_StudentInfo.WhatsApp), " -> ", (res_StudentInfo.WhatsApp),
            "\nWeChat： ", (ori_StudentInfo.WeChat), " -> ", (res_StudentInfo.WeChat)
        ].join('');
        // console.log(log_desc);

        $scope.connection.send({
            service: "public.AddLog",
            body: {
                Request: {
                    Log: {
                        Actor: $scope.connection.getUserInfo().UserName,
                        ActionType: "更新",
                        Action: "更新個人資料",
                        TargetCategory: "student, ischool.emba.student_brief2",
                        ClientInfo: {
                            ClientInfo: ''
                        },
                        ActionBy: "ischool web 個人資訊小工具",
                        Description: log_desc
                    }
                }
            }
        });
    };

    // 學歷
    $scope.educations = {
        load: function () {
            $scope.connection.send({
                service: "default.GetEducationBackground",
                body: {},
                result: function (response, error, http) {
                    //console.log(response);
                    if (!error) {
                        $scope.educations.result = [].concat(response.Result.EducationBackground || []);
                        angular.forEach($scope.educations.result, function (item) {
                            item.IsTop = (item.IsTop == 't') ? true : false;
                            item.IsSharing = (item.IsSharing == 't') ? true : false;
                            item.edit = function () {
                                $scope.educations.current = {
                                    saveing: false,
                                    confirm: false,
                                    type: 'edit',
                                    action: '更新學歷',
                                    original: angular.copy(item),
                                    result: item
                                };
                                $("#education").modal("show");
                            };
                        });
                        $scope.$apply();
                    }
                }
            });
        },
        add: function () {
            var item = {
                'SchoolName': '',
                'Department': '',
                'Degree': '',
                'IsTop': false,
                'IsSharing': false
            }
            $scope.educations.current = {
                saveing: false,
                confirm: false,
                type: 'add',
                action: '新增學歷',
                original: angular.copy(item),
                result: angular.copy(item)
            };
            $("#education").modal("show");
        },
        save: function () {
            // 判斷是否正在處理中
            if ($scope.educations.current.saveing) return;

            // 判斷必填未填
            if (!$scope.educations.current.result.SchoolName) return;
            if (!$scope.educations.current.result.Department) return;
            if (!$scope.educations.current.result.Degree) return;

            // 開始儲存
            $scope.educations.current.saveing = true;
            var service_name, body_content, action_type, action;
            if ($scope.educations.current.type == 'edit') {
                service_name = "default.UpdateEducationBackground";
                action_type = "更新";
            } else {
                service_name = "default.AddEducationBackground";
                action_type = "新增";
            }
            action = $scope.educations.current.action;
            body_content = {
                Request: {
                    EducationBackground: $scope.educations.current.result
                }
            };
            delete body_content.Request.EducationBackground.$$hashKey;

            $scope.connection.send({
                service: service_name,
                body: body_content,
                result: function (response, error, http) {
                    if (!error) {
                        if ((response.Result != null) && parseInt(response.Result.EffectRows, 10) > 0) {
                            $scope.educations.load();
                            $("#education").modal("hide");
                        }
                    } else {
                        $scope.educations.current.saveing = false;
                    }
                }
            });

            var ori_Education = $scope.educations.current.original;
            var res_Education = $scope.educations.current.result;
            var log_desc = [
                "\n學校： ", (ori_Education.SchoolName), " -> ", (res_Education.SchoolName),
                "\n系所： ", (ori_Education.Department), " -> ", (res_Education.Department),
                "\n學位： ", (ori_Education.Degree), " -> ", (res_Education.Degree),
                "\n最高學歷： ", (ori_Education.IsTop), " -> ", (res_Education.IsTop),
                "\n是否分享： ", (ori_Education.IsSharing), " -> ", (res_Education.IsSharing)
            ].join('');

            // console.log(log_desc);

            $scope.connection.send({
                service: "public.AddLog",
                body: {
                    Request: {
                        Log: {
                            Actor: $scope.connection.getUserInfo().UserName,
                            ActionType: action_type,
                            Action: action,
                            TargetCategory: "ischool.emba.education_background",
                            ClientInfo: {
                                ClientInfo: ""
                            },
                            ActionBy: "ischool web 個人資訊小工具",
                            Description: log_desc
                        }
                    }
                },
                result: function (response, error, http) {}
            });
        },
        del: function (item) {
            $scope.connection.send({
                service: "default.RemoveEducationBackground",
                body: {
                    Request: {
                        EducationBackground: {
                            UID: item.UID
                        }
                    }
                },
                result: function (response, error, http) {
                    if ((response.Result != null) && parseInt(response.Result.EffectRows, 10) > 0) {
                        $scope.educations.load();
                        $("#education").modal("hide");
                    }
                }
            });

            var log_desc = [
                "\n學校： ", (item.SchoolName),
                "\n系所： ", (item.Department),
                "\n學位： ", (item.Degree),
                "\n最高學歷： ", (item.IsTop),
                "\n是否分享： ", (item.IsSharing)
            ].join('');
            // console.log(log_desc);

            $scope.connection.send({
                service: "public.AddLog",
                body: {
                    Request: {
                        Log: {
                            Actor: $scope.connection.getUserInfo().UserName,
                            ActionType: "刪除",
                            Action: "刪除學歷",
                            TargetCategory: "ischool.emba.education_background",
                            ClientInfo: {
                                ClientInfo: ""
                            },
                            ActionBy: "ischool web 個人資訊小工具",
                            Description: log_desc
                        }
                    }
                },
                result: function (response, error, http) {}
            });
        },
        reset: function () {
            angular.copy($scope.educations.current.original, $scope.educations.current.result);
            $("#education").modal("hide");
        }
    };

    // 經歷
    $("#level").on('hidden.bs.modal', function (event) {
        if ($('.modal:visible').length)
            $('body').addClass('modal-open');
    });
    $("#placeModal").on('hidden.bs.modal', function (event) {
        if ($('.modal:visible').length)
            $('body').addClass('modal-open');
    });
    $scope.experiences = {
        load: function () {
            $scope.connection.send({
                service: "default.GetExperience",
                body: {},
                result: function (response, error, http) {
                    //console.log(response);
                    if (!error) {
                        $scope.experiences.result = [].concat(response.Result.Experience || []);
                        angular.forEach($scope.experiences.result, function (item) {
                            item.IsSharing = (item.IsSharing == 't') ? true : false;

                            item.PostLevel = (item.PostLevel ? item.PostLevel.split(',') : []);
                            item.WorkPlace = (item.WorkPlace ? item.WorkPlace.split(',') : []);

                            item.edit = function () {
                                $scope.experiences.current = {
                                    saveing: false,
                                    confirm: false,
                                    type: 'edit',
                                    original: angular.copy(item),
                                    result: item
                                };
                                $("#experience").modal("show");
                            };
                        });
                        $scope.$apply();
                    }
                }
            });
        },
        add: function () {
            var item = {
                'CompanyName': '',
                'Position': '',
                'PostLevel': [],
                'PostLevelOther': '',
                'DepartmentCategory': '',
                'DepartmentCategoryOther': '',
                'Industry': '',
                'IndustryOther': '',
                'WorkPlace': [],
                'WorkPlaceOther': '',
                'WorkStatus': '',
                'WorkStatusOther': '',
                'IsSharing': false
            };
            $scope.experiences.current = {
                saveing: false,
                confirm: false,
                type: 'add',
                original: angular.copy(item),
                result: angular.copy(item)
            };
            $("#experience").modal("show");
        },
        save: function () {
            // 判斷是否正在處理中
            if ($scope.experiences.current.saveing) return;

            // 判斷必填未填
            var request = angular.copy($scope.experiences.current.result);

            if (!request.CompanyName) return;

            if (!request.Position) return;
            if (request.Position == "其它" && !request.PositionOther) return;

            if (!request.PostLevel.length) return;
            if (request.PostLevel.indexOf("其它") != -1 && !request.PostLevelOther) return;
            request.PostLevel = request.PostLevel.join(",");

            if (!request.DepartmentCategory) return;
            if (request.DepartmentCategory == "其它" && !request.DepartmentCategoryOther) return;

            if (!request.Industry) return;
            if (request.Industry == "其它" && !request.IndustryOther) return;

            if (!request.WorkPlace.length) return;
            if (request.WorkPlace.indexOf("其它") != -1 && !request.WorkPlaceOther) return;
            request.WorkPlace = request.WorkPlace.join(',');

            if (!request.WorkStatus) return;
            if (request.WorkStatus == "其它" && !request.WorkStatusOther) return;

            // 處理儲存的資料
            $scope.experiences.current.saveing = true;
            var service_name, body_content, action_type, action;
            if ($scope.experiences.current.type == 'edit') {
                service_name = "default.UpdateExperience";
                action_type = "更新";
                action = "更新經歷";
            } else {
                service_name = "default.AddExperience";
                action_type = "新增";
                action = "新增經歷";
            }
            body_content = {
                Request: {
                    Experience: request
                }
            };
            delete body_content.Request.Experience.$$hashKey;

            $scope.connection.send({
                service: service_name,
                body: body_content,
                result: function (response, error, http) {
                    if (error) {
                        $scope.experiences.current.saveing = false;
                    } else {
                        if ((response.Result != null) && parseInt(response.Result.EffectRows, 10) > 0) {
                            $scope.experiences.load();
                            $("#experience").modal("hide");
                        } else {
                            $scope.experiences.current.saveing = false;
                        }
                    }
                }
            });

            var ori_Experience = $scope.experiences.current.original;
            var res_Experience = request;
            var log_desc = [
                "\n公司名稱： ", (ori_Experience.CompanyName), " -> ", (res_Experience.CompanyName),
                "\n職稱： ", (ori_Experience.Position), " -> ", (res_Experience.Position),
                "\n層級別： ", (ori_Experience.PostLevel), " -> ", (res_Experience.PostLevel),
                "\n層級別_其它： ", (ori_Experience.PostLevelOther), " -> ", (res_Experience.PostLevelOther),
                "\n部門： ", (ori_Experience.DepartmentCategory), " -> ", (res_Experience.DepartmentCategory),
                "\n部門_其它： ", (ori_Experience.DepartmentCategoryOther), " -> ", (res_Experience.DepartmentCategoryOther),
                "\n產業別： ", (ori_Experience.Industry), " -> ", (res_Experience.Industry),
                "\n產業別_其它： ", (ori_Experience.IndustryOther), " -> ", (res_Experience.IndustryOther),
                "\n工作地點： ", (ori_Experience.WorkPlace), " -> ", (res_Experience.WorkPlace),
                "\n工作地點_其它： ", (ori_Experience.WorkPlaceOther), " -> ", (res_Experience.WorkPlaceOther),
                "\n工作狀態： ", (ori_Experience.WorkStatus), " -> ", (res_Experience.WorkStatus),
                "\n工作狀態_其它： ", (ori_Experience.WorkStatusOther), " -> ", (res_Experience.WorkStatusOther),
                "\n是否分享： ", (ori_Experience.IsSharing), " -> ", (res_Experience.IsSharing)
            ].join('');

            // console.log(log_desc);

            $scope.connection.send({
                service: "public.AddLog",
                body: {
                    Request: {
                        Log: {
                            Actor: $scope.connection.getUserInfo().UserName,
                            ActionType: action_type,
                            Action: action,
                            TargetCategory: "ischool.emba.experience",
                            ClientInfo: {
                                ClientInfo: ""
                            },
                            ActionBy: "ischool web 個人資訊小工具",
                            Description: log_desc
                        }
                    }
                },
                result: function (response, error, http) {}
            });
        },
        del: function (item) {
            $scope.connection.send({
                service: "default.RemoveExperience",
                body: {
                    Request: {
                        Experience: {
                            UID: item.UID
                        }
                    }
                },
                result: function (response, error, http) {
                    if ((response.Result != null) && parseInt(response.Result.EffectRows, 10) > 0) {
                        $scope.experiences.load();
                        $("#experience").modal("hide");
                    }
                }
            });

            var log_desc = [
                "\n公司名稱： ", (item.CompanyName),
                "\n職稱： ", (item.Position),
                "\n層級別： ", (item.PostLevel),
                "\n部門： ", (item.DepartmentCategory),
                "\n產業別： ", (item.Industry),
                "\n工作地點： ", (item.WorkPlace),
                "\n工作狀態： ", (item.WorkStatus),
                "\n是否分享： ", (item.IsSharing)
            ].join('');

            // console.log(log_desc);

            $scope.connection.send({
                service: "public.AddLog",
                body: {
                    Request: {
                        Log: {
                            Actor: $scope.connection.getUserInfo().UserName,
                            ActionType: "刪除",
                            Action: "刪除經歷",
                            TargetCategory: "ischool.emba.experience",
                            ClientInfo: {
                                ClientInfo: ""
                            },
                            ActionBy: "ischool web 個人資訊小工具",
                            Description: log_desc
                        }
                    }
                },
                result: function (response, error, http) {}
            });
        },
        reset: function () {
            angular.copy($scope.experiences.current.original, $scope.experiences.current.result);
            $("#experience").modal("hide");
        }
    };

    // 興趣(Interest) / 參加台大EMBA團體(EMBAGroups) / 參加校外組織(ExternalOrganization)
    // 'StudentAdditional':[
    //     {
    //         'Specie':'Interest',
    //         'Domain':'運動',
    //         'Category':'球拍類運動',
    //         'Item':'桌球',
    //         'Description':''
    //     }
    // ]
    $scope.stu_additionals = {
        // 選項組合成以「/」分層的字串
        tree_desc: function (specie) {
            var desc = [];
            var formatAdditionals = function (item) {
                var ary = [];
                if (item.Domain) {
                    ary.push(item.Domain);
                    if (item.Category) {
                        ary.push(item.Category);
                        if (item.Item) {
                            ary.push(item.Item);
                        }
                    }
                }
                if (item.Description) ary.push(item.Description);
                return ary.join('/');
            };
            angular.forEach(specie.Domains, function (domain) {
                if (specie['D_' + domain].Checked) {
                    desc.push(formatAdditionals(specie['D_' + domain]));
                }
                angular.forEach(specie['D_' + domain].Categorys, function (category) {
                    if (specie['D_' + domain]['C_' + category].Checked) {
                        desc.push(formatAdditionals(specie['D_' + domain]['C_' + category]));
                    }
                    angular.forEach(specie['D_' + domain]['C_' + category].Items, function (item) {
                        if (specie['D_' + domain]['C_' + category]['I_' + item].Checked) {
                            desc.push(formatAdditionals(specie['D_' + domain]['C_' + category]['I_' + item]));
                        }
                    });
                });
            });
            return desc.join(',');
        },
        load: function () {
            $scope.stu_additionals.result = [];
            $scope.stu_additionals.original = [];
            angular.forEach(_Additionals.Species, function (specie) {
                $scope.AdditionalSetup['S_' + specie] = angular.copy(_Additionals['S_' + specie]);
            });
            // console.log($scope.AdditionalSetup);
            $scope.connection.send({
                service: "default.GetStudentAdditional",
                body: {},
                result: function (response, error, http) {
                    if (!error) {
                        if (response.Result) {
                            response.Result.StudentAdditional = [].concat(response.Result.StudentAdditional || []);

                            angular.forEach(response.Result.StudentAdditional, function (item) {
                                if (!$scope.stu_additionals.result['my_' + item.Specie]) {
                                    $scope.stu_additionals.result['my_' + item.Specie] = [];
                                }
                                $scope.stu_additionals.result['my_' + item.Specie].push(item);

                                // 依目前學生資料庫中的值變更狀態
                                if (item.Specie && $scope.AdditionalSetup['S_' + item.Specie]) {
                                    if (item.Domain && !item.Category) {
                                        if ($scope.AdditionalSetup['S_' + item.Specie]['D_' + item.Domain]) {
                                            $scope.AdditionalSetup['S_' + item.Specie]['D_' + item.Domain].Checked = true;
                                            $scope.AdditionalSetup['S_' + item.Specie]['D_' + item.Domain].Description = item.Description;;
                                        }
                                    } else {
                                        if (item.Category && !item.Item) {
                                            if ($scope.AdditionalSetup['S_' + item.Specie]['D_' + item.Domain]['C_' + item.Category]) {
                                                $scope.AdditionalSetup['S_' + item.Specie]['D_' + item.Domain]['C_' + item.Category].Checked = true;
                                                $scope.AdditionalSetup['S_' + item.Specie]['D_' + item.Domain]['C_' + item.Category].Description = item.Description;;
                                            }
                                        } else {
                                            if (item.Item && $scope.AdditionalSetup['S_' + item.Specie]['D_' + item.Domain]['C_' + item.Category]['I_' + item.Item]) {
                                                $scope.AdditionalSetup['S_' + item.Specie]['D_' + item.Domain]['C_' + item.Category]['I_' + item.Item].Checked = true;
                                                $scope.AdditionalSetup['S_' + item.Specie]['D_' + item.Domain]['C_' + item.Category]['I_' + item.Item].Description = item.Description;
                                            }
                                        }
                                    }
                                }
                            });

                            // 將所有的種類內容變成逗號分隔的字串
                            angular.forEach(_Additionals.Species, function (specie) {
                                var desc = $scope.stu_additionals.tree_desc($scope.AdditionalSetup['S_' + specie]);
                                $scope.stu_additionals.result['my_' + specie + '_desc'] = desc;
                                $scope.stu_additionals.original['my_' + specie + '_desc'] = desc;
                            });

                            $scope.$apply();
                        }
                        // console.log($scope.AdditionalSetup);
                        // console.log($scope.stu_additionals.result);
                        // console.log($scope.stu_additionals.original);
                    }
                }
            });
        },
        edit: function (type, item) {
            if (type == 'externalModal') {
                $scope.AdditionalSetupCurr = {
                    type: type,
                    value: angular.copy(item)
                }
            }
            if (['Interest', 'EMBAGroups', 'ExternalOrganization'].indexOf(type) !== -1) {
                $scope.AdditionalSetup.current = {
                    type: type,
                    addition: angular.copy(item)
                };
                if (type == 'ExternalOrganization') $("#externalModal").modal("show");
                if (type == 'Interest') $("#interestModal").modal("show");
                if (type == 'EMBAGroups') $("#EMBAGroupsModel").modal("show");
            }
        },
        set: function () {
            var type = $scope.AdditionalSetup.current.type;

            $scope.AdditionalSetup['S_' + type] = $scope.AdditionalSetup.current.addition;
            $scope.stu_additionals.result['my_' + type + '_desc'] = $scope.stu_additionals.tree_desc($scope.AdditionalSetup.current.addition);

            if (type == 'ExternalOrganization') $("#externalModal").modal("hide");
            if (type == 'Interest') $("#interestModal").modal("hide");
            if (type == 'EMBAGroups') $("#EMBAGroupsModel").modal("hide");
            delete $scope.AdditionalSetup.current;
        },
        valid: function (sname, specie) {
            var stu_addition_valid = true;
            $scope.stu_additionals.result['my_' + sname] = [];
            if (specie) {
                angular.forEach(specie.Domains, function (domain) {
                    if (specie['D_' + domain].Checked) {
                        if (domain == '其它' && !specie['D_' + domain].Description) stu_addition_valid = false;
                        if (stu_addition_valid) $scope.stu_additionals.result['my_' + sname].push(specie['D_' + domain]);
                    }
                    angular.forEach(specie['D_' + domain].Categorys, function (category) {
                        if (specie['D_' + domain]['C_' + category].Checked) {
                            if (category == '其它' && !specie['D_' + domain]['C_' + category].Description) stu_addition_valid = false;
                            if (stu_addition_valid) $scope.stu_additionals.result['my_' + sname].push(specie['D_' + domain]['C_' + category]);
                        }
                        angular.forEach(specie['D_' + domain]['C_' + category].Items, function (item) {
                            if (specie['D_' + domain]['C_' + category]['I_' + item].Checked) {
                                if (item == '其它' && !specie['D_' + domain]['C_' + category]['I_' + item].Description) stu_addition_valid = false;
                                if (stu_addition_valid) $scope.stu_additionals.result['my_' + sname].push(specie['D_' + domain]['C_' + category]['I_' + item]);
                            }
                        });
                    });
                });
            }
            return stu_addition_valid;
        },
        result: {}
    };

    // 取得選項內容
    // 產業別/部門類別/層級別/工作地點/工作狀態
    // 興趣/參加台大EMBA團體/參加校外組織
    var _Additionals = [];
    $scope.getDataSource = function (callback) {
        $scope.AdditionalSetup = {};
        $scope.ExperienceDataSource = [];
        $scope.connection.send({
            service: "default.GetUserDataSource",
            body: "",
            result: function (response, error, http) {
                if (!error) {
                    if (response.DataSource && response.DataSource.Additionals) {
                        response.DataSource.Additionals = [].concat(response.DataSource.Additionals || []);
                        _Additionals.Species = [];
                        response.DataSource.Additionals.forEach(function (aii, index) {
                            if (!_Additionals['S_' + aii.specie]) {
                                _Additionals.Species.push(aii.specie);
                                _Additionals['S_' + aii.specie] = {
                                    Domains: []
                                };
                            }
                            if (aii.domain && !_Additionals['S_' + aii.specie]['D_' + aii.domain]) {
                                _Additionals['S_' + aii.specie].Domains.push(aii.domain);
                                _Additionals['S_' + aii.specie]['D_' + aii.domain] = {
                                    'Checked': false,
                                    'Specie': aii.specie,
                                    'Domain': aii.domain,
                                    'Category': aii.category,
                                    'Item': aii.item,
                                    'Description': '',
                                    'Categorys': []
                                };
                            }
                            if (aii.category && !_Additionals['S_' + aii.specie]['D_' + aii.domain]['C_' + aii.category]) {
                                _Additionals['S_' + aii.specie]['D_' + aii.domain].Categorys.push(aii.category);
                                _Additionals['S_' + aii.specie]['D_' + aii.domain]['C_' + aii.category] = {
                                    'Checked': false,
                                    'Specie': aii.specie,
                                    'Domain': aii.domain,
                                    'Category': aii.category,
                                    'Item': aii.item,
                                    'Description': '',
                                    'Items': []
                                };
                            }
                            if (aii.item) {
                                _Additionals['S_' + aii.specie]['D_' + aii.domain]['C_' + aii.category].Items.push(aii.item);
                                _Additionals['S_' + aii.specie]['D_' + aii.domain]['C_' + aii.category]['I_' + aii.item] = {
                                    'Checked': false,
                                    'Specie': aii.specie,
                                    'Domain': aii.domain,
                                    'Category': aii.category,
                                    'Item': aii.item,
                                    'Description': ''
                                };
                            }
                        });

                        // console.log(_Additionals);

                        // 為每一層有內容的資料皆加上「其它」
                        _Additionals.Species.forEach(function (specie) {
                            _Additionals['S_' + specie].Domains.forEach(function (domain, idx) {
                                if (idx == 0) {
                                    var newItem = {
                                        'Checked': false,
                                        'Specie': specie,
                                        'Domain': '其它',
                                        'Category': '',
                                        'Item': '',
                                        'Description': '',
                                        'Categorys': []
                                    };

                                    _Additionals['S_' + specie].Domains.push('其它');
                                    _Additionals['S_' + specie]['D_其它'] = newItem;
                                }

                                _Additionals['S_' + specie]['D_' + domain].Categorys.forEach(function (category, idx) {
                                    if (idx == 0) {
                                        var newItem = {
                                            'Checked': false,
                                            'Specie': specie,
                                            'Domain': domain,
                                            'Category': '其它',
                                            'Item': '',
                                            'Description': '',
                                            'Items': []
                                        };
                                        _Additionals['S_' + specie]['D_' + domain].Categorys.push('其它');
                                        _Additionals['S_' + specie]['D_' + domain]['C_其它'] = newItem;
                                    }

                                    _Additionals['S_' + specie]['D_' + domain]['C_' + category].Items.forEach(function (item, idx) {
                                        if (idx == 0) {
                                            var newItem = {
                                                'Checked': false,
                                                'Specie': specie,
                                                'Domain': domain,
                                                'Category': category,
                                                'Item': '其它',
                                                'Description': ''
                                            };
                                            _Additionals['S_' + specie]['D_' + domain]['C_' + category].Items.push('其它');
                                            _Additionals['S_' + specie]['D_' + domain]['C_' + category]['I_其它'] = newItem;
                                        }
                                    });
                                });
                            });
                        });
                    }
                    // console.log(_Additionals);

                    var experiences = [];
                    if (response.DataSource && response.DataSource.Experiences) {
                        response.DataSource.Experiences = [].concat(response.DataSource.Experiences || []);
                        response.DataSource.Experiences.forEach(function (item, index) {
                            if (!experiences['C_' + item.item_category]) {
                                experiences['C_' + item.item_category] = [];
                            }
                            if (item.item) {
                                experiences['C_' + item.item_category].push(item.item); // unshift
                            }
                        })
                    }
                    $scope.ExperienceDataSource = experiences;
                    // console.log($scope.ExperienceDataSource);
                    $scope.$apply();

                    if (angular.isFunction(callback)) callback();
                }
            }
        });
    };

    $scope.myInfo.load(); // 取得個人基本資料及分享設定
    $scope.educations.load(); // 學歷
    $scope.experiences.load(); // 經歷
    $scope.getDataSource(function () {
        $scope.stu_additionals.load(); // 興趣/參加台大EMBA團體/參加校外組織
    }); // 取得選項內容

}]);
