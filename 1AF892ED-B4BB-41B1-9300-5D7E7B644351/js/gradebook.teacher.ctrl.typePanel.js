gradebookModule.controller('typePanelCtrl', function ($scope, $timeout, $translate) {
    
    $(function () {
        $("#affixPanel").affix({
            offset: {
                top: 100
                , bottom: function () {
                    return (this.bottom = $('.footer').outerHeight(true))
                }
            }
        })
    });
    
    $scope.changeSelectMode = function (mode) {
        $scope.current.SelectMode = mode;
        $timeout(function () {
            $('.pg-seatno-textbox:visible').select().focus();
        }, 1);
        
        $scope.socket.emit('commit', {
            name: 'group.config',
            body: {
                GroupInfo: window.groupInfo,
                SelectMode: $scope.current.SelectMode
            }
        }, function (data) {
            if (data.status !== "success") alert(JSON.stringify(data));
        });
    }
    
    $scope.submitStudentNo = function (event) {
        if (event && (event.keyCode !== 13 || $scope.isMobile)) return;
        //if (event.keyCode !== 13) return; // 13是enter按鈕的代碼，return是跳出
        if (!$scope.current.Student) return;
        $('.pg-grade-textbox:visible').focus();
        $timeout(function () {
            $('.pg-grade-textbox:visible').select();
        }, 1);
    }
    
    $scope.typeStudentNo = function () {
        var currentIndex = $scope.current.Student ? $scope.current.Student.index : 0;
        
        var nextStudent = null;
        var nextStudent2 = null;
        angular.forEach($scope.studentList, function (item, index) {
            if (item.SeatNo == $scope.current.SelectSeatNo) {
                if (index > currentIndex) {
                    if (nextStudent2 == null)
                        nextStudent2 = item;
                }
                else {
                    if (nextStudent == null)
                        nextStudent = item;
                }
            }
        });
        $scope.setCurrent(nextStudent2 || nextStudent, $scope.current.Exam, false, false);
        $('.pg-seatno-textbox:visible').focus();
    }
    
    $scope.goPrev = function () {
        var currentIndex = $scope.current.Student ? $scope.current.Student.index : 0;
        $scope.setCurrent(
            (currentIndex == 0) ?
                    $scope.studentList[$scope.studentList.length - 1] :
                    $scope.studentList[currentIndex - 1]
                , $scope.current.Exam
                , true
                , true);
        $('.pg-grade-textbox:visible').focus();
        $timeout(function () {
            $('.pg-grade-textbox:visible').select();
        }, 1);
    }
    
    $scope.goNext = function () {
        var currentIndex = $scope.current.Student ? $scope.current.Student.index : 0;
        $scope.setCurrent(
            (currentIndex == $scope.studentList.length - 1) ?
                    $scope.studentList[0] :
                    $scope.studentList[currentIndex + 1]
                , $scope.current.Exam
                , true
                , true);
        $('.pg-grade-textbox:visible').focus();
        $timeout(function () {
            $('.pg-grade-textbox:visible').select();
        }, 1);
    }
    
    $scope.enterGrade = function (event) {
        if (event && (event.keyCode !== 13 || $scope.isMobile)) return;
        var flag = false;
        if ($scope.current.Exam.Type == 'Number') {
            var temp = Number($scope.current.Value);
            if (!isNaN(temp) 
                && (!$scope.current.Exam.Range || (!$scope.current.Exam.Range.Max && $scope.current.Exam.Range.Max !== 0) || temp <= $scope.current.Exam.Range.Max) 
                && (!$scope.current.Exam.Range || (!$scope.current.Exam.Range.Min && $scope.current.Exam.Range.Min !== 0) || temp >= $scope.current.Exam.Range.Min))
                flag = true;
            if (flag) {
                if ($scope.current.Value != "")
                    $scope.current.Value = temp;
                else {
                    $scope.current.Value = null;
                }
            }
        }
        else {
            flag = true;
        }
        if (flag) {
            $scope.saveGrade();
        }
    }
    
    $scope.selectValue = function (val) {
        $scope.current.Value = val;
        $scope.saveGrade();
    }
    
    $scope.saveGrade = function (matchNext) {
        
        $scope.socket.emit('commit', {
            name: 'score',
            body: {
                Application: window.groupInfo.application,
                Groupid: window.groupInfo.groupId,
                ExamID: $scope.current.Exam._id,
                StudentID: $scope.current.Student.StudentId,
                UUID: $scope.current.Student.UUID,
                Value: $scope.current.Value
            }
        }, function (data) {
            if (data.status !== "success") alert(JSON.stringify(data));
            var nextStudent = $scope.studentList.length > ($scope.current.Student.index + 1) ?
                $scope.studentList[$scope.current.Student.index + 1] :
                $scope.studentList[0];
            $scope.setCurrent(nextStudent, $scope.current.Exam, true, false);
            
            if ($scope.current.SelectMode != 'Seq.')
                $('.pg-seatno-textbox:visible').select().focus();
            else {
                $('.pg-grade-textbox:visible').select().focus();
            }
            $timeout(function () {
                if ($scope.current.SelectMode != 'Seq.')
                    $('.pg-seatno-textbox:visible').select();
                else {
                    $('.pg-grade-textbox:visible').select();
                }
            }, 1);
        });
    }
})
.provider('$affix', function () {
    
    var defaults = this.defaults = {
        offsetTop: 'auto'
    };
    
    this.$get = function ($window, debounce, dimensions) {
        
        var bodyEl = angular.element($window.document.body);
        var windowEl = angular.element($window);
        
        function AffixFactory(element, config) {
            
            var $affix = {};
            
            // Common vars
            var options = angular.extend({}, defaults, config);
            var targetEl = options.target;
            
            // Initial private vars
            var reset = 'affix affix-top affix-bottom',
                initialAffixTop = 0,
                initialOffsetTop = 0,
                offsetTop = 0,
                offsetBottom = 0,
                affixed = null,
                unpin = null;
            
            var parent = element.parent();
            // Options: custom parent
            if (options.offsetParent) {
                if (options.offsetParent.match(/^\d+$/)) {
                    for (var i = 0; i < (options.offsetParent * 1) - 1; i++) {
                        parent = parent.parent();
                    }
                }
                else {
                    parent = angular.element(options.offsetParent);
                }
            }
            
            $affix.init = function () {
                
                $affix.$parseOffsets();
                initialOffsetTop = dimensions.offset(element[0]).top + initialAffixTop;
                
                // Bind events
                targetEl.on('scroll', $affix.checkPosition);
                targetEl.on('click', $affix.checkPositionWithEventLoop);
                windowEl.on('resize', $affix.$debouncedOnResize);
                
                // Both of these checkPosition() calls are necessary for the case where
                // the user hits refresh after scrolling to the bottom of the page.
                $affix.checkPosition();
                $affix.checkPositionWithEventLoop();

            };
            
            $affix.destroy = function () {
                
                // Unbind events
                targetEl.off('scroll', $affix.checkPosition);
                targetEl.off('click', $affix.checkPositionWithEventLoop);
                windowEl.off('resize', $affix.$debouncedOnResize);

            };
            
            $affix.checkPositionWithEventLoop = function () {
                
                setTimeout($affix.checkPosition, 1);

            };
            
            $affix.checkPosition = function () {
                // if (!this.$element.is(':visible')) return
                
                var scrollTop = getScrollTop();
                var position = dimensions.offset(element[0]);
                var elementHeight = dimensions.height(element[0]);
                
                // Get required affix class according to position
                var affix = getRequiredAffixClass(unpin, position, elementHeight);
                
                // Did affix status changed this last check?
                if (affixed === affix) return;
                affixed = affix;
                
                // Add proper affix class
                element.removeClass(reset).addClass('affix' + ((affix !== 'middle') ? '-' + affix : ''));
                
                if (affix === 'top') {
                    unpin = null;
                    element.css('position', (options.offsetParent) ? '' : 'relative');
                    element.css('top', '');
                } else if (affix === 'bottom') {
                    if (options.offsetUnpin) {
                        unpin = -(options.offsetUnpin * 1);
                    }
                    else {
                        // Calculate unpin threshold when affixed to bottom.
                        // Hopefully the browser scrolls pixel by pixel.
                        unpin = position.top - scrollTop;
                    }
                    element.css('position', (options.offsetParent) ? '' : 'relative');
                    element.css('top', (options.offsetParent) ? '' : ((bodyEl[0].offsetHeight - offsetBottom - elementHeight - initialOffsetTop) + 'px'));
                } else { // affix === 'middle'
                    unpin = null;
                    element.css('position', 'fixed');
                    element.css('top', initialAffixTop + 'px');
                }

            };
            
            $affix.$onResize = function () {
                $affix.$parseOffsets();
                $affix.checkPosition();
            };
            $affix.$debouncedOnResize = debounce($affix.$onResize, 50);
            
            $affix.$parseOffsets = function () {
                
                // Reset position to calculate correct offsetTop
                element.css('position', (options.offsetParent) ? '' : 'relative');
                
                if (options.offsetTop) {
                    if (options.offsetTop === 'auto') {
                        options.offsetTop = '+0';
                    }
                    if (options.offsetTop.match(/^[-+]\d+$/)) {
                        initialAffixTop = -options.offsetTop * 1;
                        if (options.offsetParent) {
                            offsetTop = dimensions.offset(parent[0]).top + (options.offsetTop * 1);
                        }
                        else {
                            offsetTop = dimensions.offset(element[0]).top - dimensions.css(element[0], 'marginTop', true) + (options.offsetTop * 1);
                        }
                    }
                    else {
                        offsetTop = options.offsetTop * 1;
                    }
                }
                
                if (options.offsetBottom) {
                    if (options.offsetParent && options.offsetBottom.match(/^[-+]\d+$/)) {
                        // add 1 pixel due to rounding problems...
                        offsetBottom = getScrollHeight() - (dimensions.offset(parent[0]).top + dimensions.height(parent[0])) + (options.offsetBottom * 1) + 1;
                    }
                    else {
                        offsetBottom = options.offsetBottom * 1;
                    }
                }

            };
            
            // Private methods
            
            function getRequiredAffixClass(unpin, position, elementHeight) {
                
                var scrollTop = getScrollTop();
                var scrollHeight = getScrollHeight();
                
                if (scrollTop <= offsetTop) {
                    return 'top';
                } else if (unpin !== null && (scrollTop + unpin <= position.top)) {
                    return 'middle';
                } else if (offsetBottom !== null && (position.top + elementHeight + initialAffixTop >= scrollHeight - offsetBottom)) {
                    return 'bottom';
                } else {
                    return 'middle';
                }

            }
            
            function getScrollTop() {
                return targetEl[0] === $window ? $window.pageYOffset : targetEl[0].scrollTop;
            }
            
            function getScrollHeight() {
                return targetEl[0] === $window ? $window.document.body.scrollHeight : targetEl[0].scrollHeight;
            }
            
            $affix.init();
            return $affix;

        }
        
        return AffixFactory;

    };

})
.directive('bsAffix', function ($affix, $window) {
    return {
        restrict: 'EAC',
        require: '^?bsAffixTarget',
        link: function postLink(scope, element, attr, affixTarget) {
            
            var options = { scope: scope, offsetTop: 'auto', target: affixTarget ? affixTarget.$element : angular.element($window) };
            angular.forEach(['offsetTop', 'offsetBottom', 'offsetParent', 'offsetUnpin'], function (key) {
                if (angular.isDefined(attr[key])) options[key] = attr[key];
            });
            
            var affix = $affix(element, options);
            scope.$on('$destroy', function () {
                affix && affix.destroy();
                options = null;
                affix = null;
            });

        }
    };

})
.directive('bsAffixTarget', function () {
    return {
        controller: function ($element) {
            this.$element = $element;
        }
    };
});