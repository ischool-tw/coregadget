/*

	此 Singleton 物件處理 選填志願畫面的所有事情
*/
var ischool = ischool || {};
ischool.chooseWish = ischool.chooseWish || {};

ischool.chooseWish.ChooseWishController = function () {

    var isDone = {};	//用來判斷是否已取得『我的資訊』及『我的志願清單』兩個資訊
    var myinfo;
    var mywishes = [];
    var cnStud;
    var cnCommon;
    var isDone = {};	//判斷是否三個資訊都取得了！！
    var clearItemText = ["------  清  除 -------"];
    var isAvalable = false;	//目前是否可以選志願，包含開放時間及梯次都要符合
    var filterGroup;

    var _getMyInfo = function () {
        isDone.myinfo = false;
        if (!cnStud)
            cnStud = ischool.chooseWish.cnStud;
        /* 取得 我的資訊 */
        cnStud.send({
            service: '_.GetMyInfo',
            body: '',
            autoRetry: true,
            result: function (resp, errorInfo, XMLHttpRequest) {
                if (errorInfo) {
                    ischool.chooseWish.Util.showMsg("取得我的資訊失敗：" + errorInfo);
                }
                else {
                    myinfo = resp.StudentInfo;
                    $('#myRank').html(myinfo.ChooseWishRank);
                    $('#scoreContent').html(myinfo.ScoreContent);

                    //判斷目前是否可選志願
                    if (ischool.chooseWish.Settings.ServerTime.getTime() >= ischool.chooseWish.Settings.StartTime.getTime() &&
						ischool.chooseWish.Settings.ServerTime.getTime() <= ischool.chooseWish.Settings.EndTime.getTime()) {
                        isAvalable = (ischool.chooseWish.Settings.CurrentGroup == "0" ||
							myinfo.ChooseWishRank == ischool.chooseWish.Settings.CurrentGroup);
                    }
                    if (ischool.chooseWish.Settings.AllowCrossGroup == 'f')
                        filterGroup = myinfo.Group;

                    $('#myRank').css('color', (isAvalable ? 'blue' : 'red')).tooltip({
                        title: (isAvalable ? '' : '您目前無法選填志願')
                    });

                    if (myinfo.DispatchSchoolCode) {
                        $('#end').html(ischool.chooseWish.Schools.getFullDeptNameByCode(myinfo.DispatchSchoolCode));
                        $('#end').addClass(myinfo.IsConfirm == 't' ? 'text-error' : 'muted');
                    }
                    //確認兩個資訊都取得後才進行下一步
                    isDone.myinfo = true;
                    if (isDone.myinfo && isDone.mywishes)
                        initUI1();
                }
            }
        });

    }
    var _getMyWishes = function () {
        isDone.mywishes = false;
        if (!cnStud)
            cnStud = ischool.chooseWish.cnStud;
        /* 取得 我的資訊 */
        cnStud.send({
            service: '_.GetMyWishList',
            body: '',
            autoRetry: true,
            result: function (resp, errorInfo, XMLHttpRequest) {
                if (errorInfo) {
                    ischool.chooseWish.Util.showMsg("取得我的志願清單失敗：" + errorInfo);
                }
                else {
                    mywishes = ischool.chooseWish.Util.handleArray(resp.Wishes.Wish);

                    //確認兩個資訊都取得後才進行下一步
                    isDone.mywishes = true;
                    if (isDone.myinfo && isDone.mywishes)
                        initUI1();
                }
            }
        });
    };

    var _deleteMyWish = function (uid) {
        /* 刪除我的一個志願 */
        cnStud.send({
            service: '_.DeleteWish',
            body: ('<Request><Wish><UID>' + uid + '</UID></Wish></Request>'),
            autoRetry: true,
            result: function (resp, errorInfo, XMLHttpRequest) {
                if (errorInfo) {
                    ischool.chooseWish.Util.showMsg("刪除我的志願失敗：" + errorInfo);
                }
                else {
                    _getMyWishes();
                }
            }
        });
    };
    /* 修改志願，參數設為 array 是因為調整志願順序時可能一次修改兩筆 */
    var _updateMyWish = function (aryParams) {
        if (aryParams.size == 0)
            return;

        /* 修改我的志願 */
        var reqdoc = '<Request> ';
        $(aryParams).each(function (index, param) {
            reqdoc += '		<Wish> \
								<Field> ' +
									((param.wishPriority) ? ('<WishPriority>' + param.wishPriority + '</WishPriority>') : '') +
									((param.deptCode) ? ('<SchoolDeptCode>' + param.deptCode + '</SchoolDeptCode>') : '') +
								'</Field> \
								<Condition> \
									<UID>' + param.uid + '</UID> \
								</Condition> \
							</Wish> ';
        });
        reqdoc += '</Request>';

        cnStud.send({
            service: '_.UpdateWish',
            body: reqdoc,
            autoRetry: true,
            result: function (resp, errorInfo, XMLHttpRequest) {
                if (errorInfo) {
                    ischool.chooseWish.Util.showMsg("修改我的志願失敗：" + errorInfo);
                }
                else {
                    _getMyWishes();
                }
            }
        });
    };

    var _insertMyWish = function (deptCode, wishPriority) {
        /* 新增一個志願 */
        var reqdoc = '<Request> \
						<Wish> \
							<WishPriority>' + wishPriority + '</WishPriority> \
							<SchoolDeptCode>' + deptCode + '</SchoolDeptCode> \
						</Wish> \
					</Request>';
        cnStud.send({
            service: '_.AddWish',
            body: reqdoc,
            autoRetry: true,
            result: function (resp, errorInfo, XMLHttpRequest) {
                if (errorInfo) {
                    ischool.chooseWish.Util.showMsg("新增我的志願失敗：" + errorInfo);
                }
                else {
                    _getMyWishes();
                }
            }
        });
    };

    var initUI1 = function () {
        initMyWishList();
        //initStudentsByDeptCode('');
        //initDeptsByStudentID('');
    };

    var initMyWishList = function () {
        //1. 針對行政人員的設定值，畫出可選取的志願數目格子。
        var wishLimit = ischool.chooseWish.Settings.WishCountLimit || 0;
        var tbody = $('#tblMyWishList').find('tbody');
        //tbody.html('');	//clear
        var removeTr = tbody.find('tr');
        var dicMyWishes = {};	//可根據priority 查出志願
        $(mywishes).each(function (index, mywish) {
            dicMyWishes[mywish.WishPriority] = mywish;
        });
        var i = 0;
        for (i = 0; i < wishLimit; i++) {
            var html = '<tr> \
                      	  <td class="align-center"> \
                            <a href="javascript:void(0);" class="btn btn-link btn-mini" target="_blank"><i class="icon-home"></i></a> \
                          </td> \
                          <td> \
                            <input type="text" class="span12" placeholder="請輸入校系代碼，如 001-1，或空白鍵列出全部校系。"> \
                          </td> \
                        	<td class="align-center"> \
                            <a href="javascript:void(0);" class="btn btn-inverse btn-mini"></a> \
                          </td> \
                          <td class="align-center"> \
                            <a href="javascript:void(0);" class="btn btn-link btn-mini"><i class="icon-arrow-up"></i></a> \
                          </td> \
                        </tr>';
            var tr = $(html);
            var wish = dicMyWishes[i + 1];
            var datasource = clearItemText.concat(ischool.chooseWish.Schools.getAllDeptNames(filterGroup));
            $(tr.find('td')[1]).find('input').typeahead({
                minLength: 0,
                items: datasource.length,
                source: datasource
            }).change(function () {
                var currentTr = $(this).parent().parent();
                var deptName = $(this).val();
                if ((deptName == clearItemText) | (deptName == '')) {	//delete this wish
                    //檢查是否 uid 存在，若是，則要先刪除
                    if (currentTr.attr("uid")) {
                        _deleteMyWish(currentTr.attr("uid"));
                    }
                    else {
                        _getMyWishes();
                    }
                }
                else { //新增或修改志願清單
                    //先檢查輸入值是否正確的 dept name
                    var dept = ischool.chooseWish.Schools.getDeptByFullName(deptName, filterGroup);
                    if (!dept) {
                        $(this).addClass('error');
                        console.log("err:" + deptName);
                    }
                    else { //如果是正確的 dept name，則進行新增或修改
                        if (currentTr.attr("uid")) {	//修改
                            var aryParams = [];
                            aryParams.push({ uid: currentTr.attr('uid'), deptCode: dept.SchoolDeptCode });
                            //_updateMyWish( dept.SchoolDeptCode , currentTr.attr("wishPriority"), currentTr.attr("uid"));
                            _updateMyWish(aryParams);
                        }
                        else {

                            _insertMyWish(dept.SchoolDeptCode, currentTr.attr("wishPriority"));
                        }

                        $(this).removeClass('error');
                        console.log("correct:" + deptName);
                    }
                }
                //console.log(deptName);
            });

            tr.attr("wishPriority", (i + 1))
            if (!isAvalable) {
                tr.find("input").attr('disabled', 'disabled');	//for jquery 1.5-
                tr.find("input").prop('disabled', true);	// for jquery 1.6+

                $(tr.find('td')[3]).html('');	//清空調整志願順序的按鈕
            }

            if (wish) {
                tr.attr("uid", wish.UID);
                tr.attr("deptCode", wish.SchoolDeptCode);

                var dept = ischool.chooseWish.Schools.getDeptsBySchoolCode(wish.SchoolDeptCode);

                //指定校系介紹 url
                $(tr.find('td')[0]).find('a').attr("href", dept.WebUrl);

                //填入該校系名稱
                $(tr.find('td')[1]).find('input').val(
            		ischool.chooseWish.Schools.getFullDeptNameByCode(wish.SchoolDeptCode)
            	);

                //顯示選擇該校系的學生清單
                $(tr.find('td')[2]).find('a').html(wish.StudentCount).click(function () {
                    var code = $(this).parent().parent().attr("deptCode");
                    initStudentsByDeptCode(code, ischool.chooseWish.User.StudentID);
                });

                //改變志願順序
                $(tr.find('td')[3]).find('a').click(function () {
                    var currentTr = $(this).parent().parent();
                    var currentPriority = currentTr.attr('wishPriority');
                    if (currentPriority <= 1)	//如果是第一個志願，就不處理。
                        return;
                    var targetPriority = currentPriority - 1;
                    var targetTr = $(currentTr.parent().find('tr')[targetPriority - 1]);
                    var aryParams = [];
                    if (currentTr.attr('uid'))
                        aryParams.push({ uid: currentTr.attr('uid'), wishPriority: targetPriority });
                    if (targetTr.attr('uid'))
                        aryParams.push({ uid: targetTr.attr('uid'), wishPriority: currentPriority });

                    _updateMyWish(aryParams);

                });

            }

            tr.appendTo(tbody);
        }

        $(removeTr).each(function (index, remove) {
            remove.remove();
        });
    };

    var initStudentsByDeptCode = function (deptCode, heightLightStudentID) {

        var tbody = $('#tblStudsOfDept').find('tbody');
        tbody.empty();
        if (deptCode == '') {
            initDeptsByStudentID('', '');
            return;
        }

        if (!cnCommon)
            cnCommon = ischool.chooseWish.cnCommon;
        var dept = ischool.chooseWish.Schools.getDeptByCode(deptCode);
        var deptName = ischool.chooseWish.Schools.getFullDeptNameByCode(deptCode);

        cnCommon.send({
            service: '_.GetStudentWishes',
            //body: ('<Request><SchoolDeptCode>' + deptCode + '</SchoolDeptCode></Request>'),
            body: {
                Request: {
                    SchoolDeptCode: deptCode,
                    Order: {
                        ScoreRank: ''
                    }
                }
            },
            autoRetry: true,
            result: function (resp, errorInfo, XMLHttpRequest) {
                if (errorInfo) {
                    tbody.html('');	//clear content
                    ischool.chooseWish.Util.showMsg("取得選擇『" + deptName + "』的學生清單失敗：" + errorInfo);
                }
                else {
                    $('#lblDeptName').html(deptName);
                    [].concat(resp.WishList.Wish || []).forEach(function (studWish) {
                        var html = ('<tr stud-id="' + studWish.StudentID + '" class-name="' + studWish.ClassName + '" seat-no="' + studWish.SeatNo + '" stud-name="' + studWish.StudentName + '" class="hand"> \
	                                	<td>' + studWish.ClassName + '</td> \
	                                	<td>' + studWish.StudentName + '</td> \
	                                	<td>' + studWish.WishPriority + '</td> \
	                                	<td>' + studWish.ScoreRank + '</td> \
	                                	<td>' + studWish.TotalScore + '</td> \
	                                	<td>' + studWish.Group + '</td> \
	                                	<td>' + studWish.ChooseWishRank + '</td> \
	                                </tr>');
                        var tr = $(html);

                        if (studWish.FinalDeptCode) {//這位學生是否已經分發過了。
                            tr.addClass(studWish.FinalDeptCode == deptCode ? "text-error" : "muted");
                            tr.find('a').addClass(studWish.FinalDeptCode == deptCode ? "text-error" : "muted");
                        }

                        if (heightLightStudentID && heightLightStudentID == studWish.StudentID)
                            tr.addClass("warning");

                        tr.click(function () {
                            var studID = studWish.StudentID;
                            var className = studWish.ClassName;
                            var seatNo = studWish.SeatNo ? (' [' + studWish.SeatNo + '] ') : '';
                            var studName = studWish.StudentName;

                            initDeptsByStudentID(studID, className + seatNo + studName, deptCode);
                        });

                        tr.appendTo(tbody);

                        if (studWish.ScoreDetial) {//有成績明細就加成績明細
                            var trScoreDetial = $('<tr><td colspan="7" style="white-space: pre-wrap;">' + studWish.ScoreDetial + '</td></tr>');
                            trScoreDetial.appendTo(tbody);

                            trScoreDetial.hide();
                            //tr.find('td').mouseover(function() {
                            $([tr.find('td')[3], tr.find('td')[4]]).mouseover(function () {
                                trScoreDetial.show();
                            }).mouseout(function () {
                                trScoreDetial.hide();
                            });
                            trScoreDetial.mouseover(function () {
                                trScoreDetial.show();
                            }).mouseout(function () {
                                trScoreDetial.hide();
                            });
                        }
                    });
                }
            }
        });
    };

    var initDeptsByStudentID = function (studentID, studFullName, heightLightDeptCode) {
        var tbody = $('#tblDeptsOfStudent').find('tbody');
        tbody.empty();
        if (studentID == '') {
            $('#lblStudentName').html("選填志願清單：");
            return;
        }
        $('#lblStudentName').html("『 " + studFullName + " 』的選填志願清單：");

        if (!cnCommon)
            cnCommon = ischool.chooseWish.cnCommon;

        cnCommon.send({
            service: '_.GetStudentWishes',
            body: {
                Request: {
                    StudentID: studentID,
                    Order: {
                        WishPriority: 'ASC'
                    }
                }
            },
            //body: ('<Request><StudentID>' + studentID + '</StudentID><Order><WishPriority>ASC</WishPriority></Order></Request>'),
            autoRetry: true,
            result: function (resp, errorInfo, XMLHttpRequest) {
                if (errorInfo) {
                    tbody.html('');	//clear content
                    ischool.chooseWish.Util.showMsg("取得學生『 " + studFullName + " 』填選的志願清單失敗：" + errorInfo);
                }
                else {
                    [].concat(resp.WishList.Wish || []).forEach(function (studWish) {
                        //var isLocked = (studWish.FinalDeptCode == studWish.SchoolDeptCode);	//這位學生已經分發過了。
                        var html = ('<tr deptCode="' + studWish.SchoolDeptCode + '"  class="hand"> \
	                                	<td>' + studWish.WishPriority + '</td> \
	                                	<td>' + ischool.chooseWish.Schools.getFullDeptNameByCode(studWish.SchoolDeptCode) + '</td> \
	                              </tr>');
                        var tr = $(html);
                        if (studWish.SchoolDeptCode == heightLightDeptCode)
                            tr.addClass("warning");

                        if (studWish.FinalDeptCode) {//這位學生是否已經分發過了。
                            tr.addClass(studWish.FinalDeptCode == studWish.SchoolDeptCode ? "text-error" : "muted");
                        }

                        tr.appendTo(tbody);
                        tr.click(function () {
                            initStudentsByDeptCode(studWish.SchoolDeptCode, studentID);
                        });
                    });
                }
            }
        });
    };

    return {

        init: function () {
            _getMyInfo();
            _getMyWishes();
        },
        //取得我可以選擇的群組
        getMyAvalableDepts: function () {

        },

        getMyInfo: myinfo,


    };
}();
