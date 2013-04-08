$(function() {
    LessonPlanManager.ControlPFE = function(target) {
        LessonPlanManager.StartUp.getMyTeacherID(function(TeacherID) {
            alert(TeacherID);
        });
    }('#pfe');
});