angular.module('app', ['ui.sortable', 'mgcrea.ngStrap.helpers.dimensions', 'mgcrea.ngStrap.helpers.debounce', 'monospaced.elastic'])

.controller('MainCtrl', ['$scope', '$timeout',
    function ($scope, $timeout) {
        $.material.init();
        var scope = {
            Init: true,
            InitErr: '',
            SchoolYear: '',
            Semester: '',
            TeacherName: '',
            LoginName: '',
            StuFilter: { Filter: '' },
            ConselStudent: [{
                StudentID: "470",
                GradeYear: "3",
                ClassName: "三年14班",
                SeatNo: "1",
                StudentNumber: "310901",
                StudentName: "尤姿惠",
                輔導老師: false,
                班導師: true,
                認輔老師: false,
                FilterKey: "310901  尤姿惠  三年14班01"
            }],
            FilterClass: [{
                ClassName: "三年14班",
                Student: [{
                    StudentID: "470",
                    GradeYear: "3",
                    ClassName: "三年14班",
                    SeatNo: "1",
                    StudentNumber: "310901",
                    StudentName: "尤姿惠",
                    輔導老師: false,
                    班導師: true,
                    認輔老師: false,
                    FilterKey: "310901  尤姿惠  三年14班01"
                }]
            }],
            CurrentStudent: {
                StudentID: "470",
                GradeYear: "3",
                ClassName: "三年14班",
                SeatNo: "1",
                StudentNumber: "310901",
                StudentName: "尤姿惠",
                輔導老師: false,
                班導師: true,
                認輔老師: false,
                FilterKey: "310901  尤姿惠  三年14班01",
                InterviewRecord: [{
                    UID: "38970",
                    InterviewNo: "",
                    SchoolYear: "",
                    Semester: "",
                    InterviewDate: "2016/9/2",
                    InterviewTime: "12:30",
                    Cause: "家暴自傷",
                    IntervieweeType: "學生",
                    InterviewType: "面談",
                    Place: "OOO辦公室",
                    Attendees: [{ Name: "學生" }, { Name: "導師" }, { Name: "其他", Remark: "好友某某哞" }],
                    CounselType: { Name: "導師輔導" },
                    CounselTypeKind: [{ Name: "家庭" }, { Name: "家暴" }, {
                        Name: "其他",
                        Remark: "自傷"
                    }],
                    ContentDigest: "內容要點內容要點內容要點內容要點內容要點內容要點內容要點內容要點內容要點內容要點內容要點內容要點內容要點內容要點內容要點內容要點內容要點",
                    Attachment: "",
                    AuthorID: "teacher01.whsh@1campus.net",
                    AuthorName: "張玉秀",
                    AuthorRole: '班導師',
                    RefStudentID: "483",
                    RefTeacherID: "102",
                    IsPublic: "false",
                    EditRole: "紀錄者"
                }]
            },
            CurrentView: "Interview",
            HomeVisitTypeOption: ["家庭訪問", "電話聯絡", "函件聯絡", "個別約談家長", "家長座談", "其他"],
            HomeVisitTypeOption: ['2016/1/3', '2016/1/2', '2016/1/1'],

            InterviewDateOption: ['2016/1/3', '2016/1/2', '2016/1/1'],
            InterviewTimeOption: ['早休', '第一節', '第二節', '第三節', '第四節', '午休', '第五節', '第六節', '第七節', '第八節'],
            InterviewCauseOption: ["主動來談", "約談", "家長要求", "教師轉介", "同學引介", "教官轉介", "他室轉介"], //, "家長晤談", "個案討論", "電話關心"
            IntervieweeTypeOption: ["學生", "家長", "其他"],
            InterviewTypeOption: ["面談", "電話", "家訪", "電子信箱", "聯絡簿", "其他"]
        };


        $scope.CurrentView = "Interview";

        $scope.HomeVisitTypeOption = ["家庭訪問", "電話聯絡", "函件聯絡", "個別約談家長", "家長座談", "其他"];
        $scope.HomeVisitDateOption = [];

        $scope.InterviewDateOption = [];
        var d = new Date();
        for (var i = 5; i > 0; i--) {
            $scope.HomeVisitDateOption.push(d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate());
            $scope.InterviewDateOption.push(d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate());
            d.setDate(d.getDate() - 1);
        }
        $scope.InterviewTimeOption = ['早休', '第一節', '第二節', '第三節', '第四節', '午休', '第五節', '第六節', '第七節', '第八節'];
        $scope.InterviewCauseOption = ["主動來談", "約談", "家長要求", "教師轉介", "同學引介", "教官轉介", "他室轉介"]; //, "家長晤談", "個案討論", "電話關心"
        $scope.IntervieweeTypeOption = ["學生", "家長", "其他"];
        $scope.InterviewTypeOption = ["面談", "電話", "家訪", "電子信箱", "聯絡簿", "其他"];

        $scope.StuFilter = { Filter: '' };

        $scope.Filter = function (event) {
            if (event && (event.keyCode !== 13)) return;

            var dicClass = {};
            var classList = [];
            var filter = new RegExp($scope.StuFilter.Filter || "");

            $scope.ConselStudent.forEach(function (stuRec) {
                if (filter.test(stuRec.FilterKey)) {
                    if (!dicClass[stuRec.ClassName]) {
                        dicClass[stuRec.ClassName] = {
                            ClassName: stuRec.ClassName,
                            Student: [stuRec]
                        };
                        classList.push(dicClass[stuRec.ClassName]);
                    }
                    else {
                        dicClass[stuRec.ClassName].Student.push(stuRec);
                    }
                }
            });
            $scope.FilterClass = classList;
        };
        $scope.SetCurrent = function (stuRec) {
            $scope.CurrentStudent = stuRec;
            $scope.SetCurrentView();
        }
        $scope.SetCurrentView = function (view) {
            $scope.ClearAction();
            if (view)
                $scope.CurrentView = view;

            if ($scope.CurrentStudent) {
                if ($scope.CurrentView == "Interview")
                    $scope.GetInterview($scope.CurrentStudent);

                if ($scope.CurrentView == "HomeVisit")
                    $scope.GetHomeVisit($scope.CurrentStudent);

                if ($scope.CurrentView == "PsychologicalTests")
                $scope.GetPsychologicalTests($scope.CurrentStudent);

            }
            //把選單縮回去
            $('.navbar-collapse.in').collapse('hide');
        };
        $scope.ClearAction = function () {
            $scope.CurrentAction = '';
        }
        $scope.ClearCurrentStudent = function () {
            delete $scope.CurrentStudent;
        }

		$scope.SingleChecked = function(list, opt){
			if(opt.Checked){
				[].concat(list || []).forEach(function(item){
					if(opt !== item && item.Checked){
						item.Checked = false;
					}
				});
			}
		}

        //2017/2/6  穎驊新增
        //讀取心理測驗
        $scope.GetPsychologicalTests = function (stuRec) {
            delete stuRec.PsychologicalTestsRecord;
            gadget.getContract('ischool.counsel.v2.teacher').send({
                service: "GetPsychologicalTestsRecord",
                body: { StudentID: stuRec.StudentID },
                result: function (response, error, http) {
                    $scope.$apply(function () {
                        if (!response)
                            alert('GetPsychologicalTestsRecord Error' + JSON.stringify(error));
                        else {
                            if (response.PsychologicalTestsRecord && response.PsychologicalTestsRecord.AptitudeTest) {
                                
                                    stuRec.PsychologicalTestsRecord = response.PsychologicalTestsRecord;

                                    

                                    if (response.PsychologicalTestsRecord.AptitudeTest.ImplementationDate) {
                                        // 轉成 mm 微秒
                                        var d = Date.parse(response.PsychologicalTestsRecord.AptitudeTest.ImplementationDate);
                                        var dd = new Date(d);

                                        // 轉顯示成 YYYY/MM/d 的格式
                                        stuRec.PsychologicalTestsRecord.AptitudeTest.ImplementationDate = dd.getFullYear() + "/" + (dd.getMonth() + 1) + "/" + dd.getDate();
                                    }
                                

                            }
                            if (response.PsychologicalTestsRecord && response.PsychologicalTestsRecord.InterestTest)
                            {
                                //新增 興趣測驗
                                stuRec.PsychologicalTestsRecord.InterestTest = response.PsychologicalTestsRecord.InterestTest;

                                if (response.PsychologicalTestsRecord.InterestTest.ImplementationDate) {
                                    // 轉成 mm 微秒
                                    var d = Date.parse(response.PsychologicalTestsRecord.InterestTest.ImplementationDate);
                                    var dd = new Date(d);

                                    // 轉顯示成 YYYY/MM/d 的格式
                                    stuRec.PsychologicalTestsRecord.InterestTest.ImplementationDate = dd.getFullYear() + "/" + (dd.getMonth() + 1) + "/" + dd.getDate();
                                }
                            
                            
                            }
                            if (!response.PsychologicalTestsRecord.InterestTest && !response.PsychologicalTestsRecord.AptitudeTest)
                            {
                                stuRec.PsychologicalTestsRecord = '沒有心理測驗紀錄';

                            }                            
                        }
                    });
                }
            });
        }

        //#region HomeVisitRecord 家長聯繫
        //讀取家長聯繫
        $scope.GetHomeVisit = function (stuRec) {
            gadget.getContract('ischool.counsel.v2.teacher').send({
                service: "GetHomeVisitRecord",
                body: { StudentID: stuRec.StudentID },
                result: function (response, error, http) {
                    $scope.$apply(function () {
                        if (!response)
                            alert('GetHomeVisitRecord Error' + JSON.stringify(error));
                        else {
                            stuRec.HomeVisitRecord = [].concat(response.HomeVisitRecord || []);
                            [].concat(response.HomeVisitRecord || []).forEach(function (rec) {
                                rec.IsPublic = (rec.IsPublic == 'true');
                                rec.HomeVisitDate = new Date(parseInt(rec.HomeVisitDate));
								rec.HomeVisitDate = rec.HomeVisitDate.getFullYear() + "/" + (rec.HomeVisitDate.getMonth() + 1) + "/" + rec.HomeVisitDate.getDate();
                                rec.Attendees = [].concat(rec.Attendees || []);
                                rec.Contact = [].concat(rec.Contact || []);
                                rec.CounselTypeKind = [].concat(rec.CounselTypeKind || []);
                            });
                        }
                    });
                }
            });
        }
        //進入檢視內容畫面
        $scope.ShowHomeVisitDetial = function (rec) {
            $scope.HomeVisitDetial = {};
            angular.copy(rec, $scope.HomeVisitDetial);
            $scope.CurrentAction = 'ShowHomeVisitDetial';
        }
        //進入新增 / 修改模式
        $scope.ShowHomeVisitEditor = function (rec) {
            if (!rec) {
                rec = {
                    SchoolYear: $scope.SchoolYear,
                    Semester: $scope.Semester,
                    AuthorID: $scope.LoginName,
                    AuthorName: $scope.TeacherName,
                    RefStudentID: $scope.CurrentStudent.StudentID,
                    IsPublic: false,
                    EditRole: $scope.CurrentStudent.輔導老師 ? "輔導老師" : "紀錄者"
                };
            }

            $scope.HomeVisitDetial = {};
            angular.copy(rec, $scope.HomeVisitDetial);
            //#region 轉換Attendees到AttendeesOption
            var attendeesOption = [{ Name: '學生' }, { Name: '教官' }, { Name: '輔導老師' }, { Name: '班導師' }, { Name: '任課老師' }, { Name: '家長' }, { Name: '專家' }, { Name: '醫師' }, { Name: '社工人員' }, { Name: '其他', HasRemark: true }];
            $scope.HomeVisitDetial.AttendeesOption = [];
            attendeesOption.forEach(function (opt) {
                var item = { Name: opt.Name, HasRemark: opt.HasRemark, Checked: false };
                [].concat(rec.Attendees || []).forEach(function (val) {
                    if (val.Name == item.Name) {
                        item.Checked = true;
                        if (item.HasRemark) {
                            item.Remark = val.Remark;
                        }
                    }
                });
                $scope.HomeVisitDetial.AttendeesOption.push(item);
            });
            //#endregion
            //#region 轉換Contact到ContactOption
            var contactOption = [{ Name: '學生本人' }, { Name: '父母' }, { Name: '祖父母' }, { Name: '叔伯姨姑' }, { Name: '兄姊' }, { Name: '師長' }, { Name: '其他', HasRemark: true }];
            $scope.HomeVisitDetial.ContactOption = [];
            contactOption.forEach(function (opt) {
                var item = { Name: opt.Name, HasRemark: opt.HasRemark, Checked: false };
                [].concat(rec.Contact || []).forEach(function (val) {
                    if (val.Name == item.Name) {
                        item.Checked = true;
                        if (item.HasRemark) {
                            item.Remark = val.Remark;
                        }
                    }
                });
                $scope.HomeVisitDetial.ContactOption.push(item);
            });
            //#endregion

            //#region 轉換CounselTypeKind到CounselTypeKindOption
            var counselTypeKindOption = [{ Name: '家人議題' }, { Name: '違規行為' }, { Name: '心理困擾' }, { Name: '學習問題' },
                { Name: '性別議題' }, { Name: '人際關係' }, { Name: '生涯規劃' }, { Name: '自傷/自殺' },
                { Name: '生活適應' }, { Name: '生活作息/常規' }, { Name: '家長期望' }, { Name: '健康問題' },
                { Name: '情緒不穩' }, { Name: '法定通報-兒少保護' }, { Name: '法定通報-高風險家庭' }, { Name: '法定通報-家暴(18 歲以上)' },
                { Name: '其他(含生活關懷)', HasRemark: true }];
            $scope.HomeVisitDetial.CounselTypeKindOption = [];
            counselTypeKindOption.forEach(function (opt) {
                var item = { Name: opt.Name, HasRemark: opt.HasRemark, Checked: false };
                [].concat(rec.CounselTypeKind || []).forEach(function (val) {
                    if (val.Name == item.Name) {
                        item.Checked = true;
                        if (item.HasRemark) {
                            item.Remark = val.Remark;
                        }
                    }
                });
                $scope.HomeVisitDetial.CounselTypeKindOption.push(item);
            });
            //#endregion

            $scope.CurrentAction = 'ShowHomeVisitEditor';
        }
        //刪除聯繫紀錄
        $scope.DeleteHomeVisitRecord = function (rec) {
            var strconfirm = confirm("將會刪除此筆聯繫紀錄，並且無法回復，確定要執行刪除?");
            if (strconfirm == true) {
                gadget.getContract('ischool.counsel.v2.teacher').send({
                    service: "DeleteHomeVisitRecord",
                    body: { HomeVisitRecord: { UID: rec.UID } },
                    result: function (response, error, http) {
                        if (!response)
                            alert("DeleteHomeVisitRecord" + ' Error' + JSON.stringify(error));
                        else {
                            $scope.$apply(function () {
                                //重新讀取
                                $scope.SetCurrentView('HomeVisit');
                            });
                        }
                    }
                });
            }
        }

        //點快速選項設定日期
        $scope.SetHomeVisitDate = function (record, date) {
            record.HomeVisitDate = date;
        }
        //點快速選項設定事由
        $scope.SetHomeVisitCause = function (record, cause) {
            record.Cause = cause;
        }
        //儲存家長聯繫
        $scope.SaveHomeVisit = function (record) {
            var rec = {};
            angular.copy(record, rec);

            //#region 轉換AttendeesOption到Attendees
            rec.Attendees = { Item: [] };
            [].concat(rec.AttendeesOption || []).forEach(function (opt) {
                if (opt.Checked) {
                    if (opt.HasRemark)
                        rec.Attendees.Item.push({ Name: opt.Name, Remark: opt.Remark });
                    else
                        rec.Attendees.Item.push({ Name: opt.Name });
                }
            });
            delete rec.AttendeesOption;
            //#endregion

            //#region 轉換ContactOption到Contact
            rec.Contact = { Item: [] };
            [].concat(rec.ContactOption || []).forEach(function (opt) {
                if (opt.Checked) {
                    if (opt.HasRemark)
                        rec.Contact.Item.push({ Name: opt.Name, Remark: opt.Remark });
                    else
                        rec.Contact.Item.push({ Name: opt.Name });
                }
            });
            delete rec.ContactOption;
            //#endregion

            //#region 轉換CounselTypeKindOption到CounselTypeKind
            rec.CounselTypeKind = { Item: [] };
            [].concat(rec.CounselTypeKindOption || []).forEach(function (opt) {
                if (opt.Checked) {
                    if (opt.HasRemark)
                        rec.CounselTypeKind.Item.push({ Name: opt.Name, Remark: opt.Remark });
                    else
                        rec.CounselTypeKind.Item.push({ Name: opt.Name });
                }
            });
            delete rec.CounselTypeKindOption;
            //#endregion


            //驗證
            var err = "";
            if (!rec.SchoolYear || isNaN(parseInt(rec.SchoolYear)))
                err += (err ? '\n' : '') + "學年度輸入錯誤!";
            if (!rec.Semester || isNaN(parseInt(rec.Semester)))
                err += (err ? '\n' : '') + "學期輸入錯誤!";

            if (isNaN(new Date(rec.HomeVisitDate).getTime()))
                err += (err ? '\n' : '') + "日期格式錯誤!";
            else {
                var date = new Date(rec.HomeVisitDate);
                var mm = date.getMonth() + 1; // getMonth() is zero-based
                var dd = date.getDate();

                rec.HomeVisitDate = [
                    date.getFullYear(),
                    mm,
                    dd
                ].join('/');
            }

            if (!rec.Cause)
                err += (err ? '\n' : '') + "聯繫事由不得空白!";

            if (!rec.HomeVisitType)
                err += (err ? '\n' : '') + "聯繫方式不得空白!";

            if (rec.Attendees.Item.length == 0)
                err += (err ? '\n' : '') + "參與成員不得空白!";

            if (rec.Contact.Item.length == 0)
                err += (err ? '\n' : '') + "聯繫成員不得空白!";

            if (rec.CounselTypeKind.Item.length == 0)
                err += (err ? '\n' : '') + "聯繫類別不得空白!";

            if (!rec.ContentDigest)
                err += (err ? '\n' : '') + "內容要點不得空白!";

            if (err) {
                alert(err);
                return;
            }

            gadget.getContract('ischool.counsel.v2.teacher').send({
                service: rec.UID ? "PutHomeVisitRecord" : "PushHomeVisitRecord",
                body: { HomeVisitRecord: rec },
                result: function (response, error, http) {
                    if (!response)
                        alert((rec.UID ? "PutHomeVisitRecord" : "PushHomeVisitRecord") + ' Error' + JSON.stringify(error));
                    else {
                        $scope.$apply(function () {
                            //重新讀取
                            $scope.SetCurrentView('HomeVisit');
                        });
                    }
                }
            });
        }
        //#endregion

        //#region InterviewRecord 輔導紀錄
        //讀取輔導紀錄
        $scope.GetInterview = function (stuRec) {
            gadget.getContract('ischool.counsel.v2.teacher').send({
                service: "GetInterviewRecord",
                body: { StudentID: stuRec.StudentID },
                result: function (response, error, http) {
                    $scope.$apply(function () {
                        if (!response)
                            alert('GetInterviewRecord Error' + JSON.stringify(error));
                        else {
                            stuRec.InterviewRecord = [].concat(response.InterviewRecord || []);
                            [].concat(response.InterviewRecord || []).forEach(function (rec) {
                                rec.IsPublic = (rec.IsPublic == 'true');
                                rec.InterviewDate = new Date(parseInt(rec.InterviewDate));
								rec.InterviewDate = rec.InterviewDate.getFullYear() + "/" + (rec.InterviewDate.getMonth() + 1) + "/" + rec.InterviewDate.getDate();
                                rec.Attendees = [].concat(rec.Attendees || []);
                                rec.CounselType = [].concat(rec.CounselType || []);
                                rec.CounselTypeKind = [].concat(rec.CounselTypeKind || []);
                            });
                        }
                    });
                }
            });
        }
        //進入檢視內容畫面
        $scope.ShowInterviewDetial = function (rec) {
            $scope.InterviewDetial = {};
            angular.copy(rec, $scope.InterviewDetial);
            $scope.CurrentAction = 'ShowInterviewDetial';
        }
        //進入新增 / 修改模式
        $scope.ShowInterviewEditor = function (rec) {
            if (!rec) {
                rec = {
                    SchoolYear: $scope.SchoolYear,
                    Semester: $scope.Semester,
                    AuthorID: $scope.LoginName,
                    AuthorName: $scope.TeacherName,
                    RefStudentID: $scope.CurrentStudent.StudentID,
                    IsPublic: false,
                    EditRole: $scope.CurrentStudent.輔導老師 ? "輔導老師" : "紀錄者"
                };
            }

            $scope.InterviewDetial = {};
            angular.copy(rec, $scope.InterviewDetial);


            var attendeesOption = [{ Name: "學生" }, { Name: "教官" }, { Name: "輔導老師" }, { Name: "導師" },
                { Name: "任課老師" }, { Name: "家長" }, { Name: "專家" }, { Name: "醫師" },
                { Name: "社工人員" }, { Name: "其他", HasRemark: true }];
            //#region 轉換Attendees到AttendeesOption
            // [{ Name: "學生" }, { Name: "教官" }, { Name: "輔導老師" }, { Name: "導師" }, { Name: "任課老師" }, { Name: "家長" }, { Name: "專家" }, { Name: "醫師" }, { Name: "社工人員" }, { Name: "其他", HasRemark: true }]
            $scope.InterviewDetial.AttendeesOption = [];
            var list = [].concat(rec.Attendees || []);
            attendeesOption.forEach(function (opt) {
                var item = { Name: opt.Name, HasRemark: opt.HasRemark, Checked: false };
                var remove = null;
                list.forEach(function (val) {
                    if (val.Name == item.Name) {
                        item.Checked = true;
                        if (item.HasRemark) {
                            item.Remark = val.Remark;
                        }
                        remove = val;
                    }
                });
                if (remove) list.splice(list.indexOf(remove), 1);
                $scope.InterviewDetial.AttendeesOption.push(item);
            });
            //差異新增不在清單中的項目
            list.forEach(function (val) {
                var item = { Name: val.Name, HasRemark: !!val.Remark, Remark: val.Remark, Checked: true };
                $scope.InterviewDetial.AttendeesOption.push(item);
            });
            //#endregion

            //#region 轉換CounselType到CounselTypeOption
            var counselTypeOption = [{ Name: "個別晤談" }, { Name: "提供諮詢" }, { Name: "專案輔導" }, { Name: "會商處理" }, { Name: "暫時結案" }, { Name: "導師輔導" },
                { Name: "個案研究" }, { Name: "轉介", HasRemark: true }, { Name: "就醫", HasRemark: true }, { Name: "其他", HasRemark: true }];
            //{ Name: "會商處理" }, { Name: "轉介輔導" }, { Name: "提供諮詢" }, { Name: "個案研究" }, { Name: "個別晤談" },
            $scope.InterviewDetial.CounselTypeOption = [];
            var list = [].concat(rec.CounselType || []);
            counselTypeOption.forEach(function (opt) {
                var item = { Name: opt.Name, HasRemark: opt.HasRemark, Checked: false };
                var remove = null;
                list.forEach(function (val) {
                    if (val.Name == item.Name) {
                        item.Checked = true;
                        if (item.HasRemark) {
                            item.Remark = val.Remark;
                        }
                        remove = val;
                    }
                });
                if (remove) list.splice(list.indexOf(remove), 1);
                $scope.InterviewDetial.CounselTypeOption.push(item);
            });
            //差異新增不在清單中的項目
            list.forEach(function (val) {
                var item = { Name: val.Name, HasRemark: !!val.Remark, Remark: val.Remark, Checked: true };
                $scope.InterviewDetial.CounselTypeOption.push(item);
            });
            //#endregion

            //#region 轉換CounselTypeKind到CounselTypeKindOption
            var counselTypeKindOption = [{ Name: "家人議題" }, { Name: "違規行為" }, { Name: "心理困擾" }, { Name: "學習問題" }, { Name: "性別議題" },
                { Name: "人際關係" }, { Name: "生涯規劃" }, { Name: "自傷/自殺" }, { Name: "生活適應" }, { Name: "生活作息/常規" },
                { Name: "家長期望" }, { Name: "健康問題" }, { Name: "情緒不穩" }, { Name: "法定通報-兒少保護" }, { Name: "法定通報-高風險家庭" },
                { Name: "法定通報-家暴(18 歲以上)" }, { Name: "其他(含生活關懷)", HasRemark: true }];
            //{ Name: "違規" }, { Name: "遲曠" }, { Name: "學習" }, { Name: "生涯" }, { Name: "人際" },
            //{ Name: "修退轉" }, { Name: "家庭" }, { Name: "師生" }, { Name: "情感" }, { Name: "精神" },
            //{ Name: "家暴" }, { Name: "霸凌" }, { Name: "中輟" }, { Name: "性議題" }, { Name: "戒毒" },
            //{ Name: "網路成癮" }, { Name: "情緒障礙" }, { Name: "其他", HasRemark: true }
            $scope.InterviewDetial.CounselTypeKindOption = [];
            var list = [].concat(rec.CounselTypeKind || []);
            counselTypeKindOption.forEach(function (opt) {
                var item = { Name: opt.Name, HasRemark: opt.HasRemark, Checked: false };
                var remove = null;
                list.forEach(function (val) {
                    if (val.Name == item.Name) {
                        item.Checked = true;
                        if (item.HasRemark) {
                            item.Remark = val.Remark;
                        }
                        remove = val;
                    }
                });
                if (remove) list.splice(list.indexOf(remove), 1);
                $scope.InterviewDetial.CounselTypeKindOption.push(item);
            });
            //差異新增不在清單中的項目
            list.forEach(function (val) {
                var item = { Name: val.Name, HasRemark: !!val.Remark, Remark: val.Remark, Checked: true };
                $scope.InterviewDetial.CounselTypeKindOption.push(item);
            });
            //#endregion

            $scope.CurrentAction = 'ShowInterviewEditor';
        }

        //刪除晤談紀錄
        $scope.DeleteInterviewRecord = function (rec) {
            var strconfirm = confirm("將會刪除此筆晤談紀錄，並且無法回復，確定要執行刪除?");
            if (strconfirm == true) {
                gadget.getContract('ischool.counsel.v2.teacher').send({
                    service: "DeleteInterviewRecord",
                    body: { InterviewRecord: { UID: rec.UID } },
                    result: function (response, error, http) {
                        if (!response)
                            alert("DeleteInterviewRecord" + ' Error' + JSON.stringify(error));
                        else {
                            $scope.$apply(function () {
                                //重新讀取
                                $scope.SetCurrentView('Interview');
                            });
                        }
                    }
                });
            }
        }

        //點快速選項設定日期
        $scope.SetInterviewDate = function (record, date) {
            record.InterviewDate = date;
        }

        //點快速選項設定時間
        $scope.SetInterviewTime = function (record, time) {
            record.InterviewTime = time;
        }

        //點快速選項設定事由
        $scope.SetInterviewCause = function (record, cause) {
            record.Cause = cause;
        }
        //儲存輔導紀錄
        $scope.SaveInterview = function (record) {
            var rec = {};
            angular.copy(record, rec);
            //#region 轉換AttendeesOption到Attendees
            rec.Attendees = { Item: [] };
            [].concat(rec.AttendeesOption || []).forEach(function (opt) {
                if (opt.Checked) {
                    if (opt.HasRemark)
                        rec.Attendees.Item.push({ Name: opt.Name, Remark: opt.Remark });
                    else
                        rec.Attendees.Item.push({ Name: opt.Name });
                }
            });
            delete rec.AttendeesOption;
            //#endregion
            //#region 轉換CounselTypeOption到CounselType
            rec.CounselType = { Item: [] };
            [].concat(rec.CounselTypeOption || []).forEach(function (opt) {
                if (opt.Checked) {
                    if (opt.HasRemark)
                        rec.CounselType.Item.push({ Name: opt.Name, Remark: opt.Remark });
                    else
                        rec.CounselType.Item.push({ Name: opt.Name });
                }
            });
            delete rec.CounselTypeOption;
            //#endregion
            //#region 轉換CounselTypeKindOption到CounselTypeKind
            rec.CounselTypeKind = { Item: [] };
            [].concat(rec.CounselTypeKindOption || []).forEach(function (opt) {
                if (opt.Checked) {
                    if (opt.HasRemark)
                        rec.CounselTypeKind.Item.push({ Name: opt.Name, Remark: opt.Remark });
                    else
                        rec.CounselTypeKind.Item.push({ Name: opt.Name });
                }
            });
            delete rec.CounselTypeKindOption;
            //#endregion

            //驗證
            var err = "";
            if (!rec.SchoolYear || isNaN(parseInt(rec.SchoolYear)))
                err += (err ? '\n' : '') + "學年度輸入錯誤!";
            if (!rec.Semester || isNaN(parseInt(rec.Semester)))
                err += (err ? '\n' : '') + "學期輸入錯誤!";

            if (isNaN(new Date(rec.InterviewDate).getTime()))
                err += (err ? '\n' : '') + "日期格式錯誤!";
            else {
                var date = new Date(rec.InterviewDate);
                var mm = date.getMonth() + 1; // getMonth() is zero-based
                var dd = date.getDate();

                rec.InterviewDate = [
                    date.getFullYear(),
                    mm,
                    dd
                ].join('/');
            }

            if (!rec.Cause)
                err += (err ? '\n' : '') + "晤談事由不得空白!";

            if (!rec.IntervieweeType)
                err += (err ? '\n' : '') + "晤談對象不得空白!";

            if (!rec.InterviewType)
                err += (err ? '\n' : '') + "晤談方式不得空白!";

            if (rec.Attendees.Item.length == 0)
                err += (err ? '\n' : '') + "參與人員不得空白!";

            if (rec.CounselType.Item.length == 0)
                err += (err ? '\n' : '') + "處理方式不得空白!";

            if (rec.CounselTypeKind.Item.length == 0)
                err += (err ? '\n' : '') + "案件類別不得空白!";

            if (!rec.ContentDigest)
                err += (err ? '\n' : '') + "內容要點不得空白!";

            if (err) {
                alert(err);
                return;
            }

            gadget.getContract('ischool.counsel.v2.teacher').send({
                service: rec.UID ? "PutInterviewRecord" : "PushInterviewRecord",
                body: { InterviewRecord: rec },
                result: function (response, error, http) {
                    if (!response)
                        alert((rec.UID ? "PutInterviewRecord" : "PushInterviewRecord") + ' Error' + JSON.stringify(error));
                    else {
                        $scope.$apply(function () {
                            //重新讀取
                            $scope.SetCurrentView('Interview');
                        });
                    }
                }
            });
        }
        //#endregion




        gadget.getContract('ischool.counsel.v2.teacher').send({
            service: "GetStatus",
            body: '',
            result: function (response, error, http) {
                $scope.$apply(function () {
                    if (!response) {
                        $scope.initErr = '無法取得輔導學生資訊';
                    }
                    else {
                        $scope.SchoolYear = response.SchoolYear;
                        $scope.Semester = response.Semester;
                        $scope.TeacherName = response.TeacherName;
                        $scope.LoginName = response.LoginName;

                        gadget.getContract('ischool.counsel.v2.teacher').send({
                            service: "GetCounselStudent",
                            body: '',
                            result: function (response, error, http) {
                                $scope.$apply(function () {
                                    if (!response) {
                                        $scope.initErr = '無法取得輔導學生資訊.';
                                    }
                                    else if (!response.ConselStudent) {
                                        $scope.initErr = '查無輔導學生';
                                    }
                                    else {
                                        $scope.ConselStudent = [];
                                        ([].concat(response.ConselStudent || [])).forEach(function (stuRec) {
                                            stuRec["輔導老師"] = stuRec["輔導老師"] === "true";
                                            stuRec["班導師"] = stuRec["班導師"] === "true";
                                            stuRec["認輔老師"] = stuRec["認輔老師"] === "true";

                                            function padLeft(str, lenght) {
                                                if (str.length >= lenght)
                                                    return str;
                                                else
                                                    return padLeft("0" + str, lenght);
                                            }
                                            stuRec.FilterKey = stuRec.StudentNumber + "  " + stuRec.StudentName + "  " + stuRec.ClassName + padLeft(stuRec.SeatNo, 2);

                                            $scope.ConselStudent.push(stuRec);
                                        });
                                        $scope.Filter({ keyCode: 13 });
                                        $scope.init = true;
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
])
.directive('selectOnClick', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                this.select();
            });
        }
    };
});