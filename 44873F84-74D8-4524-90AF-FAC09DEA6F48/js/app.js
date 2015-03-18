var app = angular.module('app', []);

app.controller('MainCtrl', ['$scope', '$http', function($scope, $http) {

    $scope.system_position = gadget.params.system_position || "student";

    $scope.GetClass = function() {
        $scope.connection.send({
            service: "_.GetClass",
            body: '',
            result: function(response, error, http) {

                if (error) {
                    if (error.dsaError && error.dsaError.message)
                        alert("查詢過程發生錯誤:\r\n" + error.dsaError.message);
                    if (error.loginError && error.loginError.message)
                        alert("查詢過程發生錯誤,請確認此帳號有正確身分:\r\n" + error.loginError.message);
                } else {

                    $scope.Class = [].concat(response.Class || []);

                    if ($scope.Class.length > 0)
                        $scope.SelectClass($scope.Class[0]);
                }
            }

        });
    };

    $scope.GetStudents = function() {
        $scope.connection.send({
            service: "_.GetStudents",
            body: GetStudentRequest(),
            result: function(response, error, http) {

                if (error) {
                    if (error.dsaError && error.dsaError.message)
                        alert("查詢過程發生錯誤:\r\n" + error.dsaError.message);
                    if (error.loginError && error.loginError.message)
                        alert("查詢過程發生錯誤,請確認此帳號有正確身分:\r\n" + error.loginError.message);
                } else {
                    $scope.Students = [].concat(response.Student || []);

                    if ($scope.Students.length > 0)
                        $scope.SelectStudent($scope.Students[0]);
                }
            }
        });
    };

    $scope.GetData = function() {
        $scope.connection.send({
            service: "_.GetData",
            body: GetDataRequest(),
            result: function(response, error, http) {

                //console.log(response);

                if (error) {
                    if (error.dsaError && error.dsaError.message)
                        alert("查詢過程發生錯誤:\r\n" + error.dsaError.message);
                    if (error.loginError && error.loginError.message)
                        alert("查詢過程發生錯誤,請確認此帳號有正確身分:\r\n" + error.loginError.message);
                } else if (response && response.response) {

                    SetMappingData(response);
                    SetRules(response);
                    SetSemsHistory(response);
                    SetDomainScore(response);
                    SetDiscipline(response);
                }

                $scope.$apply();
            }
        });
    };

    $scope.SelectClass = function(cls) {
        $scope.currentClass = cls;

        $scope.GetStudents();
    }

    $scope.SelectStudent = function(student) {
        $scope.currentStudent = student;

        $scope.GetData();
    }

    $scope.ScoreColor = function(str) {
        var score = parseInt(str, 10);

        if (!isNaN(score) && score < 60)
            return "underSixty";
    };

    $scope.DisciplineColor = function(obj) {
        if (obj && obj.changeColor)
            return "underSixty";
    };

    var GetDataRequest = function() {
        if ($scope.currentStudent)
            return "<StudentID>" + $scope.currentStudent.ID + "</StudentID>";
        else
            return "";
    };

    var GetStudentRequest = function() {
        if ($scope.currentClass)
            return "<ClassID>" + $scope.currentClass.ID + "</ClassID>";
        else
            return "";
    };

    //成績等第
    var SetMappingData = function(response) {

        $scope.MappingData = [].concat(response.response.Mapping || []);

        //console.log($scope.MappingData);
    };

    //規則處理
    var SetRules = function(response) {

        $scope.Rules = {};

        $scope.Rules.Domains = [];
        $scope.Rules.Disciplines = [];

        var data = [].concat(response.response.Rule || []);

        angular.forEach(data, function(rule) {

            switch (rule.Type) {

                case "LearnDomainEach":
                    rule.Text = "每學期" + rule.Count + "個領域成績「" + rule.Grade + "」等以上，符合畢業資格。";
                    $scope.Rules[rule.Type] = rule;
                    $scope.Rules.Domains.push("◇ " + rule.Text);
                    break;

                case "LearnDomainLast":
                    rule.Text = "第六學期" + rule.Count + "個領域成績「" + rule.Grade + "」等以上，符合畢業資格。";
                    $scope.Rules[rule.Type] = rule;
                    $scope.Rules.Domains.push("◇ " + rule.Text);
                    break;

                case "GraduateDomain":
                    rule.Text = "所有學習領域有" + rule.Count + "大學習領域以上畢業總平均成績「" + rule.Grade + "」等以上，符合畢業資格。";
                    $scope.Rules[rule.Type] = rule;
                    $scope.Rules.Domains.push("◇ " + rule.Text);
                    break;

                case "DemeritAmountEach":
                    rule.Text = "每學期懲戒累計未超過" + rule.Count + "大過，符合畢業資格。";

                    // if (rule.Balance === "true")
                    //     rule.Text += "(功過相抵 => 大功小功嘉獎比例 " + rule.MABBC + " 大過小過警告比例 " + rule.DABBC + ")";
                    // else
                    //     rule.Text += "(僅以懲戒累計)"

                    $scope.Rules[rule.Type] = rule;
                    $scope.Rules.Disciplines.push("◇ " + rule.Text);
                    break;

                case "DemeritAmountLast":
                    rule.Text = "第六學期懲戒累計未超過" + rule.Count + "大過，符合畢業資格。";

                    $scope.Rules[rule.Type] = rule;
                    $scope.Rules.Disciplines.push("◇ " + rule.Text);
                    break;

                case "DemeritAmountAll":
                    rule.Text = "所有學期懲戒累計未超過" + rule.Count + "大過，符合畢業資格。";

                    $scope.Rules[rule.Type] = rule;
                    $scope.Rules.Disciplines.push("◇ " + rule.Text);
                    break;
            }

            // if(rule.Type === "LearnDomainEach" || rule.Type === "LearnDomainLast" || rule.Type === "GraduateDomain"){
            //     $scope.Rules.Domains.push(rule);
            // }
        });

        var mappingData = "◇ 成績等第對照: ";

        var last = $scope.MappingData.length - 1;

        for (i = 0; i <= last; i++) {

            var mapping = $scope.MappingData[i];
            var str = mapping.Name + "═" + mapping.Score;
            if (i === last)
                mappingData += str;
            else
                mappingData += str + " ║ ";
        };

        $scope.Rules.Domains.push(mappingData);

        $scope.Rules.Disciplines.push("☆ 符號代表為功過相抵後的紀錄");

        //console.log($scope.Rules);
    };

    //學期歷程處理
    var SetSemsHistory = function(response) {

        var gradeMapping = {
            '1#1': {},
            '1#2': {},
            '2#1': {},
            '2#2': {},
            '3#1': {},
            '3#2': {},
            '7#1': {},
            '7#2': {},
            '8#1': {},
            '8#2': {},
            '9#1': {},
            '9#2': {}
        };

        //初始化...
        angular.forEach(gradeMapping, function(value, key) {
            var initObj = {};
            initObj.Domains = {};
            initObj.Discipline = {
                Merit: {
                    'A': 0,
                    'B': 0,
                    'C': 0
                },
                Demerit: {
                    'A': 0,
                    'B': 0,
                    'C': 0
                }
            };

            gradeMapping[key] = initObj;
        });

        //7年級判斷
        var sevenStart = false;

        var data = [].concat(response.response.SemsHistory || []);
        angular.forEach(data, function(sh) {

            //遇到有7年級的歷程就從7開始呈現
            var grade = parseInt(sh.Grade, 10) || 0;
            if (grade >= 7)
                sevenStart = true;

            var key = sh.Grade + "#" + sh.Semester;
            var nsy = parseInt(sh.SchoolYear, 10) || 0;

            if (key in gradeMapping) {
                var osy = 0;

                if (gradeMapping[key].SchoolYear && gradeMapping[key].Semester) {
                    osy = parseInt(gradeMapping[key].SchoolYear, 10) || 0;
                }

                //同年級的歷程取較新的
                if (nsy > osy) {
                    gradeMapping[key].SchoolYear = sh.SchoolYear;
                    gradeMapping[key].Semester = sh.Semester;
                    gradeMapping[key].Title = sh.SchoolYear + "." + sh.Semester;
                }
            }
        });

        //建構六個學期
        if (sevenStart === true) {
            $scope.Semester1 = gradeMapping["7#1"];
            $scope.Semester2 = gradeMapping["7#2"];
            $scope.Semester3 = gradeMapping["8#1"];
            $scope.Semester4 = gradeMapping["8#2"];
            $scope.Semester5 = gradeMapping["9#1"];
            $scope.Semester6 = gradeMapping["9#2"];
        } else {
            $scope.Semester1 = gradeMapping["1#1"];
            $scope.Semester2 = gradeMapping["1#2"];
            $scope.Semester3 = gradeMapping["2#1"];
            $scope.Semester4 = gradeMapping["2#2"];
            $scope.Semester5 = gradeMapping["3#1"];
            $scope.Semester6 = gradeMapping["3#2"];
        }

        //全學期(懲戒要用的)
        $scope.SemesterAll = {};
        $scope.SemesterAll.Discipline = {};
        $scope.SemesterAll.Discipline.Merit = {
            'A': 0,
            'B': 0,
            'C': 0
        };
        $scope.SemesterAll.Discipline.Demerit = {
            'A': 0,
            'B': 0,
            'C': 0
        };
    };

    //領域成績處理
    var SetDomainScore = function(response) {

        var domainList = [];

        var data = [].concat(response.response.DomainScore || []);

        angular.forEach(data, function(ds) {

            //領域聯集清單
            if (domainList.indexOf(ds.Domain) === -1)
                domainList.push(ds.Domain);

            //遍歷Semester1~6
            for (i = 1; i <= 6; i++) {

                var key = "Semester" + i;

                //將領域成績填入到對應學期
                if ($scope[key] && $scope[key].SchoolYear === ds.SchoolYear && $scope[key].Semester === ds.Semester) {
                    $scope[key].Domains[ds.Domain] = ds.Score;
                }
            };

        });

        //簡單排序字串長度
        domainList = domainList.sort(function(x, y) {
            return x.length - y.length
        });

        //計算領域平均
        $scope.DomainAvg = [];
        for (j = 0; j <= domainList.length; j++) {

            var domain = domainList[j];

            var count = 0;
            var sum = 0;

            for (i = 1; i <= 6; i++) {

                var key = "Semester" + i;

                var score = parseFloat($scope[key].Domains[domain], 10);

                if (!isNaN(score)) {
                    count++;

                    //先抓到第三位做加總
                    score = Math.floor(score * 1000);
                    sum += score;
                }
            };

            //記得除回來
            sum = sum / 1000;
            //若變NaN就不會出現
            $scope.DomainAvg[domain] = Math.round((sum / count) * 100) / 100;
        };

        $scope.DomainList = domainList;

        //console.log(domainList);
        // console.log($scope.Semester1);
        // console.log($scope.Semester2);
        // console.log($scope.Semester3);
        // console.log($scope.Semester4);
        // console.log($scope.Semester5);
        // console.log($scope.Semester6);
    };

    //懲戒處理
    var SetDiscipline = function(response) {

        var data = [].concat(response.response.Discipline || []);

        angular.forEach(data, function(dp) {

            //遍歷Semester1~6
            for (i = 1; i <= 6; i++) {

                var key = "Semester" + i;

                //將獎懲填入到對應學期
                if ($scope[key] && $scope[key].SchoolYear === dp.SchoolYear && $scope[key].Semester === dp.Semester) {

                    var a = parseInt(dp.A, 10) || 0;
                    var b = parseInt(dp.B, 10) || 0;
                    var c = parseInt(dp.C, 10) || 0;

                    //dp.Type只有兩種: Merit或Demerit
                    $scope[key].Discipline[dp.Type].A += a;
                    $scope[key].Discipline[dp.Type].B += b;
                    $scope[key].Discipline[dp.Type].C += c;
                }
            };
        });

        //再遍歷Semester1~6,處理累計
        for (i = 1; i <= 6; i++) {

            var key = "Semester" + i;

            //每學期獎懲都要加總到SemesterAll,後續再處理
            $scope.SemesterAll.Discipline.Merit.A += $scope[key].Discipline.Merit.A;
            $scope.SemesterAll.Discipline.Merit.B += $scope[key].Discipline.Merit.B;
            $scope.SemesterAll.Discipline.Merit.C += $scope[key].Discipline.Merit.C;

            $scope.SemesterAll.Discipline.Demerit.A += $scope[key].Discipline.Demerit.A;
            $scope.SemesterAll.Discipline.Demerit.B += $scope[key].Discipline.Demerit.B;
            $scope.SemesterAll.Discipline.Demerit.C += $scope[key].Discipline.Demerit.C;

            //每學期的規則條件結算
            GetDisciplineDisplay($scope[key].Discipline, "DemeritAmountEach");
        };

        //第六學期的規則條件結算
        GetDisciplineDisplay($scope.Semester6.Discipline, "DemeritAmountLast");
        //所有學期的規則條件結算
        GetDisciplineDisplay($scope.SemesterAll.Discipline, "DemeritAmountAll");

        // console.log($scope.Semester1);
        // console.log($scope.Semester2);
        // console.log($scope.Semester3);
        // console.log($scope.Semester4);
        // console.log($scope.Semester5);
        // console.log($scope.Semester6);
        // console.log($scope.SemesterAll);
    };

    //取得懲戒描述
    var GetDisciplineDisplay = function(discipline, text) {

        //取得規則條件
        var rule = $scope.Rules[text];

        if (!rule)
            return;

        //不得超過的大過數量
        var limit = parseInt(rule.Count, 10) || 0;

        //解析功過之間的轉換比例

        //獎勵部分
        var mabbc = rule.MABBC.split(",");
        var mab = mabbc[0].split(":");
        var mbc = mabbc[1].split(":");
        //幾個大功
        var mas = parseInt(mab[0], 10) || 1;
        //相當於幾個小功
        var mbt = parseInt(mab[1], 10) || 1;
        //幾個小功
        var mbs = parseInt(mbc[0], 10) || 1;
        //相當於幾個嘉獎
        var mct = parseInt(mbc[1], 10) || 1;

        //懲戒部分
        var dabbc = rule.DABBC.split(",");
        var dab = dabbc[0].split(":");
        var dbc = dabbc[1].split(":");
        //幾個大過
        var das = parseInt(dab[0], 10) || 1;
        //相當於幾個小過
        var dbt = parseInt(dab[1], 10) || 1;
        //幾個小過
        var dbs = parseInt(dbc[0], 10) || 1;
        //相當於幾個警告
        var dct = parseInt(dbc[1], 10) || 1;

        //所有獎勵轉為最小單位(嘉獎)
        var m = discipline.Merit.A / mas;
        m = (m * mbt) + discipline.Merit.B;
        m = m / mbs;
        m = (m * mct) + discipline.Merit.C;

        //所有懲戒轉為最小單位(警告)
        var d = discipline.Demerit.A / das;
        d = (d * dbt) + discipline.Demerit.B;
        d = d / dbs;
        d = (d * dct) + discipline.Demerit.C;

        //var display = "";
        var display = {
            changeColor: false,
            text: ""
        };

        //有功過相抵
        if (rule.Balance === "true") {

            var sum = m - d;

            if (sum < 0) {
                sum *= -1;
                var count = Math.floor((sum / dct) / dbt);

                display.text = "☆累計大過 " + count;

                if (count >= limit)
                    display.changeColor = true;
            }
        } else {
            //僅懲戒累計
            var sum = d;
            var count = Math.floor((sum / dct) / dbt);

            display.text = "累計大過 " + count;

            if (count >= limit)
                display.changeColor = true;
        }

        switch (text) {

            case "DemeritAmountEach":
                discipline.DisplayA = display;
                break;

            case "DemeritAmountLast":
                discipline.DisplayB = display;
                break;

            case "DemeritAmountAll":
                discipline.DisplayC = display;
                break;
        }
    };

    if ($scope.system_position === "teacher") {
        $scope.connection = gadget.getContract("ischool.GraduateAlarm.teacher");
        $scope.GetClass();
    } else if ($scope.system_position === "parent") {
        $scope.connection = gadget.getContract("ischool.GraduateAlarm.parent");
        $scope.GetStudents();
    } else {
        $scope.connection = gadget.getContract("ischool.GraduateAlarm.student");
        $scope.GetData();
    }


}]);
