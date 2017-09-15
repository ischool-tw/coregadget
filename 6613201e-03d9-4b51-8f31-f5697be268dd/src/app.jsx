import React from 'react';
import ReactDOM from 'react-dom';
import Academic5 from './components/academic';
import CourseSemesterScore from './components/course_semester_score';
import GraduationRequirement from './components/graduation_requirement';
import './assets/base.css';
import './assets/style.css';
import { contract } from './utility';

ReactDOM.render(
    <div className="page-container">
        {/* <div className="header">
            <ul className="breadcrumb">
                <li><a href="http://web.ischool.com.tw/main.htm#menu" target="_blank">回myEMBA首頁</a>
            </ul>
        </div> */}
        <div className="header-space"></div>
        <div className="content">
            <div className="tabbable">
                <div className="tab-content">
                    <div className="tab-pane active">
                        <Academic5></Academic5>
                        <CourseSemesterScore></CourseSemesterScore>
                        <GraduationRequirement></GraduationRequirement>
                        <div className="row">
                            <div className="col-md-12">
                                <table className="table table-bordered my-table">
                                    <thead>
                                        <tr>
                                            <th colSpan="4"><span><i className="glyphicon glyphicon-tag"></i> 成績說明</span></th>
                                        </tr>
                                        <tr>
                                            <th></th>
                                            <th>成績</th>
                                            <th>中文說明</th>
                                            <th>英文說明</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td rowSpan="11">等第制</td>
                                            <td>A+</td>
                                            <td>所有目標皆達成，且超越期望</td>
                                            <td>All goals achieved beyond expectation</td>
                                        </tr>
                                        <tr>
                                            <td>A</td>
                                            <td>所有目標皆達成</td>
                                            <td>All goals achieved</td>
                                        </tr>
                                        <tr>
                                            <td>A-</td>
                                            <td>所有目標皆達成，但需一些精進</td>
                                            <td>All goals achieved, but need some polish</td>
                                        </tr>
                                        <tr>
                                            <td>B+</td>
                                            <td>達成部分目標，且品質佳</td>
                                            <td>Some goals well achieved</td>
                                        </tr>
                                        <tr>
                                            <td>B</td>
                                            <td>達成部分目標，但品質普通</td>
                                            <td>Some goals adequately achieved</td>
                                        </tr>
                                        <tr>
                                            <td>B-(研究生及格標準)</td>
                                            <td>達成部分目標，但有些缺失</td>
                                            <td>Some goals achieved with minor flaws</td>
                                        </tr>
                                        <tr>
                                            <td>C+</td>
                                            <td>達成最低目標</td>
                                            <td>Minimum goals achieved</td>
                                        </tr>
                                        <tr>
                                            <td>C</td>
                                            <td>達成最低目標，但有些缺失</td>
                                            <td>Minimum goals achieved with minor flaws</td>
                                        </tr>
                                        <tr>
                                            <td>C-</td>
                                            <td>達成最低目標，但有重大缺失</td>
                                            <td>Minimum goals achieved with major flaws</td>
                                        </tr>
                                        <tr>
                                            <td>F</td>
                                            <td>未達成最低目標</td>
                                            <td>Minimum goals not achieved</td>
                                        </tr>
                                        <tr>
                                            <td>X</td>
                                            <td>因故不核予成績</td>
                                            <td>Not graded due to unexcused absences or other reasons</td>
                                        </tr>
                                        <tr>
                                            <td rowSpan="2">ＰＮ制</td>
                                            <td>P</td>
                                            <td>通過</td>
                                            <td>Pass</td>
                                        </tr>
                                        <tr>
                                            <td>N</td>
                                            <td>不通過</td>
                                            <td>Fail</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>,
    document.getElementById('root')
);