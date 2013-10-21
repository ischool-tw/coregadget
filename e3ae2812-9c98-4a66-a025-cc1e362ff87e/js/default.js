var GroupManager = GroupManager || {};
GroupManager.connection_parent = gadget.getContract('cloud.parent');
GroupManager.children = [];

$(document).ready(function () {
    $('[js="panel_children"]').each(function(index, target){
        target = $(target);

        var getChildren = function(sid) {
            GroupManager.connection_parent.send({
                service: "beta.GetMyChildren",
                body: {},
                result: function (response, error, http) {
                    if (error !== null) {
                        GroupManager.Util.msg($('#mainMsg'), 'GetMyChildren', error);
                    } else {
                        if (response.Student) {
                            var children = GroupManager.Util.handle_array(response.Student);
                            GroupManager.children = children;
                            $(children).each(function(index, child){
                                GroupManager.children['s'+child.StudentId] = child;
                            });
                        }
                        setChildren(children);
                    }
                }
            });
        };

        var setChildren = function(children) {
            var items = [];
            $(children).each(function(index, child){
                items.push('<li sid="' + child.StudentId + '">' + (child.StudentName || '未設定') + '</li>');
            });

            target.find('ul').html(items.join(''))
                .find('li:first').trigger('click');
        };

        target.on('click', 'li', function() {
            target.find('[js="child_name"]').html($(this).html());
            var sid = $(this).attr('sid');
            $('[js="panel_group_list"]').trigger('changeChild', GroupManager.children['s'+sid]);
        });

        target.on('hover', function(e) {
            if (e.type == "mouseenter") {
                target.find('.my-childname').height('auto');
            } else { // mouseleave
                target.find('.my-childname').height(0);
            }
        });

        getChildren();
    });


    $('[js="panel_group_list"]').each(function(index, target){
        target = $(target);
        var currChild;

        var clearList = function() {
            target.html('');
        };

        var getGroup = function() {
            if (!currChild.groups) {
                GroupManager.connection_parent.send({
                    service: "beta.GetChildGroup",
                    body: {
                        StudentId: currChild.StudentId
                    },
                    result: function (response, error, http) {
                        if (error !== null) {
                            GroupManager.Util.msg($('#mainMsg'), 'GetChildGroup', error);
                        } else {
                            if (response.Group) {
                                var groups = GroupManager.Util.handle_array(response.Group);
                                currChild.groups = groups;
                            }
                            setGroup(groups);
                        }
                    }
                });
            } else {
                setGroup(currChild.groups);
            }
        };

        var setGroup = function(groups) {
            var ret = [];
            $(groups).each(function(index, group) {
                ret.push('<div class="my-group"><div>' + group.GroupName + '</div></div>');
            });
            var items = ret.join('');
            if (items) {
                target.html(items);
            } else {
                target.html('<p>目前無資料</p>');
            }
        };

        target.on('changeChild',function(e, child) {
            currChild = child;
            clearList();
            getGroup();
        });
    });
});
