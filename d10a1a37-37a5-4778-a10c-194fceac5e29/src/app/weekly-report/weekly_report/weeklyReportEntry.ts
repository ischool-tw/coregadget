export class WeeklyReportEntry{

    constructor() {

    }
    CourseID:String = "";
    CourseName:String="";
    BeginDate:string="";
    EndDate:string="";
    GeneralComment:String="";

    public clear()
    {
        this.CourseID = "";
        this.CourseName = "";
        this.BeginDate = "";
        this.EndDate = "";
        this.GeneralComment = "";
    }

}