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
            InterviewTypeOption: ["面談", "電話", "家訪", "電子信箱", "聯絡簿", "其他"],
                       
        };

        $scope.student =
            {
                Name: '',
                Grade_Year:'',
            }


        $scope.MappingOverallRecordTable = [
            {
                Title: '綜合紀錄表--本人概況',
                Minimized: false,
                GetStatus: function () { },
                Save: function () { },
                Minimize: function () {
                    this.Minimized = true;                                        
                },
                Maximize: function () {
                    this.Minimized = false;
                },
                Question: [
                        {
                            Title: '血型',
                            Type: '單選',
                            Key: '本人概況_血型',
                            Option: [{ Name: 'A', Value: '' }, { Name: 'B', Value: '' }, { Name: 'O', Value: '' }, { Name: 'AB', Value: '' }, { Name: '其他',Value:'',RemarkValue:'', HasRemark: true }]
                        },
                        {
                            Title: '宗教',
                            Type: '單選',
                            Key: '本人概況_宗教',
                            Option: [{ Name: '無', Value: '' }, { Name: '佛教', Value: '' }, { Name: '基督教', Value: '' }, { Name: '天主教', Value: '' }, { Name: '回教', Value: '' }, { Name: '道教', Value: '' }]
                        },
                        {
                            Title: '原住民血統',
                            Type: '單選',
                            Key: '本人概況_原住民血統',
                            Option: [{ Name: '無', Value: '' }, { Name: '有' ,Value: '',Relation:'',Race:''}]
                        },
                        {
                            Title: '生理缺陷',
                            Type: '多選',
                            Key: '本人概況_生理缺陷',
                            Option: [{ Name: '無', Checked: false }, { Name: '近視', Checked: false }, { Name: '其它視覺障礙', Checked: false }, { Name: '聽覺障礙', Checked: false }, { Name: '肢體障礙', Checked: false }, { Name: '其它', Checked: false,RemarkValue:'', HasRemark: true }]
                        },
                        {
                            Title: '特殊疾病',
                            Type: '多選',
                            Key: '本人概況_曾患特殊疾病',
                            Option: [{ Name: '無', Checked: false }, { Name: '腦炎', Checked: false }, { Name: '癲癇', Checked: false }, { Name: '心臟病', Checked: false }, { Name: '小兒麻痺', Checked: false }, { Name: '氣喘', Checked: false }, { Name: '過敏症', Checked: false }, { Name: '肺結核', Checked: false }, { Name: '其它', Checked: false, RemarkValue: '', HasRemark: true }]
                        },
                        {
                            Title: '身高體重',
                            Type: '6SemeasterData單選填答',
                            TableTitle: ['項目', '1上', '1下', '2上', '2下', '3上', '3下'],
                            TotalWillingTitle: [
                                { Name: '身高(cm)', Key: '本人概況_身高', Option: [], SemesterCounter: [{ Semester: 's1a' }, { Semester: 's1b' }, { Semester: 's2a' }, { Semester: 's2b' }, { Semester: 's3a' }, { Semester: 's3b' }, ], IsSelect: false },
                                { Name: '體重(kg)', Key: '本人概況_體重', Option: [], SemesterCounter: [{ Semester: 's1a' }, { Semester: 's1b' }, { Semester: 's2a' }, { Semester: 's2b' }, { Semester: 's3a' }, { Semester: 's3b' }, ], IsSelect: false }
                            ],
                            Option: ['身高', '體重']
                        }
                ]
            },
            {
                Title: '綜合紀錄表--家庭狀況',
                Minimized: false,
                GetStatus: function () { },
                Save: function () { },
                Minimize: function () {
                    this.Minimized = true;
                },
                Maximize: function () {
                    this.Minimized = false;
                },
                Question: [
                    {
                        Title: '監護人',
                        Type: '單選填答',
                        Option: [
                            { Name: '監護人姓名', Key: '家庭狀況_監護人_姓名' },
                            { Name: '監護人性別', Key: '家庭狀況_監護人_性別' },
                            { Name: '監護人電話', Key: '家庭狀況_監護人_電話' },
                            { Name: '監護人關係', Key: '家庭狀況_監護人_關係' },
                            { Name: '監護人通訊地址', Key: '家庭狀況_監護人_通訊地址' }]
                    },
                    {
                        Title: '直系血親',
                        Type: 'Consanguinity單選',
                        TableTitle: [{ Name: '稱謂', Width: 'width: 10%' }, { Name: '姓名', Width: 'width: 10%' }, { Name: '存歿', Width: 'width: 10%' }, { Name: '出生年', Width: 'width: 10%' }, { Name: '職業', Width: 'width: 10%' }, { Name: '工作機構', Width: 'width: 10%' }, { Name: '職稱', Width: 'width: 10%' }, { Name: '教育程度', Width: 'width: 10%' }, { Name: '電話', Width: 'width: 10%' }, { Name: '原國籍', Width: 'width: 10%' }, { Name: '行動電話', Width: 'width: 10%' }],
                        TotalWillingTitle: [
                            { Title: '稱謂', Option: [{ Name: '' }, { Name: '父' }, { Name: '母' }, { Name: '祖父' }, { Name: '祖母' }, { Name: '曾祖父' }, { Name: '曾祖母' }], IsSelect: true },
                            { Title: '姓名', },
                            { Title: '存歿', Option: [{ Name: '' }, { Name: '存' }, { Name: '歿' }], IsSelect: true },
                            { Title: '出生年', },
                            { Title: '職業', },
                            { Title: '工作機構', },
                            { Title: '職稱', },
                            { Title: '教育程度', Option: [{ Name: '' }, { Name: '不識字' }, { Name: '識字(未就學)' }, { Name: '小學' }, { Name: '初中(職)' }, { Name: '高中(職)' }, { Name: '專科' }, { Name: '學士' }, { Name: '碩士' }, { Name: '博士' }], IsSelect: true },
                            { Title: '電話', },
                            { Title: '原國籍', },
                            { Title: '行動電話', }
                        ],
                        ConsanguinityCounter: [{ IsEmpty: true }, { IsEmpty: true }, { IsEmpty: true }, { IsEmpty: true }]
                    },
                    {
                        Title: '兄弟姊妹',
                        Key: '家庭狀況_兄弟姊妹_排行',
                        Type: '單選',                       
                        Option: [{ Name: '我是獨子' }, { Name: '我有兄弟姊妹，我排行第', HasRemark: true }]
                    },
                    {
                        Title: '',
                        Type: 'Sibling單選',
                        TableTitle: ['稱謂','姓名','畢業學校', '出生年', '備註'],                        
                        Option: [],
                        SiblingCounter: [{ IsEmpty: true }, { IsEmpty: true }, { IsEmpty: true }, { IsEmpty: true }]
                    },
                    {
                        Title: '其他項目',
                        Type: '3YearsData單選',
                        TableTitle: ['項目','1年級', '2年級', '3年級'],
                        TotalWillingTitle: [
                            {
                                Name: '父母關係', Key: '家庭狀況_父母關係', Option: [{ Name: '' }, { Name: '同住' }, { Name: '分住' }, { Name: '分居' }, { Name: '離婚' }, { Name: '單親-父' }, { Name: '單親-母' }, { Name: '單親-其他親屬' }, { Name: '特殊監護' }],
                                GradesCounter: [{ Grade: '1', }, { Grade: '2', }, { Grade: '3', }],
                                IsSelect: true
                            },
                            {
                                Name: '家庭氣氛', Key: '家庭狀況_家庭氣氛', Option: [{ Name: '' }, { Name: '很和諧' }, { Name: '和諧' }, { Name: '普通' }, { Name: '不和諧' }, { Name: '很不和諧' }],
                                GradesCounter: [{ Grade: '1', }, { Grade: '2', }, { Grade: '3', }],
                                IsSelect: true
                            },
                            {
                                Name: '父親管教方式', Key: '家庭狀況_父親管教方式', Option: [{ Name: '' }, { Name: '民主式' }, { Name: '權威式' }, { Name: '放任式' }],
                                GradesCounter: [{ Grade: '1', }, { Grade: '2', }, { Grade: '3', }],
                                IsSelect: true
                            },
                            {
                                Name: '母親管教方式', Key: '家庭狀況_母親管教方式', Option: [{ Name: '' }, { Name: '民主式' }, { Name: '權威式' }, { Name: '放任式' }],
                                GradesCounter: [{ Grade: '1', }, { Grade: '2', }, { Grade: '3', }],
                                IsSelect: true
                            },
                            {
                                Name: '居住環境', Key: '家庭狀況_居住環境', Option: [{ Name: '' }, { Name: '住宅區' }, { Name: '商業區' }, { Name: '混和(住商工)區' }, { Name: '軍眷區' }, { Name: '農村' }, { Name: '漁村' }, { Name: '工礦區' }, { Name: '山地' }],
                                GradesCounter: [{ Grade: '1', }, { Grade: '2', }, { Grade: '3', }],
                                IsSelect: true
                            },
                            {
                                Name: '本人住宿', Key: '家庭狀況_本人住宿', Option: [{ Name: '' }, { Name: '在家裡' }, { Name: '寄居親友家裡' }, { Name: '住校' }, { Name: '在外賃屋' }],
                                GradesCounter: [{ Grade: '1', }, { Grade: '2', }, { Grade: '3', }],
                                IsSelect: true
                            },
                            {
                                Name: '經濟狀況', Key: '家庭狀況_經濟狀況', Option: [{ Name: '' }, { Name: '富裕' }, { Name: '小康' }, { Name: '普通' }, { Name: '清寒' }, { Name: '貧困' }],
                                GradesCounter: [{ Grade: '1', }, { Grade: '2', }, { Grade: '3', }],
                                IsSelect: true
                            },
                            {
                                Name: '每星期零用錢(元)', Key: '家庭狀況_每星期零用錢', Option: [],
                                GradesCounter: [{ Grade: '1', }, { Grade: '2', }, { Grade: '3', }],
                                IsSelect: false
                            },
                            {
                                Name: '我覺得是否足夠', Key: '家庭狀況_我覺得是否足夠', Option: [{ Name: '' }, { Name: '足夠' }, { Name: '剛好' }, { Name: '不足' }],
                                GradesCounter: [{ Grade: '1', }, { Grade: '2', }, { Grade: '3', }],
                                IsSelect: true
                            }
                            ],
                        Option: []
                    }
                ]
            },
            {
                Title: '綜合紀錄表--學習狀況',
                Minimized: false,
                GetStatus: function () { },
                Save: function () { },
                Minimize: function () {
                    this.Minimized = true;
                },
                Maximize: function () {
                    this.Minimized = false;
                },
                Question: [
                           {
                               Title: '學習',
                               Type: '3YearsData單選',
                               TableTitle: ['項目', '1年級', '2年級', '3年級'],
                               TotalWillingTitle: [
                                   { Name: '最喜歡學科', Key: '學習狀況_最喜歡的學科', Option: [], GradesCounter: [{ Grade: '1', }, { Grade: '2', }, { Grade: '3', }], IsSelect: false },
                                   { Name: '最感困難學科', Key: '學習狀況_最感困難的學科', Option: [], GradesCounter: [{ Grade: '1', }, { Grade: '2', }, { Grade: '3', }], IsSelect: false },
                                   { Name: '樂器演奏', Key: '學習狀況_特殊專長_樂器演奏', Option: [], GradesCounter: [{ Grade: '1', }, { Grade: '2', }, { Grade: '3', }], IsSelect: false },
                                   { Name: '外語能力', Key: '學習狀況_特殊專長_外語能力', Option: [], GradesCounter: [{ Grade: '1', }, { Grade: '2', }, { Grade: '3', }], IsSelect: false },
                                   {
                                       //此項目可以多選
                                       Name: '特殊專長',
                                       Key: '',
                                       Option: [],
                                       GradesCounter: [
                                           {
                                               Grade: '1',
                                           MutipleDataList: [],
                                           GetMutipleDataListItem: function (PanelName, MutilpleTilte, Grade) {

                                               var MutipleDataList = [];

                                               var Items = '';

                                               $scope.MappingOverallRecordTable.forEach(function (opt) {

                                                   if (opt.Title == PanelName) {

                                                       opt.Question[0].TotalWillingTitle.forEach(function (opt2) {
                                                       
                                                           if (opt2.Grade == Grade && opt2.MutilpleTilte == MutilpleTilte) {

                                                               opt2.MultipleOption.forEach(function (op3) {

                                                                   if(op3.Checked)
                                                                   {
                                                                       MutipleDataList.push(op3.Name);                                                                   
                                                                   }
                                                               });                                                                                                                              
                                                           }                                                     
                                                       });
                                                   }
                                               });
                                               
                                               Items = MutipleDataList.join(',');
                                               
                                               this.MutipleDataList = MutipleDataList;

                                               return Items;       
                                           }
                                           },
                                       {
                                           Grade: '2',
                                           MutipleDataList: [],
                                           GetMutipleDataListItem: function (PanelName, MutilpleTilte, Grade) {

                                               var MutipleDataList = [];

                                               var Items = '';

                                               $scope.MappingOverallRecordTable.forEach(function (opt) {

                                                   if (opt.Title == PanelName) {

                                                       opt.Question[0].TotalWillingTitle.forEach(function (opt2) {

                                                           if (opt2.Grade == Grade && opt2.MutilpleTilte == MutilpleTilte) {

                                                               opt2.MultipleOption.forEach(function (op3) {

                                                                   if (op3.Checked) {
                                                                       MutipleDataList.push(op3.Name);
                                                                   }
                                                               });
                                                           }
                                                       });
                                                   }
                                               });

                                               Items = MutipleDataList.join(',');

                                               this.MutipleDataList = MutipleDataList;

                                               return Items;
                                           }
                                       },
                                       {
                                           Grade: '3',
                                           MutipleDataList: [],
                                           GetMutipleDataListItem: function (PanelName, MutilpleTilte, Grade) {

                                               var MutipleDataList = [];

                                               var Items = '';

                                               $scope.MappingOverallRecordTable.forEach(function (opt) {

                                                   if (opt.Title == PanelName) {

                                                       opt.Question[0].TotalWillingTitle.forEach(function (opt2) {

                                                           if (opt2.Grade == Grade && opt2.MutilpleTilte == MutilpleTilte) {

                                                               opt2.MultipleOption.forEach(function (op3) {

                                                                   if (op3.Checked) {
                                                                       MutipleDataList.push(op3.Name);
                                                                   }
                                                               });
                                                           }
                                                       });
                                                   }
                                               });

                                               Items = MutipleDataList.join(',');

                                               this.MutipleDataList = MutipleDataList;

                                               return Items;
                                           }
                                       }
                                       ], IsSelect: false, IsMultipleSelect: true,
                                   },
                                   {
                                       Grade:'1',
                                       MutilpleTilte: '特殊專長',
                                       Key: '學習狀況_特殊專長',
                                       MultipleOption: [{ Name: '球類', Checked: false }, { Name: '田徑', Checked: false }, { Name: '游泳', Checked: false }, { Name: '國術', Checked: false },
                                       { Name: '美術', Checked: false }, { Name: '樂器演奏', Checked: false }, { Name: '唱歌', Checked: false }, { Name: '工藝', Checked: false }, { Name: '家事', Checked: false }, { Name: '演說', Checked: false }, { Name: '寫作', Checked: false }, { Name: '舞蹈', Checked: false },
                                       { Name: '戲劇', Checked: false }, { Name: '書法', Checked: false }, { Name: '珠算', Checked: false }, { Name: '外語', Checked: false }, { Name: '英打', Checked: false }, { Name: '中打', Checked: false }, { Name: '會計', Checked: false }, { Name: '統計', Checked: false }, { Name: '領導', Checked: false }],
                                        GradesCounter: [{}, {}, {}],
                                        IsSelect: false,
                                       MultipleOptionHide: true
                                   },
                                   {
                                       Grade: '2',
                                       MutilpleTilte: '特殊專長',
                                       Key: '學習狀況_特殊專長',
                                       MultipleOption: [{ Name: '球類', Checked: false }, { Name: '田徑', Checked: false }, { Name: '游泳', Checked: false }, { Name: '國術', Checked: false },
                                       { Name: '美術', Checked: false }, { Name: '樂器演奏', Checked: false }, { Name: '唱歌', Checked: false }, { Name: '工藝', Checked: false }, { Name: '家事', Checked: false }, { Name: '演說', Checked: false }, { Name: '寫作', Checked: false }, { Name: '舞蹈', Checked: false },
                                       { Name: '戲劇', Checked: false }, { Name: '書法', Checked: false }, { Name: '珠算', Checked: false }, { Name: '外語', Checked: false }, { Name: '英打', Checked: false }, { Name: '中打', Checked: false }, { Name: '會計', Checked: false }, { Name: '統計', Checked: false }, { Name: '領導', Checked: false }],
                                       GradesCounter: [{}, {}, {}],
                                       IsSelect: false,
                                       MultipleOptionHide: true
                                   },
                                   {
                                       Grade: '3',
                                       MutilpleTilte: '特殊專長',
                                       Key: '學習狀況_特殊專長',
                                       MultipleOption: [{ Name: '球類', Checked: false }, { Name: '田徑', Checked: false }, { Name: '游泳', Checked: false }, { Name: '國術', Checked: false },
                                       { Name: '美術', Checked: false }, { Name: '樂器演奏', Checked: false }, { Name: '唱歌', Checked: false }, { Name: '工藝', Checked: false }, { Name: '家事', Checked: false }, { Name: '演說', Checked: false }, { Name: '寫作', Checked: false }, { Name: '舞蹈', Checked: false },
                                       { Name: '戲劇', Checked: false }, { Name: '書法', Checked: false }, { Name: '珠算', Checked: false }, { Name: '外語', Checked: false }, { Name: '英打', Checked: false }, { Name: '中打', Checked: false }, { Name: '會計', Checked: false }, { Name: '統計', Checked: false }, { Name: '領導', Checked: false }],
                                       GradesCounter: [{}, {}, {}],
                                       IsSelect: false,
                                       MultipleOptionHide: true
                                   },
                                   {
                                       //此項目可以多選
                                       Name: '休閒興趣', Option: [], IsSelect: false,
                                       GradesCounter: [
                                           {
                                               Grade: '1',
                                               MutipleDataList: [],
                                               GetMutipleDataListItem: function (PanelName, MutilpleTilte, Grade) {

                                                   var MutipleDataList = [];

                                                   var Items = '';

                                                   $scope.MappingOverallRecordTable.forEach(function (opt) {

                                                       if (opt.Title == PanelName) {

                                                           opt.Question[0].TotalWillingTitle.forEach(function (opt2) {

                                                               if (opt2.Grade == Grade && opt2.MutilpleTilte == MutilpleTilte) {

                                                                   opt2.MultipleOption.forEach(function (op3) {

                                                                       if (op3.Checked) {
                                                                           MutipleDataList.push(op3.Name);
                                                                       }
                                                                   });
                                                               }
                                                           });
                                                       }
                                                   });

                                                   Items = MutipleDataList.join(',');

                                                   this.MutipleDataList = MutipleDataList;

                                                   return Items;
                                               }
                                           },
                                           {
                                               Grade: '2',
                                               MutipleDataList: [],
                                               GetMutipleDataListItem: function (PanelName, MutilpleTilte, Grade) {

                                                   var MutipleDataList = [];

                                                   var Items = '';

                                                   $scope.MappingOverallRecordTable.forEach(function (opt) {

                                                       if (opt.Title == PanelName) {

                                                           opt.Question[0].TotalWillingTitle.forEach(function (opt2) {

                                                               if (opt2.Grade == Grade && opt2.MutilpleTilte == MutilpleTilte) {

                                                                   opt2.MultipleOption.forEach(function (op3) {

                                                                       if (op3.Checked) {
                                                                           MutipleDataList.push(op3.Name);
                                                                       }
                                                                   });
                                                               }
                                                           });
                                                       }
                                                   });

                                                   Items = MutipleDataList.join(',');

                                                   this.MutipleDataList = MutipleDataList;

                                                   return Items;
                                               }
                                           },
                                           {
                                               Grade: '3',
                                               MutipleDataList: [],
                                               GetMutipleDataListItem: function (PanelName, MutilpleTilte, Grade) {

                                                   var MutipleDataList = [];

                                                   var Items = '';

                                                   $scope.MappingOverallRecordTable.forEach(function (opt) {

                                                       if (opt.Title == PanelName) {

                                                           opt.Question[0].TotalWillingTitle.forEach(function (opt2) {

                                                               if (opt2.Grade == Grade && opt2.MutilpleTilte == MutilpleTilte) {

                                                                   opt2.MultipleOption.forEach(function (op3) {

                                                                       if (op3.Checked) {
                                                                           MutipleDataList.push(op3.Name);
                                                                       }
                                                                   });
                                                               }
                                                           });
                                                       }
                                                   });

                                                   Items = MutipleDataList.join(',');

                                                   this.MutipleDataList = MutipleDataList;

                                                   return Items;
                                               }
                                           }],
                                       IsMultipleSelect: true
                                   },
                                   {
                                       Grade: '1',
                                       MutilpleTilte: '休閒興趣',
                                       Key: '學習狀況_休閒興趣',
                                       MultipleOption: [{ Name: '電影欣賞', Checked: false }, { Name: '閱讀', Checked: false }, { Name: '登山', Checked: false }, { Name: '露營', Checked: false },
                                       { Name: '旅行郊遊', Checked: false }, { Name: '划船游泳', Checked: false }, { Name: '釣魚', Checked: false }, { Name: '樂器演奏', Checked: false }, { Name: '唱歌', Checked: false }, { Name: '音樂欣賞', Checked: false }, { Name: '舞蹈', Checked: false }, { Name: '繪畫', Checked: false },
                                       { Name: '集郵', Checked: false }, { Name: '打球', Checked: false }, { Name: '國術', Checked: false }, { Name: '編織', Checked: false }, { Name: '下棋', Checked: false }, { Name: '養小動物', Checked: false }, { Name: '作物栽培', Checked: false }], GradesCounter: [{}, {}, {}],
                                       GradesCounter: [{}, {}, {}],
                                       IsSelect: false,
                                       MultipleOptionHide: true
                                   },
                                   {
                                       Grade: '2',
                                       MutilpleTilte: '休閒興趣',
                                       Key: '學習狀況_休閒興趣',
                                       MultipleOption: [{ Name: '電影欣賞', Checked: false }, { Name: '閱讀', Checked: false }, { Name: '登山', Checked: false }, { Name: '露營', Checked: false },
                                       { Name: '旅行郊遊', Checked: false }, { Name: '划船游泳', Checked: false }, { Name: '釣魚', Checked: false }, { Name: '樂器演奏', Checked: false }, { Name: '唱歌', Checked: false }, { Name: '音樂欣賞', Checked: false }, { Name: '舞蹈', Checked: false }, { Name: '繪畫', Checked: false },
                                       { Name: '集郵', Checked: false }, { Name: '打球', Checked: false }, { Name: '國術', Checked: false }, { Name: '編織', Checked: false }, { Name: '下棋', Checked: false }, { Name: '養小動物', Checked: false }, { Name: '作物栽培', Checked: false }], GradesCounter: [{}, {}, {}],
                                       GradesCounter: [{}, {}, {}],
                                       IsSelect: false,
                                       MultipleOptionHide: true
                                   },
                                   {
                                       Grade: '3',
                                       MutilpleTilte: '休閒興趣',
                                       Key: '學習狀況_休閒興趣',
                                       MultipleOption: [{ Name: '電影欣賞', Checked: false }, { Name: '閱讀', Checked: false }, { Name: '登山', Checked: false }, { Name: '露營', Checked: false },
                                       { Name: '旅行郊遊', Checked: false }, { Name: '划船游泳', Checked: false }, { Name: '釣魚', Checked: false }, { Name: '樂器演奏', Checked: false }, { Name: '唱歌', Checked: false }, { Name: '音樂欣賞', Checked: false }, { Name: '舞蹈', Checked: false }, { Name: '繪畫', Checked: false },
                                       { Name: '集郵', Checked: false }, { Name: '打球', Checked: false }, { Name: '國術', Checked: false }, { Name: '編織', Checked: false }, { Name: '下棋', Checked: false }, { Name: '養小動物', Checked: false }, { Name: '作物栽培', Checked: false }], GradesCounter: [{}, {}, {}],
                                       GradesCounter: [{}, {}, {}],
                                       IsSelect: false,
                                       MultipleOptionHide: true
                                   },
                               ],
                               Option: []
                           },
                           //{
                           //    Title: '特殊專長',
                           //    Type: '3YearsData多選',
                           //    Option: [{ Name: '球類' }, { Name: '田徑' }, { Name: '游泳' }, { Name: '國術' },
                           //        { Name: '美術' }, { Name: '樂器演奏' }, { Name: '唱歌' }, { Name: '工藝' }, { Name: '家事' }, { Name: '演說' }, { Name: '寫作' }, { Name: '舞蹈' },
                           //        { Name: '戲劇' }, { Name: '書法' }, { Name: '珠算' }, { Name: '外語' }, { Name: '英打' }, { Name: '中打' }, { Name: '會計' }, { Name: '統計' }, { Name: '領導' }]
                           //},
                           //{
                           //    Title: '休閒興趣',
                           //    Type: '3YearsData多選',
                           //    Option: [{ Name: '電影欣賞' }, { Name: '閱讀' }, { Name: '登山' }, { Name: '露營' },
                           //        { Name: '旅行郊遊' }, { Name: '划船游泳' }, { Name: '釣魚' }, { Name: '樂器演奏' }, { Name: '唱歌' }, { Name: '音樂欣賞' }, { Name: '舞蹈' }, { Name: '繪畫' },
                           //        { Name: '集郵' }, { Name: '打球' }, { Name: '國術' }, { Name: '編織' }, { Name: '下棋' }, { Name: '養小動物' }, { Name: '作物栽培' }]
                           //},
                           {
                               Title: '社團幹部與班級幹部',
                               Type: '6SemeasterData單選填答',
                               TableTitle: ['項目', '1上', '1下', '2上', '2下', '3上', '3下'],
                               TotalWillingTitle: [
                                   { Name: '社團幹部', Key: '學習狀況_社團幹部', Option: [], SemesterCounter: [{ Semester: 's1a' }, { Semester: 's1b' }, { Semester: 's2a' }, { Semester: 's2b' }, { Semester: 's3a' }, { Semester: 's3b' }, ], IsSelect: false },
                                   { Name: '班級幹部', Key: '學習狀況_班級幹部', Option: [], SemesterCounter: [{ Semester: 's1a' }, { Semester: 's1b' }, { Semester: 's2a' }, { Semester: 's2b' }, { Semester: 's3a' }, { Semester: 's3b' }, ], IsSelect: false }
                               ],
                               Option: []
                           }
                ]
            },
            {
                Title: '綜合紀錄表--自我認識',
                Minimized: false,
                GetStatus: function () { },
                Save: function () { },
                Minimize: function () {
                    this.Minimized = true;
                },
                Maximize: function () {
                    this.Minimized = false;
                },
                Question: [
                    {
                        Title: '自我認識',
                        Type: '3YearsData單選',
                        TableTitle: ['項目', '1年級', '2年級', '3年級'],
                        TotalWillingTitle: [                            
                            {
                                Name: '個性', Option: [],
                                GradesCounter: [
                                    { Key: '自我認識_個性_1' },
                                    { Key: '自我認識_個性_2' },
                                    { Key: '自我認識_個性_3' }
                                ], IsSelect: false
                            },
                            {
                                Name: '優點', Option: [],
                                GradesCounter: [
                                    { Key: '自我認識_優點_1' },
                                    { Key: '自我認識_優點_2' },
                                    { Key: '自我認識_優點_3' }
                                ], IsSelect: false
                            },
                            {
                                Name: '需要改進的地方', Option: [],
                                GradesCounter: [
                                    { Key: '自我認識_需要改進的地方_1' },
                                    { Key: '自我認識_需要改進的地方_2' },
                                    { Key: '自我認識_需要改進的地方_3' }
                                ], IsSelect: false
                            },
                            
                        ],
                        Option: []
                    }
                ]
            },
            {
                Title: '綜合紀錄表--生活感想',
                Minimized: false,
                GetStatus: function () { },
                Save: function () { },
                Minimize: function () {
                    this.Minimized = true;
                },
                Maximize: function () {
                    this.Minimized = false;
                },
                Question: [
                    {
                        Title: '生活感想',
                        Type: '3YearsData單選',
                        TableTitle: ['項目', '1年級', '2年級', '3年級'],
                        TotalWillingTitle: [
                            {
                                Name: '期望', Option: [],
                                GradesCounter: [
                                    { Key: '生活感想_內容1_1' },
                                    { Key: '生活感想_內容1_2' },
                                    { Key: '生活感想_內容1_3' }
                                ], IsSelect: false
                            },
                            {
                                Name: '為達到理想，所需要做的努力', Option: [],
                                GradesCounter: [
                                    { Key: '生活感想_內容2_1' },
                                    { Key: '生活感想_內容2_2' },
                                    { Key: '生活感想_內容2_3' }
                                ], IsSelect: false
                            },
                            {
                                Name: '期望師長給予的幫助', Option: [],
                                GradesCounter: [
                                    { Key: '生活感想_內容3_1' },
                                    { Key: '生活感想_內容3_2' },
                                    { Key: '生活感想_內容3_3' }
                                ], IsSelect: false
                            },
                        ],
                        Option: []
                    }
                ]
            },
            {
                Title: '綜合紀錄表--畢業後計畫',
                Minimized: false,
                GetStatus: function () { },
                Save: function () { },
                Minimize: function () {
                    this.Minimized = true;
                },
                Maximize: function () {
                    this.Minimized = false;
                },
                Question: [
                    {
                        Title: '升學意願',
                        Type: '多選',
                        Key: '畢業後計畫_升學意願',
                        Option: [{ Name: '理', Checked: false }, { Name: '工', Checked: false }, { Name: '文史', Checked: false }, { Name: '法', Checked: false },
                            { Name: '商', Checked: false }, { Name: '醫', Checked: false }, { Name: '農', Checked: false }, { Name: '教育', Checked: false }, { Name: '藝術', Checked: false }, { Name: '海洋', Checked: false }, { Name: '軍', Checked: false }, { Name: '警', Checked: false }, { Name: '其它', Checked: false, HasRemark: true }]
                    },
                    {
                        Title: '就業意願',
                        Type: '多選',
                        Key: '畢業後計畫_就業意願',
                        Option: [{ Name: '自行就業', Checked: false }, { Name: '需要輔導就業', Checked: false }, { Name: '希望參加職業訓練', Checked: false }, { Name: '其它', Checked: false, HasRemark: true }]
                    },
                    {
                        Title: '職業意願',
                        Type: '多選',
                        Key: '畢業後計畫_參加職業訓練',
                        Option: [{ Name: '機械加工', Checked: false }, { Name: '機密機械加工', Checked: false }, { Name: '金屬加工', Checked: false }, { Name: '焊接及切割', Checked: false }, { Name: '電子及儀表', Checked: false }, { Name: '電機及電工', Checked: false },
                            { Name: '家用電器', Checked: false }, { Name: '營建土木', Checked: false }, { Name: '車輛修護', Checked: false }, { Name: '農業機械', Checked: false }, { Name: '農業經營', Checked: false }, { Name: '園藝經營', Checked: false },
                            { Name: '農產加工', Checked: false }, { Name: '畜牧', Checked: false }, { Name: '船員訓練', Checked: false }, { Name: '縫紉', Checked: false }, { Name: '美容', Checked: false }, { Name: '會計', Checked: false }, { Name: '護理', Checked: false }, { Name: '其它', Checked: false, HasRemark: true }]
                    },
                    {
                        Title: '受訓地區',
                        Type: '多選',
                        Key: '畢業後計畫_受訓地區',
                        Option: [{ Name: '北區', Checked: false }, { Name: '中區', Checked: false }, { Name: '南區', Checked: false }, { Name: '東區', Checked: false }, { Name: '其它', Checked: false, HasRemark: true }]
                    },
                    {
                        Title: '就業',
                        Type: '意願序',
                        Key: '',
                        TableTitle: ['項目','意願1', '意願2', '意願3'],
                        TotalWillingTitle: [
                            {
                                Name: '將來職業',
                                Key: '畢業後計畫_將來職業',
                                Option: [{ Name: '' }, { Name: '機械加工' }, { Name: '機密機械加工' }, { Name: '金屬加工' }, { Name: '焊接及切割' }, { Name: '電子及儀表' }, { Name: '電機及電工' },
                                { Name: '家用電器' }, { Name: '營建土木' }, { Name: '車輛修護' }, { Name: '農業機械' }, { Name: '農業經營' }, { Name: '園藝經營' },
                                { Name: '農產加工' }, { Name: '畜牧' }, { Name: '船員訓練' }, { Name: '縫紉' }, { Name: '美容' }, { Name: '會計' }, { Name: '護理' }, { Name: '其它' }],
                                WillingCounter: [{ priority: '1', selectvalue: '' }, { priority: '2', selectvalue: '' }, { priority: '3', selectvalue: '' }],
                                IsSelect: true
                            },
                            {
                                Name: '就業地區',
                                Key: '畢業後計畫_就業地區',
                                Option: [{ Name: '' }, { Name: '北區' }, { Name: '中區' }, { Name: '南區' }, { Name: '東區' }, { Name: '其它' }],
                                WillingCounter: [{ priority: '1', selectvalue: '' }, { priority: '2', selectvalue: '' }, { priority: '3', selectvalue: '' }],
                                IsSelect: true
                            }
                            ],
                        Option: [,
                             ]
                    },
                ]
            },
            {
                Title: '綜合紀錄表--自傳',
                Minimized: false,
                GetStatus: function () { },
                Save: function () { },
                Minimize: function () {
                    this.Minimized = true;
                },
                Maximize: function () {
                    this.Minimized = false;
                },
                Question: [
                    {
                        Title: '自傳',
                        Type: '單選填答',
                        Option: [
                            { Name: '家中最了解我的人', Key: '自傳_家中最了解我的人', ReasonKey: '自傳_家中最了解我的人_因為', HasRemark: true },
                            { Name: '我在家中最怕的人是', Key: '自傳_我在家中最怕的人是', ReasonKey: '自傳_我在家中最怕的人是_因為', HasRemark: true },
                            { Name: '我覺得我的優點是', Key: '自傳_我覺得我的優點是' },
                            { Name: '我覺得我的缺點是', Key: '自傳_我覺得我的缺點是' },
                            { Name: '常指導我做功課的人', Key: '自傳_常指導我做功課的人' },
                            { Name: '讀過印象最深的課外書', Key: '自傳_讀過且印象最深刻的課外書' },
                            { Name: '最喜歡的人', Key: '自傳_喜歡的人', ReasonKey: '自傳_喜歡的人_因為', HasRemark: true },
                            { Name: '最要好的朋友', Key: '自傳_最要好的朋友' },
                            { Name: '他是怎樣的人？', Key: '自傳_他是怎樣的人' },
                            { Name: '最喜歡的國小（國中）老師', Key: '自傳_最喜歡的國小（國中）老師' },
                            { Name: '他是怎樣的人？', Key: '自傳_最喜歡的國小（國中）老師__因為' },
                            { Name: '小學（國中）老師或同學常說我是', Key: '自傳_小學（國中）老師或同學常說我是' },
                            { Name: '小學（國中）時我曾在班上登任過的職務有', Key: '自傳_小學（國中）時我曾在班上登任過的職務有' },
                            { Name: '我在小學（國中）得過的獎有', Key: '自傳_我在小學（國中）得過的獎有' },
                            { Name: '我覺得我自己的過去最滿意的是', Key: '自傳_我覺得我自己的過去最滿意的是' },
                            { Name: '我排遣休閒時間的方法是', Key: '自傳_我排遣休閒時間的方法是' },
                            { Name: '我最難忘的一件事是', Key: '自傳_我最難忘的一件事是' },
                            { Name: '最喜歡做的事', Key: '自傳_最喜歡做的事', ReasonKey: '自傳_最喜歡做的事_因為', HasRemark: true },
                            { Name: '最不喜歡做的事', Key: '自傳_最不喜歡做的事', ReasonKey: '自傳_最不喜歡做的事_因為', HasRemark: true },
                            { Name: '國中時的學校生活', Key: '自傳_國中時的學校生活' },
                            { Name: '最快樂的回憶', Key: '自傳_最快樂的回憶' },
                            { Name: '最痛苦的回憶', Key: '自傳_最痛苦的回憶' },
                            { Name: '最足以描述自己的幾句話是', Key: '自傳_最足以描述自己的幾句話' },
                            { Name: '自傳', Key: '自傳_自傳' }
                        ]
                    },
                    {
                        Title: '自我的心聲',
                        Type: '單選填答',
                        Option: [
                            { Name: '自我的心聲_一年級_我目前遇到最大的困難是', Key: '自傳_自我的心聲_一年級_我目前遇到最大的困難是' },
                            { Name: '自我的心聲_一年級_我目前最需要的協助是', Key: '自傳_自我的心聲_一年級_我目前最需要的協助是' },
                            { Name: '自我的心聲_二年級_我目前遇到最大的困難是', Key: '自傳_自我的心聲_二年級_我目前遇到最大的困難是' },
                            { Name: '自我的心聲_二年級_我目前最需要的協助是', Key: '自傳_自我的心聲_二年級_我目前最需要的協助是' },
                            { Name: '自我的心聲_三年級_我目前遇到最大的困難是', Key: '自傳_自我的心聲_三年級_我目前遇到最大的困難是' },
                            { Name: '自我的心聲_三年級_我目前最需要的協助是', Key: '自傳_自我的心聲_三年級_我目前最需要的協助是' }
                        ]
                    }                
                ]
            }
        ]




        $scope.CurrentView = "Interview";

        $scope.OpeningTime = "開放時間";

        $scope.HomeVisitTypeOption = ["家庭訪問", "電話聯絡", "函件聯絡", "個別約談家長", "家長座談", "其他"];
        $scope.HomeVisitDateOption = [];

        $scope.InterviewDateOption = [];
        var d = new Date();
        for (var i = 5; i > 0; i--) {
            $scope.HomeVisitDateOption.push(d.toLocaleDateString());
            $scope.InterviewDateOption.push(d.toLocaleDateString());
            d.setDate(d.getDate() - 1);
        }
        $scope.InterviewTimeOption = ['早休', '第一節', '第二節', '第三節', '第四節', '午休', '第五節', '第六節', '第七節', '第八節'];
        $scope.InterviewCauseOption = ["主動來談", "約談", "家長要求", "教師轉介", "同學引介", "教官轉介", "他室轉介"]; //, "家長晤談", "個案討論", "電話關心"
        $scope.IntervieweeTypeOption = ["學生", "家長", "其他"];
        $scope.InterviewTypeOption = ["面談", "電話", "家訪", "電子信箱", "聯絡簿", "其他"];




     
        $scope.OpenCloseMutipleOption = function (PanelName, MutilpleTilte, Grade) {

            $scope.MappingOverallRecordTable.forEach(function (opt) {

                if (opt.Title == PanelName) {
                    opt.Question[0].TotalWillingTitle.forEach(function (opt2) {


                        if (opt2.Grade != Grade && opt2.MutilpleTilte == MutilpleTilte && opt2.MultipleOptionHide == false) {
                            opt2.MultipleOptionHide = true;
                        }
                        if (opt2.Grade == Grade && opt2.MutilpleTilte == MutilpleTilte && opt2.MultipleOptionHide == true) {
                            opt2.MultipleOptionHide = false;

                            return;
                        }
                        if (opt2.Grade == Grade && opt2.MutilpleTilte == MutilpleTilte && opt2.MultipleOptionHide == false) {
                            opt2.MultipleOptionHide = true;

                            return;
                        }
                    });
                }
            });
        }
       
        $scope.AddExtraSiblings = function () {

            var item = {};

            $scope.MappingOverallRecordTable.forEach(function (opt) {

                if (opt.Title == '綜合紀錄表--家庭狀況') {
                    opt.Question[3].SiblingCounter.push(item);
                }
            });
        }

        $scope.AddExtraConsanguinities = function () {

            var item = {IsEmpty: true };

            $scope.MappingOverallRecordTable.forEach(function (opt) {

                if (opt.Title == '綜合紀錄表--家庭狀況') {
                    opt.Question[1].ConsanguinityCounter.push(item);
                }
            });
        }

        $scope.init = function () {


            // TODO: 取得個人資料
            gadget.getContract('ischool.counsel.v2.student').send({
                service: "_.GetMyBaseInfo",
                body: '',
                result: function (response, error, http) {
                    $scope.$apply(function () {
                        if (error !== null) {
                            alert('GetMyBaseInfo Error' + JSON.stringify(error));
                        } else {
                            $(response.Student).each(function (index, item) {
                                Student = {                                    
                                    Name: item.Name,                                    
                                    GradeYear: item.Grade_Year,                                    
                                };
                             
                            });                           
                            $scope.student = Student;

                            // TODO: 取得開放時間
                            gadget.getContract('ischool.counsel.v2.student').send({
                                service: "_.GetOpeningHours",
                                body: '',
                                result: function (response, error, http) {

                                    if (error !== null) {
                                        alert('GetOpeningHours Error' + JSON.stringify(error));
                                    } else {

                                        if (response.Response && response.Response.CounselsystemList
                                            && response.Response.CounselsystemList.Content && response.Response.CounselsystemList.Content.Content
                                            && response.Response.CounselsystemList.Content.Content.Item) {
                                            $(response.Response.CounselsystemList.Content.Content.Item).each(function (index, item) {

                                                if (item.GradeYear == $scope.student.GradeYear) {

                                                    var tmp_Date = new Date();
                                                    var Startdate = new Date(item.StartDateTime);
                                                    var Enddate = new Date(item.EndDateTime);

                                                    //在開放時間內
                                                    if (Enddate > tmp_Date > Startdate) {

                                                        $scope.OpeningTime = "填寫開放時間:" + Startdate + "~" + Enddate;
                                                    }
                                                    //不再開放時間內
                                                    else
                                                    {

                                                        $scope.OpeningTime = "目前不再開放時間內，無法填寫";

                                                    }                                                
                                                }
                                            });
                                        }
                                    }
                                }
                            });

                            // TODO: 取得綜合紀錄表內容
                            gadget.getContract('ischool.counsel.v2.student').send({
                                service: "_.GetAllABCardData",
                                body: '',
                                result: function (response, error, http) {

                                    if (error !== null) {
                                        alert('GetAllABCardData Error' + JSON.stringify(error));
                                    } else {


                                        $scope.getSelfBaseData(response);

                                        $scope.getFamilyData(response);
                                                                                
                                        $scope.getStudyData(response);

                                        $scope.getSelfKonwingData(response);

                                        $scope.getLifeFeelingData(response);

                                        $scope.getAfterGraduateData(response);

                                        $scope.getAutobiographyData(response);

                                        
                                 
                                    }
                                }
                            });

                        }
                    });
                }
            });     
        }


        $scope.getSelfBaseData = function (response) {

            //單選
            if (response.allABCardData && response.allABCardData.singleRecord) {
                $(response.allABCardData.singleRecord).each(function (index, item) {

                    $scope.MappingOverallRecordTable.forEach(function (opt) {

                        if (opt.Title == "綜合紀錄表--本人概況") {

                            //本人概況
                            opt.Question.forEach(function (opt2) {

                                if(opt2.Key == item.key)
                                {
                                    opt2.Option.forEach(function (opt3) {
                                        if (opt3.Name == item.data) {

                                            opt3.Value = item.data;

                                            if(item.remark)
                                            {
                                                opt3.RemarkValue = item.remark;
                                            }
                                        }
                                    });                                
                                }
                                if (opt2.Key == item.key && opt2.Key == '本人概況_原住民血統') {
                                    opt2.Option.forEach(function (opt3) {
                                        if (opt3.Name == item.data && opt3.Name == "有") {

                                            opt3.Value = item.data;

                                            // item.remark 格式:  爸爸_阿美族
                                            if (item.remark) {

                                                var ss = item.remark.split('_');

                                                opt3.Relation = ss[0];
                                                opt3.Race = ss[1];                                                
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            }

            // 多選
            if (response.allABCardData && response.allABCardData.mutipleRecord) {
                $(response.allABCardData.mutipleRecord).each(function (index, item) {

                    $scope.MappingOverallRecordTable.forEach(function (opt) {

                        if (opt.Title == "綜合紀錄表--本人概況") {

                            //
                            opt.Question.forEach(function (opt2) {

                                if (opt2.Key == item.key) {
                                    opt2.Option.forEach(function (opt3) {

                                        if (opt3.Name == item.data) {

                                            opt3.Checked = true;

                                            if (item.remark) {
                                                opt3.RemarkValue = item.remark;
                                            }

                                        }                                        
                                    });
                                }

                            });
                        }
                    });
                });
            }

            // 多學期資料
            if (response.allABCardData && response.allABCardData.semesterRecord) {
                $(response.allABCardData.semesterRecord).each(function (index, item) {

                    $scope.MappingOverallRecordTable.forEach(function (opt) {

                        if (opt.Title == "綜合紀錄表--本人概況") {

                            //
                            opt.Question.forEach(function (opt2) {

                                if (opt2.Type == "6SemeasterData單選填答")
                                {                                    
                                    opt2.TotalWillingTitle.forEach(function (opt3) {

                                        if (opt3.Key == item.key) {

                                            opt3.SemesterCounter.forEach(function (opt4) {

                                                if (opt4.Semester == 's1a') {

                                                    opt4.Value = item.s1a;

                                                }
                                                if (opt4.Semester == 's1b') {

                                                    opt4.Value = item.s1b;

                                                }
                                                if (opt4.Semester == 's2a') {

                                                    opt4.Value = item.s2a;

                                                }
                                                if (opt4.Semester == 's2b') {

                                                    opt4.Value = item.s2b;

                                                }
                                                if (opt4.Semester == 's3a') {

                                                    opt4.Value = item.s3a;

                                                }
                                                if (opt4.Semester == 's3b') {

                                                    opt4.Value = item.s3b;

                                                }
                                            });                                            
                                        }
                                    });                                    
                                }                                
                            });
                        }
                    });
                });
            }
        }

        $scope.getFamilyData = function (response) {
            
            //單選，由於儲存結構 這邊處理 是否有兄弟姊妹和一般的單選不太一樣，要注意。
            if (response.allABCardData && response.allABCardData.singleRecord) {
                $(response.allABCardData.singleRecord).each(function (index, item) {

                    $scope.MappingOverallRecordTable.forEach(function (opt) {

                        if (opt.Title == "綜合紀錄表--家庭狀況") {

                            //
                            opt.Question.forEach(function (opt2) {

                                if (opt2.Key == item.key && opt2.Key == '家庭狀況_兄弟姊妹_排行') {
                                    
                                    if (item.data != "") {
                                        opt2.Option[1].Value = opt2.Option[1].Name;
                                        opt2.Option[1].RemarkValue = item.data;
                                    }
                                        // 假如沒有兄弟姊妹的話，自動將 "我是獨子"勾選起來
                                    else
                                    {
                                        opt2.Option[0].Value = opt2.Option[0].Name;
                                    }                                                                        
                                }
                            });

                            //監護人
                            opt.Question[0].Option.forEach(function (opt2) {

                                if (opt2.Key == item.key) {
                                    opt2.Value = item.data;
                                }                                
                            });
                        }
                    });
                });                             
            }


            // 血親型資料
            if (response.allABCardData && response.allABCardData.relativeRecord) {

                

                $scope.MappingOverallRecordTable.forEach(function (opt) {

                    if (opt.Title == '綜合紀錄表--家庭狀況') {
                        
                        for (; opt.Question[1].ConsanguinityCounter.length < response.allABCardData.relativeRecord.length;)
                        {
                            var item = { IsEmpty: true };
                            opt.Question[1].ConsanguinityCounter.push(item);

                        }
                    }
                });
                               
                $(response.allABCardData.relativeRecord).each(function (index, item) {

                    var itemAlreadyLink = false;

                    $scope.MappingOverallRecordTable.forEach(function (opt) {

                        if (opt.Title == "綜合紀錄表--家庭狀況") {

                            opt.Question.forEach(function (opt2) {

                                if (opt2.Type == "Consanguinity單選") {
                                                                            
                                    opt2.ConsanguinityCounter.forEach(function (opt4) {

                                        opt2.TotalWillingTitle.forEach(function (opt3) {
                                            
                                            if (opt4.IsEmpty)
                                            {
                                                opt4[opt3.Title] = "";                                                                                                
                                            }                                      
                                        });

                                        if (opt4.IsEmpty && !itemAlreadyLink) {
                                            opt4.稱謂 = item.title;
                                            opt4.姓名 = item.name;
                                            opt4.存歿 = item.is_alive?'存':'歿';
                                            opt4.出生年 = item.birth_year;
                                            opt4.職業 = item.job;
                                            opt4.工作機構 = item.institute;
                                            opt4.職稱 = item.job_title;
                                            opt4.教育程度 = item.edu_degree;
                                            opt4.電話 = item.phone;
                                            opt4.原國籍 = item.national;
                                            opt4.行動電話 = item.cell_phone;

                                            itemAlreadyLink = true;
                                            opt4.IsEmpty = false;
                                        }                                                                                
                                    });
                                }
                            });
                        }
                    });
                });
            }


            // 兄弟姊妹型資料
            if (response.allABCardData && response.allABCardData.siblingRecord) {



                $scope.MappingOverallRecordTable.forEach(function (opt) {

                    if (opt.Title == '綜合紀錄表--家庭狀況') {

                        for (; opt.Question[3].SiblingCounter.length < response.allABCardData.siblingRecord.length;) {
                            var item = { IsEmpty: true };
                            opt.Question[3].SiblingCounter.push(item);

                        }
                    }
                });

                $(response.allABCardData.siblingRecord).each(function (index, item) {

                    var itemAlreadyLink = false;

                    $scope.MappingOverallRecordTable.forEach(function (opt) {

                        if (opt.Title == "綜合紀錄表--家庭狀況") {

                            opt.Question.forEach(function (opt2) {

                                if (opt2.Type == "Sibling單選") {

                                    opt2.SiblingCounter.forEach(function (opt4) {

                                        opt2.TableTitle.forEach(function (opt3) {

                                            if (opt4.IsEmpty) {
                                                opt4[opt3] = "";
                                            }
                                        });

                                        if (opt4.IsEmpty && !itemAlreadyLink) {
                                            opt4.稱謂 = item.title;
                                            opt4.姓名 = item.name;
                                            opt4.畢業學校 =item.school_name;
                                            opt4.出生年 = item.birth_year;
                                            opt4.備註 = item.remark;
                                            
                                            itemAlreadyLink = true;
                                            opt4.IsEmpty = false;
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            }



            // 年度型資料
            if (response.allABCardData && response.allABCardData.yearlyRecord) {
                $(response.allABCardData.yearlyRecord).each(function (index, item) {

                    $scope.MappingOverallRecordTable.forEach(function (opt) {

                        if (opt.Title == "綜合紀錄表--家庭狀況") {

                            opt.Question.forEach(function (opt2) {

                                if (opt2.Type == "3YearsData單選") {
                                    opt2.TotalWillingTitle.forEach(function (opt3) {

                                        if (opt3.Key == item.key) {
                                           
                                                opt3.GradesCounter.forEach(function (opt4) {

                                                    if (opt4.Grade == '1') {

                                                        opt4.Value = item.g1;

                                                    }
                                                    if (opt4.Grade == '2') {

                                                        opt4.Value = item.g2;

                                                    }
                                                    if (opt4.Grade == '3') {

                                                        opt4.Value = item.g3;

                                                    }
                                                });                                            
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            }






        }


        $scope.getStudyData = function (response) {
            
            // 多學期資料
            if (response.allABCardData && response.allABCardData.semesterRecord) {
                $(response.allABCardData.semesterRecord).each(function (index, item) {

                    $scope.MappingOverallRecordTable.forEach(function (opt) {

                        if (opt.Title == "綜合紀錄表--學習狀況") {

                            //
                            opt.Question.forEach(function (opt2) {

                                if (opt2.Type == "6SemeasterData單選填答") {
                                    opt2.TotalWillingTitle.forEach(function (opt3) {

                                        if (opt3.Key == item.key) {

                                            opt3.SemesterCounter.forEach(function (opt4) {

                                                if (opt4.Semester == 's1a') {

                                                    opt4.Value = item.s1a;

                                                }
                                                if (opt4.Semester == 's1b') {

                                                    opt4.Value = item.s1b;

                                                }
                                                if (opt4.Semester == 's2a') {

                                                    opt4.Value = item.s2a;

                                                }
                                                if (opt4.Semester == 's2b') {

                                                    opt4.Value = item.s2b;

                                                }
                                                if (opt4.Semester == 's3a') {

                                                    opt4.Value = item.s3a;

                                                }
                                                if (opt4.Semester == 's3b') {

                                                    opt4.Value = item.s3b;

                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            }

            // 年度型資料
            if (response.allABCardData && response.allABCardData.yearlyRecord) {
                $(response.allABCardData.yearlyRecord).each(function (index, item) {

                    $scope.MappingOverallRecordTable.forEach(function (opt) {

                        if (opt.Title == "綜合紀錄表--學習狀況") {
                           
                            opt.Question.forEach(function (opt2) {

                                if (opt2.Type == "3YearsData單選") {
                                    opt2.TotalWillingTitle.forEach(function (opt3) {

                                        if (opt3.Key == item.key) {

                                            if (opt3.Key == '學習狀況_特殊專長' || opt3.Key == '學習狀況_休閒興趣') {

                                                var glList = item.g1.split(',');

                                                var g2List = item.g2.split(',');

                                                var g3List = item.g3.split(',');


                                                opt3.MultipleOption.forEach(function (opt4) {

                                                    if (opt3.Grade == '1') {

                                                        glList.forEach(function (opt5) {
                                                            if (opt4.Name == opt5)
                                                            {
                                                                opt4.Checked = true;
                                                            }
                                                        });
                                                    }
                                                    if (opt3.Grade == '2') {

                                                        g2List.forEach(function (opt5) {
                                                            if (opt4.Name == opt5) {
                                                                opt4.Checked = true;
                                                            }
                                                        });
                                                    }
                                                    if (opt3.Grade == '3') {

                                                        g3List.forEach(function (opt5) {
                                                            if (opt4.Name == opt5) {
                                                                opt4.Checked = true;
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                            else
                                            {
                                                opt3.GradesCounter.forEach(function (opt4) {

                                                    if (opt4.Grade == '1') {

                                                        opt4.Value = item.g1;

                                                    }
                                                    if (opt4.Grade == '2') {

                                                        opt4.Value = item.g2;

                                                    }
                                                    if (opt4.Grade == '3') {

                                                        opt4.Value = item.g3;

                                                    }
                                                });
                                            }                                            
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            }


        }


        $scope.getAfterGraduateData = function (response) {
            if (response.allABCardData && response.allABCardData.mutipleRecord) {
                $(response.allABCardData.mutipleRecord).each(function (index, item) {

                    $scope.MappingOverallRecordTable.forEach(function (opt) {

                        if (opt.Title == "綜合紀錄表--畢業後計畫") {

                            //畢業後計畫
                            opt.Question.forEach(function (opt2) {

                                if (opt2.Key == item.key)
                                {
                                    opt2.Option.forEach(function (opt3) {

                                        if (opt3.Name == item.data) {

                                            opt3.Checked = true;

                                            if (item.remark) {
                                                opt3.RemarkValue = item.remark;
                                            }
                                        }
                                    });
                                }
                                
                            });
                        }
                    });
                });
            }

            if (response.allABCardData && response.allABCardData.priorityRecord) {
                $(response.allABCardData.priorityRecord).each(function (index, item) {

                    $scope.MappingOverallRecordTable.forEach(function (opt) {

                        if (opt.Title == "綜合紀錄表--畢業後計畫") {

                            // 就業
                            opt.Question[4].TotalWillingTitle.forEach(function (opt2) {

                                if (opt2.Key == item.key) {
                                    opt2.WillingCounter.forEach(function (opt3) {


                                        if (opt3.priority =='1')
                                        {
                                            opt3.selectvalue = item.p1;
                                        }
                                        if (opt3.priority == '2') {
                                            opt3.selectvalue = item.p2;
                                        }
                                        if (opt3.priority == '3') {
                                            opt3.selectvalue = item.p3;
                                        }                                      
                                    });
                                }
                            });
                        }
                    });
                });
            }
        }


        $scope.getSelfKonwingData = function (response) {
            if (response.allABCardData && response.allABCardData.singleRecord) {
                $(response.allABCardData.singleRecord).each(function (index, item) {

                    $scope.MappingOverallRecordTable.forEach(function (opt) {

                        if (opt.Title == "綜合紀錄表--自我認識") {

                            //自我認識
                            opt.Question[0].TotalWillingTitle.forEach(function (opt2) {

                                opt2.GradesCounter.forEach(function (opt3) {
                                    if (opt3.Key == item.key) {
                                        opt3.Value = item.data;
                                    }
                                });
                            });
                        }
                    });
                });
            }
        }

        $scope.getLifeFeelingData = function (response) {
            if (response.allABCardData && response.allABCardData.singleRecord) {
                $(response.allABCardData.singleRecord).each(function (index, item) {

                    $scope.MappingOverallRecordTable.forEach(function (opt) {

                        if (opt.Title == "綜合紀錄表--生活感想") {

                            //生活感想
                            opt.Question[0].TotalWillingTitle.forEach(function (opt2) {

                                opt2.GradesCounter.forEach(function (opt3) {
                                    if (opt3.Key == item.key) {
                                        opt3.Value = item.data;
                                    }
                                });
                            });
                        }
                    });
                });
            }
        }


        $scope.getAutobiographyData = function (response)
        {
            if (response.allABCardData && response.allABCardData.singleRecord)
            {
                $(response.allABCardData.singleRecord).each(function (index, item) {
                                                                     
                    $scope.MappingOverallRecordTable.forEach(function (opt) {

                        if (opt.Title == "綜合紀錄表--自傳") {

                            //自傳
                            opt.Question[0].Option.forEach(function (opt2a) {

                                if (opt2a.Key == item.key) {
                                    opt2a.Value = item.data;
                                }
                                if (opt2a.ReasonKey == item.key) {
                                    opt2a.ReasonValue = item.data;
                                }
                            });

                            //自我的心聲
                            opt.Question[1].Option.forEach(function (opt2b) {

                                if (opt2b.Key == item.key) {
                                    opt2b.Value = item.data;
                                }
                            });
                        }
                    });
                });            
            }            
        }

        





        $scope.init();
        



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

            // 綜合紀錄表
            if ($scope.CurrentView == "OverallRecordTable")
            {
                $scope.ShowOverallRecordTableEditor();
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



        //進入綜合紀錄表  檢視 / 修改模式
        $scope.ShowOverallRecordTableEditor = function (rec) {

            if (!rec) {
                rec = {
                    //SchoolYear: $scope.SchoolYear,
                    //Semester: $scope.Semester,
                    //AuthorID: $scope.LoginName,
                    //AuthorName: $scope.TeacherName,
                    //RefStudentID: $scope.CurrentStudent.StudentID,
                    //IsPublic: false,
                    //EditRole: $scope.CurrentStudent.輔導老師 ? "輔導老師" : "紀錄者"
                };
            }

            $scope.OverallRecordTable = {};
            angular.copy(rec, $scope.OverallRecordTable);
                       
            //#region 轉換physiologicalDefectKind到physiologicalDefectOption
            var physiologicalDefectKind = [{ Name: '無' }, { Name: '近視' }, { Name: '其他視覺障礙' }, { Name: '聽覺障礙' },              
                { Name: '肢體障礙' },{ Name: '其他', HasRemark: true }];

            $scope.OverallRecordTable.PhysiologicalDefectOption = [];

            physiologicalDefectKind.forEach(function (opt) {
                var item = { Name: opt.Name, HasRemark: opt.HasRemark, Checked: false };
                [].concat(rec.CounselTypeKind || []).forEach(function (val) {
                    if (val.Name == item.Name) {
                        item.Checked = true;
                        if (item.HasRemark) {
                            item.Remark = val.Remark;
                        }
                    }
                });
                $scope.OverallRecordTable.PhysiologicalDefectOption.push(item);
            });
            //#endregion      

            //#region 轉換specialDiseasesKind到specialDiseasesOption
            var specialDiseasesKind = [{ Name: '無' }, { Name: '腦炎' }, { Name: '癲癇' }, { Name: '心臟病' },
                { Name: '小兒麻痺' }, { Name: '氣喘' }, { Name: '過敏症' }, { Name: '肺結核' },{ Name: '其他', HasRemark: true }];

            $scope.OverallRecordTable.SpecialDiseasesOption = [];

            specialDiseasesKind.forEach(function (opt) {
                var item = { Name: opt.Name, HasRemark: opt.HasRemark, Checked: false };
                [].concat(rec.CounselTypeKind || []).forEach(function (val) {
                    if (val.Name == item.Name) {
                        item.Checked = true;
                        if (item.HasRemark) {
                            item.Remark = val.Remark;
                        }
                    }
                });
                $scope.OverallRecordTable.SpecialDiseasesOption.push(item);
            });
            //#endregion     

            $scope.OverallRecordTable.BasicSelfData = {};


            //#region 轉換specialtyKind到specialtyOption

            

            var specialtyKind = [{ Name: '球類' }, { Name: '田徑' }, { Name: '游泳' }, { Name: '國術' },
                { Name: '美術' }, { Name: '樂器演奏' }, { Name: '唱歌' }, { Name: '工藝' }, { Name: '家事' }, { Name: '演說' }, { Name: '寫作' }, { Name: '舞蹈' },
                { Name: '戲劇' }, { Name: '書法' }, { Name: '珠算' }, { Name: '外語' }, { Name: '英打' }, { Name: '中打' }, { Name: '會計' }, { Name: '統計' }, { Name: '領導' }];

            $scope.OverallRecordTable.specialtyOption = [];

            specialtyKind.forEach(function (opt) {
                var item = { Name: opt.Name, HasRemark: opt.HasRemark, Checked: false };
                [].concat(rec.CounselTypeKind || []).forEach(function (val) {
                    if (val.Name == item.Name) {
                        item.Checked = true;
                        if (item.HasRemark) {
                            item.Remark = val.Remark;
                        }
                    }
                });
                $scope.OverallRecordTable.specialtyOption.push(item);
            });
            //#endregion   

            

            //#region 轉換interestingKind到interestingOption

            var interestingKind = [{ Name: '電影欣賞' }, { Name: '閱讀' }, { Name: '登山' }, { Name: '露營' },
                { Name: '旅行郊遊' }, { Name: '划船游泳' }, { Name: '釣魚' }, { Name: '樂器演奏' }, { Name: '唱歌' }, { Name: '音樂欣賞' }, { Name: '舞蹈' }, { Name: '繪畫' },
                { Name: '集郵' }, { Name: '打球' }, { Name: '國術' }, { Name: '編織' }, { Name: '下棋' }, { Name: '養小動物' }, { Name: '作物栽培' }];

            $scope.OverallRecordTable.interestingOption = [];

            interestingKind.forEach(function (opt) {
                var item = { Name: opt.Name, HasRemark: opt.HasRemark, Checked: false };
                [].concat(rec.CounselTypeKind || []).forEach(function (val) {
                    if (val.Name == item.Name) {
                        item.Checked = true;
                        if (item.HasRemark) {
                            item.Remark = val.Remark;
                        }
                    }
                });
                $scope.OverallRecordTable.interestingOption.push(item);
            });
            //#endregion   


            //#region 轉換continueStudyWishKind到continueStudyWishOption

            var continueStudyWishKind = [{ Name: '理' }, { Name: '工' }, { Name: '文史' }, { Name: '法' },
                { Name: '商' }, { Name: '醫' }, { Name: '農' }, { Name: '教育' }, { Name: '藝術' }, { Name: '海洋' }, { Name: '軍' }, { Name: '警' }, { Name: '其他', HasRemark: true }];

            $scope.OverallRecordTable.continueStudyWishOption = [];

            continueStudyWishKind.forEach(function (opt) {
                var item = { Name: opt.Name, HasRemark: opt.HasRemark, Checked: false };
                [].concat(rec.CounselTypeKind || []).forEach(function (val) {
                    if (val.Name == item.Name) {
                        item.Checked = true;
                        if (item.HasRemark) {
                            item.Remark = val.Remark;
                        }
                    }
                });
                $scope.OverallRecordTable.continueStudyWishOption.push(item);
            });
            //#endregion    

            //#region 轉換jobWishKind到jobWishOption

            var jobWishKind = [{ Name: '自行就業' }, { Name: '需要輔導就業' }, { Name: '希望參加職業訓練' },{ Name: '其他', HasRemark: true }];

            $scope.OverallRecordTable.jobWishOption = [];

            jobWishKind.forEach(function (opt) {
                var item = { Name: opt.Name, HasRemark: opt.HasRemark, Checked: false };
                [].concat(rec.CounselTypeKind || []).forEach(function (val) {
                    if (val.Name == item.Name) {
                        item.Checked = true;
                        if (item.HasRemark) {
                            item.Remark = val.Remark;
                        }
                    }
                });
                $scope.OverallRecordTable.jobWishOption.push(item);
            });
            //#endregion    

            //#region 轉換vocationTrainingKind到vocationTrainingOption

            var vocationTrainingKind = [{ Name: '機械加工' }, { Name: '機密機械加工' }, { Name: '金屬加工' }, { Name: '焊接及切割' }, { Name: '電子及儀表' }, { Name: '電機及電工' },
                { Name: '家用電器' }, { Name: '營建土木' }, { Name: '車輛修護' }, { Name: '農業機械' }, { Name: '農業經營' }, { Name: '園藝經營' },
                { Name: '農產加工' }, { Name: '畜牧' }, { Name: '船員訓練' }, { Name: '縫紉' }, { Name: '美容' }, { Name: '會計' },
                { Name: '護理' }, { Name: '其他', HasRemark: true }];

            $scope.OverallRecordTable.vocationTrainingOption = [];

            vocationTrainingKind.forEach(function (opt) {
                var item = { Name: opt.Name, HasRemark: opt.HasRemark, Checked: false };
                [].concat(rec.CounselTypeKind || []).forEach(function (val) {
                    if (val.Name == item.Name) {
                        item.Checked = true;
                        if (item.HasRemark) {
                            item.Remark = val.Remark;
                        }
                    }
                });
                $scope.OverallRecordTable.vocationTrainingOption.push(item);
            });
            //#endregion  


            //#region 轉換trainingLocationKind到trainingLocationOption

            var trainingLocationKind = [{ Name: '北區' }, { Name: '中區' }, { Name: '南區' }, { Name: '東區' },{ Name: '其他', HasRemark: true }];

            $scope.OverallRecordTable.trainingLocationOption = [];

            trainingLocationKind.forEach(function (opt) {
                var item = { Name: opt.Name, HasRemark: opt.HasRemark, Checked: false };
                [].concat(rec.CounselTypeKind || []).forEach(function (val) {
                    if (val.Name == item.Name) {
                        item.Checked = true;
                        if (item.HasRemark) {
                            item.Remark = val.Remark;
                        }
                    }
                });
                $scope.OverallRecordTable.trainingLocationOption.push(item);
            });
            //#endregion  




            
            
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

                            }
                            else
                            {
                                stuRec.PsychologicalTestsRecord = null;
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
                                rec.HomeVisitDate = new Date(parseInt(rec.HomeVisitDate)).toLocaleDateString();
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
                                rec.InterviewDate = new Date(parseInt(rec.InterviewDate)).toLocaleDateString();
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
                if (remove) list.splice(list.indexOf(remove));
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
                if (remove) list.splice(list.indexOf(remove));
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
                if (remove) list.splice(list.indexOf(remove));
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
