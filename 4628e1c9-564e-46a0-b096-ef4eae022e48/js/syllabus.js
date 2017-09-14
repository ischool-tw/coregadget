function syllabus() {
    //  主框架
    var mainHtml = $('#syllabus');

    //  目前學年期
    var _CurrentSemester;

    function init() {
        var currentSemesterIsReady = false;
        var courseSemeListIsReady = false;

        function loaded(loadedName) {
            if (loadedName == '_GetCurrentSemester') currentSemesterIsReady = true;
            if (loadedName == '_GetCourseSemeList') courseSemeListIsReady = true;
            if (currentSemesterIsReady && courseSemeListIsReady) {
                toggleYearSeme();
            }
        }

        _GetCurrentSemester(loaded);
        _GetCourseSemeList(loaded);
    }

    // 處理學年期的文字
    function convertSeme(value) {
        return (value=='0' ? '夏季' : '第' + value) + '學期';
    }

    //  系統目前學年期
    var _GetCurrentSemester = function(callback) {
        gadget.getContract('basic.public').send({
            service: '_.GetCurrentSemester',
            body: '',
            result: function (response, error, http) {
                if (!error) {
                    _CurrentSemester = response;
                    callback('_GetCurrentSemester');
                }
            }
        });
    };

    // 系統全部課程的學年期分佈清單
    var _GetCourseSemeList = function(callback) {
        gadget.getContract('emba.teacher').send({
            service: 'default.GetCourseSemeList',
            body: '',
            result: function (response, error, http) {
                if (!error) {
                    var list = [].concat(response.Response.SemesterList || []);
                    var dropdownSchoolYear = [];
                    var tmpYear = [];

                    list.forEach(function(item, idx) {
                        var itemYear = item.SchoolYear;
                        if (tmpYear.indexOf(itemYear) == -1) {
                            tmpYear.push(itemYear);
                            dropdownSchoolYear.push('<li onclick="mySyllabus.toggleYearSeme(\'year\', '+itemYear+')"><a href="#">'+ itemYear +'學年度</a></li>');
                        }
                    });

                    var html = '<div class="btn-group">' +
                        '<a class="btn btn-info btn-xs dropdown-toggle" data-toggle="dropdown" href="#">' +
                            '<span data-js="currSchoolYear"></span>' +
                            '<span class="caret"></span>' +
                        '</a>' +
                        '<ul class="dropdown-menu my-dropdown-menu">' + dropdownSchoolYear.join('') + '</ul>' +
                        '</div>' +
                        '<div class="btn-group">' +
                        '<a class="btn btn-info btn-xs dropdown-toggle" data-toggle="dropdown" href="#">' +
                            '<span data-js="currSemester"></span>' +
                            '<span class="caret"></span>' +
                        '</a>' +
                        '<ul class="dropdown-menu my-dropdown-menu">' +
                            '<li onclick="mySyllabus.toggleYearSeme(\'seme\', 0)"><a href="#">夏季學期</a></li>' +
                            '<li onclick="mySyllabus.toggleYearSeme(\'seme\', 1)"><a href="#">第1學期</a></li>' +
                            '<li onclick="mySyllabus.toggleYearSeme(\'seme\', 2)"><a href="#">第2學期</a></li>' +
                        '</ul>' +
                        '</div>';
                    mainHtml.find('div[data-js="dropdown"]').html(html);
                    callback('_GetCourseSemeList');
                }
            }
        });
    };

    var getCourseType = function (type) {
        switch (type) {
            case '核心必修':
                return '<span class="label label-important">核必</span>';
            case '核心選修':
                return '<span class="label label-warning">核選</span>';
            case '分組必修':
                return '<span class="label label-success">組必</span>';
            case '選修':
                return '<span class="label my-label-info">選修</span>';
            default:
                return '<span class="label">' + type + '</span>';
        }
    };

    var getCourseNameHtml = function (vCourseName, vSyllabus) {
        if (vSyllabus) 
            return '<a href="' + vSyllabus + '" target="_blank">' + vCourseName + '</a>';
        else
            return '<span>' + vCourseName + '</span>';
    };

    var parseTeacherURL = function(value) {
        var tmp = '', ret = [];
        if (value) {
            tmp = value.split(', ');
            $(tmp).each(function (index, teacher) {
                if (($(teacher).attr('href'))) {
                    ret.push('<a href="' + $(teacher).attr('href') + '" target="_blank">' + $(teacher).html() + '</a>');
                } else {
                    ret.push($(teacher).html());
                }
            })
        }
        return ret.join(', ');
    };

    // 課程大綱
    var _GetSemesterCourses = function(vSchoolYear, vSemester) {
        mainHtml.find('[data-js="haveData"]').html('').show();

        gadget.getContract('emba.teacher').send({
            service: 'default.GetSemesterCourses',
            body: "<Request><Condition><SchoolYear>"+vSchoolYear+"</SchoolYear><Semester>"+vSemester+"</Semester></Condition></Request>",
            result: function (response, error, http) {
                if (!error) {
                    /*
                    <Response>
                        <Course>
                            <CourseID>917</CourseID>
                            <CourseName>策略成本管理 03</CourseName>
                            <Credit>3</Credit>
                            <Capacity>0</Capacity>
                            <CourseTimeInfo/>
                            <Classroom/>
                            <Syllabus/>
                            <Memo/>
                            <CourseType/>
                            <NewSubjectCode>Acc(722 M0110)</NewSubjectCode>
                            <ClassName>03</ClassName>
                            <SerialNo>0</SerialNo>
                            <TeacherName/>
                            <TeacherURLName/>
                        </Course>...
                    */
                    if (response.Response) {
                        var courseSyllabus = [].concat(response.Response.Course || []);

                        var coursesHtml = [];
                        courseSyllabus.forEach(function(item, idx) {
                            coursesHtml.push(
                                '<tr>' +
                                    '<td>' + item.NewSubjectCode + '</td>' +
                                    '<td>' + item.ClassName + '</td>' +
                                    '<td>' + 
                                        getCourseType(item.CourseType) + '&nbsp;' +
                                        getCourseNameHtml(item.CourseName, item.Syllabus) +
                                    '</td>' +
                                    '<td>' + parseTeacherURL(item.TeacherURLName) + '</td>' +
                                    '<td>' + item.Credit + '</td>' +
                                    '<td>' + item.Capacity + '</td>' +
                                    '<td>' + item.Classroom + '</td>' +
                                    '<td>' + item.CourseTimeInfo + '</td>' +
                                '</tr>'
                            );
                        });

                        if (courseSyllabus.length > 0) {
                            mainHtml.find('[data-js="haveData"]').html(coursesHtml.join('')).show();
                            mainHtml.find('[data-js="noData"]').hide();
                        } else {
                            mainHtml.find('[data-js="haveData"]').html('').hide();
                            mainHtml.find('[data-js="noData"]').show();                        
                        }
                    }

                    mainHtml.find('div[data-js="content"]').html('');
                }
            }
        });
    };

    var toggleYearSeme = function(type, value) {
        if (type == 'year') _CurrentSemester.SchoolYear = value;
        if (type == 'seme') _CurrentSemester.Semester = value;

        mainHtml.find('[data-js="currSchoolYear"]').html(_CurrentSemester.SchoolYear + ' 學年度');
        mainHtml.find('[data-js="currSemester"]').html(convertSeme(_CurrentSemester.Semester));

        _GetSemesterCourses(_CurrentSemester.SchoolYear, _CurrentSemester.Semester);
    }

    init();

    return {
        toggleYearSeme: toggleYearSeme
    }
}

$(document).ready(function() {
    //  課程大綱頁籤
    $("#tabSyllabus").on('click', function () {
        $("#statistics-container").hide();
    });

    window.mySyllabus = syllabus();
});
