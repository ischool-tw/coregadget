/* 
  此 js 檔案處理當 Gadget 被載入時，所要判斷處理的事情：
  1. 是否學生身分？
  		如果是：進入選填志願畫面：
  		如果不是，則進入查詢志願畫面
 */
var ischool = ischool || {};
ischool.chooseWish = ischool.chooseWish || {};


/* =====   程式進入點   ==== */
$(document).ready(function() {
	/* 開啟下載中畫面 */
    $('#myModal').modal('show');


	//contract : ischool.preRecommendedAdmission
	ischool.chooseWish.cnCommon = gadget.getContract("ischool.preRecommendedAdmission");
	var cnCommon = ischool.chooseWish.cnCommon ;

	//如果登入 contract 成功
	cnCommon.ready(function() {
		//1. 連結 contract : ischool.推甄系統.學生
		ischool.chooseWish.cnStud = gadget.getContract("ischool.preRecommendedAdmission.Student");
		var cnStud = ischool.chooseWish.cnStud ;

		//如果登入 contract 成功，表示可以使用此系統
		cnStud.ready(function() {
			//a. 初始化使用者資訊
			initUser(cnStud.getUserInfo());	//get userinfo
			//b. 取得設定
			getSettings();
		})
		//如果登入 contract 失敗，表示雖不能選課，但還是學校師生，可以查詢
		cnStud.loginFailed(function(loginError) {
			//a. hide 選志願畫面
			$('#liWriteWish').hide();
			$('#myTab li:eq(1) a').tab('show');
			$('#tabName').html('查看志願');
			//a. 取得設定
			getSettings();
		});
	});

	//如果登入 contract 失敗，非學校師生
	cnCommon.loginFailed(function(loginError) {
		//ischool.chooseWish.Util.showMsg("您沒有權限使用此功能！！");
		$('#divPopupMsg').html("您沒有權限使用此功能！！");
	});

});

//初始化 ischool.chooseWish.User 物件
var initUser = function(currentUser) {
	if (currentUser) {
	    ischool.chooseWish.User = {
	        isStudent: true,
	        StudentID: ''
	    };
	    [].concat(currentUser.Property || []).forEach(function(property){
	        ischool.chooseWish.User[property.Name] = property["@text"];
	    });
	}
};


/* 取得行政人員設定資料，伺服器時間，以及所有校系資訊 */
var getSettings = function() {
	var cnCommon = ischool.chooseWish.cnCommon ;
	var isDone = {};	//判斷是否三個資訊都取得了！！
	/* 取得 行政人員設定資料 */
	cnCommon.send({
		service : '_.GetSettings',
		body : '',
		autoRetry : true,
		result : function(resp, errorInfo, XMLHttpRequest) {
			if (errorInfo) {
				//ischool.chooseWish.Util.showMsg("取得系統設定資訊失敗：" + errorInfo);
				//$('#divPopupMsg').html("取得系統設定資訊失敗！！");
				ischool.chooseWish.Util.showStartupError("取得系統設定資訊失敗！！");
			}
			else {
				if (ischool.chooseWish.Settings)
					resp.Setting.ServerTime = ischool.chooseWish.Settings.ServerTime ;

				ischool.chooseWish.Settings = resp.Setting;
				$('#divMsg').html(resp.Setting.Message);
				if (resp.Setting.PopupMessage)
				    $('#divPopupMsg').html(resp.Setting.PopupMessage);
				else
				    $('#myModal').modal('hide');
				ischool.chooseWish.Settings.StartTime = new Date(resp.Setting.StartTime.split(".")[0]);
				ischool.chooseWish.Settings.EndTime = new Date(resp.Setting.EndTime.split(".")[0]);
				var util = ischool.chooseWish.Util;
				$('#openPeriod').html(util.formatDateTime(resp.Setting.StartTime) + " ~ " + util.formatDateTime(resp.Setting.EndTime));
				if (resp.Setting.CurrentGroup === '0') {
				    $('#currentRank').html('0 (不分梯次)');
				}
				else {
				    $('#currentRank').html(resp.Setting.CurrentGroup);
				}
				//確認三個資訊都取得後才進行下一步
				isDone.settings = true ;
				if (isDone.settings && isDone.serverTime && isDone.allDepts)
					initUI();
			}
		}
	});

	/* 取得 server time */
	cnCommon.send({
		service : '_.GetServerTime',
		body : '',
		autoRetry : true,
		result : function(resp, errorInfo, XMLHttpRequest) {
			if (errorInfo) {
				//ischool.chooseWish.Util.showMsg("取得系統時間失敗：" + errorInfo);
				//$('#divPopupMsg').html("取得系統時間失敗！！");
				ischool.chooseWish.Util.showStartupError("取得系統時間失敗！！");
			}
			else {
				if (!ischool.chooseWish.Settings)
					ischool.chooseWish.Settings = {};

				ischool.chooseWish.Settings.ServerTime = new Date(resp.ServerTime.ServerTime.split(".")[0]);
				$('#serverTime').html(ischool.chooseWish.Util.formatDateTime(ischool.chooseWish.Settings.ServerTime));
				var t=setTimeout( changeServerTime ,1000);

				//確認三個資訊都取得後才進行下一步
				isDone.serverTime = true ;
				if (isDone.settings && isDone.serverTime && isDone.allDepts)
					initUI();
			}
		}
	});

	/* 取得所有校系資料 */
	cnCommon.send({
		service : '_.GetAllSchoolDepts',
		body : '',
		autoRetry : true,
		result : function(resp, errorInfo, XMLHttpRequest) {
			if (errorInfo) {
				//ischool.chooseWish.Util.showMsg("取得校系資訊失敗：" + errorInfo);
				ischool.chooseWish.Util.showStartupError("取得校系資訊失敗！！");
				//$('#divPopupMsg').html("取得校系資訊失敗！！");
			}
			else {
				ischool.chooseWish.Schools.parse(resp.Depts.Dept);
				//確認三個資訊都取得後才進行下一步
				isDone.allDepts = true ;
				if (isDone.settings && isDone.serverTime && isDone.allDepts)
					initUI();
			}
		}
	});
};

var changeServerTime = function() {
	ischool.chooseWish.Settings.ServerTime = new Date(ischool.chooseWish.Settings.ServerTime.getTime() + 1000);
	var dt = ischool.chooseWish.Settings.ServerTime;
	$('#serverTime').html(ischool.chooseWish.Util.formatDateTime(dt));
	setTimeout( changeServerTime ,1000);
};

var initUI = function() {
	/* 如果是可以選志願的學生 */
	if (ischool.chooseWish.User && ischool.chooseWish.User.isStudent) {
	    initChooseWishUI();
	    if (ischool.chooseWish.Settings.DenyStudentSearch == 't')
	    {
	        $('#liSearchWish').hide();
	        $('#writewish .span5').hide();
	        $('#writewish .span7').addClass('span12').removeClass('span7');
	    }
        else
	        initQueryWishUI();
	}
	else {
	    /* 教師只能查志願 */
	    initQueryWishUI();
	}
	$(".my-page").show();
};

var initChooseWishUI = function() {
	ischool.chooseWish.ChooseWishController.init();
	//ischool.chooseWish.Util.showMsg("initChooseWishUI");
};

var initQueryWishUI = function() {
	ischool.chooseWish.QueryWishController.init();
	gadget.onSizeChanged(function (newSize) {
		ischool.chooseWish.QueryWishController.resizeHeight();
	});
	//ischool.chooseWish.Util.showMsg("initQueryWishUI");
};



