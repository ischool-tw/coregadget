// babel app.jsx --out-file app.js
class RepoList extends React.Component {
  constructor(props) {
    super(props);
    /*
    this.state.status 狀態說明
      'beforeChoose': 選課前
      'choose': 選課中
      'afterChoose': 選課後尚未第一階段公告
      'announcement': 第一階段公告中
      'afterAnnouncement': 第一階段公告結束~第二階段尚未公告
      'increment': 第二階段遞補中
      'afterIncrement': 第二階段遞補結束
    */
    this.state = {
      loading: true,
      status: null,
      allCourses: [],
      allColCourses: {},
      repoCourseList: []
    };

    // this.getCourseDates = this.getCourseDates.bind(this);
    // this.getAlumniCourse = this.getAlumniCourse.bind(this);
    // this.renderAdmission = this.renderAdmission.bind(this);
  }

  // 取得公告開放時間
  getCourseDates = () => {
    return new Promise((resolve, reject) => {
      _gg.connection.send({
        service: "_.GetCourseDates",
        body: '',
        result: function(response, error, http) {
          if (error !== null) {
            reject(() => { _gg.set_error_message('#mainMsg', '_.GetCourseDates', error); });
          } else {
            if (response.CourseSelectionDate) {
              let schoolYear = response.CourseSelectionDate.SchoolYear || '';
              let semester = response.CourseSelectionDate.Semester || '';
              let status = response.CourseSelectionDate.Status;
              resolve({ schoolYear: schoolYear, semester: semester, status: status });
            } else {
              reject(() => {
                // console.log('response.CourseSelectionDate is null');
                self.setState((prevState, props) => {
                  return {
                    loading: true
                  };
                });
              });
            }
          }
        }
      });
    });
  }

