LessonPlanManager.Util = function() {
    //用來處理 DSA 回傳的資料：因為當 DSA 只回傳一筆時為單一物件，沒有資料時為 undefined, 多筆時為 array
    //所以透過此函數要全部轉換成 array
    var myHandleArray = function(obj) {
        var result ;
        //只回傳一筆時為單一物件，沒有資料時為 undefined, 多筆時為 array
        if (!$.isArray(obj)) {
            result = [];
            if (obj) {
                result.push(obj);
            }
        }
        else {
            result = obj ;
        }
        return result ;
    };
    //錯誤訊息
    var my_set_error_message = function(select_str, serviceName, error) {
        if (serviceName) {
            var tmp_msg = '<i class="icon-white icon-info-sign my-err-info"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(' + serviceName + ')';
            if (error !== null) {
                if (error.dsaError) {
                    if (error.dsaError.status === "504") {
                        switch (error.dsaError.message) {
                            case '501':
                                tmp_msg = '<strong>很抱歉，您無讀取資料權限！</strong>';
                                break;
                            default:
                                tmp_msg = '<strong>' + error.dsaError.message + '</strong>';
                        }
                    } else if (error.dsaError.message) {
                        tmp_msg = error.dsaError.message;
                    }
                } else if (error.loginError.message) {
                    tmp_msg = error.loginError.message;
                } else if (error.message) {
                    tmp_msg = error.message;
                }
                $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + tmp_msg + "\n</div>");
                $('.my-err-info').click(function(){alert('請拍下此圖，並與客服人員連絡，謝謝您。\n' + JSON.stringify(error, null, 2))});
            }
        } else {
            $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + error + "\n</div>");
        }
    };
    //#region 預覽
    myToPreview = function(jEle) {
        jEle.find('input:radio').each(function(){
                $(this).hide();
                if (!this.checked) {
                    $(this).parent('label').hide();
                }
            }).end()
            .find('input:checkbox').hide().each(function(){
                if (!this.checked) {
                    $(this).after('<span data-type="preview">' + $(this).val() + '</span>');
                }
            }).end()
            .find('input:text, textarea, select').hide().each(function(){
                $(this).after('<span data-type="preview">' + $(this).val() + '</span>');
            }).end()
            .find('input:file, input:submit, input:button').hide().end()
            .find('.btn').hide().end()
            .find('.my-trash').hide();
    };
    //#endregion

    myToPrint = function(jEle) {
        var content = $('<div>').append(jEle.html());
        content.find('input:file, input:submit, input:button, .btn, .my-trash, .my-sure, .my-print-remove').remove().end()
            .find('textarea').each(function(index, item){
                $(this).after('<span>' + jEle.find('textarea:eq(' + index + ')').val() + '</span>');
                $(this).remove();
            }).end()
            .find('input:text').each(function(index, item){
                $(this).after('<span>' + jEle.find('input:text:eq(' + index + ')').val() + '</span>');
                $(this).remove();
            }).end()
            .find('select').each(function(index, item){
                $(this).after('<span>' + jEle.find('select:eq(' + index + ') option:selected').text() + '</span>');
                $(this).remove();
            }).end()
            .find('a').each(function(){
                $(this).after('<span>' + $(this).html() + '</span>');
                $(this).remove();
            }).end()
            .find('input:radio').each(function(index, item){
                var that = $(this);
                jEle.find('input:radio:eq(' + index + ')').each(function(index, item){
                    if (!this.checked) {
                        that[index].parent('label').remove();
                    }
                })
            }).end()
            .find('input:checkbox').each(function(index, item){
                var that = $(this);
                jEle.find('input:checkbox:eq(' + index + '):checked').each(function(){
                    that.after('<span">' + $(this).val() + '</span>');
                })
                that.remove();
            }).end()
            .find('table').removeClass().addClass('table');

        content = content.html();

        content = '<!DOCTYPE html> \n' +
                '<html> \n' +
                '<head> \n' +
                '<title>print</title> \n' +
                '<link href="css/bootstrap.css" rel="stylesheet" /> \n' +
                '<link href="css/bootstrap-responsive.css" rel="stylesheet" /> \n' +
                '<link href="css/mybootstrap.css" rel="stylesheet" /> \n' +
                '<link href="css/base.css" rel="stylesheet" /> \n' +
                '<link href="css/default.css" rel="stylesheet" /> \n' +
                '</head> \n' +
                '<body onload="window.print();"> \n' +
                '<div style="width:880px;height:auto;padding:40px 20px" class="my-print-page"> \n' +
                content +
                '</div>\n  </body>\n</html>';
        var doc = window.open('about:blank', '_blank', '');
        doc.document.open();
        doc.document.write(content);
        doc.document.close();
        doc.focus();
    };

    return {
        handleArray : function(obj) {
            return myHandleArray(obj);
        },
        set_error_message : function(select_str, serviceName, error) {
            return my_set_error_message(select_str, serviceName, error)
        },
        toPreview : function(jEle) {
            return myToPreview(jEle);
        },
        toPrint : function(jEle) {
            return myToPrint(jEle);
        }
        //#endregion
    }
}();

