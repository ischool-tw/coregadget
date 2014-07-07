$(document).ready(function () {
    $(window).resize(function () {
        $("#container-nav, #container-main").height($(window).height() - 50);
        console.log($(window).height() - 50);
    });
});
