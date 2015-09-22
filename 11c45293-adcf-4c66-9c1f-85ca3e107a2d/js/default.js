$(document).ready(function () {
  var connection_teacher = gadget.getContract('gadget.logger');
  connection_teacher.ready(function(){
    connection_teacher.send({
      service: '_.AddLog',
      body: {
        GadgetLog: {
          Gadget: '11c45293-adcf-4c66-9c1f-85ca3e107a2d',
          ActionType: "點擊率",
          Action: "點擊導師APP",
          TargetCategory: "teacher",
          Description: ''
        }
      },
      result: function (response, error, http) {
      }
    });
  });
});