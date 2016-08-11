
var connection = gadget.getContract("emba.survey.student");
var oAchievingRate = {};
var oConfiguration = {}; 
var oSurveyHistoryTemplateDescriptionSubfix = 'survey-history-description';

var CallbackQueue_History = {
    Queues: [],
    Index: 0,
    Queue: function(object){
    	CallbackQueue_History.Queues.push(object);
    },
    JobFinished: function(object){
    	if (CallbackQueue_History.Queues.length === 0)
            return;

    	CallbackQueue_History.Index += 1;
    	if (CallbackQueue_History.Index > CallbackQueue_History.Queues.length) {
            return;
        }
    	CallbackQueue_History.Queues[CallbackQueue_History.Index - 1]();
    },
    ResetIndex: function(){
    	CallbackQueue_History.Index = 0;
    },
    DeQueue: function(index){
    	CallbackQueue_History.Queues[index]();
    }
};

var SurveyChanged_Handler = SurveyChanged_Handler || {
    Subscribers: [],
    Subscribe: function(object){
        SurveyChanged_Handler.Subscribers.push(object);
    },
    SurveyChanged: function(){
        var length = SurveyChanged_Handler.Subscribers.length;
        for (var i = 0; i < length; i++) {
          SurveyChanged_Handler.Subscribers[i]();
        }
    }
};

var SurveyAfterChanged = function(){
	CallbackQueue_History.ResetIndex();
	CallbackQueue_History.DeQueue(0);
};

var GetAchievingRate = function() {
    connection.send({
        service: "_.GetAchievingRate",
        body: '<Request><Order><SchoolYear></SchoolYear><Semester></Semester></Order></Request>',
        result: function (response, error, http) {
            if (error !== null) {
                $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗，請稍候重試!</strong>(GetAchievingRate)\n</div>");
            } else {

                /*
                <Response>
                    <AchievingRate>
                        <Rate>80</Rate>
                        <SchoolYear>100</SchoolYear>
                        <Semester>0</Semester>
                    </AchievingRate>
                </Response>
                */

                if (response.Response && response.Response.AchievingRate) {
                    oAchievingRate = response.Response.AchievingRate;
                    // console.log(JSON.stringify(oAchievingRate));
                }
            }
            CallbackQueue_History.JobFinished();
        }
    });
};

var GetTextTemplate = function() {
    connection.send({
        service: "_.GetCSConfiguration",
        body: {},
        result: function (response, error, http) {
            if (error !== null) {
                $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗，請稍候重試!</strong>(GetTextTemplate)\n</div>");
            } else {
                /*
                <Response>
                    <Configuration>
                        <ConfName>101-2-survey-history-description</ConfName>
                        <ConfContent>
                            <![CDATA[]]>
                        </ConfContent>
                    </Configuration>
                </Response>
                */
                if (response.Response && response.Response.Configuration) {
                    oConfiguration = response.Response.Configuration;
                    // console.log(JSON.stringify(oConfiguration));
                }
            }
            CallbackQueue_History.JobFinished();
        }
    });
};

