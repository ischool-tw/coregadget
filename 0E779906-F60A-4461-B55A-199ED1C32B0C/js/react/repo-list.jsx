class RepoList extends React.Component {
  constructor(props) {
    super(props);
    /*
    status 狀態說明
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
      repoCourseList: []
    };
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

  componentWillUpdate(prevProps, prevState) {
    if (prevProps !== this.props) {
      const { schoolYear, semester, status, allColCourses } = prevProps;

      let self = this;
      // console.log(data);

      // 第一階段公告中, 第二階段遞補中
      if (['announcement', 'afterAnnouncement', 'increment'].includes(status)) {
        self.getAlumniSelectCourse(schoolYear, semester)
        .then((electives) => {
          // console.dir(allColCourses);
          // console.dir(electives);

          let repoCourseList = [];

          electives.forEach((elective) => {
            let repo = allColCourses['c' + elective.AlumniID];
            if (repo) {
              repoCourseList.push(
                <tbody key={repo.AlumniID}>
                  <tr>
                    <td>{repo.NewSubjectCode}</td>
                    <td>
                      { (repo.Syllabus) ? <a href={repo.Syllabus} target="_blank">{repo.CourseName}</a> : <span>{repo.CourseName}</span> }
                    </td>
                    <td dangerouslySetInnerHTML={{ __html: repo.TeacherURLName }}></td>
                    <td>{repo.MumberOfElectives}</td>
                    <td>{repo.Classroom}</td>
                    <td>{repo.CourseTimeInfo}</td>
                  </tr>
                  <AdmissionList alumniID={repo.AlumniID}></AdmissionList>
                </tbody>
              );
            }
          });
          self.setState((prevState, props) => {
            return {
              loading: false,
              repoCourseList: repoCourseList
            };
          });
        })
        .catch((err) => {
          // console.error(err);
          (typeof err === 'function') ? err() : _gg.set_error_message('#mainMsg', null, '內部發生錯誤 001');
        });
      } 
      // 第二階段遞補結束
      else if (status == 'afterIncrement') {
        // this.getAlumniPractiseCourse(schoolYear, semester)
        this.getAlumniPractiseCourse(106, 1)
        .then((practises) => {
          let repoCourseList = [];

          practises.forEach((practise) => {
            let repo = allColCourses['c' + practise.AlumniID];
            if (repo) {
              repoCourseList.push(
                <tbody key={repo.AlumniID}>
                  <tr>
                    <td>{repo.NewSubjectCode}</td>
                    <td>
                      { (repo.Syllabus) ? <a href={repo.Syllabus} target="_blank">{repo.CourseName}</a> : <span>{repo.CourseName}</span> }
                    </td>
                    <td dangerouslySetInnerHTML={{ __html: repo.TeacherURLName }}></td>
                    <td>{repo.MumberOfElectives}</td>
                    <td>{repo.Classroom}</td>
                    <td>{repo.CourseTimeInfo}</td>
                  </tr>
                </tbody>
              );
            }
          });
          self.setState((prevState, props) => {
            return {
              loading: false,
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
            repoCourseList: [],
          };
        });
      }
    }
  }

  render() {
    const { schoolYear, semester, status, allColCourses } = this.props;

    if (this.state.loading) {
      return <div>載入中...</div>;
    } 
    else {      
      // 選課前, 選課中, 選課後尚未第一階段公告
      if (['beforeChoose', 'choose', 'afterChoose'].includes(status)) {
        return <div>尚未公告</div>
      }
      // 第一階段公告中, 第一階段公告結束~第二階段尚未公告, 第二階段遞補中, 第二階段遞補結束
      else if (['announcement', 'afterAnnouncement', 'increment', 'afterIncrement'].includes(status)) {
        if (this.state.repoCourseList.length) {
          return (
            <table className="table table-bordered table-striped">
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
              {this.state.repoCourseList}
            </table>
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
