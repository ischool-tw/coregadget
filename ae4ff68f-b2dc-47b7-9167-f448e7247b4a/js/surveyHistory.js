
var connection = gadget.getContract("emba.survey.student");   
var oAchievingRate = {};
var oConfiguration = {};
var oSurveyHistoryTemplateDescriptionSubfix = 'survey-history-description';

var CallbackQueue = CallbackQueue || {
    Queues: [],
    Index: 0,
    Queue: function(object){
        CallbackQueue.Queues.push(object);
    },
    JobFinished: function(object){
        if (CallbackQueue.Queues.length === 0)
            return;

        CallbackQueue.Index += 1;
        if (CallbackQueue.Index > CallbackQueue.Queues.length){
            return;
        }
        CallbackQueue.Queues[CallbackQueue.Index - 1]();
    },
    ResetIndex: function(){
        CallbackQueue.Index = 0;
    },
    DeQueue: function(index){
        CallbackQueue.Queues[index]();
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
    CallbackQueue.ResetIndex();
    CallbackQueue.DeQueue(0);
};

var GetAchievingRate = function() {
    connection.send({
        service: "_.GetAchievingRate",
        body: '<Request><Order><SchoolYear></SchoolYear><Semester></Semester></Order></Request>',
        result: function (response, error, http) {
            if (error !== null) {
                $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetAchievingRate)\n</div>");
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
                    console.log(JSON.stringify(oAchievingRate));
                }
                CallbackQueue.JobFinished();
            }
        }
    });
};

var GetTextTemplate = function() {
    connection.send({
        service: "_.GetCSConfiguration",
        body: {},
        result: function (response, error, http) {
            if (error !== null) {
                $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetTextTemplate)\n</div>");
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
                    console.log(JSON.stringify(oConfiguration));
                }
                CallbackQueue.JobFinished();
            }
        }
    });
};

var GetReplyHistory = function() {
    connection.send({
        service: "_.GetReplyHistory",
        body: "<Request><Order><SchoolYear>DESC</SchoolYear><Semester>DESC</Semester><EndTime></EndTime><CourseID></CourseID></Order></Request>",
        result: function (response, error, http){
            if (error !== null) {
                $("#mainMsg").html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  <strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(GetReplyHistory)\n</div>");
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
                    console.log(JSON.stringify(response.Response.ReplyHistory));

                    var _school_year = '';                    
                    var _semester = '';
                    var _surveyCount = 0;
                    var _answerCount = 0;
                    var _achievingRate;
                    var _is_qualify = true;
                    var _qualify_string = '';
                    var _survey_detail_string = '';

                    $(response.Response.ReplyHistory).each(function(index, item) {
                        //  學年期更換，加學年期標題
                        if (item.SchoolYear != _school_year || item.Semester != _semester) {
                        	var ret = "<p><h4 align='center'>" + item.SchoolYear + '學年度' + (item.Semester === '0' ? '夏季學期' : '第' + item.Semester + '學期') + "</h4></p>" +
                                     "<table id='" + item.SchoolYear + "-" + item.Semester + "' class='table table-bordered table-striped table-list survey-history-table'>" +
                                     "<thead><tr><th>課程名稱</th><th>問卷數</th><th>問卷完成數</th><th>符合填答課程條件</th></tr></thead><tbody>" + 
                                     "<tr><td>合計</td><td></td><td></td><td rowspan='2'></td></tr>" + 
                                     "<tr><td>問卷填答率</td><td colspan='2'></td></tr></tbody>" + 
                                     "<tfoot><tr><td colspan='4'></td></tr></tfoot></table><p>&nbsp;</p>";  
                            //console.log(ret);
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
                                console.log(x.ConfName);
                                if (y.ConfName == _survey_history_template_key){
                                    $('#' + item.SchoolYear + "-" + item.Semester).find("tfoot:last-child>tr:last-child>td").html(y.ConfContent);
                                }
                            });                            
                        }
                        _survey_detail_string = "<tr><td>" + item.CourseName + "</td><td>" + item.SurveyCount + "</td>" + 
                                                (item.AnswerCount ? "<td>" + item.AnswerCount + "</td>" : "<td style='color:red'>0</td>") + 
                                                (item.AnswerCount ? "<td>是</td>" : "<td style='color:red'>否</td>") + "</tr>";
                        $("#" + item.SchoolYear + "-" + item.Semester + " > tbody:first").before(_survey_detail_string);
                        
                        _surveyCount += parseInt(item.SurveyCount);
                        _answerCount += parseInt(item.AnswerCount ? item.AnswerCount : '0');
                        _answerRate = Math.ceil(_answerCount*100/_surveyCount);
                        _is_qualify = ((item.AnswerCount) ? true : false) && _is_qualify;
                        console.log(item.AnswerCount + "-" + _is_qualify);

                        if (!_is_qualify){
                            _qualify_string = "<span class='label label-important' style='font-size:14px'>不符合優先選課條件</span>";
                        }
                        else{
                            if (!_achievingRate)
                                _qualify_string = "<span class='label label-important' style='font-size:14px'>不符合優先選課條件</span>";
                            else {
                                if (parseInt(_answerRate) >= parseInt(_achievingRate))
                                    _qualify_string = "<span class='label label-success' style='font-size:14px'>符合優先選課條件</span>";
                                else
                                    _qualify_string = "<span class='label label-important' style='font-size:14px'>不符合優先選課條件</span>";
                            }                            
                        }

                        /*
                        JavaScript的四捨五入、無條件捨去、無條件進位
                        Math.round() ，Math.floor()，Math.ceil()

                        Math.round() 四捨五入
                        Math.floor() 取小於這個數的最大整數
                        Math.ceil() 取大於這個數的最小整數
                        */
                        //console.log(_answerCount);$("#102-0").find("tr:nth-last-child(2)")
                        console.log(_surveyCount);
                        $('#' + item.SchoolYear + "-" + item.Semester).find("tbody>tr:nth-last-child(2)>td:nth-child(2)").html(_surveyCount);
                        $('#' + item.SchoolYear + "-" + item.Semester).find("tbody>tr:nth-last-child(2)>td:nth-child(3)").html(_answerCount);
                        $('#' + item.SchoolYear + "-" + item.Semester).find("tbody>tr:nth-last-child(2)>td:last-child").html(_qualify_string);
                        $('#' + item.SchoolYear + "-" + item.Semester).find("tbody>tr:last-child>td:nth-child(2)").html(_answerRate + "%");

                        _school_year = item.SchoolYear;
                        _semester = item.Semester;
                    });
                } else {
                	$('#survey-history').html('<h4>無歷史填答記錄</h4>');
                }

                CallbackQueue.JobFinished();
            }
        }
    });
};

var ClearHTML = function(){
    $('#survey-history').html('');
    CallbackQueue.JobFinished();
};

$(document).ready(function() {
    SurveyChanged_Handler.Subscribe(SurveyAfterChanged);

    CallbackQueue.Queue(ClearHTML);
    CallbackQueue.Queue(GetTextTemplate);
    CallbackQueue.Queue(GetAchievingRate);
    CallbackQueue.Queue(GetReplyHistory);
    CallbackQueue.DeQueue(0);
});