(function($){
    //#region 上傳照片
    jQuery.fn.updatePhoto = function(img_obj, options) {
        var settings = $.extend({
            width      : 225,
            height     : 300,
            oncomplete : null
        }, options||{});
        this.addClass('hasUploader');
        this.click(function(evt){
            $(this).val('');
        });
        // TODO: 處理上傳圖片
        this.change(function(evt) {
            if (evt.target == undefined ||
            evt.target.files == undefined ||
            evt.target.files.length == 0) {
                alert("您的瀏覽器並未支援讀取檔案功能，請更新您的瀏覽器，謝謝!\n\n建議瀏覽器：Chrome 10+, IE 10+, Firefox 10+");
                return;
            }

            var file = evt.target.files[0];

            if (!(file.type == "image/png" || file.type == "image/jpeg" || file.type == "image/gif")) {
                return;
            }

            var reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    var image = new Image();
                    image.src = e.target.result;
                    image.onload = function () {
                        var maxWidth = settings.width, maxHeight = settings.height, imageHeight = image.height, imageWidth = image.width;

                        if (imageHeight > maxHeight) {
                            imageWidth *= maxHeight / imageHeight;
                            imageHeight = maxHeight;
                        }
                        if (imageWidth > maxWidth) {
                            imageHeight *= maxWidth / imageWidth;
                            imageWidth = maxWidth;
                        }

                        var canvas = document.createElement('canvas');
                        canvas.width = imageWidth;
                        canvas.height = imageHeight;

                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(this, 0, 0, imageWidth, imageHeight);

                        var finalFile = canvas.toDataURL("image/png");
                        var photo_base64 = finalFile.replace("data:image/png;base64,", "");
                        img_obj.attr('src', finalFile).attr("photo-base64", photo_base64);
                        if (typeof settings.oncomplete === "function") {
                            settings.oncomplete();
                        }
                    }
                };
            })(file);
            reader.readAsDataURL(file);
        });
    }
    //#endregion

    //#region 送出表單
    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
    //#endregion

    //ex: s.sort($.by('desc', 'last', $.by('asc', 'first')));
    //ex: s.sort($.by('asc', 'last'));
    $.by = function(model, name, minor) {
        return function (o, p) {
            var a, b;
            if (o && p && typeof o === 'object' && typeof p === 'object') {
                a = o[name];
                b = p[name];
                if (a === b) {
                    return typeof minor === 'function' ? minor(o, p) : 0;
                }
                if (typeof a === typeof b) {
                    if (parseInt(a, 10) && parseInt(b, 10)) {
                        a = parseInt(a, 10);
                        b = parseInt(b, 10);
                    }

                    if (model === 'desc') {
                        return a > b ? -1 : 1;
                    } else {
                        return a < b ? -1 : 1;
                    }
                }
                return typeof a < typeof b ? -1 : 1;
            } else {
                throw {
                    name: 'Error',
                    message: 'Expected an object when sorting by ' + name
                }
            }
        };
    };
})(jQuery);


//#region 驗證提示樣式設定
$.validator.setDefaults({
    debug: false, // 為 true 時不會 submit
    errorElement: "span", //錯誤時使用元素
    errorClass: "help-inline", //錯誤時使用樣式
    highlight: function(element) {
        // 將未通過驗證的表單元素設置高亮度
        $(element).closest('td').addClass("my-error");
    },
    unhighlight: function(element) {
        // 與 highlight 相反
        $(element).closest('td').removeClass("my-error");
    },
    errorPlacement: function (error, element) {
        // 錯誤標籤的顯示位置
        if (element.is(':radio') || element.is(':checkbox')) {
            error.appendTo(element.closest('td'));
        }
        else {
            error.insertAfter(element);
        }
    }
});
//#endregion