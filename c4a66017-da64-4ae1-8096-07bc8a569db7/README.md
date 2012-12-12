gadget-訊息
==========================

* 身份「老師、學生、家長」
* 運用語法來撰寫 javascript
* 運用 less css 語法來撰寫 css
* 運用 gadget 物件呼叫 dsa 服務，取得學生資訊
* 運用 twitter bootstrap 做為畫面設計的板型


----------


功能說明
-------

**訊息清單**

 * 呈現送出及接收的全部訊息
 * 捲軸至最底端時，載入更多訊息
 * 以多久以前的方式呈現訊息時間

**互動訊息清單**

 * 呈現目前瀏覽的這則訊息的「發送 or 接收人」頭像、姓名、個性簽名
 * 顯示本則訊息之前，雙方互動的訊息
 * 捲軸至最底端時，載入更多訊息
 * 呈現實際訊息時間

**傳訊**

 * 以目前瀏覽的這則訊息的「發送 or 接收人」為對象，傳送訊息給此對象
 * 傳訊成功的提示訊息會自動消失


撰寫注意事項
-------

  * <script src="js/jquery.ui.touch-punch.min.js"></script>
  * <script src="js/facescroll.js"></script>
  * <script src="js/bootstrap.js"></script> 一定要放最後面，與上面2者衝突，會使button的loading狀態失效