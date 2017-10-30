const contractForLog = gadget.getContract("emba.student");

class ReactApp extends React.Component {
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
      myInfo: {},
      schoolYear: null,
      semester: null,
      status: null,
      openingDate: {},
      allColCourses: {},
    };

    let self = this;
    this.getCourseDates()
    .then((openingDate) => {
      Promise.all([
        this.getMyInfo(),
        this.getAlumniCourse(openingDate.SchoolYear, openingDate.Semester)
      ])
      .then((subData) => {
        const myInfo = subData[0];
        const courses = subData[1];
        // console.dir(courses.allColCourses);

        self.setState((prevState, props) => {
          return {
            myInfo: myInfo,
            schoolYear: openingDate.SchoolYear,
            semester: openingDate.Semester,
            status: openingDate.Status,
            openingDate: openingDate,
            allColCourses: courses.allColCourses,
          };
        });
      })
      .catch((err) => {
        console.error(err);
        (typeof err === 'function') ? err() : _gg.set_error_message('#mainMsg', null, '內部發生錯誤 001');
      });
    })
    .catch((err) => {
      console.error(err);
      (typeof err === 'function') ? err() : _gg.set_error_message('#mainMsg', null, '內部發生錯誤 002');
    });
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
              resolve(response.CourseSelectionDate);
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

  getMyInfo() {
    return new Promise((resolve, reject) => {
      _gg.connection.send({
        service: "_.GetMyInfo",
        body: {},
        result: function(response, error, http) {
          if (error !== null) {
            reject(() => { _gg.set_error_message('#mainMsg', '_.GetMyInfo', error); });
          } else {
            if (response.Response && response.Response.StudentInfo) {
              resolve(response.Response.StudentInfo);
            } else {
              resolve({});
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
              resolve({ allColCourses: colData });
            } else {
              resolve({ allColCourses: {} });
            }
          }
        }
      });
    });
  }

  componentDidMount() {
  }

  render() {
    const { tabName } = this.props;

    switch (tabName) {
      case 'sa07':
        return <RepoList
          schoolYear={this.state.schoolYear}
          semester={this.state.semester}
          status={this.state.status}
          openingDate={this.state.openingDate}
          allColCourses={this.state.allColCourses}
        />
      case 'sa08':
        return <Payment
          myInfo={this.state.myInfo}
          schoolYear={this.state.schoolYear}
          semester={this.state.semester}
          status={this.state.status}
          openingDate={this.state.openingDate}
          allColCourses={this.state.allColCourses}
        />
    }
  }
}

ReactDOM.render(
  <ReactApp tabName="sa07"></ReactApp> , document.getElementById('sa07')
);
ReactDOM.render(
  <ReactApp tabName="sa08"></ReactApp> , document.getElementById('sa08')
);
