// 教育理念
$(function() {
    LessonPlanManager.ControlConcept = function(target) {
        var _myInfo;
        var target = $(target);
        target.find('[data-action=cancel]').click(function() {
            showConcept(_myInfo);
        });
        target.find('[data-action=save]').click(function() {
            if ($(this).hasClass('disabled')) return;
            $(this).text('儲存中...').addClass('disabled');
            var tmp_req = target.find('form').serializeObject();
            LessonPlanManager.StartUp.profileSave({Request: { TeacherExt : tmp_req }} , setConcept);
        });

        var showConcept = function(myInfo) {
            _myInfo = myInfo || {};
            target.find('[name=Concept]').val(_myInfo.Concept);
            target.find('[name=Motto]').val(_myInfo.Motto);
            target.find('[name=Future]').val(_myInfo.Future);
        };
        var setConcept = function(req) {
            req = req || {};
            _myInfo.Concept = req.Concept;
            _myInfo.Motto = req.Motto;
            _myInfo.Future = req.Future;

            target.find('[data-action=save]').text('儲存變更').removeClass("disabled");
            $('#mainMsg').html('<div class="alert alert-success">\n  儲存成功！\n</div>');
            $('body').scrollTop(0);
            setTimeout("$('#mainMsg').html('')", 1500);
        };

        LessonPlanManager.StartUp.profileReady(showConcept);
    }('#concept');
});