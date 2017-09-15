import React, {Component} from 'react';
import classNames from 'classnames';
import { contract } from '../utility';

export default class GraduationRequirement extends Component {
    constructor(props) {
        super(props);
      
        this.state = {
            info: '',
            list: []
        };

        this.getRaduationRequirement = this.getRaduationRequirement.bind(this);
        this.getGraduationSubjectList = this.getGraduationSubjectList.bind(this);
        this.getSubjectSemesterScore = this.getSubjectSemesterScore.bind(this);
    };

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <table className="table table-bordered my-table">
                        <thead>
                            <tr>
                                <th colSpan="6">
                                    <div>
                                        <i className="glyphicon glyphicon-tag"></i>
                                        <span id="credit-info-title">
                                            {this.state.info}
                                        </span>
                                    </div>
                                </th>
                            </tr>
                            <tr>
                                <th>課程識別碼</th>
                                <th>課號</th>
                                <th>課程名稱</th>
                                <th>學分數</th>
                                <th>群組別</th>
                                <th>備註</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.list}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // 取得畢業學分表
    getRaduationRequirement() {
        contract.send({
            service: "default.GetGraduationRequirement",
            body: {},
            result: (response, error, http) => {
                if (!error) {
                    if (response.Result) {
                        this.setState((prevState, props) => {
                            return { 
                                info: `
                                    畢業應修科目及學分表：系訂必修： ${response.Result.DepartmentCredit || ''} 
                                    學分、選修： ${response.Result.ElectiveCredit || ''} 
                                    學分、應修最低畢業學分： ${response.Result.RequiredCredit || ''}
                                `
                            };
                        });
                    }
                }
            }
        });
    };
  
    // 取得畢業應修科目
    getGraduationSubjectList() {
        return new Promise((resolve, reject) => {
            contract.send({
                service: "default.GetGraduationSubjectList",
                body: {},
                result: (response, error, http) => {
                    if (!error) {
                        if (response.Result) {
                            resolve([].concat(response.Result.Subject || []));
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

    // 取得所修課程成績
    getSubjectSemesterScore() {
        return new Promise((resolve, reject) => {
            contract.send({
                service: "default.GetSubjectSemesterScore",
                body: {},
                result: (response, error, http) => {
                    if (!error) {
                        if (response.Result) {
                            let scoreTexts = {};

                            ([].concat(response.Result.Score || [])).forEach((item, idx) => {
                                if (item.IsPass === 't' && (item.ScoreConfirmed === "" || item.ScoreConfirmed === "t")) {
                                    scoreTexts['subjectId_' + item.SubjectID] = '已取得學分';
                                } else {
                                    scoreTexts['subjectId_' + item.SubjectID] = '';                                    
                                }
                            });
                            resolve(scoreTexts);
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
        // 取得畢業學分表
        this.getRaduationRequirement();

        Promise.all([this.getGraduationSubjectList(), this.getSubjectSemesterScore()]).then((data) => {            
            let items = [];
            if (data[0].length) {
                data[0].forEach((item, idx) => {
                    items.push(
                        <tr key={idx} className="info">
                            <td>{item.NewSubjectCode}</td>
                            <td>{item.SubjectCode}</td>
                            <td>
                                {item.ChineseName}<br />{item.EnglishName}
                            </td>
                            <td>{item.Credit}</td>
                            <td>{item.GroupName}</td>
                            <td>
                                {data[1]['subjectId_' + item.SubjectID]}
                            </td>
                        </tr>
                    )
                });
            }
            this.setState((prevState, props) => {
                return { list: items };
            });

        },(err) => {
            console.log(err);
        });
    }
}