var GetCanSeeCurriculumEvaluation = function() {
    $('#show_course_evaluation').hide();
    connection.send({
        service: "ext.CanSeeEvaluationRate",
        body: "<Request></Request>",
        result: function (response, error, http){
            if (error !== null) {
                $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗，請稍候重試!</strong>(CanSeeEvaluationRate)\n</div>");
            } else {
                /*
                    <myEntranceSchoolYear>104</myEntranceSchoolYear>
                    <csSchoolYear>105</currentSchoolYear>
                    <csSemester>0</currentSemester>
                    <isNewStudent>false</isNewStudent>
                    <targetSchoolYear>104</targetSchoolYear>
                    <targetSemester>2</targetSemester>
                    <surveyCount>8</surveyCount>
                    <replyCount>8</replyCount>
                    <answerRate>100</answerRate>
                    <ansRateStandard>70</ansRateStandard>
                    <canSee>true</canSee>
                */
                console.log(response);
                if (response.canSee && response.canSee == "true") {
                    var msg =  [ 
                                "<div style='color:red;'>",
                                response.csSchoolYear,  "學年度 第" , 
                                response.csSemester , "學期 選課參考依據 : ",
                                "<a href='#' class='alert-link' ",
                                "   onclick='showEvaluation(", response.csSchoolYear , "," , response.csSemester ,");'>查看本期評鑑公告</a>"
                            ].join("");
                    if (response.isNewStudent && response.isNewStudent == "true") {
                        msg =  [ 
                                msg,
                                "( 您是新生 )" ,
                                "</div>"
                            ].join("");
                    }
                    else {
                        msg =  [ 
                                msg,
                                "( 您的 ", response.targetSchoolYear , "/" , 
                                response.targetSemester , " 評鑑填答率為 ", 
                                response.answerRate , "% , 符合查看條件。)" ,
                                "</div>"
                            ].join("");
                    }
                    msg += ["<div>查看參考依據，是依前2學期之問卷填答率達到：",
                             response.ansRateStandard ,
                              "% 才可以查看選課課程之評鑑值</div>"].join("");
                    $('#show_course_evaluation').html(msg).show();
                }
                else {
                    var msg =  [ 
                                "<div style='color:red;'>",
                                "( 您的 ", response.targetSchoolYear , "/" , 
                                response.targetSemester , " 評鑑填答率為 ", 
                                response.answerRate , "% , 不符合查看本期選課課程評鑑值之條件。)" ,
                                "</div>"
                            ].join("");
                    msg += ["<div>查看參考依據，是依前2學期之問卷填答率達到：",
                             response.ansRateStandard ,
                              "% 才可以查看選課課程之評鑑值</div>"].join("");
                    $('#show_course_evaluation').html(msg).show();
                }
            }

            CallbackQueue_History.JobFinished();
        }
    });
};

var evalContent ;

var showEvaluation = function(schoolyear, semester) {
    var content = ["<Body><Request><SchoolYear>", schoolyear , "</SchoolYear><Semester>" , semester , "</Semester></Request></Body>"].join("");
    console.log(content);
    var myWindow = window.open("show_curriculum_evaluation.html", "MsgWindow"+ (new Date()), "width=600,height=400,location=no,toolbar=no,menubar=no,scrollbars=yes,resizable=yes,top=100,left=100");
    connection.send({
        service: "ext.GetCurriculumEvaluation",
        body: content ,
        result: function (response, error, http){
            if (error !== null) {
                $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗，請稍候重試!</strong>(GetReplyHistory)\n</div>");
            } else {
                var content = parseEvaluation(response);
                evalContent = content ;

                // $(myWindow).ready(function(){
                //     if(!!myWindow.showContent)
                //         myWindow.showContent();
                //     //myWindow.document.write(html);
                // });
            }

            
            // $(myWindow.document).ready(function() {
            //     myWindow.data_content = html;
            //     // myWindow.showContent(html);
            // });
        }
    });

    var parseEvaluation = function(response) {
        console.log(response);
        var content= "<table class='table'>";
        content += "<thead><tr><th>課程</th><th>課程代碼</th><th>評鑑值</th></thead><tbody>";
        if (response.Response && response.Response.Evaluation) {
            $(response.Response.Evaluation).each(function(index, item) {
                content += "<tr>";
                content += ["<td>" , item.SubjectName , "</td>"].join("");
                content += ["<td>" , item.NewSubjectCode , "</td>"].join("");
                content += ["<td>" , item.Value , "</td>"].join("");
                content += "</tr>";
            });
        }
        content += "</tbody></table>";

        return content;
    };

};


