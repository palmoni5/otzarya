/* עוטפים את הקוד בפונקציה כדי להגן על המשתנים ומוודאים ש-$ קיים */
(function($) {
    'use strict';

    /* הפונקציה הראשית */
    function initPreviewTooltip() {
        if ($('#topic-preview-tooltip').length === 0) {
            $('body').append('<div id="topic-preview-tooltip"><div class="preview-content">טוען...</div></div>');
        }

        var $tooltip = $('#topic-preview-tooltip');
        var topicCache = {};
        var leaveTimeout;

        function scheduleHide() {
            leaveTimeout = setTimeout(function() {
                $tooltip.hide();
            }, 50);
        }

        function cancelHide() {
            if (leaveTimeout) {
                clearTimeout(leaveTimeout);
                leaveTimeout = null;
            }
        }

        /* אירוע כניסה עם העכבר לקישורים */
        $('body').off('mouseenter.topicPreview').on('mouseenter.topicPreview', '[component="topic/header"] a, .topic-title a', function() {
            cancelHide();

            var $link = $(this);
            var href = $link.attr('href');
            
            if (!href || !href.includes('/topic/')) return;

            var linkOffset = $link.offset();
            var linkHeight = $link.outerHeight();
            var linkWidth = $link.outerWidth();
            
            var top = linkOffset.top + linkHeight + 5;
            var left = linkOffset.left - (550 - linkWidth);
            if (left < 10) left = linkOffset.left;

            $tooltip.css({ top: top + 'px', left: left + 'px' }).show();

            if (topicCache[href]) {
                $tooltip.find('.preview-content').html(topicCache[href]);
            } else {
                $tooltip.find('.preview-content').text('טוען...');
                
                $.getJSON('/api' + href, function(data) {
                    if (data && data.posts && data.posts.length > 0) {
                        var content = data.posts[0].content;
                        topicCache[href] = content;
                        
                        if ($tooltip.is(':visible')) {
                            $tooltip.find('.preview-content').html(content);
                        }
                    }
                }).fail(function() {
                     $tooltip.find('.preview-content').text('שגיאה בטעינת התוכן');
                });
            }
        });

        /* אירוע יציאה מהקישור */
        $('body').off('mouseleave.topicPreview').on('mouseleave.topicPreview', '[component="topic/header"] a, .topic-title a', function() {
            scheduleHide();
        });

        /* אירועים על ה-Tooltip עצמו */
        $tooltip.on('mouseenter', cancelHide);
        $tooltip.on('mouseleave', scheduleHide);
    }

    /* הפעלה בעת מעבר דפים ב-NodeBB */
    $(window).on('action:ajaxify.end', initPreviewTooltip);

    /* הפעלה ראשונית אם הדף כבר טעון */
    initPreviewTooltip();

})(window.jQuery || window.$);
