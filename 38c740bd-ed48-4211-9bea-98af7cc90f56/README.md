gadget-重補修成績
==========================

* 身份「老師」
* 運用語法來撰寫 javascript
* 運用 less css 語法來撰寫 css
* 運用 gadget 物件呼叫 dsa 服務，依據呼叫不同類型的服務，來操做"評分"等功能
* 運用 twitter bootstrap 做為畫面設計的板型


----------


功能說明
-------

**登錄成績**

 - 授課老師可評分自己的學生成績
 - 包含原班級、原班座號、重修座號。依重修座號排序
 - 輸入各評量成績後，系統會試算學期成績，老師參考後決定實際要給予的學期成績，重補修的學期成績由教師提供
 - desktop上的「成績結算」是備而不用的功能，如果因老師未輸入妥當時，可協助處理
 - 學期成績的輸入期間可與期末考成績輸入期間相同
 - 成續驗證規則可與社團相同(要再與李組長討論。因為重補修的學期成績及格時一定以60分登錄，所以他想要改成績為60。但是。我們討論後還是覺得修改成績不太妥當)。


----------


檔案說明
-------
**一般共用**

js/bootstrap.js

      // 將這3行註解：使編輯的對話框，點擊背景時不會關閉
      // if (this.options.backdrop != 'static') {
      //   this.$backdrop.click($.proxy(this.hide, this))
      // }

**小工具專用**

js/club.js：用於處理瀏覽

**驗證用 ([jQuery plugin: Validation][1] 版本1.9.0)**

js/jquery.metadata.js：驗證規則使用 class={} 時需引用的檔

js/jquery.validate.min.js：驗證用主程式

js/messages_tw.js：提示訊息中文化


  [1]: http://bassistance.de/jquery-plugins/jquery-plugin-validation/

