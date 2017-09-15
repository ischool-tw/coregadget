import React, {Component} from 'react';
import classNames from 'classnames';
import { contract } from '../utility';

export default class Academic extends Component {
    constructor(props) {
        super(props);
      
        this.state = {
            currentData: []
        };

        this.getSemester = this.getSemester.bind(this);
        this.getCurrentCourse = this.getCurrentCourse.bind(this);
    }
    
    render() {
        return (
            <div className="row">
                <div className="col-md-12" id="current-course">
                    <table className="table table-bordered my-table">
                        <thead>
                            <tr>
                                <th colSpan="11"><span><i className="glyphicon glyphicon-tag"></i> 本學期修課</span></th>
                            </tr>
                            <tr>
                                <th>流水號</th>
                                <th>學年度</th>
                                <th>學期</th>
                                <th>課程識別碼</th>
                                <th>課程名稱</th>
                                <th>班次</th>
                                <th>類別</th>
                                <th>必選修</th>
                                <th>學分數</th>
                                <th>授課教師</th>
                                <th>成績</th>
                            </tr>
                        </thead>
                        <tbody>{this.state.currentData}</tbody>
                    </table>
                </div>
            </div>
        );
    }

    getSemester() {
        return new Promise((resolve, reject) => {
            contract.send({
                service: "default.GetSemester",
                body: {},
                result: (response, error, http) => {
                    if (!error) {
                        if (response.Result) {
                            let schoolYear = response.Result.SystemConfig.DefaultSchoolYear;
                            let semester = response.Result.SystemConfig.DefaultSemester;
                            resolve({schoolYear: schoolYear, semester: semester})
                        } else {
                            reject(() => console.log('response.Result is null'));
                        }
                    } else {
                        reject(() => console.log(error));
                    }
                }
            });
        });
        
    };

    // 取得當學期修課課程
    getCurrentCourse(schoolYear, semester) {
        return new Promise((resolve, reject) => {
            contract.send({
                service: "default.GetCurrentCourse",
                body: {
                    Request: {
                        SchoolYear: schoolYear,
                        Semester: semester
                    }
                },
                result: (response, error, http) => {
                    if (!error) {
                        if (response.Result) {
                            resolve([].concat(response.Result.Course || []));
                        } else {
                            reject(() => console.log('response.Result is null'));
                        }
                    } else {
                        reject(() => console.log(error));
                    }
                }
            });
        });
    }

    componentWillMount() {
        let self = this;
        this.getSemester().then((data) => {
            // console.log(data);
            this.getCurrentCourse(data.schoolYear, data.semester).then((lists) => {
                // console.log(lists);
                let items = [];
                if (lists.length) {
                    lists.forEach((item, idx) => {
                        items.push(
                            <tr key={idx}>
                                <td>{item.SerialNo}</td>
                                <td>{item.SchoolYear}</td>
                                <td>{(item.Semester === "0" ? "夏季" : `第${item.Semester}學期`)}</td>
                                <td>{item.NewSubjectCode}</td>
                                <td>{item.SubjectName}</td>
                                <td>{item.ClassName}</td>
                                <td>{item.CourseType}</td>
                                <td>{(item.IsRequired=="t") ? "必修" : "選修"}</td>
                                <td>{item.Credit}</td>
                                <td>{item.TeacherName}</td>
                                <td>{item.IsCancel == 't' ? "停修" : item.Score}</td>
                            </tr>
                        );
                    });
                }
                self.setState((prevState, props) => {
                    return { currentData: items };
                });
            })
        });
    };
}