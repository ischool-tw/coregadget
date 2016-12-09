angular.module('app', [])

.controller('MainCtrl', ['$scope', '$timeout',
    function ($scope, $timeout) {
        $scope.SetShowTab = function (tab) {
            $scope.ShowTab = tab;
        };

        function init() {
            delete $scope.init;
            delete $scope.initErr;
            delete $scope.Session;
            $scope.connection = gadget.getContract("shschool.retake.student");
            $scope.connection.send({
                service: "GetSession",
                body: {},
                result: function (response, error, http) {
                    if (error) {
                        alert('GetSession Error' + JSON.stringify(error));
                    }
                    else {
                        $scope.$apply(function () {
                            $scope.init = true;
                            if (response.Session) {
                                $scope.Session = response.Session;
                                if ($scope.Session.RegistrationOpen) {
                                    $scope.Session.RegistrationOpen = new Date($scope.Session.RegistrationOpen);
                                    $scope.Session.RegistrationOpenTime = $.formatDate($scope.Session.RegistrationOpen, 'yyyy/MM/dd HH:mm:ss');
                                }
                                if ($scope.Session.RegistrationClose) {
                                    $scope.Session.RegistrationClose = new Date($scope.Session.RegistrationClose);
                                    $scope.Session.RegistrationCloseTime = $.formatDate($scope.Session.RegistrationClose, 'yyyy/MM/dd HH:mm:ss');
                                }
                                $scope.Session.RegistrationClosed = $scope.Session.RegistrationClosed == 'true';
                                $scope.Session.RegistrationOpening = $scope.Session.RegistrationOpening == 'true';

                                $scope.ShowTab = $scope.Session.RegistrationClosed ? 'courseList' : 'registration';
                            }
                            else {
                                $scope.initErr = "重補修準備工作尚未完成。";
                            }
                        });
                    }
                }
            });
            $scope.connection.send({
                service: "GetSubject",
                body: {},
                result: function (response, error, http) {
                    if (error) {
                        alert('GetSubject Error' + JSON.stringify(error));
                    }
                    else {
                        $scope.$apply(function () {
                            response.SubjectList = response.SubjectList || {};
                            $scope.Subject = [].concat(response.SubjectList.Subject || []);
                            $scope.Subject.forEach(function (item) {
                                item.FullName = (item.SubjectName || '') + ' ' + $.arabic2roman(item.SubjectLevel || '');
                                if (parseInt(item.FailGradeYear) && parseInt(item.FailSemester)) {
                                    item.FailSemester = ["一", "二", "三", "四"][parseInt(item.FailGradeYear) - 1] + ["上", "下"][parseInt(item.FailSemester) - 1];
                                }
                                item.Selected = item.Selected == "true";
                            });
                        });
                    }
                }
            });
            $scope.connection.send({
                service: "GetSubjectHistory",
                body: {},
                result: function (response, error, http) {
                    if (error) {
                        alert('GetSubjectHistory Error' + JSON.stringify(error));
                    }
                    else {
                        $scope.$apply(function () {
                            response.SubjectList = response.SubjectList || {};
                            var roundMapping = {};
                            $scope.SubjectHistory = [];
                            [].concat(response.SubjectList.Subject || []).forEach(function (item) {
                                var key = item.SchoolYear + "^^" + item.Semester + "^^" + item.Round;
                                item.FullName = (item.SubjectName || '') + ' ' + $.arabic2roman(item.SubjectLevel || '');
                                if (!roundMapping[key]) {
                                    var list = [];
                                    roundMapping[key] = list;
                                    $scope.SubjectHistory.push({
                                        SchoolYear: item.SchoolYear,
                                        Semester: item.Semester,
                                        Round: item.Round,
                                        List:list
                                    });
                                }
                                roundMapping[key].push(item);
                            });
                        });
                    }
                }
            });
        }
        init();
        $scope.saveSSSelect = function () {
            var body = { Request: {} };
            $scope.Subject.forEach(function (item) {
                if (item.Selected) {
                    body.Request.SSSelect = body.Request.SSSelect || [];
                    body.Request.SSSelect.push({
                        SubjectID: item.Uid
                    });
                }
            });

            $scope.connection.send({
                service: "InsertSSSelect",
                body: body,
                result: function (response, error, http) {
                    if (error !== null) {
                        alert('InsertSSSelect Error' + JSON.stringify(error));
                    } else {
                        alert('儲存完成。');
                        $scope.$apply(function () {
                            init();
                        });
                    }
                }
            });
        }
    }
])