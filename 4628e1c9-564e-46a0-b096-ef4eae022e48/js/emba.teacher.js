
var Contract = {
    'Teacher': 'emba.teacher',
    'Student': 'emba.student'
};

var Service = {
    'GetScoreInputSemester': 'default.GetScoreInputSemester',
    'GetMyCourses': 'default.GetMyCourses',
    'GetStudents': 'default.GetStudents',
    'GetCourseTeacherList': 'default.GetCourseTeacherList',
    'GetSubjectScoreLock': 'default.GetSubjectScoreLock',
    'AddSubjectSemesterScore': 'default.AddSubjectSemesterScore',
    'UpdateSubjectSemesterScore': 'default.UpdateSubjectSemesterScore',
    'UpdateCourseExt': 'default.UpdateCourseExt',
    'AddLog': 'public.AddLog',
    'GetCSConfiguration': 'default.GetCSConfiguration'
};

var ScoreInputSemester = {
    'SchoolYear': '',
    'Semester': ''
};

var getConfirm = function (confirmMessage, callback){
    confirmMessage = confirmMessage || '';

    $('#confirmbox').modal({
        show:true,
        backdrop:'static',
        keyboard: false,
    });

    $('#confirmMessage').html(confirmMessage);
    $('#confirmFalse').click(function(){
        $('#confirmbox').modal('hide');
        if (callback) callback(false);
    });
    $('#confirmTrue').click(function(){
        $('#confirmbox').modal('hide');
        if (callback) callback(true);
    });
};  

var CreateCallbackQueue = function() {
    //  結構為2維陣列的工作排程，第1維表示單執行緒，第2維表示多執行緒
    var Queues = [];

    //  執行中的工作
    var _Current = [];
    
    //  已做完的工作
    var _Finished = [];  

    //  記錄所有錯誤訊息
    var _InternalError = [];  

    //  執行目前工作中的每一個子工作
    var _Execute = function(object) {   
        //  _Current 中的工作，全部一起執行(單執行緒與多執行緒皆適用)     
        while (object.length > 0) {
            var o = object.shift();
            if (jQuery.isFunction(o)) {
                o();
            } else {
                _InternalError.push("函式：" + arguments.callee + " 無法執行。");
            }
        }   
    };

    //  執行目前工作
    var _DoCurrentJob = function() {
        _Current = Queues.shift();
        _Finished = _Current.slice(0);
        _Execute(_Current);
    };

    return {
        Push: function(object) {
            if (typeof object === 'object' && typeof object.length === 'number' && typeof object.splice === 'function' && !(object.propertyIsEnumerable('length'))) {
                Queues.push(object);
            } else {
                Queues.push([object]);
            }
        }, 

        Start: function() {
            if (Queues.length === 0) {
                _InternalError.push('無工作排程可執行。');
                return;
            }
            _DoCurrentJob();
        }, 

        JobFinished: function() {
            _Finished.shift();

            if (Queues.length === 0 && _Finished.length === 0 && _Current.length === 0) {
                return;
            }

            if (_Finished.length === 0) {
                _DoCurrentJob();                  
            }
        }
    }
};

//  Observer Patterns：資料繫結用
var CreatePublisher = function() {
    var _Subscribers = {
        'any': []
    };

    var _VisitSubscribers = function(action, arg, type) {
        var pubtype = type || 'any';
        var subscribers = _Subscribers[pubtype];
        var length = subscribers.length;

        for (var i = 0; i < length; i++) {
            if (action === 'publish') {
                subscribers[i](arg);
            } else {
                if (subscribers[i] === arg) {
                    subscribers.splice(i, 1);
                }
            }
        }
    }

    return {
        Subscribe: function(fn, type) {
            type = type || 'any';
            if (!_Subscribers[type]) {
                _Subscribers[type] = [];
            }
            _Subscribers[type].push(fn);
        },
        UnSubscribe: function(fn, type) {
            _VisitSubscribers('unsubscribe', fn, type);
        },
        Publish: function(fn, type) {
            _VisitSubscribers('publish', fn, type);
        },
        Clear: function() {
            _Subscribers = {
                'any': []
            };
        }
    }
};

//  轉換 o 為 publisher
function MakePublisher(o, publisher) {
    for (var i in publisher) {
        if (publisher.hasOwnProperty(i) && typeof publisher[i] === 'function') {
            o[i] = publisher[i];
        }
    }
    o.Clear();
}

