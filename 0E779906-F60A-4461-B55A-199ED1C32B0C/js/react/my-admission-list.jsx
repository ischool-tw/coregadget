class MyAdmissionList extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      checkAll: true,
    };
  }

  handleCheckedAllChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState((prevState, props) => {
      return {
        checkAll: value,
      }
    });
    this.props.handleInputChange(event);
  }

  // 產出 DOM
  listDom = () => {
    const { canPayment, allColCourses, list, handleInputChange } = this.props;

    let admittedList = [];
    
    const newLineStyle = {
      'whiteSpace': 'pre',
    };
    const liStyle = {
      'border': 0,
      'padding': 0,
    }

    list.forEach((item) => {
      let repo = allColCourses['c' + item.AlumniID];
      admittedList.push(
        <tr key={repo.AlumniID}>
          {
            (canPayment) ?
            <td>
              <input
                name={item.AlumniID}
                type="checkbox"
                checked={item.Checked}
                onChange={handleInputChange} 
                disabled={item.Cancel == 't'}/>
            </td>
            :
            null
          }
          <td>{repo.NewSubjectCode}</td>
          <td>{repo.CourseName}</td>
          <td>{repo.TuitionFees}</td>
          <td>{repo.Margin}</td>
          <td>
            {(item.VerifyAccounting == 'f' ? '否' : '是')}
            {item.Cancel == 't' && '(放棄)'}
          </td>
          <td>
            <ul>
              <li style={liStyle}>銀行代號: {item.BankCode || '未填寫'}</li>
              <li style={liStyle}>帳號末5碼: {item.DigitsAfter5Number || '未填寫'}</li>
              <li style={liStyle}>繳款時間: {item.PaymentDate || '未填寫'}</li>
              <li style={liStyle}>繳款金額: {item.PaymentAmount || '未填寫'}</li>
            </ul>
          </td>
          <td>
            <div style={newLineStyle}>{item.Description || '未填寫'}</div>
          </td>
        </tr>
      );
    });

    return admittedList;
  }

  render() {
    const { type, canPayment, startDate, endDate, list, handleInputChange } = this.props;
    const title = (type == 'admitted') ? '正取' : '備取遞補';
    const titleStyle = {
      'marginBottom': '10px',
      'color': (type == 'admitted' ? 'blue' : 'red'),
      'fontSize': '16px',
    };
    const thStyle = ( type ? 'my-admission' : 'my-waiting');

    return (
      <div>
        <div style={titleStyle}>{title}</div>
        {
          list.length ?
          <div>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  {
                    canPayment ?
                    <th className={thStyle}>
                      <input
                        ref="admissionCheckAll"
                        name="checkAll"
                        type="checkbox"
                        checked={this.state.checkAll}
                        onChange={this.handleCheckedAllChange} />
                    </th>
                    :
                    null
                  }
                  <th className={thStyle}>課程編號</th>
                  <th className={thStyle}>課程名稱</th>
                  <th className={thStyle}>學雜費</th>
                  <th className={thStyle}>保證金</th>
                  <th className={thStyle}>已入帳</th>
                  <th className={thStyle}>繳款資訊</th>
                  <th className={thStyle}>繳款說明</th>
                </tr>
              </thead>
              <tbody>
                {this.listDom()}
              </tbody>
            </table>
          </div>
          : '目前無資料'
        }
      </div>
    )
  }
}