  // 取得全部校友課程
  getAlumniCourse(schoolYear, semester) {
    return new Promise((resolve, reject) => {
      _gg.connection.send({
        service: "_.GetAlumniCourse",
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
            reject(() => { _gg.set_error_message('#mainMsg', '_.GetAlumniourse', error); });
          } else {
            if (response.Response) {
              let data = [].concat(response.Response.AlumniCourseRecord || []);
              let colData = {};
              data.forEach((item) => {
                let tmp = '',
                  teachers = [];
                // 為超連結加上 target="_blank"
                if (item.TeacherURLName) {
                  tmp = item.TeacherURLName.split(', ');
                  tmp = [].concat(tmp || []);
                  tmp.forEach((teacher) => {
                    if (($(teacher).attr('href'))) {
                      teachers.push($(teacher).attr('target', '_blank').prop('outerHTML'));
                    } else {
                      teachers.push($(teacher).html());
                    }
                  })
                  item.TeacherURLName = teachers.join(', ');
                }
                colData['c' + item.AlumniID] = item;
              });
              resolve({ allCourses: data, allColCourses: colData });
            } else {
              resolve({ allCourses: [], allColCourses: {} });
            }
          }
        }
      });
    });
  }

  // 取得選課清單
  getAlumniSelectCourse(schoolYear, semester) {
    return new Promise((resolve, reject) => {
      _gg.connection.send({
        service: "_.GetAlumniSelectCourse",
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
            reject(() => _gg.set_error_message('#mainMsg', '_.GetAlumniSelectCourse', error));
          } else {
            if (response.Response && response.Response.SelectCourse) {
              let data = [].concat(response.Response.SelectCourse || []);
              resolve(data);
            } else {
              resolve([]);
            }
          }
        }
      });
    });
  }

  // 取得修課清單
  getAlumniPractiseCourse(schoolYear, semester) {
    return new Promise((resolve, reject) => {
      _gg.connection.send({
        service: "_.GetAlumniPractiseCourse",
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
            reject(() => _gg.set_error_message('#mainMsg', '_.GetAlumniPractiseCourse', error));
          } else {
            if (response.Response && response.Response.PractiseCourse) {
              let data = [].concat(response.Response.PractiseCourse || []);
              resolve(data);
            } else {
              resolve([]);
            }
          }
        }
      });
    });
  }

  componentDidMount() {
    let self = this;
    this.getCourseDates()
    .then((data) => {
      // console.log(data);

      // 第一階段公告中, 第二階段遞補中
      if (data.status == 'announcement' || data.status == 'increment') {
        Promise.all([
          this.getAlumniCourse(data.schoolYear, data.semester),
          this.getAlumniSelectCourse(data.schoolYear, data.semester)
        ])
        .then((subData) => {
          let courses = subData[0];
          let electives = subData[1];
          // console.log(courses.allCourses);
          // console.dir(courses.allColCourses);
          // console.dir(electives);

          let repoCourseList = [];

          electives.forEach((elective) => {
            let repo = courses.allColCourses['c' + elective.AlumniID];
            if (repo) {
              repoCourseList.push(
                <table key={repo.AlumniID} className="table table-bordered">
                  <thead>
                    <tr>
                      <th>課程編號</th>
                      <th>課程名稱</th>
                      <th>授課教師</th>
                      <th>人數上限</th>
                      <th>教室</th>
                      <th>上課時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{repo.NewSubjectCode}</td>
                      <td>
                        { (repo.Syllabus) ? <a href={repo.Syllabus} target="_blank">{repo.CourseName}</a> : <span>{repo.CourseName}</span> }
                      </td>
                      <td dangerouslySetInnerHTML={{ __html: repo.TeacherURLName }}></td>
                      <td>{repo.Capacity}</td>
                      <td>{repo.Classroom}</td>
                      <td>{repo.CourseTimeInfo}</td>
                    </tr>
                    <AdmissionList alumniID={repo.AlumniID}></AdmissionList>
                  </tbody>
                </table>
              );
            }
          });
          self.setState((prevState, props) => {
            return {
              loading: false,
              status: data.status,
              allCourses: courses.allCourses,
              allColCourses: courses.allColCourses,
              repoCourseList: repoCourseList
            };
          });
        })
        .catch((err) => {
          (typeof err === 'function') ? err() : _gg.set_error_message('#mainMsg', null, '內部發生錯誤 001');
        });
      } 
      // 第二階段遞補結束
      else if (data.status == 'afterIncrement') {
        Promise.all([
          this.getAlumniCourse(data.schoolYear, data.semester),
          this.getAlumniPractiseCourse(data.schoolYear, data.semester)
        ])
        .then((subData) => {
          let courses = subData[0];
          let practises = subData[1];

          let repoCourseList = [];

          practises.forEach((practise) => {
            let repo = courses.allColCourses['c' + practise.AlumniID];
            if (repo) {
              repoCourseList.push(
                <table key={repo.AlumniID} className="table table-bordered">
                  <thead>
                    <tr>
                      <th>課程編號</th>
                      <th>課程名稱</th>
                      <th>授課教師</th>
                      <th>人數上限</th>
                      <th>教室</th>
                      <th>上課時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{repo.NewSubjectCode}</td>
                      <td>
                        { (repo.Syllabus) ? <a href={repo.Syllabus} target="_blank">{repo.CourseName}</a> : <span>{repo.CourseName}</span> }
                      </td>
                      <td dangerouslySetInnerHTML={{ __html: repo.TeacherURLName }}></td>
                      <td>{repo.Capacity}</td>
                      <td>{repo.Classroom}</td>
                      <td>{repo.CourseTimeInfo}</td>
                    </tr>
                  </tbody>
                </table>
              );
            }
          });
          self.setState((prevState, props) => {
            return {
              loading: false,
              status: data.status,
              allCourses: courses.allCourses,
              allColCourses: courses.allColCourses,
              repoCourseList: repoCourseList
            };
          });
        })
        .catch((err) => {
          (typeof err === 'function') ? err() : _gg.set_error_message('#mainMsg', null, '內部發生錯誤 002');
        });
      }
      // 其他期間
      else {
        self.setState((prevState, props) => {
          return {
            loading: false,
            status: data.status
          };
        });
      }
    })
    .catch((err) => {
      (typeof err === 'function') ? err() : _gg.set_error_message('#mainMsg', null, '內部發生錯誤 003');
    });
  }

  render() {
    if (this.state.loading) {
      return <div>載入中...</div>;
    } 
    else {      
      // 選課前, 選課中, 選課後尚未第一階段公告, 第一階段公告結束~第二階段尚未公告
      if (['beforeChoose', 'choose', 'afterChoose', 'afterAnnouncement'].includes(this.state.status)) {
        return <div>尚未公告</div>
      }
      // 第一階段公告中, 第二階段遞補中, 第二階段遞補結束
      else if (['announcement', 'increment', 'afterIncrement'].includes(this.state.status)) {
        if (this.state.repoCourseList.length) {
          return (
            <div>{this.state.repoCourseList}</div>
          );
        } else {
          return <div>目前無資料</div>;
        }
      }
      else {
        return <div>目前尚無資料</div>
      }
    }
  }
}


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
            <div style={{width: '95%', margin: '0 auto'}}>
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th colSpan="2" className="my-table-head1"><font color="blue">正取</font>名單</th>
                  </tr>
                  <tr>
                    <th style={{width:'100px'}}>序號</th>
                    <th>姓名</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    (this.state.admittedList.length) ? 
                      this.state.admittedList.map((item, idx) => {
                        return (
                          <tr key={idx}>
                            <td style={{borderRadius: 0}}>{item.SerialNumber}</td>
                            <td>{item.StudentName}</td>
                          </tr>
                        )
                      }) : 
                      <tr>
                        <td colSpan="2">目前無資料</td>
                      </tr>
                  }
                </tbody>
              </table>
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th colSpan="2" className="my-table-head2"><font color="red">備取</font>名單</th>
                  </tr>
                  <tr>
                    <th style={{width:'100px'}}>序號</th>
                    <th>姓名</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    (this.state.waitingList.length) ? 
                      this.state.waitingList.map((item, idx) => {
                        return (
                          <tr key={idx}>
                            <td style={{borderRadius: 0}}>{item.SerialNumber}</td>
                            <td>{item.StudentName}</td>
                          </tr>
                        )
                      }) : 
                      <tr>
                        <td colSpan="2">目前無資料</td>
                      </tr>
                  }
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      );
    }
  }
}


ReactDOM.render(
  <RepoList /> , document.getElementById('sa07')
);