var CreateTeacher = function() {

    //  選取課程之系統編號
    var _CourseID;

    //  所有課程之授課教師
    var _CourseTeachers = {};

    //  登入教師於成績輸入學年期之所有課程
    var _TeacherCourses = {};

    //  所有課程之修課學生及其成績資料
    var _CourseStudents = {};

    //    記錄所有錯誤訊息
    var _InternalError = [];  

    //  呼叫 Web2 Service 使用工作排程來處理
    var _CallbackQueue = CreateCallbackQueue();

    //  本學期課程是否已鎖定不得成績輸入
    var _SubjectScoreLock; 

    //  成績輸入說明樣版
    var _TextTemplate;

    //  成績上傳提醒樣版
    var _ReminderTemplate;

    //  取得成績輸入學年期
    var _GetScoreInputSemester = function() {
        gadget.getContract(Contract.Teacher).send({
            service: Service.GetScoreInputSemester,
            body: {},
            result: function(response, error, http) {
                if (error !== null) {
                    _InternalError.push('呼叫服務(' + Service.GetScoreInputSemester + ')失敗或網路異常，請稍候重試！');
                } else {
                    if (response.InputSemester != null) {
                        ScoreInputSemester.SchoolYear = response.InputSemester.SchoolYear;
                        ScoreInputSemester.Semester = response.InputSemester.Semester;
                    }
                }
                // console.log('ScoreInputSemester.SchoolYear：' + ScoreInputSemester.SchoolYear);
                // console.log('ScoreInputSemester.Semester：' + ScoreInputSemester.Semester);
                _CallbackQueue.JobFinished();
            }
        });
    };
  
    //    取得教師授課清單
    var _GetTeacherCourses = function() {
        gadget.getContract(Contract.Teacher).send({
            service: Service.GetMyCourses,
            body: {
                Request: {
                  SchoolYear: ScoreInputSemester.SchoolYear,
                  Semester: ScoreInputSemester.Semester
                }
            },
            result: function(response, error, http) {
                if (error !== null) {
                    _InternalError.push('呼叫服務(' + Service.GetMyCourses + ')失敗或網路異常，請稍候重試！');
                    //console.log(error);
                } else {
                    if (response.Result && response.Result.Course){
                        //  記錄授課清單。
                        $(response.Result.Course).each(function(index, item) {
                            _TeacherCourses[item.CourseID] = {
                                'CourseID': item.CourseID,
                                'ClassName': item.ClassName,
                                'CourseTitle': item.CourseTitle,
                                'SubjectID': item.SubjectID,
                                'NewSubjectCode': item.NewSubjectCode,
                                'SubjectCode': item.SubjectCode,
                                'SubjectName': item.SubjectName,
                                'SchoolYear': item.SchoolYear,
                                'Semester': item.Semester,
                                'Credit': item.Credit,
                                'IsRequired': item.IsRequired,
                                'Confirmed': item.Confirmed,
                                'Role': item.Role,
                                'IsScored': item.IsScored,
                                'SerialNo': item.SerialNo
                            };
                        });
                        // Teacher.Publish(_TeacherCourses, 'teacher_course_loaded');
                    }
                }
                //    無論如何都要 Callback，參數「stop_if_error」傳給 Callback 代理程式，以判斷是否執行下一個 function。
                _CallbackQueue.JobFinished();
            }
        });
    };
  
    //    取得選取課程之「俢課學生」及其成績資料。
    var _GetCourseStudents = function() {
        gadget.getContract(Contract.Teacher).send({
            service: Service.GetStudents,
            body: {
                Request: {
                  SchoolYear: ScoreInputSemester.SchoolYear,
                  Semester: ScoreInputSemester.Semester
                }
            },
            result: function(response, error, http) {
                if (error !== null) {
                    _InternalError.push('呼叫服務(' + Service.GetStudents + ')失敗或網路異常，請稍候重試！');
                } else {
                    if (response.Result && response.Result.Student){
                        //  記錄修課學生。
                        $(response.Result.Student).each(function(index, item) {
                            if (!_CourseStudents[item.CourseID]) {
                                _CourseStudents[item.CourseID] = {};
                            }
                            _CourseStudents[item.CourseID][item.StudentNumber] = {
                                'StudentID': item.StudentID,
                                'Name': item.Name,
                                'EnglishName': item.EnglishName,
                                'StudentNumber': item.StudentNumber,
                                'Department': item.Department,
                                'ScoreID': item.ScoreID,
                                'Score': item.Score,
                                'Remark': item.Remark,
                                'IsCancel': item.IsCancel,
                                'SchoolYear': item.SchoolYear,
                                'Semester': item.Semester,
                                'Credit': item.Credit
                            }
                        });
                    }
                }
                //    無論如何都要 Callback，參數「stop_if_error」傳給 Callback 代理程式，以判斷是否執行下一個 function。
                _CallbackQueue.JobFinished();
            }
        });
    };
  
    //    取得選取課程之「俢課學生」及其成績資料，上傳成績前更新「ScoreID, IsCancel」，確保取得學生成績最新資料。
    var _GetCourseStudentPreUpload = function() {
        gadget.getContract(Contract.Teacher).send({
            service: Service.GetStudents,
            body: {
                Request: {
                  SchoolYear: ScoreInputSemester.SchoolYear,
                  Semester: ScoreInputSemester.Semester
                }
            },
            result: function(response, error, http) {
                if (error !== null) {
                    _InternalError.push('呼叫服務(' + Service.GetStudents + ')失敗或網路異常，請稍候重試！');
                } else {
                    if (response.Result && response.Result.Student){
                        //  記錄修課學生。
                        $(response.Result.Student).each(function(index, item) {
                            if (!_CourseStudents[item.CourseID]) {
                                _CourseStudents[item.CourseID] = {};
                            }
                            if (_CourseStudents[item.CourseID][item.StudentNumber]) {
                                _CourseStudents[item.CourseID][item.StudentNumber].ScoreID = item.ScoreID;
                                _CourseStudents[item.CourseID][item.StudentNumber].IsCancel = item.IsCancel;
                            }
                        });
                    }
                }
                //    無論如何都要 Callback，參數「stop_if_error」傳給 Callback 代理程式，以判斷是否執行下一個 function。
                _CallbackQueue.JobFinished();
            }
        });
    };
  
    //    取得成績輸入學年期之所有課程的授課教師。
    var _GetCourseTeachers = function() {
        gadget.getContract(Contract.Teacher).send({
            service: Service.GetCourseTeacherList,
            body: {
                Request: {
                  SchoolYear: ScoreInputSemester.SchoolYear,
                  Semester: ScoreInputSemester.Semester
                }
            },
            result: function(response, error, http) {
                if (error !== null) {
                    _InternalError.push('呼叫服務(' + Service.GetCourseTeacherList + ')失敗或網路異常，請稍候重試！');
                } else {
                    if (response.Result && response.Result.Teacher){
                        //  記錄授課教師。
                        var teacher_name = [];
                        $(response.Result.Teacher).each(function(index, item) {
                            if (!_CourseTeachers[item.CourseID]) {
                                _CourseTeachers[item.CourseID] = [];
                            }
                            _CourseTeachers[item.CourseID].push(item.TeacherName);
                        });
                    }
                }
                //    無論如何都要 Callback，參數「stop_if_error」傳給 Callback 代理程式，以判斷是否執行下一個 function。
                _CallbackQueue.JobFinished();
            }
        });
    };    

    //  取得鎖定成績輸入資訊
    var _GetSubjectScoreLock = function() {
        gadget.getContract(Contract.Teacher).send({
            service: Service.GetSubjectScoreLock,
            body: {
                Request: {
                  SchoolYear: ScoreInputSemester.SchoolYear,
                  Semester: ScoreInputSemester.Semester
                }
            },
            result: function(response, error, http) {
                if (error !== null) {
                    _InternalError.push('呼叫服務(' + Service.GetSubjectScoreLock + ')失敗或網路異常，請稍候重試！');
                } else {
                    if (response.Result) {
                        _SubjectScoreLock = response.Result.IsLocked;
                    }
                }
                //    無論如何都要 Callback，參數「stop_if_error」傳給 Callback 代理程式，以判斷是否執行下一個 function。
                _CallbackQueue.JobFinished();
            }
        });
    };

    //  新增學期成績
    var _AddSubjectSemesterScore = function(scores) {
        gadget.getContract(Contract.Teacher).send({
            service: Service.AddSubjectSemesterScore,
            body: {
                Request: {
                  Score: scores
                }
            },
            result: function(response, error, http) {
                if (error !== null) {
                    _InternalError.push('呼叫服務(' + Service.AddSubjectSemesterScore + ')失敗或網路異常，請稍候重試！');
                } else {
                    if (!response.Result) {
                        _InternalError.push("新增成績失敗！請稍候重試。");
                    }
                }
                //    無論如何都要 Callback，參數「stop_if_error」傳給 Callback 代理程式，以判斷是否執行下一個 function。
                _CallbackQueue.JobFinished();
            }
        });
    };

    //  修改學期成績
    var _UpdateSubjectSemesterScore = function(scores) {
        gadget.getContract(Contract.Teacher).send({
            service: Service.UpdateSubjectSemesterScore,
            body: {
                Request: {
                  Score: scores
                }
            },
            result: function(response, error, http) {
                if (error !== null) {
                    _InternalError.push('呼叫服務(' + Service.UpdateSubjectSemesterScore + ')失敗或網路異常，請稍候重試！');
                } else {
                    if (!response.Result) {
                        _InternalError.push("修改成績失敗！請稍候重試。");
                    }
                }
                //    無論如何都要 Callback，參數「stop_if_error」傳給 Callback 代理程式，以判斷是否執行下一個 function。
                _CallbackQueue.JobFinished();
            }
        });
    };

    //  成績輸入說明樣版、成績上傳提醒樣版
    var _GetTextTemplate = function(confName) {
        //  成績輸入說明樣版：teacher_score_input_explanation_template
        //  成績上傳提醒樣版：teacher_score_upload_reminder_template
        gadget.getContract(Contract.Teacher).send({
            service: Service.GetCSConfiguration,
            body: "<Request><Condition><ConfName>" + confName + "</ConfName></Condition></Request>",
            result: function (response, error, http) {
                if (error !== null) {
                    _InternalError.push('呼叫服務(' + Service.GetCSConfiguration + ')失敗或網路異常，請稍候重試！');
                } else {
                    /*
                    <Response>
                        <Configuration>
                            <ConfName>teacher_score_input_explanation_template</ConfName>
                            <ConfContent>
                                <![CDATA[<DIV id=editable>這是成績輸入說明文字樣版</DIV>]]></ConfContent>
                        </Configuration>
                    </Response>
                    */
                    if (response.Response && response.Response.Configuration) {
                        if (confName === 'teacher_score_input_explanation_template') {
                            _TextTemplate = response.Response.Configuration.ConfContent;
                        }
                        if (confName === 'teacher_score_upload_reminder_template') {
                            _ReminderTemplate = response.Response.Configuration.ConfContent;
                        }
                    }
                }
                _CallbackQueue.JobFinished();
            }
        });
    };

    //  驗證是否可上傳成績
    var _VerifySemesterScore = function(vCourseID) {
        var pCourseStudents = _CourseStudents[vCourseID];  
        var isValidate = true;

        var student_count = 0;
        if (pCourseStudents) {      
            for(var student_number in pCourseStudents) {
                var student = pCourseStudents[student_number];
                student_count = student_count + 1;

                if (!student.Score) {
                    isValidate = false;
                }
            }
        } else {
            isValidate = false;
        }
        if (student_count === 0) {
            return false;
        }
        return isValidate;
    };

    //  Update CourseExt
    var _UpdateCourseExt = function(vCourseID) {
        gadget.getContract(Contract.Teacher).send({
            service: Service.UpdateCourseExt,
            body: {
                Request: {
                    Course: {
                        CourseID: vCourseID,
                        Confirmed: true
                    }
                }
            },
            result: function(response, error, http) {
                if (error !== null) {
                    _InternalError.push('呼叫服務(' + Service.UpdateCourseExt + ')失敗或網路異常，請稍候重試！');
                } else {
                    if (response.Result != null) {
                        _TeacherCourses[vCourseID].Confirmed = 'true';
                    }
                }
                _CallbackQueue.JobFinished();
            }
        });
    };

    //  寫入上傳成績 Log
    var _AddLog = function(vCourseID, vCourseName) {    
        var log = "" + vCourseName + "\n";  
        var pCourseStudents = _CourseStudents[vCourseID];  
        for(var student_number in pCourseStudents) {
            var student = pCourseStudents[student_number];          
            log += "\n" + student.Department + "_" + student.StudentNumber + "_" + student.Name + "： " + student.Score + ($.trim(student.Remark) !== '' ? ", " + student.Remark : "");
        }

        gadget.getContract(Contract.Student).send({
            service: Service.AddLog,
            body: "<Request>\n  <Log>\n     <Actor>" + (gadget.getContract(Contract.Teacher).getUserInfo().UserName) + "</Actor>\n        <ActionType>更新</ActionType>\n       <Action>更新成績</Action>\n     <TargetCategory>ischool.emba.subject_semester_score</TargetCategory>\n      <ClientInfo><ClientInfo></ClientInfo></ClientInfo>\n        <ActionBy>ischool web 成績輸入小工具</ActionBy>\n      <Description>" + log + "</Description>\n    </Log>\n</Request>",
            result: function(response, error, http) {
                if (error !== null) {
                    _InternalError.push('呼叫服務(' + Service.AddLog + ')失敗或網路異常，請稍候重試！');
                } 
                _CallbackQueue.JobFinished();
            }
        });
    }; 

    //  對外發佈訊息
    var _RaiseEvent = function(type, o) {
        _CallbackQueue.JobFinished();        

        Teacher.Publish(o, type);                 
    };

    return {
        ClearInternalError: function() {
            _InternalError = [];
        },

        Init: function() {
            //  成績輸入說明樣版：teacher_score_input_explanation_template
            //  成績上傳提醒樣版：teacher_score_upload_reminder_template
            this.ClearInternalError();

            _CallbackQueue.Push(_GetScoreInputSemester);
            _CallbackQueue.Push([_GetSubjectScoreLock, _GetTeacherCourses, _GetCourseStudents, _GetCourseTeachers, function() {_GetTextTemplate('teacher_score_input_explanation_template')}, function() {_GetTextTemplate('teacher_score_upload_reminder_template')}]);
            _CallbackQueue.Push(function() {_RaiseEvent('teacher_course_loaded', _TeacherCourses)});   
            _CallbackQueue.Push(function() {_RaiseEvent('explanation_template_loaded', _TextTemplate)});                                  
            _CallbackQueue.Start();
        },

        GetReminderTemplate: function() {
            return _ReminderTemplate;
        },

        GetCourseStudents: function(vCourseID) {
            
            return _CourseStudents[vCourseID];
        },
    
        GetCourseTeachers: function(vCourseID) {
          
            return _CourseTeachers[vCourseID].join(',');
        },   

        GetStudentByStudentNumber: function(vCourseID, vStudentNumber) {

            return _CourseStudents[vCourseID][vStudentNumber];
        },
    
        GetSelectedCourse: function(vCourseID) {

            return _TeacherCourses[vCourseID];
        },   
    
        IsSubjectScoreLock: function() {

            return _SubjectScoreLock === 't' ? true : false;
        },    

        SaveSubjectSemesterScore: function(vCourseID) {
            var pCourseStudents = _CourseStudents[vCourseID];    
            var pCourse = _TeacherCourses[vCourseID];
            var pass_score = ["A+", "A", "A-", "B+", "B", "B-"];

            if (pCourseStudents) {                
                
                var add_content = [];
                var update_content = [];

                for(var student_number in pCourseStudents) {
                    var student = pCourseStudents[student_number];

                    if (student.Score) {
                        if (student.ScoreID) {
                            var score = {
                                Score: student.IsCancel === "t" ? "X" : student.Score,
                                IsPass: $.inArray(student.Score, pass_score) !== -1 ? true : false,
                                Remark: student.IsCancel === "t" ? "已停修" : student.Remark,
                                ScoreID: student.ScoreID
                            };
                            update_content.push(score);
                        } else {
                            var score = {
                                Score: student.IsCancel === "t" ? "X" : student.Score,
                                IsPass: $.inArray(student.Score, pass_score) !== -1 ? true : false,
                                Remark: student.IsCancel === "t" ? "已停修" : student.Remark,
                                OffsetCourse: "",
                                RefCourseID: vCourseID,
                                RefStudentID: student.StudentID,
                                RefSubjectID: pCourse.SubjectID,
                                SchoolYear: pCourse.SchoolYear,
                                Semester: pCourse.Semester,
                                Credit: pCourse.Credit,
                                IsRequired: pCourse.IsRequired === "true" ? true : false,
                                SubjectCode: pCourse.SubjectCode,
                                SubjectName: pCourse.SubjectName
                            };
                            add_content.push(score);
                        }
                    }
                }
                this.ClearInternalError();

                _CallbackQueue.Push(_GetCourseStudentPreUpload);
                _CallbackQueue.Push([function() {_UpdateSubjectSemesterScore(update_content)}, function() {_AddSubjectSemesterScore(add_content)}]);
                var o = {
                    InternalError: _InternalError,
                    WarningMessage: '',
                    SuccessMessage: '成績已暫存。'
                };
                _CallbackQueue.Push(function() {_RaiseEvent('save_subject_semester_score_complete', o)});   
                _CallbackQueue.Push(function() {_GetCourseStudents(vCourseID)});
                _CallbackQueue.Push(function() {_RaiseEvent('refresh_subject_semester_score', vCourseID)});

                _CallbackQueue.Start();             
            }
        },
    
        UpdateCourseExt: function(vCourseID, vCourseName) {
            if (!_VerifySemesterScore(vCourseID)) {
                var o = {
                    InternalError: _InternalError,
                    WarningMessage: '請完成所有成績輸入再繳交，謝謝。',
                    SuccessMessage: ''
                };
                _CallbackQueue.Push(function() {_RaiseEvent('update_course_ext_complete', o)});  
                _CallbackQueue.Start();
                return;
            }

            var pCourseStudents = _CourseStudents[vCourseID];    
            var pCourse = _TeacherCourses[vCourseID];
            var pass_score = ["A+", "A", "A-", "B+", "B", "B-"];

            if (pCourseStudents) {                
                
                var add_content = [];
                var update_content = [];

                for(var student_number in pCourseStudents) {
                    var student = pCourseStudents[student_number];

                    if (student.Score) {
                        if (student.ScoreID) {
                            var score = {
                                Score: student.IsCancel === "t" ? "X" : student.Score,
                                IsPass: $.inArray(student.Score, pass_score) !== -1 ? true : false,
                                Remark: student.IsCancel === "t" ? "已停修" : student.Remark,
                                ScoreID: student.ScoreID
                            };
                            update_content.push(score);
                        } else {
                            var score = {
                                Score: student.IsCancel === "t" ? "X" : student.Score,
                                IsPass: $.inArray(student.Score, pass_score) !== -1 ? true : false,
                                Remark: student.IsCancel === "t" ? "已停修" : student.Remark,
                                OffsetCourse: "",
                                RefCourseID: vCourseID,
                                RefStudentID: student.StudentID,
                                RefSubjectID: pCourse.SubjectID,
                                SchoolYear: pCourse.SchoolYear,
                                Semester: pCourse.Semester,
                                Credit: pCourse.Credit,
                                IsRequired: pCourse.IsRequired === "true" ? true : false,
                                SubjectCode: pCourse.SubjectCode,
                                SubjectName: pCourse.SubjectName
                            };
                            add_content.push(score);
                        }
                    }
                }
                this.ClearInternalError();

                _CallbackQueue.Push(_GetCourseStudentPreUpload);
                _CallbackQueue.Push([function() {_UpdateSubjectSemesterScore(update_content)}, function() {_AddSubjectSemesterScore(add_content)}, function() {_UpdateCourseExt(vCourseID)}, function() {_AddLog(vCourseID, vCourseName)}]);

                var oo = {
                    InternalError: _InternalError,
                    WarningMessage: '',
                    SuccessMessage: '成績已上傳。'
                };

                _CallbackQueue.Push(function() {_RaiseEvent('update_course_ext_complete', oo)}); 
                _CallbackQueue.Push(function() {_GetCourseStudents(vCourseID)});
                _CallbackQueue.Push(function() {_RaiseEvent('refresh_subject_semester_score', vCourseID)});

                _CallbackQueue.Start();    
            }
        }     
    };
};

