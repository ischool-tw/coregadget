class Payment extends React.Component {
  constructor(props) {
    super(props);  

    this.stage = this.props.status; // 將階段寫入全域變數
    this.state = {
      loading: true,
      admitteds: [],
      waitings: [],
      showModal: false,
      disabledBtn: false,
      checkedCourses: [],
    };
  }

  get stage() {
    return this._status;
  } 

  set stage(val) {
    this._status = val;
  }

  get configuration() {
    return this._configuration;
  }

  set configuration(val) {
    this._configuration = val;
  }

  getPaymentList(props) {
    const { schoolYear, semester, status, openingDate, allColCourses } = props;

    const self = this;

    Promise.all([
      self.getMyPaymentList(schoolYear, semester),
      self.getConfiguration(),
    ])
    .then((subData) => {
      const electives = subData[0];
      // console.dir(electives);
      // console.dir(allColCourses);

      // 整理繳款單及正備取
      let data1 = [];
      let data2 = [];
      let checkedCourses = [];

      electives.forEach((elective) => {
        let repo = allColCourses['c' + elective.AlumniID];
        if (repo) {

          elective.NewSubjectCode = repo.NewSubjectCode;
          elective.CourseName = repo.CourseName;
          elective.TuitionFees = repo.TuitionFees;
          elective.Margin = repo.Margin;
          elective.checked = true;

          if (elective.IsAdmitted == 't') {
            data1.push(elective);
          } else {
            data2.push(elective);
          };
        }
      });

      if (this.stage == 'announcement') checkedCourses = data1;
      if (this.stage == 'increment') checkedCourses = data2;

      this.setState((prevState, props) => {
        return {
          loading: false,
          admitteds: data1,
          waitings: data2,
          checkedCourses: checkedCourses,
          disabledBtn: (checkedCourses.length == 0),
        };
      });
    })
    .catch((err) => {
      console.error(err);
      (typeof err === 'function') ? err() : _gg.set_error_message('#mainMsg', null, '內部發生錯誤 101');
    });
  }

  // 取得選課繳款單清單
  getMyPaymentList(schoolYear, semester) {
    return new Promise((resolve, reject) => {
      _gg.connection.send({
        service: "_.GetMyPaymentList",
        body: {
          Request: {
            Condition: {
              SchoolYear: schoolYear || '',
              Semester: semester || ''
            }
          }
        },
        result: function(response, error, http) {
          if (error !== null) {
            reject(() => { _gg.set_error_message('#mainMsg', '_.GetMyPaymentList', error); });
          } else {
            if (response.Response && response.Response.PaymentList) {
              let data = [].concat(response.Response.PaymentList || []);
              resolve(data);
            } else {
              resolve([]);
            }
          }
        }
      });
    });
  }

  // 匯款訊息、Mail樣版
  getConfiguration() {
    const self = this;

    return new Promise((resolve, reject) => {
      _gg.connection.send({
        service: "_.GetConfiguration",
        body: {
          Request: {
              Condition: {
                  ConfName: [
                      'emba_alumnicoursemodule_course_description_temp',
                      'emba_alumnicoursemodule_view_alumni_notes'
                  ]
              }
          }
        },
        result: (response, error, http) => {
          if (error !== null) {
            reject(() => { _gg.set_error_message('#mainMsg', '_.GetConfiguration', error); });
          } else {
            if (response.Response && response.Response.Configuration) {
              let configs = {};

              ([].concat(response.Response.Configuration || [])).forEach((item) => {
                configs[item.ConfName] = item.ConfContent;
              });

              self.configuration = configs;
              resolve('success!');
            } else {
              resolve('');
            }
          }
        }
      });
    });
  }

  handleHideModal = () => {
    this.setState({showModal: false});
  }

  handleShowModal = () => {
    if (this.state.disabledBtn) return;
    this.setState({showModal: true});
  }

  // 設定勾選
  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    let checkedCourses = [], dataName = '', data = [];

    if (this.stage == 'announcement') {
      dataName = 'admitteds';
      data = this.state.admitteds;
    }
    else if (this.stage == 'increment') {
      dataName = 'waitings';
      data = this.state.waitings;
    }

    const newData = data.map((item) => {
      if (name == 'checkAll') item.checked = value;
      if (name == item.AlumniID) item.checked = value;
      if (item.checked) checkedCourses.push(item);
      return item;
    });

    this.setState((prevState, props) => {
      return {
        [dataName]: data,
        dataName: this.state.admitteds,
        checkedCourses: checkedCourses,
        disabledBtn: (checkedCourses.length == 0),
      }
    });
  }

  btnDom = (courses = [], checkedCourses = []) => {
    let ret1, ret2;
    let style1 = 'btn btn-info';

    // 有正備取課程
    if (courses.length == 0) return;

    if (this.state.disabledBtn) style1 += ' disabled';
  
    ret1 = <button
        type="button"
        className={style1}
        onClick={this.handleShowModal}>
        填寫匯款通知
      </button>;

    if (this.state.disabledBtn) ret2 = <span className="text-error">請先勾選！</span>;

    return <div>{ret1}{ret2}</div>;
  }

  noteDom = () => {
    if (!this.configuration) return;

    const note = this.configuration['emba_alumnicoursemodule_view_alumni_notes'] || '';

    return (
      <div className="alert alert-info">
        <div
          style={{'color':'black', 'backgroundColor':'white'}}
          dangerouslySetInnerHTML={{ __html: note }} />
      </div>
    )
  }

  // 儲存繳款單資訊
  saveMyPaymentData = (data, sendMail, elemErr, elemModal) => {
    const self = this;
    
    const { schoolYear, semester, status, allColCourses } = self.props;
    
    elemErr.html('');
    // console.log(data);

    if (['announcement', 'increment'].indexOf(status) != -1) {
      // 儲存
      self.setPaymentRecord(data, sendMail, elemErr)
      .then((res) => {
        // 寄信
        if (sendMail) self.sendMail(data);

        // 重讀內容
        this.getPaymentList(this.props);

        // 顯示成功訊息
        elemErr.html("<div class='alert alert-success'>\n  儲存成功！\n</div>");
        setTimeout(() => { 
          elemErr.html('');
          elemModal.modal('hide');
          this.handleHideModal();
        }, 5000);
      })
      .catch((err) => {
        console.error(err);
        (typeof err === 'function') ? err() : elemErr.html("<div class='alert alert-error'>\n  發生錯誤！\n</div>");;
      });
    }
  }

  // 繳款單資訊寫入資料庫
  setPaymentRecord = (data, sendMail, elemErr) => {
    const self = this;

    return new Promise((resolve, reject) => {
      _gg.connection.send({
        service: "_.SetPaymentRecord",
        body: {
          Request: {
            PaymentRecord: data
          }
        },
        result: (response, error, http) => {
          if (error !== null) {
            reject(() => { elemErr.html("<div class='alert alert-error'>\n  儲存失敗了！\n</div>"); });
          } else {
            if (parseInt(response.Result && response.Result.EffectRows, 10) > 0) {
              const today = new Date();
              const logMessage = { courseNames: [], refStudentSelectId: [] };
              
              logMessage.courseNames = self.state.checkedCourses.map((item) => {
                return `
                  *課程編號: ${item.NewSubjectCode}
                  *課程名稱: ${item.CourseName}
                  *學雜費: ${item.TuitionFees}
                  *保證金: ${item.Margin}
                `
              });

              data.forEach((item) => { 
                logMessage.refStudentSelectId.push(item.RefStudentSelectId);
                logMessage.bankCode = item.BankCode;
                logMessage.digitsAfter5Number = item.DigitsAfter5Number;
                logMessage.paymentDate = item.PaymentDate;
                logMessage.paymentAmount = item.PaymentAmount;
                logMessage.description = item.Description;
              });

              // 記錄 Log
              let logDescription = `
                校友「@StudentName@」填寫「校友選課保證金」。
                階段：${(self.stage == 'announcement' ? '正取公告中' : '遞補公告中')}
                課程清單：${logMessage.courseNames.join('---------')}
                選課系統編號：${logMessage.refStudentSelectId.join(',')}
                銀行代號：${logMessage.bankCode}
                帳號末5碼：${logMessage.digitsAfter5Number}
                繳款日期：${logMessage.paymentDate}
                繳款金額：${logMessage.paymentAmount}
                繳款說明：${logMessage.description}
                寄送副本：${(sendMail)?'是':'否'}
                使用者電腦時間：${today.getFullYear()}/${(today.getMonth()+1)}/${today.getDate()} ${today.getHours()}:${today.getMinutes()}`;
              self.writeLog('填寫「校友選課」保證金', '填寫「校友選課」保證金表單資料成功', logDescription);
              resolve('success!');
            } else {
              reject(() => { elemErr.html("<div class='alert alert-error'>\n  儲存失敗！\n</div>"); });
            }
          }
        }
      });
    });
  }

  // 填寫記錄寫入 Log
  writeLog = (actionType, action, description) => {
    contractForLog.ready(function() {
      contractForLog.getUserInfo().Property.forEach(function(item){
        let patt = new RegExp('@'+item.Name+'@', 'g');
        description = description.replace(patt, item['@text']);
      });
      // console.log(description);

      contractForLog.send({
        service: "public.AddLog",
        body: {
          Request: {
            Log: {
              Actor: contractForLog.getUserInfo().UserName,
              ActionType: actionType,
              Action: action,
              TargetCategory: 'student',
              ClientInfo: { ClientInfo: '' },
              ActionBy: 'ischool web 校友選課',
              Description: description
            }
          }
        }
      });
    });
  }

  // 寄信
  sendMail = (data) => {
    if (data.length == 0) return;

    self = this;
    const { myInfo } = self.props;

    let receiver = [];
    [1,2,3,4,5].forEach((ii) => {
      if (myInfo['Email' + ii]) {
        receiver.push(`${myInfo.StudentName || ''}  <${myInfo['Email' + ii]}>`);
      }
    });

    if (receiver.length) {
      //  信件主旨
      let mail_subject = '校友選課匯款內容';
      //  信件內容
      let courseNames = self.state.checkedCourses.map((item) => {
        return item.CourseName;
      });
      let mail_content = `
        <p>
          ${myInfo.StudentName} 同學，您好:<br />
          您於${self.props.schoolYear}學年度${(self.props.semester == '0')?'夏季':'第'+self.props.semester}學期 校友選課匯款內容如下：
        </p>
        <p>
          課程名稱：${courseNames.join(', ')}<br />
          銀行代號：${data[0].BankCode}<br />
          帳號末5碼：${data[0].DigitsAfter5Number}<br />
          繳款日期：${data[0].PaymentDate}<br />
          繳款金額：${data[0].PaymentAmount}<br />
          繳款說明：<br />
          ${(data[0].Description || '無').replace(/\n/g, '<br />')}
        </p>
        <br /><br />
        <p>
          EMBA辦公室<br />
          02-3366-5409
        </p>
      `;
    
      _gg.connection.send({
        service: "_.SendMail",
        body: {
          Request: {
            Receiver: receiver.join(','),
            Subject: mail_subject,
            HtmlContent: mail_content
          }
        },
        result: function(response, error, http) {
          if (error) {
            let logDescription = `校友「${myInfo.StudentName}」發送「填寫匯款通知副本」失敗： ${JSON.stringify(error)}`;
            self.writeLog('填寫匯款通知', '發送「填寫匯款通知副本」失敗', logDescription);

          } else {
            let logDescription = `校友「${myInfo.StudentName}」發送「填寫匯款通知副本」成功`;
            self.writeLog('填寫匯款通知', '發送「填寫匯款通知副本」成功', logDescription);
          }
        }
      });
    } else {
      let logDescription = `校友「${myInfo.StudentName}」未設定Email`;
      self.writeLog('填寫匯款通知', '發送「填寫匯款通知副本」失敗', logDescription);
    }
  }

  componentWillUpdate(prevProps, prevState) {
    if (prevProps !== this.props) {
      this.stage = prevProps.status; // 將階段寫入全域變數
      this.getPaymentList(prevProps);
    }
  }

  render() {
    const { openingDate, allColCourses } = this.props;
    const panel = {'marginTop': '20px'};
    const titleStyle2 = {
      'marginBottom': '10px',
      'color': 'red',
      'fontSize': '16px',
    };
    if (this.state.loading) {
      return <div>載入中...</div>;
    } 
    else {
      if (this.stage == 'afterChoose') {
        return (<div>目前尚無資料</div>)
      } 
      else {
        // 第一階段公告中
        if (this.stage == 'announcement') {
          return (
            <div>
              {/* Block Comments */}
              <div className="alert alert-info2">
                繳款時間：{openingDate.AnnouncementStartDate} 至 {openingDate.AnnouncementEndDate} 止。
              </div>
              {this.noteDom()}
              <div>
                <MyAdmissionList
                  type="admitted"
                  canPayment={true}
                  allColCourses={allColCourses}
                  list={this.state.admitteds}
                  handleInputChange={this.handleInputChange} />
              </div>
              <div>{this.btnDom(this.state.admitteds, this.state.checkedCourses)}</div>
              {
                this.state.showModal ? 
                  <PaymentForm
                    stage={this.stage}
                    checkedCourses={this.state.checkedCourses}
                    allColCourses={allColCourses}
                    handleHideModal={this.handleHideModal}
                    saveMyPaymentData={this.saveMyPaymentData} />
                : null
              }
            </div>
          )
        }

        // 第二階段遞補中
        else if (this.stage == 'increment') {
          return (
            <div>
              <div className="alert alert-info2">
                繳款時間：{openingDate.IncrementStartDate} 至 {openingDate.IncrementEndDate} 止。
              </div>
              {this.noteDom()}
              <div>
                <MyAdmissionList
                  type="admitted"
                  canPayment={false}
                  allColCourses={allColCourses}
                  list={this.state.admitteds}
                  handleInputChange={this.handleInputChange} />
              </div>
              <div style={panel}>
                <MyAdmissionList
                  type="waiting"
                  canPayment={true}
                  allColCourses={allColCourses}
                  list={this.state.waitings}
                  handleInputChange={this.handleInputChange} />
              </div>
              <div>{this.btnDom(this.state.waitings, this.state.checkedCourses)}</div>
              {
                this.state.showModal ? 
                  <PaymentForm
                    stage={this.stage}
                    checkedCourses={this.state.checkedCourses}
                    allColCourses={allColCourses}
                    handleHideModal={this.handleHideModal}
                    saveMyPaymentData={this.saveMyPaymentData} />
                : null
              }
            </div>
          )
        }

        // 其他
        else {
          return (
            <div>
              <div>
                <MyAdmissionList
                  type="admitted"
                  canPayment={false}
                  allColCourses={allColCourses}
                  list={this.state.admitteds}
                  handleInputChange={this.handleInputChange} />
              </div>
              <div style={panel}>
                <MyAdmissionList
                  type="waiting"
                  canPayment={false}
                  allColCourses={allColCourses}
                  list={this.state.waitings}
                  handleInputChange={this.handleInputChange} />
              </div>
            </div>
          )
        }
      }
    }
  }
}
