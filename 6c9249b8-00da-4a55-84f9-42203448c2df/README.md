gadget-課表查詢
==========================

* 身份「老師、學生」
* 運用 coffeescript 語法來撰寫 javascript
* 運用 css 語法來撰寫 css
* 運用 gadget 物件呼叫 dsa 服務，依據呼叫不同類型的服務，來操作"查詢"等功能

功能說明
-------

**gadget.paramValues 設定**

    //使用小工具者的身份
    "system_position": ["teacher"(老師，預設) || "student"(學生)]

    paramValues: {
        system_position: "teacher"
    }


**學期課表**

無搜尋條件時呈現我的課表

  - 老師預設載入自己的課表
  - 學生預設載入班級的課表

**查詢課表**

請輸入您要查詢的教師、班級、或場地的名稱後，指定單一「教師」、「班級」、或「場地」後，呈現目前學年度學期的課表