//  **********  從這裡開始是 DataBinding：使用事件驅動模式+jQuery  **********        
var CreateEvent = function() {
    
    var _ShowErrorMessage = function(message) {
        $("#mainMsg").html('');
        if (message) {
            if (typeof message === 'object' && typeof message.length === 'number' && typeof message.splice === 'function' && !(message.propertyIsEnumerable('length'))) {
                $("#mainMsg").html("<div class='alert alert-error'>\n<strong>" + message.join('\n') + "</strong>\n</div>");
            } else {
                $("#mainMsg").html("<div class='alert alert-error'>\n<strong>" + message + "</strong>\n</div>");
            }
        }
    };

    var timeoutID;
    var _ShowSuccessMessage = function(message) {     
        if (message) {
            if (typeof message === 'object' && typeof message.length === 'number' && typeof message.splice === 'function' && !(message.propertyIsEnumerable('length'))) {
                $('#tab1Msg').html("<div class='alert alert-success'>" + message.join('\n') + "</div>");
            } else {
                $('#tab1Msg').html("<div class='alert alert-success'>" + message + "</div>");
            }
            clearTimeout(timeoutID);
            timeoutID = window.setTimeout(function() { 
               $('#tab1Msg').html('');
            }, 3000);
        }
    };

    var _ShowWarningMessage = function(message) {     
        if (message) {
            if (typeof message === 'object' && typeof message.length === 'number' && typeof message.splice === 'function' && !(message.propertyIsEnumerable('length'))) {
                $('#tab1Msg').html("<div class='alert alert-error'>" + message.join('\n') + "</div>");
            } else {
                $('#tab1Msg').html("<div class='alert alert-error'>" + message + "</div>");
            }
            clearTimeout(timeoutID);
            timeoutID = window.setTimeout(function() { 
               $('#tab1Msg').html('');
            }, 3000);
        }
    };

    var _DisableSaveButtion = function() {
        $("#btnSave").prop("disabled", true);
        $("#btnUpload").prop("disabled", true);
    };

    var _EnableSaveButtion = function(vCourseID) {
        //  是否已鎖定不得成績輸入？
        var pSubjectScoreLock = Teacher.IsSubjectScoreLock();

        //  是否已「確認」？
        var pSelectedCourse = Teacher.GetSelectedCourse(vCourseID);
        //  若未鎖定不得成績輸入，則判斷是否已確認。
        if (!pSubjectScoreLock) {        
            if (pSelectedCourse) {
                if (pSelectedCourse.Confirmed === 'true') {
                    $("#btnSave").prop("disabled", true);
                    $("#btnUpload").prop("disabled", true);
                } else {
                    $("#btnSave").prop("disabled", false);
                    $("#btnUpload").prop("disabled", false);
                }
            } else {
                $("#btnSave").prop("disabled", true);
                $("#btnUpload").prop("disabled", true);
            }
        } else {
            $("#btnSave").prop("disabled", true);
            $("#btnUpload").prop("disabled", true);            
        } 
    };

    return {
        Template_Loaded: function(vTemplate) {
            $('#explanation').html(vTemplate);
        },

        ComboBox_DataBind: function(vTeacher) {
            $('#InputSemester').html(ScoreInputSemester.SchoolYear + " 學年度 " + (ScoreInputSemester.Semester === '0' ? '夏季' : '第' + ScoreInputSemester.Semester) + "學期");
            $('#cboTeacherCourses').html("<option value='0'>- 請選擇課程 -</option>");
            var arrTeacher =[];
            for(var key in vTeacher) {
                arrTeacher.push(vTeacher[key]);
            }
            $(arrTeacher).sort(function(a, b) {return (a.SerialNo - b.SerialNo);}).each(function(index, item) {
                $('#cboTeacherCourses').append("<option value='" + item.CourseID + "'>" + item.CourseTitle + "</option>");
            });
            _DisableSaveButtion();
        },

        ComboBox_SelectedIndexChanged: function(vCourseID) {
            //  授課教師清單(不包含助教)
            $("#lblTeacherList").html('');
            if (vCourseID > 0) {
                $("#lblTeacherList").html("任課教師：" + (Teacher.GetCourseTeachers(vCourseID)));  
            } 

            //  是否已鎖定不得成績輸入？
            var pSubjectScoreLock = Teacher.IsSubjectScoreLock();

            //  是否已「確認」？
            var pSelectedCourse = Teacher.GetSelectedCourse(vCourseID);
            //  若未鎖定不得成績輸入，則判斷是否已確認。
            if (!pSubjectScoreLock) {        
                if (pSelectedCourse) {
                    if (pSelectedCourse.Confirmed === 'true') {
                        $("#btnSave").prop("disabled", true);
                        $("#btnUpload").prop("disabled", true);
                    } else {
                        $("#btnSave").prop("disabled", false);
                        $("#btnUpload").prop("disabled", false);
                    }
                } else {
                    $("#btnSave").prop("disabled", true);
                    $("#btnUpload").prop("disabled", true);
                }
            } else {
                $("#btnSave").prop("disabled", true);
                $("#btnUpload").prop("disabled", true);            
            } 

            //  修課學生
            $("#tblStudentList>tbody").html('');
            var pCourseStudents = Teacher.GetCourseStudents(vCourseID);        
            if (pCourseStudents) {
                var arrStudent =[];
                for(var key in pCourseStudents) {
                    arrStudent.push(pCourseStudents[key]);
                }
                $(arrStudent).sort(function(a, b) {
                    var aStudentNumber = a.StudentNumber.toLowerCase();
                    var bStudentNumber = b.StudentNumber.toLowerCase();
                    return ((aStudentNumber < bStudentNumber) ? -1 : ((aStudentNumber > bStudentNumber) ? 1 : 0));
                }).each(function(index, student) {
                    var remark_item, score_item;
                    //  若已鎖定不得成績輸入，則沒有成績輸入方塊，反之則有。
                    if (pSubjectScoreLock || (pSelectedCourse && pSelectedCourse.Confirmed === 'true')) {  
                        score_item = "<td>" + student.Score + "</td>";
                        remark_item = "<td>" + student.Remark + "</td>";
                    } else {
                        score_item = "<td>" + "<input class='input-block-level' type='text' value='" + student.Score + "' style='width:60px;text-align:center;border:1px solid #ddd;'/></td>";
                        remark_item = "<td>" + "<input maxlength='20' class='input-block-level' type='text' value='" + student.Remark + "' style='width:80px;text-align:center;border:1px solid #ddd;'/></td>";

                    }

                    //remark_item = "<td>" + student.ScoreID + "</td>";
                    if (student.IsCancel === "t") {
                      score_item = "<td>***</td>";
                      remark_item = "<td>已停修</td>";
                      student.Score = "***";
                      student.Remark = "已停修";
                    }
                    $("#tblStudentList>tbody").append("<tr><td>" + student.Department + "</td><td>" + student.StudentNumber + "</td><td>" + student.Name + "</td>" + score_item + remark_item + "</tr>");

                });
            }

            //  成績輸入方塊「上、下、Enter」選取文字效果
            $('input').on('keydown', function(e) {
                var current_td_index = $(this).closest('td').index();
                if (e.which === 13 || e.which === 40) {
                    $(this).closest('td').closest('tr').next().find('td:nth-child(' + (current_td_index + 1) + ')>input').focus();
                }
                if (e.which === 38) {
                    $(this).closest('td').closest('tr').prev().find('td:nth-child(' + (current_td_index + 1) + ')>input').focus();
                }
            });
            
            var timeoutID;
            $("input[type=text]").focus(function() { 
                var save_this = $(this);                

                clearTimeout(timeoutID);
                timeoutID = window.setTimeout (function(){ 
                   save_this.select(); 
                },50);
            });
            
            //  成績變更之驗證
            $('input').on('change', function() {
                
                var student_number = $(this).closest('td').closest('tr').find('td:nth-child(2)').html();
                var student = Teacher.GetStudentByStudentNumber(vCourseID, student_number);

                if ($(this).closest('td').index() === 4) {
                    student.Remark = $.trim($(this).val());
                    return;
                }
                var valid_score = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "F", "a+", "a", "a-", "b+", "b", "b-", "c+", "c", "c-", "f"];
                var value = $(this).val();
                var fixed_value = '';
                // score_type = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "F", "X", "***", ""];

                if ($.inArray(value, valid_score) === -1) {
                  // params.students[index].Score = '';
                    fixed_value = '';
                } else {
                    fixed_value = value.toUpperCase();
                }
                $(this).val(fixed_value);

                student.Score = fixed_value;
                // student.Remark = 
            });
        },

        SaveSubjectSemesterScore: function(vCourseID) {
            _DisableSaveButtion();
            Teacher.SaveSubjectSemesterScore(vCourseID);
        },

        UpdateCourseExt: function(vCourseID, vCourseName) {
            _DisableSaveButtion();
            Teacher.UpdateCourseExt(vCourseID, vCourseName);
        },

        UpdateCourseExt_Complete: function(message) {
            if (message && message.InternalError && message.InternalError.length > 0) {
                _ShowErrorMessage(message.InternalError);
            }
            if (message && message.SuccessMessage) {
                _ShowSuccessMessage(message.SuccessMessage);
            }
            if (message && message.WarningMessage) {
                _ShowWarningMessage(message.WarningMessage);
            }
            _EnableSaveButtion($("#cboTeacherCourses").val());
        },

        SaveSubjectSemesterScore_Complete: function(message) {
            if (message && message.InternalError && message.InternalError.length > 0) {
                _ShowErrorMessage(message.InternalError);
            }
            if (message && message.SuccessMessage) {
                _ShowSuccessMessage(message.SuccessMessage);
            }
            if (message && message.WarningMessage) {
                _ShowWarningMessage(message.WarningMessage);
            }
            _EnableSaveButtion($("#cboTeacherCourses").val());
        },

        RefreshStudentScore: function(vCourseID) {
            Event.ComboBox_SelectedIndexChanged(vCourseID);
        },

        PrintScore: function(type, vCourseID) {
            var currentCourse = Teacher.GetSelectedCourse(vCourseID);
            
            var content, doc, i, page_count, print_content, print_pages, _i;

            if (!currentCourse) {
                return;
            }

            if (type === "score" && currentCourse.Confirmed !== "true") {
                _ShowWarningMessage("成績尚未上傳，無法列印成績報告單。");
            } else {
                print_pages = [];
                print_content = [];
                var students = Teacher.GetCourseStudents(currentCourse.CourseID);
                var z = 0;
                for(var student_number in students) {
                    z = z + 1;
                }
                page_count = (parseInt(z / 50, 10)) + (z % 50 > 0 ? 1 : 0);
                for (i = _i = 0; 0 <= page_count ? _i < page_count : _i > page_count; i = 0 <= page_count ? ++_i : --_i) {
                    print_pages.push($("<div>" + ($(".print-page").html()) + "</div>"));
                }
                $(print_pages).each(function(index, page) {
                    var tr, _j;

                    $(page).find(".title").html("<div>臺灣大學 " + currentCourse.SchoolYear + " 學年度 " + (currentCourse.Semester === '0' ? '夏季' : '第' + currentCourse.Semester) + "學期成績報告單</div>");
                    $(page).find(".course-info .subject-code").html("課程編號：" + currentCourse.NewSubjectCode + " (" + currentCourse.SubjectCode + ")");
                    $(page).find(".course-info .subject-name").html("科目名稱：" + currentCourse.SubjectName);
                    $(page).find(".course-info .class-name").html("班次：" + currentCourse.ClassName);
                    $(page).find(".course-info .credit").html("學分：" + currentCourse.Credit);
                    $(page).find(".course-info .course-teacher").html($(".teacher-list").html());
                    $(page).find(".course-info .page-index").html("頁次：" + (index + 1) + " / " + print_pages.length);
                    $(page).find(".teacher-sign .subject-code").html("課程編號：" + currentCourse.NewSubjectCode + " (" + currentCourse.SubjectCode + ")");
                    $(page).find(".teacher-sign .subject-name").html("科目名稱：" + currentCourse.SubjectName);
                    $(page).find(".teacher-sign .class-name").html("班次：" + currentCourse.ClassName);
                    $(page).find(".score-detail table tbody").html("");
                    for (i = _j = 0; _j < 25; i = ++_j) {
                        tr = "";

                        var student_number = $("#tblStudentList>tbody>tr:nth-child(" + (index * 50 + i + 1) + ")>td:nth-child(2)").html();
                        var student = Teacher.GetStudentByStudentNumber(currentCourse.CourseID, student_number);

                        if (student) {
                            tr = "<td><div style='width:80px'>" + student.Department + "</div></td>\n<td><div style='width:20px'>&nbsp;</div></td>\n<td><div style='width:80px'>" + student.StudentNumber + "</div></td>\n<td><div style='width:100px'>" + student.Name + "</div></td>";
                            if (type === "score") {
                                tr += "<td>\n   <div style='width:40px'>" + (student.IsCancel !== "t" ? student.Score : "***") + "</div>\n</td>\n<td>\n   <div style='width:60px'>" + (student.IsCancel !== "t" ? student.Remark : "已停修") + "</div>\n</td>";
                            }
                            if (type === "clear") {
                                tr += "<td>\n   <div style='width:40px'>" + (student.IsCancel !== "t" ? "" : "***") + "</div>\n</td>\n<td>\n <div style='width:60px'>" + (student.IsCancel !== "t" ? "" : "已停修") + "</div>\n</td>";
                            }
                        } else {
                            tr += "<td><div style='width:80px'>&nbsp;</div></td>\n<td><div style='width:20px'>&nbsp;</div></td>\n<td><div style='width:80px'>&nbsp;</div></td>\n<td><div style='width:100px'>&nbsp;</div></td>\n<td><div style='width:40px'>&nbsp;</div></td>\n<td><div style='width:60px'>&nbsp;</div></td>";
                        }

                        var student_number = $("#tblStudentList>tbody>tr:nth-child(" + (index * 50 + i + 25 + 1) + ")>td:nth-child(2)").html();
                        student = Teacher.GetStudentByStudentNumber(currentCourse.CourseID, student_number);

                        if (student) {
                            tr += "<td><div style='width:80px'>" + student.Department + "</div></td>\n<td><div style='width:20px'>&nbsp;</div></td>\n<td><div style='width:80px'>" + student.StudentNumber + "</div></td>\n<td><div style='width:100px'>" + student.Name + "</div></td>";
                            if (type === "score") {
                                tr += "<td>\n   <div style='width:40px'>" + (student.IsCancel !== "t" ? student.Score : "***") + "</div>\n</td>\n<td>\n   <div style='width:60px'>" + (student.IsCancel !== "t" ? student.Remark : "已停修") + "</div>\n</td>";
                            }
                            if (type === "clear") {
                                tr += "<td>\n   <div style='width:40px'>" + (student.IsCancel !== "t" ? "" : "***") + "</div>\n</td>\n<td>\n <div style='width:60px'>" + (student.IsCancel !== "t" ? "" : "已停修") + "</div>\n</td>";
                            }
                        } else {
                            tr += "<td><div style='width:80px'>&nbsp;</div></td>\n<td><div style='width:20px'>&nbsp;</div></td>\n<td><div style='width:80px'>&nbsp;</div></td>\n<td><div style='width:100px'>&nbsp;</div></td>\n<td><div style='width:40px'>&nbsp;</div></td>\n<td><div style='width:60px'>&nbsp;</div></td>";
                        }
                        $("<tr>" + tr + "</tr>").appendTo($(page).find(".score-detail table tbody"));
                    }
                    print_content.push($(page).html());
                });
                content = print_content.join("<P style='page-break-after:always'>&nbsp;</P>");
                content = "<!DOCTYPE html>\n<html>\n <head><title></title>\n        <link type=\"text/css\" rel=\"stylesheet\" href=\"css/scorekit.css\"/>\n    </head>\n   <body onload=\"window.print();\">\n        <div style='width:880px;padding:40px 20px'>" + content + "</div>\n  </body>\n</html>";
                doc = window.open('', '_blank', '');
                doc.document.open();
                doc.document.write(content);
                doc.document.close();
                doc.focus();
            }
        }
    }
};

