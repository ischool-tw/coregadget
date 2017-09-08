var app = angular.module("app", ["checklist-model"]);

app.controller('MainCtrl', ['$scope', function($scope) {
    $scope.connection = gadget.getContract("emba.student");
    $scope.isLoadComplete = false;
    $scope.isLoading = false;
    // 取得系所組別
    $scope.getDept = function(enroll_year) {
        // enroll_year 入學年度
        $scope.Department = [];
        $scope.filter.dept = null;

        var service_name, body_content;
        if (enroll_year) {
            service_name = "default.GetEnrollYearDepartmentGroup";
            body_content = { Request: { Condition: { EnrollYear: enroll_year } } };
        } else {
            service_name = "default.GetDepartmentGroup";
            body_content = '';
        }

        $scope.connection.send({
            service: service_name,
            body: body_content,
            result: function(response, error, http) {
                if (!error) {
                    if (response.Result) $scope.Department = [].concat(response.Result.Department || []);
                    $scope.$apply();
                }
            }
        });
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
                        response.DataSource.Additionals.forEach(function(item, index) {
                            if (!additionals['S_' + item.specie]) {
                                additionals['S_' + item.specie] = {
                                    Domain: []
                                };
                            }
                            if (item.domain && !additionals['S_' + item.specie]['D_' + item.domain]) {
                                additionals['S_' + item.specie].Domain.push(item.domain);
                                additionals['S_' + item.specie]['D_' + item.domain] = {
                                    Category: []
                                };
                            }
                            if (item.category && !additionals['S_' + item.specie]['D_' + item.domain]['C_' + item.category]) {
                                additionals['S_' + item.specie]['D_' + item.domain].Category.push(item.category);
                                additionals['S_' + item.specie]['D_' + item.domain]['C_' + item.category] = {
                                    Item: []
                                };
                            }
                            if (item.item) {
                                additionals['S_' + item.specie]['D_' + item.domain]['C_' + item.category].Item.push(item.item);
                            }
                        });
                    }
                    $scope.AdditionalSetup = additionals;
                    // console.log($scope.AdditionalSetup);

                    var experiences = [];
                    if (response.DataSource && response.DataSource.Experiences) {
                        response.DataSource.Experiences = [].concat(response.DataSource.Experiences || []);
                        response.DataSource.Experiences.forEach(function(item, index) {
                            if (!experiences['C_' + item.item_category]) {
                                experiences['C_' + item.item_category] = [];
                            }
                            if (item.item) {
                                experiences['C_' + item.item_category].push(item.item);
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

    $scope.resetFilter = function() {
        $scope.filter = {
            enroll_year: null, // 入學年度
            student_name: null, // 學生姓名
            dept: null, // 系統組別
            edu: null, // 學歷
            additional: {
                company_name: null, // 公司名稱
                level: [], // 層級別
                industry: null, // 產業別
                department: null, // 部門
                place: [], // 工作地點
                status: null, // 工作狀態
            },
            experience: {
                interest: { // 興趣
                    domain: null, // 領域
                    category: null, // 類別
                    item: null // 項目
                },
                emba_groups: { // 參加台大EMBA團體
                    domain: null,
                    category: null
                },
                external_organization: { // 參加校外組織
                    domain: null,
                    category: null
                }
            },
            willingness: {
                is_social_enterprise: false, // 社會企業
                description_enterprise: null,
                is_non_porfit_organizations: false, // 非營利組織
                description_organizations: null,
                is_corporate_social_responsibility: false, // 企業社會責任
                description_responsibility: null,
                is_venture: false, // 創業
                description_venture: null,
                is_entrpreneurial_team: false, // 業師意願
                description_entrpreneurial: null
            }
        };
        $scope.panel = "filter"; // 呈現查詢頁
    };

    $scope.queryStudent = function() {
        $scope.isLoadComplete = false;
        $scope.isLoading = true;
        $scope.students = [];

        // 搜尋條件列表
        var flt = $scope.filter;
        var cdt = [];
        var body_obj = {};
        if (flt.enroll_year) { // 入學年度
            body_obj.enroll_year = flt.enroll_year;
            cdt.push(flt.enroll_year);
        }
        if (flt.student_name) { // 學生姓名
            body_obj.student_name = ['%', flt.student_name, '%'].join('');
            cdt.push(flt.student_name);
        }
        if (flt.dept) { // 系統組別
            body_obj.dept = flt.dept.Name;
            cdt.push(flt.dept.Name);
        }
        if (flt.edu) { // 學歷
             if (!body_obj.edu_background) body_obj.edu_background = {};
            body_obj.edu_background.edu_sharing = true;
            body_obj.edu_background.school_name = ['%', flt.edu, '%'].join('');
            cdt.push(flt.edu);
        }
        if (flt.additional.company_name) { // 公司名稱
            if (!body_obj.additional) body_obj.additional = {};
            body_obj.additional.company_sharing = true;
            body_obj.additional.company_name = ['%', flt.additional.company_name, '%'].join('');
            cdt.push(flt.additional.company_name);
        }
        if (flt.additional.level.length) { // 層級別
            if (!body_obj.additional) body_obj.additional = {};
            body_obj.additional.company_sharing = true;
            body_obj.additional.level = flt.additional.level;
            cdt.push(flt.additional.level.join(','));
        }
        if (flt.additional.industry) { // 產業別
            if (!body_obj.additional) body_obj.additional = {};
            body_obj.additional.company_sharing = true;
            body_obj.additional.industry = flt.additional.industry;
            cdt.push(flt.additional.industry);
        }
        if (flt.additional.department) { // 部門
            if (!body_obj.additional) body_obj.additional = {};
            body_obj.additional.company_sharing = true;
            body_obj.additional.department = flt.additional.department;
            cdt.push(flt.additional.department);
        }
        if (flt.additional.place.length) { // 工作地點
            if (!body_obj.additional) body_obj.additional = {};
            body_obj.additional.company_sharing = true;
            body_obj.additional.place = flt.additional.place;
            cdt.push(flt.additional.place.join(','));
        }
        if (flt.additional.status) { // 工作狀態
            if (!body_obj.additional) body_obj.additional = {};
            body_obj.additional.company_sharing = true;
            body_obj.additional.status = flt.additional.status;
            cdt.push(flt.additional.status);
        }
        if (flt.experience.interest.domain) { // 興趣領域
            if (!body_obj.experience) body_obj.experience = {};
            if (!body_obj.experience.interest) body_obj.experience.interest = {};
            body_obj.experience.interest.interest_sharing = true;
            body_obj.experience.interest.specie = "Interest";
            body_obj.experience.interest.domain = flt.experience.interest.domain;
            cdt.push(flt.experience.interest.domain);
        }
        if (flt.experience.interest.category) { // 興趣類別
            body_obj.experience.interest.category = flt.experience.interest.category;
            cdt.push(flt.experience.interest.category);
        }
        if (flt.experience.interest.item) { // 興趣項目
            body_obj.experience.interest.item = flt.experience.interest.item;
            cdt.push(flt.experience.interest.item);
        }
        if (flt.experience.emba_groups.domain) { // 參加台大EMBA團體領域
            if (!body_obj.experience) body_obj.experience = {};
            if (!body_obj.experience.emba_groups) body_obj.experience.emba_groups = {};
            body_obj.experience.emba_groups.emba_groups_sharing = true;
            body_obj.experience.emba_groups.specie = "EMBAGroups";
            body_obj.experience.emba_groups.domain = flt.experience.emba_groups.domain;
            cdt.push(flt.experience.emba_groups.domain);
        }
        if (flt.experience.emba_groups.category) { // 參加台大EMBA團體類別
            body_obj.experience.emba_groups.category = flt.experience.emba_groups.category;
            cdt.push(flt.experience.emba_groups.category);
        }
        if (flt.experience.external_organization.domain) { // 參加校外組織領域
            if (!body_obj.experience) body_obj.experience = {};
            if (!body_obj.experience.external_organization) body_obj.experience.external_organization = {};
            body_obj.experience.external_organization.external_organization_sharing = true;
            body_obj.experience.external_organization.specie = "ExternalOrganization";
            body_obj.experience.external_organization.domain = flt.experience.external_organization.domain;
            cdt.push(flt.experience.external_organization.domain);
        }
        if (flt.experience.external_organization.category) { // 參加校外組織類別
            body_obj.experience.external_organization.category = flt.experience.external_organization.category;
            cdt.push(flt.experience.external_organization.category);
        }
        if (flt.willingness.is_social_enterprise) { // 社會企業
            if (!body_obj.willingness) body_obj.willingness = {};
            body_obj.willingness.is_sharing_enterprise = true;
            body_obj.willingness.is_social_enterprise = flt.willingness.is_social_enterprise;
            cdt.push("有參與社會企業");
        }
        if (flt.willingness.description_enterprise) { // 社會企業關鍵字
            if (!body_obj.willingness) body_obj.willingness = {};
            body_obj.willingness.is_sharing_enterprise = true;
            body_obj.willingness.description_enterprise = ['%', flt.willingness.description_enterprise, '%'].join('');
            cdt.push(flt.willingness.description_enterprise);
        }
        if (flt.willingness.is_non_porfit_organizations) { // 非營利組織
            if (!body_obj.willingness) body_obj.willingness = {};
            body_obj.willingness.is_sharing_organizations = true;
            body_obj.willingness.is_non_porfit_organizations = flt.willingness.is_non_porfit_organizations;
            cdt.push("有參與非營利組織");
        }
        if (flt.willingness.description_organizations) { // 非營利組織關鍵字
            if (!body_obj.willingness) body_obj.willingness = {};
            body_obj.willingness.is_sharing_organizations = true;
            body_obj.willingness.description_organizations = ['%', flt.willingness.description_organizations, '%'].join('');
            cdt.push(flt.willingness.description_organizations);
        }
        if (flt.willingness.is_corporate_social_responsibility) { // 企業社會責任
            if (!body_obj.willingness) body_obj.willingness = {};
            body_obj.willingness.is_sharing_responsibility = true;
            body_obj.willingness.is_corporate_social_responsibility = flt.willingness.is_corporate_social_responsibility;
            cdt.push("有參與企業社會責任");
        }
        if (flt.willingness.description_responsibility) { // 企業社會責任關鍵字
            if (!body_obj.willingness) body_obj.willingness = {};
            body_obj.willingness.is_sharing_responsibility = true;
            body_obj.willingness.description_responsibility = ['%', flt.willingness.description_responsibility, '%'].join('');
            cdt.push(flt.willingness.description_responsibility);
        }
        if (flt.willingness.is_venture) { // 創業
            if (!body_obj.willingness) body_obj.willingness = {};
            body_obj.willingness.is_sharing_venture = true;
            body_obj.willingness.is_venture = flt.willingness.is_venture;
            cdt.push("有參與創業");
        }
        if (flt.willingness.description_venture) { // 創業關鍵字
            if (!body_obj.willingness) body_obj.willingness = {};
            body_obj.willingness.is_sharing_venture = true;
            body_obj.willingness.description_venture = ['%', flt.willingness.description_venture, '%'].join('');
            cdt.push(flt.willingness.description_venture);
        }
        if (flt.willingness.is_entrpreneurial_team) { // 業師意願
            if (!body_obj.willingness) body_obj.willingness = {};
            body_obj.willingness.is_sharing_entrpreneurial = true;
            body_obj.willingness.is_entrpreneurial_team = flt.willingness.is_entrpreneurial_team;
            cdt.push("有業師意願");
        }
        if (flt.willingness.description_entrpreneurial) { // 業師意願關鍵字
            if (!body_obj.willingness) body_obj.willingness = {};
            body_obj.willingness.is_sharing_entrpreneurial = true;
            body_obj.willingness.description_entrpreneurial = ['%', flt.willingness.description_entrpreneurial, '%'].join('');
            cdt.push(flt.willingness.description_entrpreneurial);
        }

        if (cdt.length) {
            $scope.conditions = cdt;

            // 至資料庫比對
            $scope.connection.send({
                service: "public.QueryStudents",
                body: { filter: body_obj },
                result: function(response, error, http) {
                    if (!error) {
                        $scope.$apply(function() {
                            $scope.students = [].concat(response.Result.Student || []);
                            $scope.isLoadComplete = true;
                            $scope.isLoading = false;
                            $scope.panel = "result"; // 呈現查詢結果
                        });
                    }
                }
            });
            // 第六階段第二期需求變更，需要顯示更多統計內容
            $scope.connection.send({
                service: "public.QueryExperienceCount",
                body: { },
                result: function(response, error, http) {
                    if (!error) {
                        $scope.experienceCount = response.Response;
                        console.log(response);
                    }
                }
            });
        }
    };

    $scope.previewDetail = function(student) {
        window.scrollTo(0,0);
        
        $scope.currStudent = angular.copy(student);

        // 取得是否分享的資訊
        $scope.currStudent.shareInfo = {
            "Name": "true",
            "Gender": "true",
            "Birthdate": "false",
            "Custodian": "false",
            "CustodianPhone": "false",
            "ContactPhone": "false",
            "PermanentPhone": "false",
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
            "公司電話": "false",
            "行動電話2": "false",
            "秘書電話": "false",
            "SMSPhone": "false",
            "EmailList": {
                "email1": "false",
                "email2": "false",
                "email3": "false",
                "email4": "false",
                "email5": "false"
            },
            "ContactAddress": "false",
            "PermanentAddress": "false",
            "OtherAddressList": {
                Address: "true",
                Address: "true",
                Address: "true" 
            },
            // 其它聯絡資訊
            "Line": "false",
            "Facebook": "false",
            "LinkedIn": "false",
            "WhatsApp": "false",
            "WeChat": "false"
        };
        $scope.connection.send({
            service: "public.QueryStudentBrief",
            body: { Request: { StudentID: student.StudentID } },
            result: function(response, error, http) {
                if (!error) {
                    if (response.Result.DataSharing && response.Result.DataSharing.DataSharing) {
                        $scope.currStudent.shareInfo = response.Result.DataSharing.DataSharing;
                        $scope.currStudent.shareInfo.OtherPhoneList.PhoneNumber.forEach(function(item) {
                            $scope.currStudent.shareInfo[item.title] = item['@text'];
                        });
                        $scope.$apply();
                    }
                }
            }
        });

        // 取得學歷資訊
        $scope.currStudent.eduBackground = [];
        $scope.connection.send({
            service: "public.QueryStudentEducationBackground",
            body: { Request: { StudentID: student.StudentID } },
            result: function(response, error, http) {
                if (!error) {
                    if (response.Result.EducationBackground) {
                        $scope.currStudent.eduBackground = [].concat(response.Result.EducationBackground || []);
                        $scope.$apply();
                    }
                }
            }
        });

        // 取得經歷資訊
        $scope.currStudent.experience = [];
        $scope.connection.send({
            service: "public.QueryStudentExperience",
            body: { Request: { StudentID: student.StudentID } },
            result: function(response, error, http) {
                if (!error) {
                    if (response.Result.Experience) {
                        $scope.currStudent.experience = [].concat(response.Result.Experience || []);
                        $scope.$apply();
                    }
                }
            }
        });

        // 取得經驗調查&意願調查資訊
        $scope.currStudent.willingness = {};
        $scope.connection.send({
            service: "public.QueryWillingness",
            body: { Request: { Condition: { StudentID: student.StudentID } } },
            result: function(response, error, http) {
                if (!error) {
                    if (response.Response.Willingness) {
                        $scope.currStudent.willingness = response.Response.Willingness;
                        $scope.$apply();
                    }
                }
            }
        });

        // 取得參加校外團體資訊
        $scope.currStudent.externalOrg = [];
        $scope.connection.send({
            service: "public.QueryExternalOrigination",
            body: { Request: { Condition: { StudentID: student.StudentID } } },
            result: function(response, error, http) {
                if (!error) {
                    if (response.Response.ExternalOrg) {
                        $scope.currStudent.externalOrg = [].concat(response.Response.ExternalOrg || []);
                        $scope.$apply();
                    }
                }
            }
        });

        // 取得興趣資訊
        $scope.currStudent.interest = [];
        $scope.connection.send({
            service: "public.QueryInterest",
            body: { Request: { Condition: { StudentID: student.StudentID } } },
            result: function(response, error, http) {
                if (!error) {
                    if (response.Response.Interest) {
                        $scope.currStudent.interest = [].concat(response.Response.Interest || []);
                        $scope.$apply();
                    }
                }
            }
        });

        // 取得參加台大EMBA團體資訊
        $scope.currStudent.embaGroups = [];
        $scope.connection.send({
            service: "public.QueryEMBAGroups",
            body: { Request: { Condition: { StudentID: student.StudentID } } },
            result: function(response, error, http) {
                if (!error) {
                    if (response.Response.EMBAGroups) {
                        $scope.currStudent.embaGroups = [].concat(response.Response.EMBAGroups || []);
                        $scope.$apply();
                    }
                }
            }
        });

        $scope.panel = "detail"; // 呈現個人資料
    };

    $scope.resetFilter();
    $scope.getDept();
    $scope.getDataSource();
}]);
