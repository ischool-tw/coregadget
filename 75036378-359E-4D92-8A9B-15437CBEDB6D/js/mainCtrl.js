angular.module('app', ['ui.sortable', 'mgcrea.ngStrap.helpers.dimensions', 'mgcrea.ngStrap.helpers.debounce', 'monospaced.elastic'])

.controller('MainCtrl', ['$scope', '$timeout',
    function ($scope, $timeout) {
        $.material.init();


        var scope = {
            SchoolYear: '105',
            Semester: '1',
            Stage : "3",
            StageMode : "目前身分為鎖社狀態，不開放選社",
            OpenTime: "第1階段開放選社時間： 2016/12/01 00:00~ 2016/12/05 00:00",
            student: {
               ClubID :"12345456",
               ClubName:"籃球社",
               Lock: "是",
               StudentID: "123454566",
               Name: "大平台",
               Gender: "女",
               GradeYear: "3",
               DeptName: "普通科",
               SemsHistory: {},
                //所有的社團紀錄，包含以前的。
               Clubs: []

            },
            FilterClub: {
                ClubID:"28260",
                ClubName: "籃球社",
                DeptRestrict: ["普通科","舞蹈班"],
                GendertRestrict: "男",
                Grade1Limit: "20",
                Grade2Limit: "20",
                Grade3Limit: "20",
                GradeYear1Count: "20",
                GradeYear2Count: "20",
                GradeYear3Count: "20",
                Limit:"60",
                SchoolYear: "105",
                Semester: "1",
                TotalCount:"60",
                FilterKey: "籃球社"
            },
            VolunteerClub: [{
                Club: [{
                    ClubID: "28260",
                    ClubName: "籃球社",
                    DeptRestrict: ["普通科", "舞蹈班"],
                    GendertRestrict: "男",
                    Grade1Limit: "20",
                    Grade2Limit: "20",
                    Grade3Limit: "20",
                    GradeYear1Count: "20",
                    GradeYear2Count: "20",
                    GradeYear3Count: "20",
                    Limit: "60",
                    SchoolYear: "105",
                    Semester: "1",
                    TotalCount: "60",
                    FilterKey: "籃球社",
                    //志願序
                    VolunteerIndex:"1"
                }]
            }],
            CurrentClub: {
                ClubID: "28260",
                ClubName: "籃球社",
                DeptRestrict: ["普通科", "舞蹈班"],
                GendertRestrict: "男",
                Grade1Limit: "20",
                Grade2Limit: "20",
                Grade3Limit: "20",
                GradeYear1Count: "20",
                GradeYear2Count: "20",
                GradeYear3Count: "20",
                Limit: "60",
                SchoolYear: "105",
                Semester: "1",
                TotalCount: "60",
            },
            CurrentClub_info:{
            
                SchoolYear :"",
                Semester :"",
                ClubCategory :"",
                ClubNumber:"",
                TeacherName1:"",
                TeacherName2:"",
                TeacherName3 :"",
                Location: "",
                Limit: "",
                GenderRestrict: "",
                Grade1Limit: "",
                Grade2Limit: "",
                Grade3Limit: "",
                DeptRestrict_detail: "",
                About: "",
                Level:""
            },
            CurrentView: "",            
        };

        var dicClub = {};

        var dicClub_Log = {};
        //var dicClub = [];

        //dicClub['籃球社'] = { ClubName: '籃球社', Limit: '60', TotalCount: '35' }
        //dicClub['桌球社'] = { ClubName: '桌球社', Limit: '40', TotalCount: '25' }
        //dicClub['羽球社'] = { ClubName: '羽球社', Limit: '55', TotalCount: '15' }
        //dicClub['壁球社'] = { ClubName: '壁球社', Limit: '65', TotalCount: '17' }

        //$scope.FilterClub = ['籃球社','桌球社','羽球社','壁球社']

        $scope.FilterClub = dicClub;

        $scope.VolunteerClub = [];

        var VolunteerClub_Log = [];

        $scope.VolunteerClub_Is_Changed = false;

        $scope.VolunteerClub_Changed_Record_Is_Saved = false;
        
        //$scope.CurrentView = "OriSet";

        $scope.ClubFilter = { Filter: '' };

        $scope.Filter = function (event) {
            if (event && (event.keyCode !== 13)) return;            
            var ClubList = {};
            var filter = new RegExp($scope.ClubFilter.Filter || "");
            for (var index in dicClub) {
                if (filter.test(dicClub[index].FilterKey))
                {
                    ClubList[dicClub[index].ClubName] = dicClub[index];

                }                
            }
            $scope.FilterClub = ClubList;
        };

        $scope.BeforeSetCurrent = function (ClubRec) {

            $scope.VolunteerClub_Is_Changed = false;
            for (var index in $scope.VolunteerClub) {

                if (VolunteerClub_Log[index]) {
                    if ($scope.VolunteerClub[index].VolunteerIndex != VolunteerClub_Log[index].VolunteerIndex) {
                        $scope.VolunteerClub_Is_Changed = true;

                    }
                    else {

                    }
                }
                else {
                    $scope.VolunteerClub_Is_Changed = true;
                }
            }

            if (VolunteerClub_Log.length > $scope.VolunteerClub.length) {

                $scope.VolunteerClub_Is_Changed = true;
            }

            if ($scope.VolunteerClub_Is_Changed && !$scope.VolunteerClub_Changed_Record_Is_Saved) {
                if (confirm("社團志願序已改變但尚未儲存，現在離開不會儲存更動，確定要離開?" )) {

                    $scope.VolunteerClub_Is_Changed = false;
                    $scope.VolunteerClub_Changed_Record_Is_Saved = false;
                    $scope.SetCurrent(ClubRec);
                }
                else {


                }
            }
            else {

                $scope.VolunteerClub_Is_Changed = false;
                $scope.VolunteerClub_Changed_Record_Is_Saved = false;
                $scope.SetCurrent(ClubRec);
            }            
        }




        $scope.SetCurrent = function (ClubRec) {
            $scope.CurrentClub = ClubRec;
            $scope.CurrentTitle = ClubRec.ClubName;
            $scope.SetCurrentView('Club_Detail');
            $scope.GetChoose_Club();
        }

        $scope.SetCurrentView = function (view) {
            if (view)
                $scope.CurrentView = view;

            //選社志願
            if ($scope.CurrentView == "Choose_Club")
            {
                $scope.CurrentTitle = "選社志願";
                $scope.GetChoose_Club();
            }
            //社團成績
            if ($scope.CurrentView == "My_Club")
            {
                $scope.CurrentTitle = "社團成績";
                //$scope.GetMy_Club();
            }
            //社團詳細資料
            if ($scope.CurrentView == "Club_Detail") {
                $scope.GetClub_Detail($scope.CurrentClub);
            }               
        };

        $scope.SetVolunteerClubUp = function (ClubRec) {   
            for (var index in $scope.VolunteerClub) {
                if (parseInt($scope.VolunteerClub[index].VolunteerIndex) == parseInt(ClubRec.VolunteerIndex) - 1) {
                   $scope.VolunteerClub[index].VolunteerIndex = parseInt($scope.VolunteerClub[index].VolunteerIndex)+1;
                }
            }            
            for (var index in $scope.VolunteerClub) {
                if ($scope.VolunteerClub[index].ClubID == ClubRec.ClubID && ClubRec.VolunteerIndex != 1) {
                    $scope.VolunteerClub[index].VolunteerIndex = parseInt(ClubRec.VolunteerIndex) - 1;
                }
            }
            $scope.VolunteerClub.sort(function (a, b) {
                return a.VolunteerIndex - b.VolunteerIndex;
            });

        }

        $scope.SetVolunteerClubDown = function (ClubRec) {
            for (var index in $scope.VolunteerClub) {
                if (parseInt($scope.VolunteerClub[index].VolunteerIndex) == parseInt(ClubRec.VolunteerIndex) + 1) {
                    $scope.VolunteerClub[index].VolunteerIndex = parseInt($scope.VolunteerClub[index].VolunteerIndex) - 1;
                }
            }
            for (var index in $scope.VolunteerClub) {
                if ($scope.VolunteerClub[index].ClubID == ClubRec.ClubID && ClubRec.VolunteerIndex != $scope.Max_Wish_Count && parseInt(ClubRec.VolunteerIndex) != $scope.VolunteerClub.length) {
                    $scope.VolunteerClub[index].VolunteerIndex = parseInt(ClubRec.VolunteerIndex) + 1;
                }
            }
            $scope.VolunteerClub.sort(function (a, b) {
                return a.VolunteerIndex - b.VolunteerIndex;
            });

        
        }
        
        $scope.RemoveVolunteerClub = function (ClubRec) {
            var ClubList = [];
            for (var index in $scope.VolunteerClub) {
                if (parseInt($scope.VolunteerClub[index].VolunteerIndex) > parseInt(ClubRec.VolunteerIndex) ) {
                    $scope.VolunteerClub[index].VolunteerIndex = parseInt($scope.VolunteerClub[index].VolunteerIndex) - 1;
                }
            }
            for (var index in $scope.VolunteerClub) {
                if ($scope.VolunteerClub[index].ClubID == ClubRec.ClubID) {
                    delete $scope.VolunteerClub[index];                    
                }
            }
            for (var index in $scope.VolunteerClub) {
              
                ClubList.push($scope.VolunteerClub[index]);
            }

            $scope.VolunteerClub = ClubList;

            $scope.VolunteerClub.sort(function (a, b) {
                return a.VolunteerIndex - b.VolunteerIndex;
            });

            $scope.VolunteerClub_Changed_Record_Is_Saved = false;

        }

        //#region 儲存志願序
        $scope.SaveVolunteerClubList = function () {
            var volunteer = [];
            for (var index in $scope.VolunteerClub) {
                volunteer.push({
                    '@': ['Index', 'Ref_Club_ID'],
                    'Index': parseInt(index) + 1,
                    'Ref_Club_ID': $scope.VolunteerClub[index].ClubID
                });
            }
            gadget.getContract('ischool.universal_club_v2.student').send({
                service: "_.SetVolunteer",
                body: { Request: { Volunteer: { Content: { xml: { Club: volunteer } } } } },
                result: function (response, error, http) {
                    if (error !== null) {
                        alert('SetVolunteer' + JSON.stringify(error));
                        $scope.VolunteerClub_Changed_Record_Is_Saved = true;
                    } else {             
                        alert('儲存志願序成功');
                        $scope.VolunteerClub_Changed_Record_Is_Saved = true;
                    }
                }
            });
        };
        //#endregion

        $scope.AlreadyInVolunteer = function (CurrentClub_info) {
            var InVolunteer = false;
            if (CurrentClub_info) {
                for (var index in $scope.VolunteerClub) {
                    if ($scope.VolunteerClub[index].ClubID == CurrentClub_info.ClubID) {
                        InVolunteer = true;
                    }
            }            
            }
            return InVolunteer;
        }
        $scope.AddNewVolunteerClub = function (CurrentClub_info) {
            $scope.GetChoose_Club(function () {
                var IsNewVoluteerClub = true;
                var new_volunteer_club = [];
                for (var index in $scope.VolunteerClub) {
                    if ($scope.VolunteerClub[index].ClubID == CurrentClub_info.ClubID) {
                        IsNewVoluteerClub = false;
                    }
                }

                if ($scope.VolunteerClub.length < $scope.Max_Wish_Count && IsNewVoluteerClub) {
                    for (var index in dicClub) {
                        if (dicClub[index].ClubID == CurrentClub_info.ClubID) {
                            dicClub[index].VolunteerIndex = parseInt($scope.VolunteerClub.length) + 1;
                            $scope.VolunteerClub.push(dicClub[index]);
                        }
                    }
                    $scope.SaveVolunteerClubList();
                }
                else {
                    if (!IsNewVoluteerClub) {
                        alert('本社團已加入志願序清單，請勿重覆加入志願');
                    }
                    else {
                        alert('已達到選填志願數上限:' + $scope.Max_Wish_Count);
                    }
                }
            });                
        }

        
        $scope.RemoveOldVolunteerClub = function (CurrentClub_info) {
            $scope.GetChoose_Club(function () {
                var ClubList = [];
                var ClubRec = {};
                for (var index in $scope.VolunteerClub) {
                    if ($scope.VolunteerClub[index].ClubID == CurrentClub_info.ClubID) {
                        ClubRec = $scope.VolunteerClub[index];
                    }
                }
                for (var index in $scope.VolunteerClub) {
                    if (parseInt($scope.VolunteerClub[index].VolunteerIndex) > parseInt(ClubRec.VolunteerIndex)) {
                        $scope.VolunteerClub[index].VolunteerIndex = parseInt($scope.VolunteerClub[index].VolunteerIndex) - 1;
                    }
                }
                for (var index in $scope.VolunteerClub) {
                    if ($scope.VolunteerClub[index].ClubID == ClubRec.ClubID) {
                        delete $scope.VolunteerClub[index];
                    }
                }
                for (var index in $scope.VolunteerClub) {

                    ClubList.push($scope.VolunteerClub[index]);
                }
                $scope.VolunteerClub = ClubList;
                $scope.VolunteerClub.sort(function (a, b) {
                    return a.VolunteerIndex - b.VolunteerIndex;
                });
                $scope.SaveVolunteerClubList();
            });

        }

        
        $scope.ChooseClub = function (CurrentClub_info) {
            var IsNewClub = true;
            if ($scope.student.ClubID == CurrentClub_info.ClubID) {            
                IsNewClub = false;
            }
            if ($scope.student.ClubID) {
                if (confirm("目前已經加入:" + $scope.student.ClubName + "，確定要轉加入:" + CurrentClub_info.ClubName + "嗎? 將會刪除原本社團選社紀錄")) {
                    if (CurrentClub_info.ClubID && IsNewClub) {
                        gadget.getContract('ischool.universal_club_v2.student').send({
                            service: "_.SetMyClub",
                            body: '<Request><SCJoin><ClubID>' + CurrentClub_info.ClubID + '</ClubID></SCJoin></Request>',
                            result: function (response, error, http) {
                                if (error !== null) {
                                    //alert('SetMyClub' + JSON.stringify(error));
                                    alert('錯誤:' +error.dsaError.message);
                                } else {
                                    alert("已從" + $scope.student.ClubName + "轉加入" + CurrentClub_info.ClubName + "成功");
                                    location.reload();
                                }
                            }
                        });
                    } else {
                        if (!IsNewClub) {
                            alert('本社團已加入，請勿重覆加入');
                        }
                        else {
                            alert('加入社團的資料不正確，請重新操作!' + JSON.stringify(error));
                        }
                    }
                }
            }
            else {
                if (CurrentClub_info.ClubID && IsNewClub) {
                    gadget.getContract('ischool.universal_club_v2.student').send({
                        service: "_.SetMyClub",
                        body: '<Request><SCJoin><ClubID>' + CurrentClub_info.ClubID + '</ClubID></SCJoin></Request>',
                        result: function (response, error, http) {
                            if (error !== null) {
                                alert('SetMyClub' + JSON.stringify(error));
                            } else {
                                alert("加入" + CurrentClub_info.ClubName + "成功");
                                location.reload();
                            }
                        }
                    });
                } else {
                    if (!IsNewClub) {
                        alert('本社團已加入，請勿重覆加入');
                    }
                    else {
                        alert('加入社團的資料不正確，請重新操作!' + JSON.stringify(error));
                    }
                }
            }
        }

        $scope.RemoveClub = function (CurrentClub_info) {
            if ($scope.student.ClubID) {
                if (confirm("目前已經加入:" + $scope.student.ClubName + "，確定要退選嗎? 將會刪除此社團選社紀錄")) {
                    gadget.getContract('ischool.universal_club_v2.student').send({
                            service: "_.RemoveClub",
                            body: '<Request><SCJoin><ClubID>' + $scope.student.ClubID + '</ClubID></SCJoin></Request>',
                            result: function (response, error, http) {
                                if (error !== null) {
                                    alert('RemoveClub' + JSON.stringify(error));
                                } else {
                                    alert("已從" + $scope.student.ClubName + "退選成功");
                                    location.reload();
                                }
                            }
                        });                   
                }
            }
            else {
                alert('加入社團的資料不正確，請重新操作!' + JSON.stringify(error));               
           }
        }


        $scope.ClearCurrentClub = function () {
            delete $scope.CurrentClub;
            delete $scope.CurrentView;
        }

        $scope.GetChoose_Club = function (next) {
            // TODO: 取得選社志願
            gadget.getContract('ischool.universal_club_v2.student').send({
                service: "_.GetVolunteer",
                body: { Request: { Condition: { SchoolYear: SchoolYear, Semester: Semester } } },
                result: function (response, error, http) {
                    if (error !== null) {
                        alert('GetVolunteer' + JSON.stringify(error));            
                    } else {
                        if (response.Response.Volunteer && response.Response.Volunteer.Content
                            && response.Response.Volunteer.Content.xml
                            && response.Response.Volunteer.Content.xml.Club) {

                            var ClubList = [];
                            var ClubList_Log = [];

                            $(response.Response.Volunteer.Content.xml.Club).each(function (index, item) {
                                for (var index in dicClub) {
                                    if (dicClub[index].ClubID == item.Ref_Club_ID)
                                    {
                                        dicClub[index].VolunteerIndex = item.Index;
                                        dicClub_Log[index].VolunteerIndex = item.Index;
                                        ClubList.push(dicClub[index]);                                        
                                        ClubList_Log.push(dicClub_Log[index]);
                                    }                
                                }
                            });

                            VolunteerClub_Log = ClubList_Log;

                            $scope.$apply(function () {
                                $scope.VolunteerClub = ClubList;

                                

                                if (next) {
                                    next();
                                }
                            });
                        }
                    }
                }
            });          
        }

        $scope.GetClub_Detail = function (ClubRec)
        {
            gadget.getContract('ischool.universal_club_v2.student').send({
                service: "_.GetClubInfo",
                body: '<Request><ClubID>' + ClubRec.ClubID + '</ClubID></Request>',
                result: function (response, error, http) {
                    if (error !== null) {
                        set_error_message("#mainMsg", "GetClubInfo", error);
                    } else {
                        if (response.Response.ClubRecord) {
                            $scope.$apply(function () {
                                $scope.CurrentClub_info = response.Response.ClubRecord;
                                if ($scope.CurrentClub_info.Limit == "") {
                                    $scope.CurrentClub_info.Limit = "無限制";
                                }
                                if ($scope.CurrentClub_info.GenderRestrict=="") {
                                    $scope.CurrentClub_info.GenderRestrict = "無限制";
                                }
                                if ($scope.CurrentClub_info.Grade1Limit == "") {
                                    $scope.CurrentClub_info.Grade1Limit = "無限制";
                                }
                                if ($scope.CurrentClub_info.Grade2Limit == "") {
                                    $scope.CurrentClub_info.Grade2Limit = "無限制";
                                }
                                if ($scope.CurrentClub_info.Grade3Limit == "") {
                                    $scope.CurrentClub_info.Grade3Limit = "無限制";
                                }
                                $scope.CurrentClub_info.DeptRestrict_detail = "";
                                $(response.Response.ClubRecord.DeptRestrict.Department.Dept).each(function (index, item) {                                 
                                    $scope.CurrentClub_info.DeptRestrict_detail += item;
                                    if (index + 1 < response.Response.ClubRecord.DeptRestrict.Department.Dept.length) {
                                        $scope.CurrentClub_info.DeptRestrict_detail += "、";
                                    }
                                }
                                )
                                if (response.Response.ClubRecord.DeptRestrict_detail == "") {
                                    $scope.CurrentClub_info.DeptRestrict_detail = "無限制";
                                }
                            });
                        }
                        //$(response.Response.ClubRecord).each(function (index, item) {
                        //    $.each(item, function (key, value) {

                        //        $scope.$apply(function () {
                                    
                        //            $scope.CurrentClub_info=value;
                        //        });

                        //    });                            
                        //});
                    }
                }
            });
        }       
        var SchoolYear = '';
        var Semester = '';
        var Opening = "no";

        $scope.Max_Wish_Count = "";
        $scope.OpenTime = "";
        $scope.StageMode = "";
        $scope.Stage = "";        

        // TODO: 取得個人資料
        gadget.getContract('ischool.universal_club_v2.student').send({
            service: "_.GetMyBaseInfo",
            body: '',
            result: function (response, error, http) {
                if (error !== null) {
                    set_error_message("#mainMsg", "GetMyBaseInfo", error);
                } else {
                    $(response.Response.Student).each(function (index, item) {
                        Student = {
                            StudentID: item.StudentID,
                            Name: item.Name,
                            Gender: item.Gender,
                            GradeYear: item.GradeYear,
                            DeptName: item.DeptName,
                            SemsHistory: {},
                            Clubs: []
                        };
                        // TODO: 設定年級對應學年度的預設值
                        var tmp_y = 0;
                        for (var i = Student.GradeYear; i <= 3; i++) {
                            Student.SemsHistory['GS' + i + '1'] = parseInt(SchoolYear, 10) + tmp_y + ''; //上學期
                            Student.SemsHistory['GS' + i + '2'] = parseInt(SchoolYear, 10) + tmp_y + ''; //下學期
                            tmp_y += 1;
                        }
                        // TODO: 覆寫年級對應學年度，處理學生重讀
                        var tmp_alias;
                        $(item.SemsHistory.History).each(function (index, item) {
                            tmp_alias = 'GS' + item.GradeYear + item.Semester;
                            Student.SemsHistory[tmp_alias] = Student.SemsHistory[tmp_alias] || 0;
                            if (parseInt(item.SchoolYear, 10) > parseInt(Student.SemsHistory[tmp_alias], 10)) {
                                Student.SemsHistory[tmp_alias] = item.SchoolYear;
                            }
                        });
                    });
                    $scope.$apply(function () {
                        $scope.student = Student;
                    });                                        
                    // TODO: 取得開放時間
                    gadget.getContract('ischool.universal_club_v2.student').send({
                        service: "_.GetOpeningHours",                        
                        body: '<Request><GradeYear>' + $scope.student.GradeYear + '</GradeYear></Request>',
                        result: function (response, error, http) {
                            $scope.$apply(function () {
                                if (error !== null) {                                    
                                    alert('GetOpeningHours Error' + JSON.stringify(error));
                                } else {
                                    $(response.Response.OpeningHours).each(function (index, item) {

                                        if (item.Startdate1 && item.Enddate1) {
                                            var tmp_Date = new Date();
                                            var Startdate = new Date(item.Startdate1);
                                            var Enddate = new Date(item.Enddate1);

                                            if (Startdate <= tmp_Date && Enddate >= tmp_Date) {

                                                Opening = "yes";
                                                $scope.Stage = "1";
                                                $scope.OpenTime = "第1階段開放選社時間：" + $.formatDate(Startdate, "yyyyMMdd") + " " + $.formatDate(Startdate, "HHmm") + " ~ " + $.formatDate(Enddate, "yyyyMMdd") + " " + $.formatDate(Enddate, "HHmm");
                                                $scope.StageMode = "模式:"+item.Stage1_Mode;

                                            } else if (tmp_Date < Startdate || tmp_Date > Enddate) {

                                                Opening = "no";
                                                $scope.Stage = "3";
                                                $scope.OpenTime="目前未開放選社"
                                            }
                                        }
                                         if (item.Startdate2 && item.Enddate2) {                                        
                                            var tmp_Date = new Date();
                                            var Startdate = new Date(item.Startdate2);
                                            var Enddate = new Date(item.Enddate2);
                                            if (Startdate <= tmp_Date && Enddate >= tmp_Date) {
                                                Opening = "yes";
                                                $scope.Stage = "2";
                                                $scope.OpenTime = "第2階段開放選社時間：" + $.formatDate(Startdate, "yyyyMMdd") + " " + $.formatDate(Startdate, "HHmm") + " ~ " + $.formatDate(Enddate, "yyyyMMdd") + " " + $.formatDate(Enddate, "HHmm");
                                                $scope.StageMode = "模式:" + item.Stage2_Mode;
                                            } else if (tmp_Date < Startdate || tmp_Date > Enddate  ) {
                                                if ($scope.Stage != 1) {
                                                    Opening = "no";
                                                    $scope.Stage = "3";
                                                    $scope.OpenTime = "目前未開放選社"
                                                }                                                
                                            }
                                        }
                                         if (!item.Startdate1 && !item.Enddate1 && !item.Startdate2 && !item.Enddate2) {
                                             $scope.OpenTime = "開放選社時間：未指定"
                                             Opening = "no";
                                             $scope.Stage = "3";
                                        }                                                                                   
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });

        // TODO: 可選志願數  
        gadget.getContract('ischool.universal_club_v2.student').send({
            service: "_.GetConfig",
            body: '<Request><Condition><ConfigName>學生選填志願數</ConfigName></Condition></Request>',
            result: function (response, error, http) {
                $scope.$apply(function () {
                    if (error !== null) {
                        alert('GetConfig' + JSON.stringify(error));                        
                    } else {
                        if (response.Response.Config && response.Response.Config.Content) {
                            _maxCount = parseInt(response.Response.Config.Content, 10) || 0;
                            $scope.Max_Wish_Count = _maxCount;
                        }
                    }
                });
                }
        });

        // TODO: 取得目前學年度學期
        gadget.getContract('ischool.universal_club_v2.student').send({
            service: "_.GetCurrentSemester",
            body: '',
            result: function (response, error, http) {
                $scope.$apply(function () {
                    if (error !== null) {
                        alert('GetCurrentSemester' + JSON.stringify(error));                        
                    } else {
                        $(response.Result.SystemConfig).each(function (index, item) {
                            $scope.SchoolYear = item.DefaultSchoolYear;
                            $scope.Semester = item.DefaultSemester;
                            SchoolYear = item.DefaultSchoolYear;
                            Semester = item.DefaultSemester;
                        });
                    }                    
                });

                // TODO: 目前學年度學期社團資料(已過濾性別、總人數=0、科別條件，未過濾年級人數)
                gadget.getContract('ischool.universal_club_v2.student').send({
                    service: "_.GetAllClubs",
                    body: '<Request><SchoolYear>' + SchoolYear + '</SchoolYear><Semester>' + Semester + '</Semester></Request>',
                    result: function (response, error, http) {
                        if (error !== null) {
                            alert('GetAllClubs' + JSON.stringify(error));                            
                        } else {
                            //var tmp_show;
                            //var sortlist = [];
                            //resetData();
                            $(response.Response.ClubRecord).each(function (index, item) {

                                $scope.$apply(function () {

                                    item.FilterKey = item.ClubName;

                                    dicClub[item.ClubName] = item;

                                    dicClub_Log[item.ClubName] = item;
                                    
                                });
                                // 舊的Code 目前用不到，先註解起來，日後研究。
                                //tmp_show = "false";
                                //if (student.Lock === '是') {
                                //    if (student.ClubID === item.ClubID) {
                                //        tmp_show = "true";
                                //    }
                                //} else {
                                //    if (item['Grade' + Student.GradeYear + 'Limit']) {
                                //        tmp_show = (parseInt(item['Grade' + Student.GradeYear + 'Limit'], 10) == 0) ? "false" : "true";
                                //    } else {
                                //        tmp_show = "true";
                                //    }
                                //}

                                //if (tmp_show === "true") {
                                //    if (!Clubs[index]) {
                                //        Clubs[index] = item;
                                //        item.getInfo = "false";
                                //    }
                                //}

                                //if ($.inArray(item.ClubID, _chooseClub) !== -1) {
                                //    sortlist[$.inArray(item.ClubID, _chooseClub)] = '' +
                                //        '<li id="' + item.ClubID + '">' +
                                //        '<a href="javascript:$(\'#club-list li[club-id=' + item.ClubID + '] a\').click();">' +
                                //        (item.ClubName || '') +
                                //        '</a>';

                                //    sortlist[$.inArray(item.ClubID, _chooseClub)] += (Opening === 'yes') ? '<i class="icon-resize-vertical pull-right"></i></li>' : '';
                                //}

                            });
                            $(response.Response.ClubRecord).each(function (index, item) {

                                $scope.$apply(function () {

                                    item.FilterKey = item.ClubName;

                                    dicClub[item.ClubName] = item;

                                    dicClub_Log[item.ClubName] = item;
                                   
                                });
                            });

                            // TODO: 取得選社志願
                            gadget.getContract('ischool.universal_club_v2.student').send({
                                service: "_.GetVolunteer",
                                body: { Request: { Condition: { SchoolYear: SchoolYear, Semester: Semester } } },
                                result: function (response, error, http) {
                                    if (error !== null) {
                                        alert('GetVolunteer' + JSON.stringify(error));                                        
                                    } else {
                                        if (response.Response.Volunteer && response.Response.Volunteer.Content
                                            && response.Response.Volunteer.Content.xml
                                            && response.Response.Volunteer.Content.xml.Club) {

                                            var ClubList = [];
                                            var ClubList_Log = [];

                                            $(response.Response.Volunteer.Content.xml.Club).each(function (index, item) {
                                                for (var index in dicClub) {
                                                    if (dicClub[index].ClubID == item.Ref_Club_ID) {
                                                        dicClub[index].VolunteerIndex = item.Index;
                                                        dicClub_Log[index].VolunteerIndex = item.Index;
                                                        ClubList.push(dicClub[index]);
                                                        ClubList_Log.push(dicClub_Log[index]);
                                                    }
                                                }
                                                //_chooseClub.push(cid);
                                            });

                                            VolunteerClub_Log = ClubList_Log;

                                            $scope.$apply(function () {
                                                $scope.VolunteerClub = ClubList;

                                                
                                                //if (next) {
                                                //    next();

                                                //}
                                            });
                                        }
                                    }
                                }
                            });

                            //if (Clubs.length === 0) {
                            //    $("#filter-keyword").addClass("disabled").attr("disabled", "disabled");
                            //    $("#club-list .tabbable").html("目前無社團");
                            //    $("div[data-type] tbody").html("目前無社團");
                            //    $("div[data-type=summary] .my-widget-content").html("目前無社團");
                            //} else {
                            //    $('#sortable').append(sortlist.join(''));
                            //    resetClubList();
                            //    SetClubRecord();
                            //}
                        }
                    }
                });

                // TODO: 取得所有學年度學期個人選社資料
                gadget.getContract('ischool.universal_club_v2.student').send({
                    service: "_.GetMyClub",
                    body: '',
                    result: function (response, error, http) {
                        if (error !== null) {
                            alert('GetMyClub' + JSON.stringify(error));                            
                        } else {
                            $(response.Response.Clubs).each(function (index, item) {
                                var tmp_cadreName = '';
                                if (item.ClubID) {
                                    var tmp_cn = item.CadreName.split(',');
                                    $(tmp_cn).each(function (key, value) {
                                        if (value) {
                                            if (tmp_cadreName) tmp_cadreName += ', ';
                                            tmp_cadreName += value;
                                        }
                                    });
                                    $scope.student.Clubs[index] = {
                                        'SchoolYear': item.SchoolYear,
                                        'Semester': item.Semester,
                                        'ClubName': item.ClubName,
                                        'TeacherName1': item.TeacherName1,
                                        'Lock': item.Lock,
                                        'Score': item.Score,
                                        'CadreName': tmp_cadreName,
                                        'ResultScore': item.ResultScore
                                    };
                                } else {
                                    var tmp_cn = item.RSCadreName.split(',');
                                    $(tmp_cn).each(function (key, value) {
                                        if (value) {
                                            if (tmp_cadreName) tmp_cadreName += ', ';
                                            tmp_cadreName += value;
                                        }
                                    });
                                    // TODO: 轉學生未連結選社紀錄
                                    $scope.student.Clubs[index] = {
                                        'SchoolYear': item.RSSchoolYear,
                                        'Semester': item.RSSemester,
                                        'ClubName': item.RSClubName,
                                        'TeacherName1': '',
                                        'Lock': '否',
                                        'Score': '',
                                        'CadreName': tmp_cadreName,
                                        'ResultScore': item.ResultScore
                                    };
                                }
                                // 現在學年度、學期社團
                                if (item.SchoolYear === SchoolYear && item.Semester === Semester) {
                                    $scope.student.ClubID = item.ClubID;
                                    $scope.student.ClubName = item.ClubName;
                                    $scope.student.Lock = item.Lock;
                                }
                                if ($scope.student.Lock == "是") {
                                    $scope.Stage = "3";
                                    $scope.StageMode = "目前身分為鎖社狀態，不開放選社";
                                    $scope.OpenTime = ""
                                }
                            });
                        }
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