var GetReplyHistory = function() {
    connection.send({
        service: "_.GetReplyHistory",
        body: "<Request><Order><SchoolYear>DESC</SchoolYear><Semester>DESC</Semester><EndTime></EndTime><CourseID></CourseID></Order></Request>",
        result: function (response, error, http){
            if (error !== null) {
                $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗，請稍候重試!</strong>(GetReplyHistory)\n</div>");
            } else {

                /*
                <ReplyHistory>
                    <SchoolYear>101</SchoolYear>
                    <Semester>2</Semester>
                    <CourseID>522</CourseID>
                    <CourseName>企業價值衡量 </CourseName>
                    <SurveyCount>1</SurveyCount>
                    <AnswerCount/>
                </ReplyHistory>
                */

                if (response.Response && response.Response.ReplyHistory) {
                    // console.log(JSON.stringify(response.Response.ReplyHistory));

                    var _school_year = '';
                    var _semester = '';
                    var _surveyCount = 0;
                    var _answerCount = 0;
                    var _achievingRate;
                    var _is_qualify = true;
                    var _survey_detail_string = '';

                    $(response.Response.ReplyHistory).each(function(index, item) {
                        //  學年期更換，加學年期標題
                        if (item.SchoolYear != _school_year || item.Semester != _semester) {
                        	var ret = "<p><h4 align='center'>" + item.SchoolYear + '學年度' + (item.Semester === '0' ? '夏季學期' : '第' + item.Semester + '學期') + "</h4></p>" +
                                    "<table id='" + item.SchoolYear + "-" + item.Semester + "' class='table table-bordered table-striped table-list survey-history-table'>" +
                                    "<thead><tr><th>課程名稱</th><th>問卷數</th><th>問卷完成數</th></tr></thead>" +
                                    "<tbody></tbody>" +
                                    "<tfoot><tr><td class='my-totle-style'>合計</td>" +
                                    "<td class='my-surveyCount my-totle-style'></td>" +
                                    "<td class='my-answerCount my-totle-style'></td>" +
                                    "<tr><td class='my-totle-style'>問卷填答率</td><td colspan='2' class='my-answerRate my-totle-style'></td></tr>" +
                                    "<tr><td colspan='3' class='my-survey-history-description'></td></tr></tfoot></table><p>&nbsp;</p>";
                            // console.log(ret);
                            $('#survey-history').append(ret);
                            //$('tfoot>tr>td').css('text-align', 'center');
                            _surveyCount = 0;
                            _answerCount = 0;
                            _achievingRate = '';
                            _is_qualify = true;

                            $(oAchievingRate).each(function(x, y){
                                if (item.SchoolYear === y.SchoolYear && item.Semester === y.Semester)
                                    _achievingRate = y.Rate;
                            });

                            var _survey_history_template_key = item.SchoolYear + '-' + item.Semester + '-' + oSurveyHistoryTemplateDescriptionSubfix;
                            $(oConfiguration).each(function(x, y){
                                // console.log(x.ConfName);
                                if (y.ConfName == _survey_history_template_key){
                                    $('#' + item.SchoolYear + "-" + item.Semester + ' .my-survey-history-description').html(y.ConfContent);
                                }
                            });
                        }
                        _survey_detail_string = "<tr><td>" + item.CourseName + "</td><td>" + item.SurveyCount + "</td>" +
                                                (item.AnswerCount ? "<td>" + item.AnswerCount + "</td>" : "<td style='color:red'>0</td>");

                        $("#" + item.SchoolYear + "-" + item.Semester + " tbody").append(_survey_detail_string);

                        _surveyCount += parseInt(item.SurveyCount);
                        _answerCount += parseInt(item.AnswerCount ? item.AnswerCount : '0');
                        _answerRate = Math.ceil(_answerCount*100/_surveyCount);
                        _is_qualify = ((item.AnswerCount) ? true : false) && _is_qualify;
                        // console.log(item.AnswerCount + "-" + _is_qualify);

                        /*
                        JavaScript的四捨五入、無條件捨去、無條件進位
                        Math.round() ，Math.floor()，Math.ceil()

                        Math.round() 四捨五入
                        Math.floor() 取小於這個數的最大整數
                        Math.ceil() 取大於這個數的最小整數
                        */
                        //console.log(_answerCount);$("#102-0").find("tr:nth-last-child(2)")
                        // console.log(_surveyCount);
                        $('#' + item.SchoolYear + "-" + item.Semester + ' .my-surveyCount').html(_surveyCount);
                        $('#' + item.SchoolYear + "-" + item.Semester + ' .my-answerCount').html(_answerCount);
                        $('#' + item.SchoolYear + "-" + item.Semester + ' .my-answerRate').html(_answerRate + "%");

                        _school_year = item.SchoolYear;
                        _semester = item.Semester;
                    });
                } else {
                	$('#survey-history').html('<h4>無歷史填答記錄</h4>');
                }
            }
            CallbackQueue_History.JobFinished();
        }
    });
};

var ClearHTML = function(){
    $('#survey-history').html('');
    CallbackQueue_History.JobFinished();
};

$(document).ready(function() {
    SurveyChanged_Handler.Subscribe(SurveyAfterChanged);

    CallbackQueue_History.Queue(ClearHTML);
    CallbackQueue_History.Queue(GetTextTemplate);
    CallbackQueue_History.Queue(GetAchievingRate);
    CallbackQueue_History.Queue(GetCanSeeCurriculumEvaluation);
    CallbackQueue_History.Queue(GetReplyHistory);
    CallbackQueue_History.DeQueue(0);
});