//  備妥 Data Model
var Teacher = CreateTeacher();
//  使用 Observer Patterns 做為 Data Model 對外溝通的橋梁
var Publisher = CreatePublisher();
//  將 Teacher 物件轉變為出版者
MakePublisher(Teacher, Publisher);

//  使用事件整合 Data Model 與 HTML
var Event = CreateEvent();

$(document).ready(function() {

    //  **********  註冊事件    **********  //
    //  登入教師授課清單(下拉式選單資料繫結)
    Teacher.Subscribe(Event.ComboBox_DataBind, 'teacher_course_loaded');
    //  成績輸入說明樣版
    Teacher.Subscribe(Event.Template_Loaded, 'explanation_template_loaded')
    //  暫存成績完畢
    Teacher.Subscribe(Event.SaveSubjectSemesterScore_Complete, 'save_subject_semester_score_complete');
    //  上傳成績完畢
    Teacher.Subscribe(Event.UpdateCourseExt_Complete, 'update_course_ext_complete');
    //  更新學生成績資料(主要是取回新增之成績的 ScoreID, 下次再暫存才會 Update 而不是又新增乙次)
    Teacher.Subscribe(Event.RefreshStudentScore, 'refresh_subject_semester_score');
    //  Data Model 開始取得資料
    Teacher.Init();

    //  課程之下拉式選單的值改變時
    $("#cboTeacherCourses").on('change', function() {
        Event.ComboBox_SelectedIndexChanged($("#cboTeacherCourses").val());
    });

    //  「儲存(暫存)成績」
    $("#btnSave").on('click', function() {
        Event.SaveSubjectSemesterScore($("#cboTeacherCourses").val());
    });

    //  確認並上傳成績
    $("#btnUpload").on('click', function() {
        getConfirm(Teacher.GetReminderTemplate, function(result) {
            if (result) {
                Event.UpdateCourseExt($("#cboTeacherCourses").val(), $("#cboTeacherCourses").find("option:selected").text());
            }
        });
    });

    //  列印空白成績單
    $("#btnPrintEmptyScoreSheet").on('click', function() {
        Event.PrintScore('clear', $("#cboTeacherCourses").val());
    });

    //  列印成績報告單
    $("#btnPrintScoreSheet").on('click', function() {
        Event.PrintScore('score', $("#cboTeacherCourses").val());
    });
    
});  


