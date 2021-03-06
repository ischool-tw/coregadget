$ ->
    bind_myinfo()
    bind_payment()

bind_myinfo = () ->
    gadget.getContract("emba.student").send {
        service: "default.GetMyInfo",
        body: "",
        result: (response, error, http) ->
            if response.Result?
                myInfo = response.Result

                $("#payment #payment-message").addClass "hide" if myInfo.Status is "在學" or myInfo.Status is "休學"

    }

# 更新繳費記錄畫面
bind_payment = () ->
    gadget.getContract("emba.student").send {
        service: "default.GetPaymentHistory",
        body: "",
        result: (response, error, http) ->
            items = []
            if response.Result?
                $(response.Result.PaymentHistory).each (index, item) ->
                    items.push """
                        <tr>
                            <td>#{item.SchoolYear}</td>
                            <td>#{if item.Semester is "0" then "夏季學期" else "第 #{item.Semester} 學期"}</td>
                            <td>已繳費</td>
                            <td>#{if item.ModifiedDate isnt "" then item.ModifiedDate.substr(0, 10) else ""}</td>
                        </tr>""" if item.IsPaied is "1"

            $("#payment #payment-detail tbody").html (if items.length is 0 then '<tr><td colspan="4">無資料</td></tr>' else items.join "")

    }