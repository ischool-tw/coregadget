/*

	此 Singleton 物件負責解析校系資訊，並提供存取。
*/
var ischool = ischool || {};
ischool.chooseWish = ischool.chooseWish || {};

ischool.chooseWish.Schools = function () {
    var ary = [];
    var dic = {};
    var dicDeptNames = {};
    var aryDeptNames = [];
    var filterAryDeptNames = {};

    var formatDeptName = function (dept) {
        if (!dept) return '';
        return (dept.SchoolDeptCode + " " + dept.School + " - " + dept.Dept + "（" + dept.Group + "）");
    };

    return {
        parse: function (rawData) {
            ary = rawData;
            dic = {};
            dicDeptNames = {};
            aryDeptNames = [];
            filterAryDeptNames = {};
            $(rawData).each(function (index, dept) {
                dic[dept.SchoolDeptCode] = dept;
                var deptFullName = formatDeptName(dept);
                dicDeptNames[deptFullName] = dept;
                aryDeptNames.push(deptFullName);
            });
        },

        getSchools: function () {

        },

        getAllDepts: function () {
            return ary;
        },

        getDeptsBySchoolCode: function (deptCode) {
            return dic[deptCode];
        },

        getDeptByCode: function (deptCode) {
            return dic[deptCode];
        },

        getFullDeptNameByCode: function (deptCode) {
            var dept = dic[deptCode];
            return formatDeptName(dept);
        },

        getDeptByFullName: function (deptFullName, filterGroup) {
            if (filterGroup) {
                //比對filterGroup要用filterGroup(學生Group) contains 校系Group的方式，四技的資料中會有同校系允許多個組同時選的狀況，學生會被允許選則多個Group
                if (dicDeptNames[deptFullName] && filterGroup.indexOf(dicDeptNames[deptFullName].Group) !== -1)
                    return dicDeptNames[deptFullName];
            }
            else
                return dicDeptNames[deptFullName];
        },

        getAllDeptNames: function (filterGroup) {
            if (filterGroup) {
                if (!filterAryDeptNames[filterGroup]) {
                    filterAryDeptNames[filterGroup] = [];
                    $(ary).each(function (index, dept) {
                        //比對filterGroup要用filterGroup(學生Group) contains 校系Group的方式，四技的資料中會有同校系允許多個組同時選的狀況，學生會被允許選則多個Group
                        if (filterGroup.indexOf(dept.Group) !== -1) {
                            var deptFullName = formatDeptName(dept);
                            filterAryDeptNames[filterGroup].push(deptFullName);
                        }
                    });
                }

                return filterAryDeptNames[filterGroup];
            }
            else
                return aryDeptNames;
        }

    }

}();