//  Singleton Patterns：另1種用法
// function Teacher() {

//     //  cached instance 
//     var instance;

//     //  重新定義建構式
//     Teacher = function Teacher() {
//         return instance;
//     };

//     //  帶上原型屬性
//     Teacher.prototype = this;

//     //  建立實體
//     instance = new Teacher();

//     //  重設建構式指標
//     instance.constructor = Teacher;

//     return instance;
// }


    // **********  Domain Knowledge  **********    
    // 1、取得「成績輸入學年期」資料。

    //      contract：emba.teacher

    //      service：default.GetScoreInputSemester

    // 2、取得「登入教師」之「授課清單」。

    //      contract：emba.teacher

    //      service：default.GetMyCourses

    // 3、取得選取課程之「俢課學生」及其成績資料。

    //      contract：emba.teacher

    //      service：default.GetStudents

    // 4、取得選取課程之「授課教師」。

    //      contract：emba.teacher

    //      service：default.GetCourseTeacherList

    // 5、判斷成績是否已鎖定不可上傳。

    //      contract：emba.teacher

    //      service：default.GetSubjectScoreLock

    // 6、「儲存」成績之新增。

    //      contract：emba.teacher

    //      service：default.AddSubjectSemesterScore

    // 7、「儲存」成績之修改。

    //      contract：emba.teacher

    //      service：default.UpdateSubjectSemesterScore

    // 8、「上傳成績」。

    //      contract：emba.teacher

    //      service：default.UpdateCourseExt

    // 9、「記錄 Log」。

    //      contract：emba.teacher

    //      service：default.AddLog