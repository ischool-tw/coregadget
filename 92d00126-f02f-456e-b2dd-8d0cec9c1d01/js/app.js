var app = angular.module("app", ["checklist-model"]);

app.controller('MainCtrl', ['$scope', function($scope) {
    $scope.connection = gadget.getContract("emba.student");

    $scope.myInfo = {};
    // StudentInfo
    $scope.myInfo.StudentInfo = {
        // 姓名
        'Name':'',
        // 性別
        'Gender':'',
        // 出生日期
        'Birthdate':'',
        // 緊急聯絡人
        'CustodianName':'',
        // 住家電話
        'PermanentPhone':'',
        // e-mail欄-5個
        'EmailList':{
            'email1':'',
            'email2':'',
            'email3':'',
            'email4':'',
            'email5':''
        }
    };
    // StudentBrief2
    $scope.myInfo.StudentBrief2 = {
        // 行動電話1
        'SMSPhone':'',
        // 聯絡人電話 CustodianOtherInfo.CustodianOtherInfo.Phone
        'CustodianOtherInfo':{
            'CustodianOtherInfo':{
                'Phone':'',
                'Email':'',
                'Job':'',
                'EducationDegree':'',
                'Relationship':''
            }
        },
        // 公司電話  OtherPhones.PhoneList.PhoneNumber[0]
        // 行動電話2 OtherPhones.PhoneList.PhoneNumber[1]
        // 秘書電話  OtherPhones.PhoneList.PhoneNumber[2]
        'OtherPhones':{
            'PhoneList':{
                'PhoneNumber':[
                    '',
                    '',
                    ''
                ]
            }
        },
        // 聯絡地址 MailingAddress.AddressList.Address
        'MailingAddress':{
            'AddressList':{
                'Address':{
                    'ZipCode':'',
                    'County':'',
                    'Town':'',
                    'District':'',
                    'Area':'',
                    'DetailAddress':''
                }
            }
        },
        // 住家地址 PermanentAddress.AddressList.Address
        'PermanentAddress':{
            'AddressList':{
                'Address':{
                    'Area':'',
                    'County':'',
                    'DetailAddress':'',
                    'District':'',
                    'Latitude':'',
                    'Longitude':'',
                    'Town':'',
                    'ZipCode':''
                }
            }
        },
        // 公司地址 OtherAddresses.AddressList.Address
        'OtherAddresses':{
            'AddressList':{
                'Address':{
                    'ZipCode':'',
                    'County':'',
                    'Town':'',
                    'District':'',
                    'Area':'',
                    'DetailAddress':''
                }
            }
        }
    };
    // Willingness
    $scope.myInfo.Willingness = {
        // 經驗調查-你個人或所屬組織，是否參與「社會企業」相關活動
        'IsSocialEnterprise':'',
        // 經驗調查-分享你個人或所屬組織，是否參與「社會企業」相關活動
        'IsSharingEnterprise':'',
        // 經驗調查-簡述你個人或所屬組織，是否參與「社會企業」相關活動
        'DescriptionEnterprise':'',
        // 經驗調查-你個人或所屬組織，是否參與「非營利組織」相關活動
        'IsNonProfitOrganizations':'',
        // 經驗調查-分享你個人或所屬組織，是否參與「非營利組織」相關活動
        'IsSharingOrganizations':'',
        // 經驗調查-簡述你個人或所屬組織，是否參與「非營利組織」相關活動
        'DescriptionOrganizations':'',
        // 經驗調查-你個人或所屬組織，是否參與「企業社會責任(CSR)」相關活動
        'IsCorporateSocialResponsibility':'',
        // 經驗調查-分享你個人或所屬組織，是否參與「企業社會責任(CSR)」相關活動
        'IsSharingResponsibility':'',
        // 經驗調查-簡述你個人或所屬組織，是否參與「企業社會責任(CSR)」相關活動
        'DescriptionResponsibility':'',
        // 經驗調查-你個人或所屬組織，是否參與「創業」相關活動
        'IsVenture':'',
        // 經驗調查-分享你個人或所屬組織，是否參與「創業」相關活動
        'IsSharingVenture':'',
        // 經驗調查-簡述你個人或所屬組織，是否參與「創業」相關活動
        'DescriptionVenture':'',
        // 意願調查-是否擔任台大管理學院相關課程「業師」意願
        'IsEntrepreneurialTeam':'',
        // 意願調查-分享是否擔任台大管理學院相關課程「業師」意願
        'IsSharingEntrpreneurial':'',
        // 意願調查-簡述是否擔任台大管理學院相關課程「業師」意願
        'DescriptionEntrpreneurial':'',
        // 分享興趣
        'IsSharingInterest':'',
        // 分享EMBA社團
        'IsSharingEMBAGroups':'',
        // 分享參與校外組織
        'IsSharingExternalOrganization':''
    };
    // StudentBrief2 - DataSharing
    $scope.myInfo.DataSharing = {
        // 要分享的項目
        'DataSharing':{
            'Name':'true', // 姓名
            'Gender':'true', // 性別
            'Birthdate':'false', // 出生日期
            'Custodian':'false', // 緊急聯絡人
            'CustodianPhone':'false', // 聯絡人電話
            'ContactPhone':'false',
            'PermanentPhone':'false', // 住家電話
            'OtherPhoneList':{
                'PhoneNumber':[
                    {
                        '@text':'false',
                        '@':[
                            'title'
                        ],
                        'title':'公司電話'
                    },
                    {
                        '@text':'false',
                        '@':[
                            'title'
                        ],
                        'title':'行動電話2'
                    },
                    {
                        '@text':'false',
                        '@':[
                            'title'
                        ],
                        'title':'秘書電話'
                    }
                ]
            },
            'SMSPhone':'false', // 行動電話1
            'EmailList':{
                'Email1':'false',
                'Email2':'false',
                'Email3':'false',
                'Email4':'false',
                'Email5':'false'
            },
            'ContactAddress':'false', // 聯絡地址
            'PermanentAddress':'false', // 住家地址
            'OtherAddressList':{ // 公司地址
                'Address':[
                    'false',
                    'false',
                    'false'
                ]
            }
        }
    };
    // Publicist
    $scope.myInfo.Publicist = {
        // 公關姓名
        'PublicistName':'',
        // 公關室電話
        'PublicRelationsOfficeTelephone':'',
        // 公室傳真
        'PublicRelationsOfficeFax':'',
        // 公關室e-amil
        'PublicistEmail':'',
        // 公司網址
        'CompanyWebsite':''
    };

    // 將地址合併成字串
    $scope.myInfo.mergeAddress = function(address) {
        if (address.AddressList && address.AddressList.Address) {
            address.AddressList.Address.DetailAddress = [
                (address.AddressList.Address.ZipCode || ''),
                (address.AddressList.Address.County || ''),
                (address.AddressList.Address.Town || ''),
                (address.AddressList.Address.District || ''),
                (address.AddressList.Address.Area || '')
            ].join('');
            return address.AddressList.Address.DetailAddress;
        } else {
            return '';
        }
    };
    // 設定，值為字串型態， 'true' or 'false'
    $scope.myInfo.toggleSLTF = function(value) {
        return (value != 'true' ? 'true' : 'false');
    };
    // 個人基本資料管理
    $scope.myInfo.load = function() {
        $scope.connection.send({
            service: "default.GetMyAdvancedInfo",
            body: {},
            result: function(response, error, http) {
                if (!error) {
                    if (response.Result) {
                        var setValue = function(x, y) {
                            angular.forEach(x, function(item, key) {
                                if (x[key] && y[key]) {
                                    setValue(x[key], y[key]);
                                } else {
                                    x[key] = y[key];
                                }
                            });
                        };
                        setValue($scope.myInfo.StudentInfo, response.Result);
                        setValue($scope.myInfo.StudentBrief2, response.Result);
                        setValue($scope.myInfo.Willingness, response.Result);
                        setValue($scope.myInfo.DataSharing, response.Result);
                        setValue($scope.myInfo.Publicist, response.Result);

                        // 處理資料
                        angular.forEach($scope.myInfo.Willingness, function(item) {
                            item.IsSocialEnterprise = (item.IsSocialEnterprise == 't') ? true : false;
                            item.IsSharingEnterprise = (item.IsSharingEnterprise == 't') ? true : false;
                            item.IsNonProfitOrganizations = (item.IsNonProfitOrganizations == 't') ? true : false;
                            item.IsSharingOrganizations = (item.IsSharingOrganizations == 't') ? true : false;
                            item.IsCorporateSocialResponsibility = (item.IsCorporateSocialResponsibility == 't') ? true : false;
                            item.IsSharingResponsibility = (item.IsSharingResponsibility == 't') ? true : false;
                            item.IsVenture = (item.IsVenture == 't') ? true : false;
                            item.IsSharingVenture = (item.IsSharingVenture == 't') ? true : false;
                            item.IsEntrepreneurialTeam = (item.IsEntrepreneurialTeam == 't') ? true : false;
                            item.IsSharingEntrpreneurial = (item.IsSharingEntrpreneurial == 't') ? true : false;
                            item.IsSharingInterest = (item.IsSharingInterest == 't') ? true : false;
                            item.IsSharingEMBAGroups = (item.IsSharingEMBAGroups == 't') ? true : false;
                            item.IsSharingExternalOrganization = (item.IsSharingExternalOrganization == 't') ? true : false;
                        });

                        // 記錄log用
                        $scope.myInfo.oriStudentInfo = angular.copy($scope.myInfo.StudentInfo);
                        $scope.myInfo.oriStudentBrief2 = angular.copy($scope.myInfo.StudentBrief2);
                        $scope.myInfo.oriWillingness = angular.copy($scope.myInfo.Willingness);
                        $scope.myInfo.oriDataSharing = angular.copy($scope.myInfo.DataSharing);
                        $scope.myInfo.oriPublicist = angular.copy($scope.myInfo.Publicist);
                        $scope.$apply();
                    }
                }
            }
        });
    };
    $scope.myInfo.edit_address = function(type, item) {
        // 編輯聯絡地址 MailingAddress
        // 編輯公司地址 OtherAddresses
        if (['MailingAddress', 'OtherAddresses'].indexOf(type)!==-1) {
            $scope.myInfo.current = {
                type: type,
                address: item
            }
            $(".modal[target='address']").modal("show");
        }
    };
    $scope.myInfo.set_address = function() {
        $scope.myInfo[$scope.myInfo.current.type] = $scope.myInfo.current.address;
        delete $scope.myInfo.current;
        $(".modal[target='address']").modal("hide");
    };
    $scope.myInfo.save = function() {
        var log_desc, requestA, requestB, requestC;
        if ($("#baseinfo form").valid()) {
            var requestStudentInfo = { Request: { Content: $scope.myInfo.StudentInfo } };
            requestStudentInfo.Request.Content.DataSharing = $scope.myInfo.DataSharing;
            var requestStudentBrief2 = { Request: { Content: $scope.myInfo.StudentBrief2 } };
            var requestWillingness = { Request: { Content: $scope.myInfo.Willingness } };
            var requestPublicist = { Request: { Content: $scope.myInfo.Publicist } };


            // 儲存內容
            var saveStu = false, saveSB = false, saveWi = false, saveSA = false, saveSP = false;
            var finish = function() {
                if (saveStu && saveSB && saveWi && saveSA && saveSP) {
                    $scope.myInfo.load();
                    alert("更新完成!");
                }
            };
            $scope.connection.send({
                service: "default.UpdateStudentInfo",
                body: requestStudentInfo,
                result: function(response, error, http) {
                    if (response.Result && response.Result.EffectRows === "1") {
                        saveStu = true;
                        finish();
                    }
                }
            });
            $scope.connection.send({
                service: "default.UpdateStudentBrief",
                body: requestStudentBrief2,
                result: function(response, error, http) {
                    if (response.Result && response.Result.EffectRows === "1") {
                        saveSB = true;
                        finish();
                    }
                }
            });
            $scope.connection.send({
                service: "default.SetWillingness",
                body: requestWillingness,
                result: function(response, error, http) {
                    if ((response.Result != null) && response.Result.EffectRows === "1") {
                        saveWi = true;
                        finish();
                    }
                }
            });
            $scope.connection.send({
                service: "default.SetStudentAdditional",
                body:  { studentAdditional: { Content: $scope.stu_additionals.result } },
                result: function(response, error, http) {
                    if ((response.Result != null) && response.Result.EffectRows === "1") {
                        saveSA = true;
                        finish();
                    }
                }
            });
            $scope.connection.send({
                service: "default.SetStudentPublicist",
                body: requestPublicist,
                result: function(response, error, http) {
                    if ((response.Result != null) && response.Result.EffectRows === "1") {
                        saveSP = true;
                        finish();
                    }
                }
            });

            // 記錄 log
            // 修改前
            var ori_StudentInfo = $scope.myInfo.oriStudentInfo;
            var ori_StudentBrief2 = $scope.myInfo.oriStudentBrief2;
            var ori_Willingness = $scope.myInfo.oriWillingness;
            var ori_DataSharing = $scope.myInfo.oriDataSharing;
            var ori_Publicist = $scope.myInfo.oriPublicist;
            var ori_StudentAdditional = $scope.stu_additionals.original;
            // 修改後
            var res_StudentInfo = $scope.myInfo.StudentInfo;
            var res_StudentBrief2 = $scope.myInfo.StudentBrief2;
            var res_Willingness = $scope.myInfo.Willingness;
            var res_DataSharing = $scope.myInfo.DataSharing;
            var res_Publicist = $scope.myInfo.Publicist;
            var res_StudentAdditional = $scope.stu_additionals.result;
            // log 內容
            var log_StudentAdditional = [];
            var log_desc = [
                "---分享設定---",
                "\n出生日期： ", (ori_DataSharing.Birthdate), " -> ", (res_DataSharing.Birthdate),
                "\n住家電話： ", (ori_DataSharing.PermanentPhone), " -> ", (res_DataSharing.PermanentPhone),
                "\n公司電話： ", (ori_DataSharing.OtherPhoneList.PhoneNumber[0]), " -> ", (res_StudentBrief2.OtherPhoneList.PhoneNumber[0]),
                "\n秘書電話： ", (ori_DataSharing.OtherPhoneList.PhoneNumber[2]), " -> ", (res_StudentBrief2.OtherPhoneList.PhoneNumber[2]),
                "\n行動電話 1： ", (ori_DataSharing.SMSPhone), " -> ", (res_StudentBrief2.SMSPhone),
                "\n行動電話 2： ", (ori_DataSharing.OtherPhoneList.PhoneNumber[1]), " -> ", (res_StudentBrief2.OtherPhoneList.PhoneNumber[1]),
                "\nE-MAIL 1： ", (ori_DataSharing.EmailList.Email1), " -> ", (res_DataSharing.EmailList.Email1),
                "\nE-MAIL 2： ", (ori_DataSharing.EmailList.Email2), " -> ", (res_DataSharing.EmailList.Email2),
                "\nE-MAIL 3： ", (ori_DataSharing.EmailList.Email3), " -> ", (res_DataSharing.EmailList.Email3),
                "\nE-MAIL 4： ", (ori_DataSharing.EmailList.Email4), " -> ", (res_DataSharing.EmailList.Email4),
                "\nE-MAIL 5： ", (ori_DataSharing.EmailList.Email5), " -> ", (res_DataSharing.EmailList.Email5),
                "\n聯絡地址： ", (ori_DataSharing.ContactAddress), " -> ", (res_StudentBrief2.ContactAddress),
                "\n住家地址： ", (ori_DataSharing.PermanentAddress), " -> ", (res_StudentBrief2.PermanentAddress),
                "\n公司地址： ", (ori_DataSharing.OtherAddressList.Address[0]), " -> ", (res_StudentBrief2.OtherAddressList.Address[0]),
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
                "\n聯絡人電話： ", (ori_StudentBrief2.CustodianOtherInfo.CustodianOtherInfo.Phone), " -> ", (res_StudentBrief2.CustodianOtherInfo.CustodianOtherInfo.Phone),
                "\n住家電話： ", (ori_StudentInfo.PermanentPhone), " -> ", (res_StudentInfo.PermanentPhone),
                "\n公司電話： ", (ori_StudentBrief2.OtherPhones.PhoneList.PhoneNumber[0]), " -> ", (res_StudentBrief2.OtherPhones.PhoneList.PhoneNumber[0]),
                "\n秘書電話： ", (ori_StudentBrief2.OtherPhones.PhoneList.PhoneNumber[2]), " -> ", (res_StudentBrief2.OtherPhones.PhoneList.PhoneNumber[2]),
                "\n行動電話 1： ", (ori_StudentBrief2.SMSPhone), " -> ", (res_StudentBrief2.SMSPhone),
                "\n行動電話 2： ", (ori_StudentBrief2.OtherPhones.PhoneList.PhoneNumber[1]), " -> ", (res_StudentBrief2.OtherPhones.PhoneList.PhoneNumber[1]),
                "\nE-MAIL 1： ", (ori_StudentInfo.EmailList.Email1), " -> ", (res_StudentInfo.EmailList.Email1),
                "\nE-MAIL 2： ", (ori_StudentInfo.EmailList.Email2), " -> ", (res_StudentInfo.EmailList.Email2),
                "\nE-MAIL 3： ", (ori_StudentBrief2.EmailList.Email3), " -> ", (res_StudentInfo.EmailList.Email3),
                "\nE-MAIL 4： ", (ori_StudentInfo.EmailList.Email4), " -> ", (res_StudentInfo.EmailList.Email4),
                "\nE-MAIL 5： ", (ori_StudentInfo.EmailList.Email5), " -> ", (res_StudentInfo.EmailList.Email5),
                "\n聯絡地址： ", (ori_StudentBrief2.MailingAddress.AddressList.Address.DetailAddress), " -> ", (res_StudentBrief2.MailingAddress.AddressList.Address.DetailAddress),
                "\n住家地址： ", (ori_StudentBrief2.PermanentAddress.AddressList.Address.DetailAddress), " -> ", (res_StudentBrief2.PermanentAddress.AddressList.Address.DetailAddress),
                "\n公司地址： ", (ori_StudentBrief2.OtherAddresses.AddressList.Address.DetailAddress), " -> ", (res_StudentBrief2.OtherAddresses.AddressList.Address.DetailAddress),
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
                "\n興趣： ", (ori_Willingness.IsSharingInterest), " -> ", (res_Willingness.IsSharingInterest),
                "\n參加台大EMBA團體： ", (ori_Willingness.IsSharingEMBAGroups), " -> ", (res_Willingness.IsSharingEMBAGroups),
                "\n參加校外團體： ", (ori_Willingness.IsSharingExternalOrganization), " -> ", (res_Willingness.IsSharingExternalOrganization),
                "\n其他聯絡窗口： ", (ori_Willingness.IsSharingExternalOrganization), " -> ", (res_Willingness.IsSharingExternalOrganization),
                "\n公關姓名： ", (ori_Publicist.PublicistName), " -> ", (res_Publicist.PublicistName),
                "\n公關室電話： ", (ori_Publicist.PublicRelationsOfficeTelephone), " -> ", (res_Publicist.PublicRelationsOfficeTelephone),
                "\n公室傳真： ", (ori_Publicist.PublicRelationsOfficeFax), " -> ", (res_Publicist.PublicRelationsOfficeFax),
                "\n公關室e-amil： ", (ori_Publicist.PublicistEmail), " -> ", (res_Publicist.PublicistEmail),
                "\n公司網址： ", (ori_Publicist.CompanyWebsite), " -> ", (res_Publicist.CompanyWebsitet),

            ];
            angular.forEach(ori_StudentAdditional, function(item, idx) {
                if (idx == 0) log_StudentAdditional.push('\n---刪除---');
                var desc = [
                    "\n種類： ", (item.Specie),
                    "領域： ", (item.Domain),
                    "類別： ", (item.Category),
                    "項目： ", (item.Item),
                    "內容： ", (item.Description)
                ].join(',');
                log_StudentAdditional.push(desc);
            });
            angular.forEach(res_StudentAdditional, function(item, idx) {
                if (idx == 0) log_StudentAdditional.push('\n---新增---');
                var desc = [
                    "\n種類： ", (item.Specie),
                    "領域： ", (item.Domain),
                    "類別： ", (item.Category),
                    "項目： ", (item.Item),
                    "內容： ", (item.Description)
                ].join(',');
                log_StudentAdditional.push(desc);
            });

            console.log(log_desc);
            // $scope.connection.send({
            //     service: "public.AddLog",
            //     body: {
            //         Request: {
            //             Log: {
            //                 Actor: gadget.getContract("emba.student").getUserInfo().UserName,
            //                 ActionType: "更新",
            //                 Action: "更新個人資料",
            //                 TargetCategory: "student, ischool.emba.student_brief2",
            //                 ClientInfo: {
            //                     ClientInfo: ''
            //                 },
            //                 ActionBy: "ischool web 個人資訊小工具",
            //                 Description: log_desc
            //             }
            //         }
            //     }
            // });
        } else {
            return $("#baseinfo form .error:first input").focus();
        }
    };

    // 學歷
    $scope.educations = {
        load: function() {
            $scope.connection.send({
                service: "default.GetEducationBackground",
                body: {},
                result: function(response, error, http) {
                    //console.log(response);
                    if (!error) {
                        $scope.educations.result = [].concat(response.Result.EducationBackground || []);
                        angular.forEach($scope.educations.result, function(item) {
                            item.IsTop = (item.IsTop == 't') ? true : false;
                            item.IsSharing = (item.IsSharing == 't') ? true : false;
                            item.edit = function() {
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
        add: function() {
            var item = {
                'SchoolName':'',
                'Department':'',
                'Degree':'',
                'IsTop':false,
                'IsSharing':false
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
        save: function() {
            if ($scope.educations.current.result.SchoolName &&
                $scope.educations.current.result.Department &&
                $scope.educations.current.result.Degree &&
                $scope.educations.current.saveing == false ) {

                $scope.educations.current.saveing = true;
                var service_name, body_content, action_type, action;
                if ($scope.educations.current.type=='edit') {
                    service_name = "default.UpdateEducationBackground";
                    action_type = "更新";
                }
                else {
                    service_name = "default.AddEducationBackground";
                    action_type = "新增";
                }
                action = $scope.educations.current.action;
                body_content = { Request: { EducationBackground: $scope.educations.current.result } };
                delete body_content.Request.EducationBackground.$$hashKey;

                $scope.connection.send({
                    service: service_name,
                    body: body_content,
                    result: function(response, error, http) {
                        if (!error) {
                            if ((response.Result != null) && parseInt(response.Result.EffectRows, 10) > 0) {
                                $scope.educations.load();
                                $("#education").modal("hide");
                            }
                        } else {
                            alert('出現錯誤');
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

                console.log(log_desc);

                // $scope.connection.send({
                //     service: "public.AddLog",
                //     body: {
                //         Request: {
                //             Log: {
                //                 Actor: gadget.getContract("emba.student").getUserInfo().UserName,
                //                 ActionType: action_type,
                //                 Action: action,
                //                 TargetCategory: "ischool.emba.education_background",
                //                 ClientInfo: {
                //                     ClientInfo: ""
                //                 },
                //                 ActionBy: "ischool web 個人資訊小工具",
                //                 Description: log_desc
                //             }
                //         }
                //     },
                //     result: function(response, error, http) {
                //     }
                // });
            }
        },
        del: function(item) {
            $scope.connection.send({
                service: "default.RemoveEducationBackground",
                body: { Request: { EducationBackground: { UID: item.UID } } },
                result: function(response, error, http) {
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
            console.log(log_desc);

            // $scope.connection.send({
            //     service: "public.AddLog",
            //     body: {
            //         Request: {
            //             Log: {
            //                 Actor: gadget.getContract("emba.student").getUserInfo().UserName,
            //                 ActionType: "刪除",
            //                 Action: "刪除學歷",
            //                 TargetCategory: "ischool.emba.education_background",
            //                 ClientInfo: {
            //                     ClientInfo: ""
            //                 },
            //                 ActionBy: "ischool web 個人資訊小工具",
            //                 Description: log_desc
            //             }
            //         }
            //     },
            //     result: function(response, error, http) {
            //     }
            // });
        },
        reset: function() {
            angular.copy($scope.educations.current.original, $scope.educations.current.result);
            $("#education").modal("hide");
        }
    };

    // 經歷
    $scope.experiences = {
        load: function() {
            $scope.connection.send({
                service: "default.GetExperience",
                body: {},
                result: function(response, error, http) {
                    //console.log(response);
                    if (!error) {
                        $scope.experiences.result = [].concat(response.Result.Experience || []);
                        angular.forEach($scope.experiences.result, function(item) {
                            item.IsSharing = (item.IsSharing == 't') ? true : false;

                            var position = item.Position.split('：');
                            if (position.length > 1) {
                                item.Position = "其它";
                                item.Position_Other = position[1];
                            }

                            item.PostLevel = item.PostLevel.split(',');
                            angular.forEach(item.PostLevel, function(item, idx) {
                                if (item.substring(0, 3) == "其它：") {
                                    var other = item.split('：');
                                    if (other.length > 0) item.PostLevel_Other = other[1];
                                    item.PostLevel[idx] = "其它";
                                }
                            });

                            var dc = item.DepartmentCategory.split('：');
                            if (dc.length > 1) {
                                item.DepartmentCategory = "其它";
                                item.DepartmentCategory_Other = dc[1];
                            }

                            var industry = item.Industry.split('：');
                            if (industry.length > 1) {
                                item.Industry = "其它";
                                item.Industry_Other = industry[1];
                            }

                            item.WorkPlace = item.WorkPlace.split(',');
                            angular.forEach(item.WorkPlace, function(item, idx) {
                                if (item.substring(0, 3) == "其它：") {
                                    var other = item.split('：');
                                    if (other.length > 0) item.WorkPlace_Other = other[1];
                                    item.WorkPlace[idx] = "其它";
                                }
                            });

                            var ws = item.WorkStatus.split('：');
                            if (ws.length > 1) {
                                item.WorkStatus = "其它";
                                item.WorkStatus_Other = ws[1];
                            }

                            item.edit = function() {
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
        add: function() {
            var item = {
                'CompanyName':'',
                'Position':'',
                'Position_Other':'',
                'PostLevel':[],
                'PostLevel_Other':'',
                'DepartmentCategory':'',
                'DepartmentCategory_Other':'',
                'Industry':'',
                'Industry_Other':'',
                'WorkPlace':[],
                'WorkPlace_Other':'',
                'WorkStatus':'',
                'WorkStatus_Other':'',
                'IsSharing':false
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
        save: function() {
            if ($scope.experiences.current.saveing) return;

            var request = angular.copy($scope.experiences.current.result);

            if (!request.CompanyName) return;

            if (!request.Position) return;
            if (request.Position == "其它") {
                if (!request.Position_Other) return;
                request.Position = "其它：" + request.Position_Other;
            }

            if (!request.PostLevel.length) return;
            if (request.PostLevel.indexOf("其它")!=-1) {
                if (!request.PostLevel_Other) return;
                angular.forEach(request.PostLevel, function(item, idx) {
                    if (item == "其它") request.PostLevel[idx] = "其它：" + request.PostLevel_Other;
                });
            }
            request.PostLevel = request.PostLevel.join(",");

            if (!request.DepartmentCategory) return;
            if (request.DepartmentCategory == "其它") {
                if (!request.DepartmentCategory_Other) return;
                request.DepartmentCategory = "其它：" + request.DepartmentCategory_Other;
            }

            if (!request.Industry) return;
            if (request.Industry == "其它") {
                if (!request.Industry_Other) return;
                request.Industry = "其它：" + request.Industry_Other;
            }

            if (!request.WorkPlace.length) return;
            if (request.WorkPlace.indexOf("其它")!=-1) {
                if (!request.WorkPlace_Other) return;
                angular.forEach(request.WorkPlace, function(item, idx) {
                    if (item == "其它") request.WorkPlace[idx] = "其它：" + request.WorkPlace_Other;
                });
            }
            request.WorkPlace = request.WorkPlace.join(',');

            if (!request.WorkStatus) return;
            if (request.WorkStatus == "其它") {
                if (!request.WorkStatus_Other) return;
                request.WorkStatus = "其它：" + request.WorkStatus_Other;
            }

            $scope.experiences.current.saveing = true;
            var service_name, body_content, action_type, action;
            if ($scope.experiences.current.type=='edit') {
                service_name = "default.UpdateExperience";
                action_type = "更新";
                action = "更新經歷";
            }
            else {
                service_name = "default.AddExperience";
                action_type = "新增";
                action = "新增經歷";
            }
            body_content = { Request: { Experience: request } };
            delete body_content.Request.Experience.$$hashKey;

            $scope.connection.send({
                service: service_name,
                body: body_content,
                result: function(response, error, http) {
                    if ((response.Result != null) && parseInt(response.Result.EffectRows, 10) > 0) {
                        $scope.experiences.load();
                        $("#experience").modal("hide");
                    }
                }
            });

            var ori_Experience = $scope.experiences.current.original;
            var res_Experience = request;
            var log_desc = [
                "\n公司名稱： ", (ori_Experience.CompanyName), " -> ", (res_Experience.CompanyName),
                "\n職稱： ", (ori_Experience.Position), " -> ", (res_Experience.Position),
                "\n層級別： ", (ori_Experience.PostLevel), " -> ", (res_Experience.PostLevel),
                "\n部門： ", (ori_Experience.DepartmentCategory), " -> ", (res_Experience.DepartmentCategory),
                "\n產業別： ", (ori_Experience.Industry), " -> ", (res_Experience.Industry),
                "\n工作地點： ", (ori_Experience.WorkPlace), " -> ", (res_Experience.WorkPlace),
                "\n工作狀態： ", (ori_Experience.WorkStatus), " -> ", (res_Experience.WorkStatus),
                "\n是否分享： ", (ori_Experience.IsSharing), " -> ", (res_Experience.IsSharing)
            ].join('');

            console.log(log_desc);

            // $scope.connection.send({
            //     service: "public.AddLog",
            //     body: {
            //         Request: {
            //             Log: {
            //                 Actor: gadget.getContract("emba.student").getUserInfo().UserName,
            //                 ActionType: action_type,
            //                 Action: action,
            //                 TargetCategory: "ischool.emba.experience",
            //                 ClientInfo: {
            //                     ClientInfo: ""
            //                 },
            //                 ActionBy: "ischool web 個人資訊小工具",
            //                 Description: log_desc
            //             }
            //         }
            //     },
            //     result: function(response, error, http) {
            //     }
            // });

        },
        del: function(item) {
            $scope.connection.send({
                service: "default.RemoveExperience",
                body: { Request: { Experience: { UID: item.UID } } },
                result: function(response, error, http) {
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

            console.log(log_desc);

            // $scope.connection.send({
            //     service: "public.AddLog",
            //     body: {
            //         Request: {
            //             Log: {
            //                 Actor: gadget.getContract("emba.student").getUserInfo().UserName,
            //                 ActionType: "刪除",
            //                 Action: "刪除經歷",
            //                 TargetCategory: "ischool.emba.experience",
            //                 ClientInfo: {
            //                     ClientInfo: ""
            //                 },
            //                 ActionBy: "ischool web 個人資訊小工具",
            //                 Description: log_desc
            //             }
            //         }
            //     },
            //     result: function(response, error, http) {
            //     }
            // });
        },
        reset: function() {
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
        tree_desc: function(item) {
            var desc = [];
            if (item.Domain) {
                desc.push(item.Domain);
                if (item.Category) {
                    desc.push(item.Category);
                    if (item.Item) {
                        desc.push(item.Item);
                        if (item.Description) desc.push(item.Description);
                    }
                }
            }
            return desc.join('/');
        },
        load: function() {
            $scope.connection.send({
                service: "default.GetStudentAdditional",
                body: {},
                result: function(response, error, http) {
                    //console.log(response);
                    if (!error) {
                        if (response.Result) {
                            $scope.stu_additionals.result = [].concat(response.Result.StudentAdditional || []);
                            $scope.stu_additionals.original = angular.copy($scope.stu_additionals.result);
                            $scope.stu_additionals.Specie = [];

                            angular.forEach($scope.stu_additionals.result, function(item) {
                                if (!$scope.stu_additionals.result['my_'+item.Specie]) {
                                    $scope.stu_additionals.result['my_'+item.Specie] = [];
                                    $scope.stu_additionals.result['my_'+item.Specie+'_desc'] = [];
                                    $scope.stu_additionals.Specie.push(item.Specie);
                                }

                                $scope.stu_additionals.result['my_'+item.Specie].push(item); // 種類名
                                $scope.stu_additionals.result['my_'+item.Specie+'_desc'].push($scope.stu_additionals.tree_desc(item));
                            });

                            angular.forEach($scope.stu_additionals.Specie, function(item) {
                                $scope.stu_additionals.result['my_'+item+'_desc'] = $scope.stu_additionals.result['my_'+item+'_desc'].join(", ");
                            });
                            $scope.$apply();
                        }
                    }
                }
            });
        },
        edit: function() {
            $(".modal[target='experience']").modal("show");
        },
        save: function() {
            $(".modal[target='experience']").modal("hide");
        }
    };

    // 取得選項內容
    // 產業別/部門類別/層級別/工作地點/工作狀態
    // 興趣/參加台大EMBA團體/參加校外組織
    $scope.getDataSource = function() {
        $scope.AdditionalSetup = [];
        $scope.ExperienceDataSource = [];
        $scope.connection.send({
            service: "default.GetUserDataSource",
            body: "",
            result: function(response, error, http) {
                if (!error) {
                    var additionals = [];
                    if (response.DataSource && response.DataSource.Additionals) {
                        response.DataSource.Additionals = [].concat(response.DataSource.Additionals || []);
                        response.DataSource.Additionals.forEach(function(item, index){
                            if (!additionals['S_'+item.specie]) {
                                additionals['S_'+item.specie] = {
                                    Domain: []
                                };
                            }
                            if (item.domain && !additionals['S_'+item.specie]['D_'+item.domain]) {
                                additionals['S_'+item.specie].Domain.push({
                                    Key: item.domain,
                                    Value: item.doamin
                                });
                                additionals['S_'+item.specie]['D_'+item.domain] = {
                                    Category: []
                                };
                            }
                            if (item.category && !additionals['S_'+item.specie]['D_'+item.domain]['C_'+item.category]) {
                                additionals['S_'+item.specie]['D_'+item.domain].Category.push({
                                    Key: item.category,
                                    Value: [item.doamin, item.category].join('/')
                                });
                                additionals['S_'+item.specie]['D_'+item.domain]['C_'+item.category] = {
                                    Item: []
                                };
                            }
                            if (item.item) {
                                additionals['S_'+item.specie]['D_'+item.domain]['C_'+item.category].Item.push({
                                    Key: item.item,
                                    Value: [item.doamin, item.category, item.item].join('/')
                                }); // unshift
                            }
                        });
                    }
                    $scope.AdditionalSetup = additionals;
                    // console.log($scope.AdditionalSetup);

                    var experiences = [];
                    if (response.DataSource && response.DataSource.Experiences) {
                        response.DataSource.Experiences = [].concat(response.DataSource.Experiences || []);
                        response.DataSource.Experiences.forEach(function(item, index){
                            if (!experiences['C_'+item.item_category]) {
                                experiences['C_'+item.item_category] = [];
                            }
                            if (item.item) {
                                experiences['C_'+item.item_category].push(item.item); // unshift
                            }
                        })
                    }
                    $scope.ExperienceDataSource = experiences;
                    // console.log($scope.ExperienceDataSource);
                    $scope.$apply();
                }
            }
        });
    };

    $scope.myInfo.load(); // 取得個人基本資料及分享設定
    $scope.educations.load(); // 學歷
    $scope.experiences.load(); // 經歷
    $scope.stu_additionals.load(); // 興趣/參加台大EMBA團體/參加校外組織
    $scope.getDataSource(); // 取得選項內容

}]);
