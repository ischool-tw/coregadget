gadget-輔導系統
==========================

* 身份「學生」
* 運用語法來撰寫 javascript
* 運用 less css 語法來撰寫 css
* 運用 gadget 物件呼叫 dsa 服務，依據呼叫不同類型的服務，來操做"修改"等功能
* 運用 twitter bootstrap 做為畫面設計的板型


----------


功能說明
-------

> 如果 Desktop 設定「學生可編輯」，則學生「可瀏覽」、「不可編輯」，於編輯時不會出現該題目。
>
> 開放填寫時間以「年級」區分，非開放期間不可編輯。

**個人及親屬資料**

> 包含：個人資料、監護人資料、尊親屬資料、兄弟姊妹資料、身高及體重。

 ※尊親屬資料

 - 需先於 Desktop 設定稱謂。
 - 出生年必需為數字。

※兄弟姊妹資料

 - 可於線上新增、刪除、修改。
 - 若選擇「我是獨子」，家中排行的輸入框為 disabled
 - 出生年必需為數字。

※身高及體重

 - 每學期填寫一次。
 - 身高、體重必需為數字。

**家庭、學習、生活**

>包含：家庭訊息、學習、幹部資訊、自我認識、生活感想。

>只能編輯「目前年級」的資料。其他年級點了編輯鈕無效。

※自我認識

 - 儲存時系統自動帶入填寫日期。

※生活感想

 - 題目由學校自行於 Desktop 設定問題內容。
 - 每學年可設定不一樣的題目，目前只規劃一、二年級有題目。
 - 儲存時系統自動帶入填寫日期。

**畢業後規劃**


**自傳**

 - 儲存時系統自動帶入填寫日期。

----------


檔案說明
-------
**一般共用**

js/api.js：用於日期格式處理

js/bootstrap.js

      // 將這3行註解：使編輯的對話框，點擊背景時不會關閉
      // if (this.options.backdrop != 'static') {
      //   this.$backdrop.click($.proxy(this.hide, this))
      // }

**小工具專用**

js/counsel.js：用於處理瀏覽

js/counsel_data.js：用於處理 service 回傳的物件

js/counsel_save.js：用於處理儲存

js/counsel_update.js：用於處理編輯表單

**驗證用 ([jQuery plugin: Validation][1] 版本1.9.0)**

js/jquery.metadata.js：驗證規則使用 class={} 時需引用的檔

js/jquery.validate.min.js：驗證用主程式

js/messages_tw.js：提示訊息中文化



  [1]: http://bassistance.de/jquery-plugins/jquery-plugin-validation/