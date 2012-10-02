gadget-重補修
==========================

* 身份「學生」
* 運用語法來撰寫 javascript
* 運用 less css 語法來撰寫 css
* 運用 gadget 物件呼叫 dsa 服務
* 運用 twitter bootstrap 做為畫面設計的板型


----------


功能說明
-------

**重補修期間判定**

 - 重補修期間名冊($shinmin.retake.time_list) 決定是否為重補修期間
 - 非重補修期間畫面只呈現「目前未開放重補修」
 - 開放重補修選課時間($shinmin.retake.select_course_date) 決定目前是否為選科目期間
 - 非選科目期間出現「梯次名稱 選課期間：尚未開放」


**學生選課條件**

 1. 重補修建議名單($shinmin.retake.suggest_list).名冊 = 開放中的重補修期間名冊，其科目名稱+級別
 2. **課表**($shinmin.retake.course_timetable) 包含**學生的科別**，例：科別=綜合高中科:多媒體製作學程
 3. 科目選擇清單($shinmin.retake.subject).名冊 = 開放中的重補修期間名冊
 4. 科目選擇清單($shinmin.retake.subject).課表 = 包含學生科別的課表
 5. 科目選擇清單($shinmin.retake.subject).科目名稱+級別 = 學生重補修建議名單中的科目+級別

**衝堂**

 - 節次固定為8節
 - 一節課只能出現一個科別+級別，超過一個**科別+級別**即衝堂
 - 衝堂時不允許儲存


**其他**

 - 級別以羅馬數字呈現

----------


檔案說明
-------

**驗證用 ([jQuery plugin: Validation][1] 版本1.9.0)**

js/jquery.metadata.js：驗證規則使用 class={} 時需引用的檔

js/jquery.validate.min.js：驗證用主程式

js/messages_tw.js：提示訊息中文化

js/jquery-ui-1.7.3.custom.min.js：提示選課成功特效 Effect "Pulsate"

  [1]: http://bassistance.de/jquery-plugins/jquery-plugin-validation/