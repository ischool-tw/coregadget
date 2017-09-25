import React, {Component} from 'react';
import classNames from 'classnames';
import { contract } from '../utility';

export default class CourseSemesterScore extends Component {
    constructor(props) {
        super(props);
      
        this.state = {
            list: []
        };
        this.getSemester = this.getSemester.bind(this);
        this.getCourseSemesterScore = this.getCourseSemesterScore.bind(this);
    };

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <table className="table table-bordered my-table">
                        <thead>
                            <tr>
                                <th colSpan="10">
                                    <span><i className="glyphicon glyphicon-tag"></i> 歷年修課成績</span>
                                </th>
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
                                <th>成績</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (this.state.list.length) ? this.state.list : <tr><td colSpan="10">目前無資料</td></tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

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
                            console.log('default.GetSemester 查無學年期');
                            reject();
                        }
                    } else {
                        console.log(error);
                        reject();
                    }
                }
            });
        });
        
    };

    // 歷年修課成績
    getCourseSemesterScore(schoolYear, semester) {
        return new Promise((resolve, reject) => {
            contract.send({
                service: "default.GetCourseSemesterScore",
                body: {
                    Request: {
                        SchoolYear: schoolYear,
                        Semester: semester
                    }
                },
                result: (response, error, http) => {
                    if (!error) {
                        if (response.Result) {
                            resolve([].concat(response.Result.Score || []));
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

    componentWillMount() {
        let self = this;
        this.getSemester().then((data) => {
            // console.log(data);
            this.getCourseSemesterScore(data.schoolYear, data.semester).then((lists) => {
                // console.log(lists);
                let items = [];
                if (lists.length) {
                    lists.forEach((item, idx) => {
                        items.push(
                            <tr key={idx}>
                                <td>{item.SerialNo}</td>
                                <td>{item.SchoolYear}</td>
                                <td>{(item.Semester ? (item.Semester === "0" ? "夏季" : "第" + item.Semester) + "學期" : "")}</td>
                                <td>{item.NewSubjectCode}</td>
                                <td>{item.SubjectName}</td>
                                <td>{item.ClassName}</td>
                                <td>{item.CourseType}</td>
                                <td>{(item.IsRequired === "t" ? "必修" : "選修")}</td>
                                <td>{((item.IsPass === "t" && item.ScoreConfirmed === "t") ? item.Credit : "(" + item.Credit + ")")}</td>
                                <td>{item.IsCancel == 't' ? "停修" : item.Score}</td>
                            </tr>
                        );
                    });
                }
                self.setState((prevState, props) => {
                    return { list: items };
                });
            })
            .catch((err) => {});
        })
        .catch((err) => {});
    };

}