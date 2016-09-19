var pagerState = pagerState || {};

$.fn.pager = function(clas, options) {
    var settings = {
        navId: 'nav',
        navClass: 'nav',
        navAttach: 'append',
        highlightClass: 'active',
        prevText: 'Prev',
        nextText: 'Next',
        linkText: null,
        linkWrap: null,
        height: null,
        pagesize: 10
    }
    if(options) $.extend(settings, options);

    return this.each( function () {
        var me = $(this);
        var size;
        var i = 0;
        var navid = '#'+settings.navId;
        var _length;
        var _maxpage = 10;

        function init () {
            _length = $(clas, me).not(navid).size();
            size = Math.ceil($(clas, me).not(navid).size() / settings.pagesize);

            if(settings.height == null) {
                settings.height = getHighest();
            }
            if(size > 1) {
                makeNav();
                show();
                highlight();
            }
            sizePanel();
            if(settings.linkWrap != null) {
                linkWrap();
            }
        }
        function makeNav () {
            var str = '<div id="'+settings.navId+'" class="pagination pagination-centered '+settings.navClass+'">';
            str += '<ul>';
            str += '<li class="disabled" pager-data="li-prev"><a href="#" rel="prev">'+settings.prevText+'</a></li>';
            for(var i = 0; i < size; i++) {
                var j = i+1;
                var tmp_class = (i >= _maxpage) ? ' style="display:none"' : '';
                str += '<li' +tmp_class+ '><a href="#" rel="'+j+'">';
                str += (settings.linkText == null) ? j : settings.linkText[j-1];
                str += '</a></li>';
            }
            str += '<li pager-data="li-next"><a href="#" rel="next">'+settings.nextText+'</a></li>';
            str += '</ul>';
            str += '</div>';
            switch (settings.navAttach) {
                case 'before':
                    $(me).before(str);
                    break;
                case 'after':
                    $(me).after(str);
                    break;
                case 'prepend':
                    $(me).prepend(str);
                    break;
                default:
                    $(me).append(str);
                    break;
            }
        }
        function show () {
            $(me).find(clas).not(navid).hide();

            var w = i * settings.pagesize;
            var a = w + settings.pagesize;
            if (a > _length) {
                a = _length;
            }
            var show = $(me).find(clas).not(navid).slice(w, a);
            $(show).show();
        }
        function highlight () {
            $(me).find(navid).find('li').removeClass(settings.highlightClass);
            var show = $(me).find(navid).find('li').get(i+1);
            $(show).addClass(settings.highlightClass);
        }

        function sizePanel () {
            if($.browser.msie) {
                $(me).find(clas).not(navid).css( {
                    height: settings.height
                });
            } else {
                $(me).find(clas).not(navid).css( {
                    minHeight: settings.height
                });
            }
        }
        function getHighest () {
            var highest = 0;
            $(me).find(clas).not(navid).each(function () {

                if(this.offsetHeight > highest) {
                    highest = this.offsetHeight;
                }
            });
            highest = highest + "px";
            return highest;
        }
        function getNavHeight () {
            var nav = $(navid).get(0);
            return nav.offsetHeight;
        }
        function linkWrap () {
            $(me).find(navid).find("a").wrap(settings.linkWrap);
        }
        function dynamicPage() {
            var tmp_half = Math.ceil(_maxpage/2);
            var tmp_obj = $(me).find(navid).find('li').not('[pager-data=li-next],[pager-data=li-prev]');
            tmp_obj.css('display','none');
            var s = i - tmp_half;
            var e = i + tmp_half;
            if (s < 0) {
                s = 0;
            }
            if (i < tmp_half) {
                e = _maxpage;
            }
            if (e > size) {
                e = size;
            }
            var show = tmp_obj.slice(s, e);
            $(show).css('display','inline');
        }
        init();
        $(this).find(navid).find("a").click(function () {

            if($(this).attr('rel') == 'next') {
                if(i + 1 < size) {
                    i = i+1;
                }
            } else if($(this).attr('rel') == 'prev') {
                if(i > 0) {
                    i = i-1;
                }
            } else {
                var j = $(this).attr('rel');
                i = j-1;
            }

            var tmp_next = $(navid).find('[rel=next]').parent();
            var tmp_prev = $(navid).find('[rel=prev]').parent();
            if ((i+1) === size) {
                tmp_next.addClass('disabled');
            } else {
                tmp_next.removeClass('disabled');
            }
            if (i === 0) {
                tmp_prev.addClass('disabled');
            } else {
                tmp_prev.removeClass('disabled');
            }

            pagerState[settings.navId] = (i + 1);

            show();
            dynamicPage();
            highlight();
            return false;
        });
    });
}