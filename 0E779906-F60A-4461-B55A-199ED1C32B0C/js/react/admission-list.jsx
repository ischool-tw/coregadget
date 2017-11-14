class AdmissionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      admittedList: [],
      waitingList: []
    };
  }

  getAdmissionList(alumniID) {
    return new Promise((resolve, reject) => {
      if (alumniID) {
        _gg.connection.send({
          service: "_.GetAdmissionList",
          body: {
            Request: {
              Condition: {
                AlumniID: alumniID
              }
            }
          },
          result: function(response, error, http) {
            if (error !== null) {
              reject(() => _gg.set_error_message('#mainMsg', '_.GetAdmissionList', error));
            } else {
              if (response.Response && response.Response.AdmissionList) {
                let data = [].concat(response.Response.AdmissionList || []);
                resolve(data);
              } else {
                resolve([]);
              }
            }
          }
        });
      } else {
        reject(() => {_gg.set_error_message('#mainMsg', '_.GetAdmissionList', 'need alumniID')});
      }
    });
  };

  toggleTab = (tabName) => {
    $('#myTab a:[href="#' + tabName + '"]').tab('show');
  };

  admissionDOM(type, item, idx) {
    // type 'a': 正取 'w': 備取
    let mySelfClass = '';
    if (item.Myself === 't') mySelfClass = (type === 1) ? 'my-admission' : 'my-waiting';

    let ret;
    // 逾期未繳費
    if (item.AutoManualEliminate == 't') {
      ret = <span>{item.StudentName} (放棄)</span>
    }
    else {
      // 可繳費，本人
      if (item.Myself == 't') {
        ret = <a href="javascript:;" onClick={() => this.toggleTab('sa08')}>{item.StudentName}</a>
      }
      // 可繳費，非本人
      else {
        ret = <span>{item.StudentName}</span>
      }
    }

    return (
      <div key={`${type}${idx}`}>
        <span className={mySelfClass}>
          <span>{item.SerialNumber}. </span>
          {ret}
        </span>
      </div>
    )
  };

  componentDidMount() {
    let self = this;

    const { alumniID } = this.props;
    if (alumniID) {
      this.getAdmissionList(alumniID).then((data) => {
        let data1 = [];
        let data2 = [];
        data.forEach((item) => {
          if (item.IsAdmitted == 't') {
            data1.push(item);
          } else {
            data2.push(item);
          }
        });
        self.setState((prevState, props) => {
          return {
            admittedList: data1,
            waitingList: data2
          };
        });
      })
      .catch((err) => {
        // console.error(err);
        (typeof err === 'function') ? err() : _gg.set_error_message('#mainMsg', null, '內部發生錯誤 004');
      });
    }
  }

  render() {
    const { alumniID } = this.props;
    if (!alumniID) {
      return (null);
    }
    else {
      return (
        <tr>
          <td colSpan="6">
            <div style={{'display': 'flex'}}>
              <div style={{'padding': '5px', 'width': '50%'}}>
                <div style={{'color': 'blue'}}>正取名單：</div>
                <div>
                  {
                    (this.state.admittedList.length) ? 
                    this.state.admittedList.map((item, idx) => {
                      return this.admissionDOM('a', item, idx)
                    }) : '無資料'
                  }
                </div>
              </div>
              <div style={{'padding': '5px', 'width': '50%'}}>
                <div style={{'color': 'red'}}>備取名單：</div>
                <div>
                  {
                    (this.state.waitingList.length) ? 
                    this.state.waitingList.map((item, idx) => {
                      return (
                        <div key={'w'+idx}>
                          <span className={(item.Myself == 't') ? 'my-waiting' : ''}>
                            <span>{item.SerialNumber}. </span>
                            {
                              (item.AutoManualEliminate == 't') ?
                              <span>{item.StudentName} (放棄)</span>
                              :
                              <span>{item.StudentName}</span>
                            }
                          </span>
                          <span>
                            { (item.AutoManualEliminate != 't' && item.AutoManually == 't') ? ' (遞補)' : '' }
                          </span>
                        </div>
                      )
                    }) : '無資料'
                  }
                </div>
              </div>
            </div>         
          </td>
        </tr>
      );
    }
  }
}