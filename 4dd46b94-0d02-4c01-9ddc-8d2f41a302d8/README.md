gadget-評量成績(高中)
==========================

* 身份「學生及家長」
* 運用 CoffeeScript 語法來撰寫 javascript
* 運用 less css 語法來撰寫 css
* 運用 gadget 物件呼叫 dsa 服務，取得學生資訊
* 運用 twitter bootstrap 做為畫面設計的板型


----------


功能說明
-------

**gadget.paramValues 設定**

    //本學期是否於輸入截止後才顯示成績
    "system_exam_must_enddate": ["true"(預設) || "false"]

    //使用小工具者的身份
    "system_position": ["student"(學生，預設) || "parent"(家長)]


**評量成績列表**

 - 可切換學年度、學期
 - 可瀏覽總分
 - 除了體育之外，皆有成績進退步比較
 - 未設定評分樣版及不需評分之科目，不顯示
 - 如果是本學期，成績在輸入截止之前不顯示；截止前顯示tooltip