require(['jquery'], function($) {
    $(window).on('action:ajaxify.end', function() {
        // בדיקה שהאלמנט לא קיים כבר כדי למנוע כפילויות
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

        // שימוש ב-Delegate event כדי לתפוס גם אלמנטים שנוספו דינמית
        $('body').on('mouseenter', '[component="topic/header"] a, .topic-title a', function() {
            cancelHide();

            var $link = $(this);
            var href = $link.attr('href');
            
            // בדיקת תקינות הקישור
            if (!href || !href.includes('/topic/')) return;

            var linkOffset = $link.offset();
            var linkHeight = $link.outerHeight();
            var linkWidth = $link.outerWidth();
            
            // חישוב מיקום ה-Tooltip
            var top = linkOffset.top + linkHeight + 5;
            var left = linkOffset.left - (550 - linkWidth); // 550 הוא רוחב ה-Tooltip
            if (left < 10) left = linkOffset.left;

            $tooltip.css({ top: top + 'px', left: left + 'px' }).show();

            // טעינת התוכן
            if (topicCache[href]) {
                $tooltip.find('.preview-content').html(topicCache[href]);
            } else {
                $tooltip.find('.preview-content').text('טוען...');
                
                // שימוש ב-NodeBB API
                $.getJSON('/api' + href, function(data) {
                    if (data && data.posts && data.posts.length > 0) {
                        var content = data.posts[0].content;
                        topicCache[href] = content;
                        
                        // עדכון רק אם ה-Tooltip עדיין מוצג והמשתמש עדיין על אותו קישור
                        if ($tooltip.is(':visible')) {
                            $tooltip.find('.preview-content').html(content);
                        }
                    }
                }).fail(function() {
                     $tooltip.find('.preview-content').text('שגיאה בטעינת התוכן');
                });
            }
        });

        // הסתרה ביציאה מהקישור
        $('body').on('mouseleave', '[component="topic/header"] a, .topic-title a', function() {
            scheduleHide();
        });

        // טיפול בהובר על ה-Tooltip עצמו
        $tooltip.on('mouseenter', function() {
            cancelHide();
        });

        $tooltip.on('mouseleave', function() {
            scheduleHide();
        });
    });
});
