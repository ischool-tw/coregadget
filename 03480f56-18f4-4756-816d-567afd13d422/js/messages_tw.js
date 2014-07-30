/*
 * Translated default messages for the jQuery validation plugin.
 * Locale: TW (Taiwan - Traditional Chinese)
 */
 
gadget.onLanguageChanged(function(lang){
	jQuery.extend(jQuery.validator.messages, 
		(function(){
			var result={};
			if(lang=="zh-CN"){
				result.required= "必填";
				result.remote= "请修正此栏位";
				result.email= "请输入正确的电子信箱";
				result.url= "请输入合法的URL";
				result.date= "请输入合法的日期";
				result.dateISO= "请输入合法的日期 (ISO).";
				result.number= "请输入数字";
				result.digits= "请输入整数";
				result.creditcard= "请输入合法的信用卡号码";
				result.equalTo= "请重复输入一次";
				result.accept= "请输入有效的后缀字符串";
				result.maxlength= jQuery.validator.format("请输入长度不大于{0} 的字符串");
				result.minlength= jQuery.validator.format("请输入长度不小于 {0} 的字符串");
				result.rangelength= jQuery.validator.format("请输入长度介于 {0} 和 {1} 之间的字符串");
				result.range= jQuery.validator.format("请输入介于 {0} 和 {1} 之间的数值");
				result.max= jQuery.validator.format("请输入不大于 {0} 的数值");
				result.min= jQuery.validator.format("请输入不小于 {0} 的数值");			
			}
			else{
				result.required= "必填";
				result.remote= "請修正此欄位";
				result.email= "請輸入正確的電子信箱";
				result.url= "請輸入合法的URL";
				result.date= "請輸入合法的日期";
				result.dateISO= "請輸入合法的日期 (ISO).";
				result.number= "請輸入數字";
				result.digits= "請輸入整數";
				result.creditcard= "請輸入合法的信用卡號碼";
				result.equalTo= "請重複輸入一次";
				result.accept= "請輸入有效的後缀字串";
				result.maxlength= jQuery.validator.format("請輸入長度不大於{0} 的字串");
				result.minlength= jQuery.validator.format("請輸入長度不小於 {0} 的字串");
				result.rangelength= jQuery.validator.format("請輸入長度介於 {0} 和 {1} 之間的字串");
				result.range= jQuery.validator.format("請輸入介於 {0} 和 {1} 之間的數值");
				result.max= jQuery.validator.format("請輸入不大於 {0} 的數值");
				result.min= jQuery.validator.format("請輸入不小於 {0} 的數值");	
			}
			return result;
		})()
	);
});
 