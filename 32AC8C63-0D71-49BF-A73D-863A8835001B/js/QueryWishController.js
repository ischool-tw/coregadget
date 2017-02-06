/*

	此 Singleton 物件處理 選填志願畫面的所有事情
*/
var ischool = ischool || {};
ischool.chooseWish = ischool.chooseWish || {};

ischool.chooseWish.QueryWishController = function () {

    var isDone = {};	//用來判斷是否已取得『我的資訊』及『我的志願清單』兩個資訊
    var classList = [];
    var dicClasses = {};
    var cnCommon;
    var isDone = {};	//判斷是否三個資訊都取得了！！

    var studWishes = [];

    var aryStudIDList = [];
    var dicWishesByStudID = {};

    var aryChooseRankList = [];
    var dicWishesByRank = {};

    var aryGroupList = [];
    var dicWishesByGroup = {};

    /* 取得有參與選填志願的班級清單 */
    var _getClassList = function () {
        if (!cnCommon)
            cnCommon = ischool.chooseWish.cnCommon;
        /* 取得 班級清單 */
        cnCommon.send({
            service: '_.GetClassList',
            body: '',
            autoRetry: true,
            result: function (resp, errorInfo, XMLHttpRequest) {
                if (errorInfo) {
                    ischool.chooseWish.Util.showMsg("取得班級清單失敗：" + errorInfo);
                }
                else {

                    classList = ischool.chooseWish.Util.handleArray(resp.Classes.Class);
                    /*
					if ($.isArray(resp.Classes.Class))
						classList = resp.Classes.Class;
					else {
						classList = [];
						if (resp.Classes.Class)
							classList.push(resp.Classes.Class);
					}
					*/
                    var sel = $('#selClass');
                    sel.html('');

                    $("<option value='-1'> --- 請選擇 --- </option>").appendTo(sel);
                    $(classList).each(function (index, cls) {
                        var item = $("<option value='" + cls.ID + "'>" + cls.ClassName + "</option>");
                        item.appendTo(sel);
                        dicClasses[cls.ID, cls];
                    });

                    $("<option value='0'>全部</option>").appendTo(sel);
                    sel.change(function () {
                        var classID = sel.val();
                        _getStudentWishes(classID);
                    });

                }
            }
        });


    };

    /* 取得指定班級的學生的志願清單 */
    var _getStudentWishes = function (classID, next) {
        if (!cnCommon)
            cnCommon = ischool.chooseWish.cnCommon;
        var reqdoc = '<Request>' +
						(classID == "0" ? "" : ('<ClassID>' + classID + '</ClassID>')) +
						'<Order> \
							<ClassName>ASC</ClassName> \
							<SeatNo>ASC</SeatNo> \
							<WishPriority>ASC</WishPriority> \
						</Order> \
					 </Request>';
        /* 取得 我的資訊 */
        cnCommon.send({
            service: '_.GetStudentWishes',
            body: reqdoc,
            autoRetry: true,
            result: function (resp, errorInfo, XMLHttpRequest) {
                $('#tblStudWishList2').find('tbody').html('');
                if (errorInfo) {
                    var cls = dicClasses[classID];
                    ischool.chooseWish.Util.showMsg("取得選擇『" + (cls ? cls.ClassName : "全部班級") + "』的學生清單失敗：" + errorInfo);
                }
                else {
                    studWishes = ischool.chooseWish.Util.handleArray(resp.WishList.Wish);

                    //studWishes = resp.WishList.Wish;
                    aryStudIDList = [];
                    dicWishesByStudID = {};

                    aryChooseRankList = [];
                    dicWishesByRank = {};

                    aryGroupList = [];
                    dicWishesByGroup = {};

                    $(studWishes).each(function (index, studWish) {
                        var studID = studWish.StudentID;

                        /* 分配到以座號排序的資料結構 */
                        if (!dicWishesByStudID[studID]) {
                            dicWishesByStudID[studID] = [];
                            aryStudIDList.push(studID);
                        }
                        dicWishesByStudID[studID].push(studWish);

                        /* 分配到以群組排序的資料結構 */
                        var grp = studWish.Group;
                        if (!dicWishesByGroup[grp]) {
                            dicWishesByGroup[grp] = {}; //記錄每一個 Group 的學生志願清單
                            dicWishesByGroup[grp + "_studIDs"] = []; //記錄每一個 Group 裡的學生編號
                            aryGroupList.push(grp);
                        }
                        if (!dicWishesByGroup[grp][studID]) {
                            dicWishesByGroup[grp][studID] = [];
                            dicWishesByGroup[grp + "_studIDs"].push(studID);
                        }
                        dicWishesByGroup[grp][studID].push(studWish);


                        /* 分配到以梯次排序的資料結構 */
                        var rank = studWish.ChooseWishRank;
                        if (!dicWishesByGroup[rank]) {
                            dicWishesByGroup[rank] = {}; //記錄每一個 Rank 的學生志願清單
                            dicWishesByGroup[rank + "_studIDs"] = []; //記錄每一個 Rank 裡的學生編號
                            aryChooseRankList.push(parseInt(rank));	//記錄 rank 清單
                        }
                        if (!dicWishesByGroup[rank][studID]) {
                            dicWishesByGroup[rank][studID] = [];
                            dicWishesByGroup[rank + "_studIDs"].push(studID);
                        }
                        dicWishesByGroup[rank][studID].push(studWish);


                    }); // end for loop

                    _fillStudWishList();

                    if (next)
                        next();
                } // end if 
            }
        });
    };

    /* 選擇班級，或是選擇排序方式之後，要更新左半邊畫面上的學生志願清單 */
    var _fillStudWishList = function () {
        if ($("#radioSeatNo").is(':checked'))
            _fillBySeatNo();
        else if ($("#radioRank").is(':checked'))
            _fillByRank();
        else if ($("#radioGroup").is(':checked'))
            _fillByGroup();

        $('#tblStudWishList2').find('tbody > tr').mouseover(function () {
            $(this).addClass('hand');
        }).mouseout(function () {
            $(this).removeClass('hand');
        });
    };

    /* 按照座號顯示 */
    var _fillBySeatNo = function () {
        var tbody = $('#tblStudWishList2').find('tbody');
        tbody.html('');
        /* 顯示每一位學生 */
        $(aryStudIDList).each(function (index, studID) {
            var stud = dicWishesByStudID[studID][0];
            var studText = stud.ClassName + "(" + stud.SeatNo + ") - " + stud.StudentName + "(" + stud.Group + ") (第 " + stud.ChooseWishRank + " 梯次) (" + stud.TotalScore + ")";
            var trHtml = '<tr class="my-title" id="trStud_' + studID + '"> \
                          	<td stud-id="' + stud.StudentID + '"><i class="icon-chevron-right text-margin" ></i>' + studText + '</td> \
                          	<td>&nbsp;</td> \
                          </tr>';
            var tr = $(trHtml);
            if (stud.FinalDeptCode) {//這位學生是否已經分發過了。
                tr.addClass("text-error");
            }
            tr.click(function () {
                var td = $($(this).find('td')[0]);
                var studid = td.attr('stud-id');
                if (td.attr('mode') != 'open') {
                    $(td.find('i')[0]).addClass('icon-chevron-down');
                    $(td.find('i')[1]).addClass('icon-folder-open');
                    $(this).parent().find("tr.stud_" + studid).show();
                    td.attr('mode', 'open');
                }
                else {
                    $(td.find('i')[0]).removeClass('icon-chevron-down');
                    $(td.find('i')[1]).removeClass('icon-folder-open');
                    $(this).parent().find("tr.stud_" + studid).hide();
                    td.attr('mode', 'close');
                }
            }).appendTo(tbody);

            /* 顯示這位學生的所有志願 */
            $(dicWishesByStudID[studID]).each(function (index, wish) {
                var code = wish.SchoolDeptCode;
                var dept = ischool.chooseWish.Schools.getDeptByCode(code);
                var deptText = code + " - " + dept.School + " - " + dept.Dept + " (" + dept.Group + ")";
                var html = '<tr dept-code="' + code + '" class="stud_' + studID + ' ' + '"> \
                          	  <td>' + deptText + '</td> \
                          	  <td class="align-center">' + wish.WishPriority + '</td> \
                        	</tr>';
                var trWish = $(html);
                $(trWish.find('td')[0]).click(function () {
                    $('#selDepts').val(code);
                    _initStudentsByDeptCode(code, studID);
                });
                if (wish.FinalDeptCode) {//這位學生是否已經分發過了。
                    trWish.addClass(wish.FinalDeptCode == code ? "text-error" : "muted");
                }
                if ($('#selDepts').val() == code)
                    trWish.addClass("warning");

                trWish.appendTo(tbody).hide();

            });
        });

    };

    /* 按照梯次顯示 */
    var _fillByRank = function () {
        var tbody = $('#tblStudWishList2').find('tbody');
        tbody.html('');

        aryChooseRankList.sort(function (a, b) { return a - b });

        /* 顯示每一個梯次 */
        $(aryChooseRankList).each(function (index, rank) {
            var rankHtml = '<tr class="my-title"> \
	                          	<td rank="' + rank + '"><i class="icon-chevron-right text-margin"></i>第 ' + rank + ' 梯次</td> \
	                          	<td>&nbsp;</td> \
	                          </tr>';
            var trRank = $(rankHtml);
            //當梯次列被按下時
            trRank.click(function () {
                var tdRank = $($(this).find('td')[0]);
                var rnk = tdRank.attr('rank');
                if (trRank.attr('mode') != 'open') {
                    $(tdRank.find('i')[0]).addClass('icon-chevron-down');	//改變 icon
                    //顯示這梯次的所有學生，並確認學生以下的志願是否開啟。
                    $(this).parent().find("tr.rank_" + rnk + ".studinfo").show().each(function (index, elmTr) {
                        var stud_id = $($(elmTr).find('td')[0]).attr('stud-id');
                        var mode = $(elmTr).attr('mode');
                        //決定志願列是否顯示
                        if (mode == "open") {
                            $(elmTr).parent().find('tr.stud_' + stud_id).show();
                        }
                        else {
                            $(elmTr).parent().find('tr.stud_' + stud_id).hide();
                        }
                    });

                    trRank.attr('mode', 'open');
                }
                else {
                    $(tdRank.find('i')[0]).removeClass('icon-chevron-down');
                    $(this).parent().find("tr.rank_" + rnk).hide();

                    trRank.attr('mode', 'close');
                }
            }).appendTo(tbody);

            /* 對於 rank 中的每一位學生 */
            var studIDs = dicWishesByGroup[rank + "_studIDs"];
            var dicStuds = dicWishesByGroup[rank];
            $(studIDs).each(function (index, studID) {
                /* 建立學生列，tr 加上 studinfo class 以資識別 */
                var stud = dicStuds[studID][0];
                var studText = stud.ClassName + "(" + stud.SeatNo + ") - " + stud.StudentName + "(" + stud.Group + ") (" + stud.TotalScore + " 分)";
                var trHtml = '<tr class="my-title rank_' + rank + ' studinfo " mode="close" id="trStud_' + stud.StudentID + '"> \
	                          	<td class="sub-title" stud-id="' + stud.StudentID + '" style="padding-left:40px;"><i class="icon-chevron-right text-margin"></i>' + studText + '</td> \
	                          	<td>&nbsp;</td> \
	                          </tr>';
                var tr = $(trHtml);
                if (stud.FinalDeptCode) {//這位學生是否已經分發過了。
                    tr.addClass("text-error");
                }
                /* 當學生列被按下時 */
                tr.click(function () {
                    var td = $($(this).find('td')[0]);
                    var studid = td.attr('stud-id');
                    /* 判斷這位學生的志願是否顯示 */
                    /**/
                    if ($(this).attr('mode') != 'open') {
                        $(td.find('i')[0]).addClass('icon-chevron-down');
                        $(this).parent().find("tr.stud_" + studid).show();
                        $(this).attr('mode', 'open');
                    }
                    else {
                        $(td.find('i')[0]).removeClass('icon-chevron-down');
                        $(this).parent().find("tr.stud_" + studid).hide();
                        $(this).attr('mode', 'close');
                    }

                    /* 處理 
	            	$(this).parent().find("tr.studinfo").each(function(index, trStudInfo) {
            			if ($(trStudInfo).attr('mode') != 'open') {
		            		$(trStudInfo).find('td > i').addClass('icon-chevron-down');
		            		$(trStudInfo).parent().find("tr.stud_" + studid).show();
		            		$(trStudInfo).attr('mode','open');
		            	}
		            	else {
		            		$(trStudInfo).find('td > i').removeClass('icon-chevron-down');
		            		$(trStudInfo).parent().find("tr.stud_" + studid).hide();
		            		$(trStudInfo).attr('mode','close');
		            	}
            		});
            		*/
                }).appendTo(tbody).hide();

                /* 顯示這位學生的所有志願 */
                $(dicStuds[studID]).each(function (index, wish) {
                    var code = wish.SchoolDeptCode;
                    var dept = ischool.chooseWish.Schools.getDeptByCode(code);
                    var deptText = code + " - " + dept.School + " - " + dept.Dept + " (" + dept.Group + ")";
                    var html = '<tr dept-code="' + code + '" class="stud_' + studID + ' rank_' + rank + '"> \
	                          	  <td>' + deptText + '</td> \
	                          	  <td class="align-center">' + wish.WishPriority + '</td> \
	                        	</tr>';
                    var trWish = $(html);
                    $(trWish.find('td')[0]).click(function () {
                        $('#selDepts').val(code);
                        _initStudentsByDeptCode(code, studID);
                    });
                    if (wish.FinalDeptCode) {//這位學生是否已經分發過了。
                        trWish.addClass(wish.FinalDeptCode == code ? "text-error" : "muted");
                    }
                    if ($('#selDepts').val() == code)
                        trWish.addClass("warning");

                    trWish.appendTo(tbody).hide();

                });

            })

        });

    };

    /* 按照群駔顯示 */
    var _fillByGroup = function () {
        var tbody = $('#tblStudWishList2').find('tbody');
        tbody.html('');

        aryGroupList.sort();

        /* 顯示每一個梯次 */
        $(aryGroupList).each(function (index, grp) {
            var rankHtml = '<tr class="my-title"> \
	                          	<td rank="' + grp + '"><i class="icon-chevron-right text-margin"></i>' + grp + ' </td> \
	                          	<td>&nbsp;</td> \
	                          </tr>';
            var trRank = $(rankHtml);
            //當梯次列被按下時
            trRank.click(function () {
                var tdRank = $($(this).find('td')[0]);
                var rnk = tdRank.attr('rank');
                if (trRank.attr('mode') != 'open') {
                    $(tdRank.find('i')[0]).addClass('icon-chevron-down');	//改變 icon
                    //顯示這梯次的所有學生，並確認學生以下的志願是否開啟。
                    $(this).parent().find("tr.rank_" + rnk + ".studinfo").show().each(function (index, elmTr) {
                        var stud_id = $($(elmTr).find('td')[0]).attr('stud-id');
                        var mode = $(elmTr).attr('mode');
                        //決定志願列是否顯示
                        if (mode == "open") {
                            $(elmTr).parent().find('tr.stud_' + stud_id).show();
                        }
                        else {
                            $(elmTr).parent().find('tr.stud_' + stud_id).hide();
                        }
                    });

                    trRank.attr('mode', 'open');
                }
                else {
                    $(tdRank.find('i')[0]).removeClass('icon-chevron-down');
                    $(this).parent().find("tr.rank_" + rnk).hide();

                    trRank.attr('mode', 'close');
                }
            }).appendTo(tbody);

            /* 對於 rank 中的每一位學生 */
            var studIDs = dicWishesByGroup[grp + "_studIDs"];
            var dicStuds = dicWishesByGroup[grp];
            $(studIDs).each(function (index, studID) {
                /* 建立學生列，tr 加上 studinfo class 以資識別 */
                var stud = dicStuds[studID][0];
                var studText = stud.ClassName + "(" + stud.SeatNo + ") - " + stud.StudentName + "(第 " + stud.ChooseWishRank + " 梯次) (" + stud.TotalScore + " ％)";
                var trHtml = '<tr class="my-title rank_' + grp + ' studinfo " mode="close" id="trStud_' + stud.StudentID + '"> \
	                          	<td class="sub-title" stud-id="' + stud.StudentID + '" style="padding-left:40px;"><i class="icon-chevron-right text-margin"></i>' + studText + '</td> \
	                          	<td>&nbsp;</td> \
	                          </tr>';
                var tr = $(trHtml);
                if (stud.FinalDeptCode) {//這位學生是否已經分發過了。
                    tr.addClass("text-error");
                }
                /* 當學生列被按下時 */
                tr.click(function () {
                    var td = $($(this).find('td')[0]);
                    var studid = td.attr('stud-id');
                    /* 判斷這位學生的志願是否顯示 */
                    /**/
                    if ($(this).attr('mode') != 'open') {
                        $(td.find('i')[0]).addClass('icon-chevron-down');
                        $(this).parent().find("tr.stud_" + studid).show();
                        $(this).attr('mode', 'open');
                    }
                    else {
                        $(td.find('i')[0]).removeClass('icon-chevron-down');
                        $(this).parent().find("tr.stud_" + studid).hide();
                        $(this).attr('mode', 'close');
                    }

                }).appendTo(tbody).hide();

                /* 顯示這位學生的所有志願 */
                $(dicStuds[studID]).each(function (index, wish) {
                    var code = wish.SchoolDeptCode;
                    var dept = ischool.chooseWish.Schools.getDeptByCode(code);
                    var deptText = code + " - " + dept.School + " - " + dept.Dept + " (" + dept.Group + ")";
                    var html = '<tr dept-code="' + code + '" class="stud_' + studID + ' rank_' + grp + '"> \
	                          	  <td>' + deptText + '</td> \
	                          	  <td class="align-center">' + wish.WishPriority + '</td> \
	                        	</tr>';
                    var trWish = $(html);

                    if (wish.FinalDeptCode) {//這位學生是否已經分發過了。
                        trWish.addClass(wish.FinalDeptCode == code ? "text-error" : "muted");
                    }
                    if ($('#selDepts').val() == code)
                        trWish.addClass("warning");

                    $(trWish.find('td')[0]).click(function () {
                        $('#selDepts').val(code);
                        _initStudentsByDeptCode(code, studID);
                    });
                    trWish.appendTo(tbody).hide();

                });

            })

        });
    };

    var _fillSchoolDepts = function () {
        var depts = ischool.chooseWish.Schools.getAllDepts();
        var sel = $('#selDepts');
        sel.html('');	//clear content
        $("<option value='0'> --- 請選擇 --- </option>").appendTo(sel);
        $(depts).each(function (index, dept) {
            var deptName = ischool.chooseWish.Schools.getFullDeptNameByCode(dept.SchoolDeptCode);
            var content = "<option value='" + dept.SchoolDeptCode + "'>" + deptName + "</option>";
            var item = $(content);
            item.appendTo(sel);
        });
        sel.change(function () {
            var code = $(this).val();

            _initStudentsByDeptCode(code);
        });
    };

    var _initStudentsByDeptCode = function (deptCode, heightLightStudentID) {

        var tbody = $('#tblStudentsOfDept').find('tbody');

        if (deptCode == '0' | deptCode == '') {
            tbody.html('');	//clear content
            return;
        }

        var dept = ischool.chooseWish.Schools.getDeptByCode(deptCode);
        var deptName = ischool.chooseWish.Schools.getFullDeptNameByCode(deptCode);
        $("[dept-code]").removeClass("warning");
        $("[dept-code=" + deptCode + "]").addClass("warning");

        $('#deptUrl').attr('href', (dept ? dept.WebUrl : '#'));
        cnCommon.send({
            service: '_.GetStudentWishes',
            body: {
                Request: {
                    SchoolDeptCode: deptCode,
                    Order: {
                        ScoreRank: ''
                    }
                }
            },
            //body : ('<Request><SchoolDeptCode>' + deptCode + '</SchoolDeptCode></Request>'),
            autoRetry: true,
            result: function (resp, errorInfo, XMLHttpRequest) {
                tbody.html('');	//clear content
                if (errorInfo) {
                    ischool.chooseWish.Util.showMsg("取得選擇『" + deptName + "』的學生清單失敗：" + errorInfo);
                }
                else {
                    var studs = ischool.chooseWish.Util.handleArray(resp.WishList.Wish);

                    var html = '';
                    $(studs).each(function (index, studWish) {
                        html = ('<tr stud-id="' + studWish.StudentID + '" class-name="' + studWish.ClassName + '" seat-no="' + studWish.SeatNo + '" stud-name="' + studWish.StudentName + '"> \
	                                	<td><a href="javascript:void(0);" cls-id="' + studWish.ClassID + '">' + studWish.ClassName + '</a></td> \
	                                	<td><a href="javascript:void(0);" stud-id="' + studWish.StudentID + '">' + studWish.StudentName + '</a></td> \
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

                        /* 點選班級欄位 */
                        $(tr.find('td')[0]).find('a').click(function () {
                            var classID = studWish.ClassID;
                            $('#selClass').val(classID);
                            _getStudentWishes(classID);
                        });
                        /* 點選學生姓名欄位 */
                        $(tr.find('td')[1]).find('a').click(function () {
                            var classID = studWish.ClassID;
                            $('#selClass').val(classID);
                            _getStudentWishes(classID, function () {
                                var studID = studWish.StudentID;
                                var trStud = $("#trStud_" + studID).show();
                                trStud.click();
                                var scrollTopPosition = trStud.position().top - $('#divWishResults').position().top;
                                $('#divWishResults').scrollTop(scrollTopPosition);
                            });
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

    var initUI1 = function () {

    };



    return {

        init: function () {
            _getClassList();	//取得班級清單
            _fillSchoolDepts();	//填入學校科目代碼

            $("input:radio[name=optionsRadios]").click(function () {
                _fillStudWishList();
            });

        },

        resizeHeight: function () {
            var height = $(window).height() - $('#divWishResults').position().top - 20;
            $('#divWishResults').css('overflow-y', 'auto').css('max-height', height);
        }

    };
}();
