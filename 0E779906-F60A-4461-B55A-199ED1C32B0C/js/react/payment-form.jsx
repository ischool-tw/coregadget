class PaymentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formErrors: {
        inputBankCode: '',
        inputDigitsAfter5Number: '',
        inputPaymentDate: '',
        inputPaymentAmount: '',
      },
      formValid: true
    };
  }

  componentDidMount() {
    const { checkedCourses, allColCourses, handleHideModal, saveMyPaymentData } = this.props;

    $(this.refs.myPaymentModal).modal('show')
    $(this.refs.myPaymentModal).on('hidden.bs.modal', handleHideModal);
    $(this.refs.inputPaymentDate).datetimepicker({
      showMonthAfterYear: true,
      dateFormat: 'yy-mm-dd',
      timeFormat: 'HH:mm',
      showSecond: false,
      showButtonPanel: true,
      showTime: true 
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    const inputBankCode = this.refs.inputBankCode.value;
    const inputDigitsAfter5Number = this.refs.inputDigitsAfter5Number.value;
    const inputPaymentDate = this.refs.inputPaymentDate.value;
    const inputPaymentAmount = this.refs.inputPaymentAmount.value;
    const inputDescription = this.refs.inputDescription.value;
    const inputSendMail = this.refs.sendMail.checked;

    /**
     * 驗證資料
     * inputBankCode 不為空
     * inputDigitsAfter5Number 長度一定為 5
     * inputPaymentDate 日期不大於今天(可以預約轉帳)
     * inputPaymentAmount 金額不小於 0
     */
    let formErrors = {
      inputBankCode: '',
      inputDigitsAfter5Number: '',
      inputPaymentDate: '',
      inputPaymentAmount: '',
    };

    if (!inputBankCode) formErrors.inputBankCode = '必填！';
    if (inputDigitsAfter5Number.length != 5) formErrors.inputDigitsAfter5Number = '請填入末5碼！';
    if (isNaN(Date.parse(inputPaymentDate))) {
      formErrors.inputPaymentDate = '日期不正確！';
    } 
    // else {
    //   if (new Date().getTime() < new Date(inputPaymentDate).getTime()) formErrors.inputPaymentDate = '日期不應大於今天！';
    // }
    if (!((/^(\+|-)?\d+$/.test(inputPaymentAmount))&&inputPaymentAmount>=0)) formErrors.inputPaymentAmount = '請填入正整數！';


    // 確認是否驗證成功
    let formValid = (
      formErrors.inputBankCode.length == 0
      && formErrors.inputDigitsAfter5Number.length == 0
      && formErrors.inputPaymentDate.length == 0
      && formErrors.inputPaymentAmount.length == 0);

    if (formValid) {
      const payData = {
        Status: this.props.stage, // 執行階段，儲存要用的
        RefStudentSelectId: null,
        BankCode: inputBankCode,
        DigitsAfter5Number: inputDigitsAfter5Number,
        PaymentDate: inputPaymentDate,
        PaymentAmount: inputPaymentAmount,
        Description: inputDescription,
      };
      const data = [];

      this.props.checkedCourses.forEach((item) => {
        let tmp = Object.assign({}, payData);
        tmp.RefStudentSelectId = item.RefStudentSelectId;
        data.push(tmp);
      });
      
      // console.log(data);
      this.props.saveMyPaymentData(data, inputSendMail, $(this.refs.paymentMessage), $(this.refs.myPaymentModal));
    }

    this.setState((prevState, props) => {
      return {
        formErrors: formErrors,
        formValid: formValid,
      };
    });  
  }

  errorClass(error) {
    return (error.length === 0 ? '' : 'error');
  }

  render() {
    const { checkedCourses, allColCourses, handleHideModal, saveMyPaymentData, lastBankCode, lastDigitsAfter5Number } = this.props;

    // 取得今天日期，為繳款日期的預設值
    const dtToday = new Date();
    const year = dtToday.getFullYear();
    let month = dtToday.getMonth() + 1;
    let day = dtToday.getDate();
    if(month < 10) month = '0' + month.toString();
    if(day < 10) day = '0' + day.toString();
    const maxDate = `${year}-${month}-${day} 23:59`;

    let defPaymentAmount = 0;
    if (checkedCourses.length) {
      checkedCourses.forEach((item) => {
        let repo = allColCourses['c' + item.AlumniID];
        if (repo) {
          defPaymentAmount += ((repo.TuitionFees || 0) * 1);
          defPaymentAmount += ((repo.Margin || 0) * 1);
        }
      })
    }

    return (
      <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <div className="modal" ref="myPaymentModal">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal">×</button>
            <h3>填寫匯款通知</h3>
            <div ref="paymentMessage" className="my-Msg"></div>
          </div>
          <div className="modal-body">
            <div className={`control-group ${this.errorClass(this.state.formErrors.inputBankCode)}`}>
              <label className="control-label" htmlFor="inputBankCode">
                <span className="text-error">*</span>銀行代號
              </label>
              <div className="controls">
                <select
                  id="inputBankCode"
                  ref="inputBankCode"
                  defaultValue={lastBankCode}
                  required="true">
                  <option value="">請選擇</option>
                  <option value="004">004 - 臺灣銀行</option>
                  <option value="005">005 - 土地銀行</option>
                  <option value="006">006 - 合作金庫商業銀行</option>
                  <option value="007">007 - 第一銀行</option>
                  <option value="008">008 - 華南銀行</option>
                  <option value="009">009 - 彰化銀行</option>
                  <option value="011">011 - 上海商業儲蓄銀行</option>
                  <option value="012">012 - 台北富邦銀行</option>
                  <option value="013">013 - 國泰世華銀行</option>
                  <option value="016">016 - 高雄銀行</option>
                  <option value="017">017 - 兆豐國際商業銀行</option>
                  <option value="018">018 - 農業金庫</option>
                  <option value="021">021 - 花旗（台灣）商業銀行</option>
                  <option value="022">022 - 美國銀行</option>
                  <option value="025">025 - 首都銀行</option>
                  <option value="039">039 - 澳商澳盛銀行</option>
                  <option value="040">040 - 中華開發工業銀行</option>
                  <option value="048">048 - 王道商業銀行</option>
                  <option value="050">050 - 臺灣企銀</option>
                  <option value="052">052 - 渣打國際商業銀行</option>
                  <option value="053">053 - 台中商業銀行</option>
                  <option value="054">054 - 京城商業銀行</option>
                  <option value="072">072 - 德意志銀行</option>
                  <option value="075">075 - 東亞銀行</option>
                  <option value="081">081 - 匯豐（台灣）商業銀行</option>
                  <option value="082">082 - 法國巴黎銀行</option>
                  <option value="085">085 - 新加坡商新加坡華僑銀行</option>
                  <option value="101">101 - 瑞興商業銀行</option>
                  <option value="102">102 - 華泰銀行</option>
                  <option value="103">103 - 臺灣新光商銀</option>
                  <option value="104">104 - 台北五信</option>
                  <option value="108">108 - 陽信商業銀行</option>
                  <option value="114">114 - 基隆一信</option>
                  <option value="115">115 - 基隆二信</option>
                  <option value="118">118 - 板信商業銀行</option>
                  <option value="119">119 - 淡水一信</option>
                  <option value="120">120 - 淡水信合社</option>
                  <option value="124">124 - 宜蘭信合社</option>
                  <option value="127">127 - 桃園信合社</option>
                  <option value="130">130 - 新竹一信</option>
                  <option value="132">132 - 新竹三信</option>
                  <option value="146">146 - 台中二信</option>
                  <option value="147">147 - 三信商業銀行</option>
                  <option value="158">158 - 彰化一信</option>
                  <option value="161">161 - 彰化五信</option>
                  <option value="162">162 - 彰化六信</option>
                  <option value="163">163 - 彰化十信</option>
                  <option value="165">165 - 鹿港信合社</option>
                  <option value="178">178 - 嘉義三信</option>
                  <option value="188">188 - 台南三信</option>
                  <option value="204">204 - 高雄三信</option>
                  <option value="215">215 - 花蓮一信</option>
                  <option value="216">216 - 花蓮二信</option>
                  <option value="222">222 - 澎湖一信</option>
                  <option value="223">223 - 澎湖二信</option>
                  <option value="224">224 - 金門信合社</option>
                  <option value="503">503 - 基隆漁會</option>
                  <option value="504">504 - 瑞芳／萬里漁會</option>
                  <option value="505">505 - 頭城／蘇澳漁會</option>
                  <option value="506">506 - 桃園漁會</option>
                  <option value="507">507 - 新竹漁會</option>
                  <option value="511">511 - 彰化區漁會</option>
                  <option value="512">512 - 雲林區漁會</option>
                  <option value="515">515 - 嘉義區漁會</option>
                  <option value="517">517 - 南市區漁會</option>
                  <option value="518">518 - 南縣區漁會</option>
                  <option value="520">520 - 小港區漁會；高雄區漁會</option>
                  <option value="521">521 - 彌陀／永安／興達港／林園區漁會</option>
                  <option value="523">523 - 東港／琉球／林邊區漁會</option>
                  <option value="524">524 - 新港區漁會</option>
                  <option value="525">525 - 澎湖區漁會</option>
                  <option value="542">542 - 麻豆區農會</option>
                  <option value="549">549 - 下營區農會</option>
                  <option value="551">551 - 官田區農會</option>
                  <option value="552">552 - 大內區農會</option>
                  <option value="557">557 - 新市區農會</option>
                  <option value="558">558 - 安定區農會</option>
                  <option value="562">562 - 仁德區農會</option>
                  <option value="567">567 - 南化區農會</option>
                  <option value="568">568 - 七股區農會</option>
                  <option value="570">570 - 南投市農會</option>
                  <option value="573">573 - 埔里鎮農會</option>
                  <option value="574">574 - 竹山鎮農會</option>
                  <option value="575">575 - 中寮鄉農會</option>
                  <option value="577">577 - 魚池鄉農會</option>
                  <option value="578">578 - 水里鄉農會</option>
                  <option value="579">579 - 國姓鄉農會</option>
                  <option value="580">580 - 鹿谷鄉農會</option>
                  <option value="581">581 - 信義鄉農會</option>
                  <option value="582">582 - 仁愛鄉農會</option>
                  <option value="600">600 - 農金資中心</option>
                  <option value="603">603 - 基隆地區農會</option>
                  <option value="605">605 - 高雄市農會</option>
                  <option value="606">606 - 新北市農會</option>
                  <option value="607">607 - 宜蘭地區農會</option>
                  <option value="608">608 - 桃園地區農會</option>
                  <option value="610">610 - 新竹地區農會</option>
                  <option value="611">611 - 後龍農會</option>
                  <option value="612">612 - 豐原市農會；神岡鄉農會</option>
                  <option value="613">613 - 名間╱集集農會</option>
                  <option value="614">614 - 彰化地區農會</option>
                  <option value="616">616 - 雲林地區農會</option>
                  <option value="617">617 - 嘉義地區農會</option>
                  <option value="618">618 - 台南地區農會</option>
                  <option value="619">619 - 高雄地區農會</option>
                  <option value="620">620 - 屏東地區農會</option>
                  <option value="621">621 - 花蓮地區農會</option>
                  <option value="622">622 - 台東地區農會</option>
                  <option value="623">623 - 台北市農會</option>
                  <option value="624">624 - 澎湖農會</option>
                  <option value="625">625 - 台中市農會</option>
                  <option value="627">627 - 連江縣農會</option>
                  <option value="631">631 - 溪湖鎮農會</option>
                  <option value="635">635 - 線西鄉農會</option>
                  <option value="636">636 - 伸港鄉農會</option>
                  <option value="638">638 - 花壇鄉農會</option>
                  <option value="639">639 - 大村鄉農會</option>
                  <option value="642">642 - 社頭鄉農會</option>
                  <option value="646">646 - 大城鄉農會</option>
                  <option value="647">647 - 溪州鄉農會</option>
                  <option value="649">649 - 埔鹽鄉農會</option>
                  <option value="650">650 - 福興鄉農會</option>
                  <option value="683">683 - 北港鎮農會</option>
                  <option value="685">685 - 土庫鎮農會</option>
                  <option value="693">693 - 東勢鄉農會</option>
                  <option value="696">696 - 水林鄉農會</option>
                  <option value="697">697 - 元長鄉農會</option>
                  <option value="699">699 - 林內鄉農會</option>
                  <option value="700">700 - 中華郵政</option>
                  <option value="803">803 - 聯邦商業銀行</option>
                  <option value="805">805 - 遠東銀行</option>
                  <option value="806">806 - 元大銀行</option>
                  <option value="807">807 - 永豐銀行</option>
                  <option value="808">808 - 玉山銀行</option>
                  <option value="809">809 - 凱基銀行</option>
                  <option value="810">810 - 星展銀行</option>
                  <option value="812">812 - 台新銀行</option>
                  <option value="814">814 - 大眾銀行</option>
                  <option value="815">815 - 日盛銀行</option>
                  <option value="816">816 - 安泰銀行</option>
                  <option value="822">822 - 中國信託</option>
                  <option value="860">860 - 中埔鄉農會</option>
                  <option value="875">875 - 太平區農會</option>
                  <option value="876">876 - 烏日區農會</option>
                  <option value="877">877 - 后里區農會</option>
                  <option value="878">878 - 大雅區農會</option>
                  <option value="901">901 - 大里市農會</option>
                  <option value="903">903 - 汐止農會</option>
                  <option value="904">904 - 新莊農會</option>
                  <option value="910">910 - 財團法人農漁會聯合資訊中心</option>
                  <option value="912">912 - 冬山農會</option>
                  <option value="914">914 - 卓蘭鎮農會</option>
                  <option value="915">915 - 西湖鄉農會</option>
                  <option value="916">916 - 草屯農會</option>
                  <option value="919">919 - 三義鄉農會</option>
                  <option value="921">921 - 南庄鄉農會</option>
                  <option value="922">922 - 台南市農會</option>
                  <option value="925">925 - 三灣鄉農會</option>
                  <option value="928">928 - 板橋農會</option>
                  <option value="951">951 - 北農中心</option>
                  <option value="954">954 - 中南部地區農漁會</option>
                </select>
                <div className="help-inline">{this.state.formErrors.inputBankCode}</div>
              </div>
            </div>
            <div className={`control-group ${this.errorClass(this.state.formErrors.inputDigitsAfter5Number)}`}>
              <label className="control-label" htmlFor="inputDigitsAfter5Number">
                <span className="text-error">*</span>帳號末5碼
              </label>
              <div className="controls">
                <input
                  type="text"
                  id="inputDigitsAfter5Number"
                  ref="inputDigitsAfter5Number"
                  placeholder="帳號末5碼"
                  maxLength="5"
                  defaultValue={lastDigitsAfter5Number}
                  required="true" />
                <div className="help-inline">{this.state.formErrors.inputDigitsAfter5Number}</div>
              </div>
            </div>
            <div className={`control-group ${this.errorClass(this.state.formErrors.inputPaymentDate)}`}>
              <label className="control-label" htmlFor="inputPaymentDate">
                <span className="text-error">*</span>繳款時間
              </label>
              <div className="controls">
                <input
                  type="text"
                  id="inputPaymentDate"
                  ref="inputPaymentDate"
                  placeholder="YYYY-MM-DD HH:mm"
                  pattern="[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}"
                  max={maxDate}
                  defaultValue={maxDate}
                  required="true" />
                <div>(格式：YYYY-MM-DD HH:mm)</div>
                <div className="help-inline">{this.state.formErrors.inputPaymentDate}</div>
              </div>
            </div>
            <div className={`control-group ${this.errorClass(this.state.formErrors.inputPaymentAmount)}`}>
              <label className="control-label" htmlFor="inputPaymentAmount">
                <span className="text-error">*</span>繳款金額
              </label>
              <div className="controls">
                <input
                  type="number"
                  id="inputPaymentAmount"
                  ref="inputPaymentAmount"
                  placeholder="繳款金額"
                  min="0"
                  defaultValue={defPaymentAmount}
                  required="true" />
                {this.state.defPaymentAmount}
                <div className="help-inline">{this.state.formErrors.inputPaymentAmount}</div>
              </div>
            </div>
            <div className="control-group">
              <label className="control-label" htmlFor="inputDescription">繳款說明</label>
              <div className="controls">
                <textarea
                  id="inputDescription"
                  ref="inputDescription" />
              </div>
            </div>
            <div className="control-group">
              <div className="controls">
                <label className="checkbox" htmlFor="sendMail">
                  <input type="checkbox" id="sendMail" ref="sendMail" defaultChecked={true} /> 寄一份副本給我
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-success" autocomplete="off" data-loading-text="儲存中...">送出</button>
            <button type="button" className="btn" data-dismiss="modal">取消</button>
          </div>
        </div>
      </form>
    )
  }
}