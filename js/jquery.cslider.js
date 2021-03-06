// Original: https://github.com/Le-Stagiaire/jquery.cslider/blob/0c99322279b114acdffca087d3700ab9a840c25f/src/jquery.cslider.js
// Modified: https://github.com/Le-Stagiaire/jquery.cslider/pull/1
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery.cslider'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    /*
     * Slider object.
     */
    $.Slider = function (options, element) {
        this.$el = $(element);
        this._init(options);
    };
    $.Slider.defaults = {
        current: 0,  // index of current slide
        bgincrement: 50, // increment the bg position (parallax effect) when sliding
        autoplay: false,// slideshow on / off
        interval: 4000  // time between transitions
    };
    $.Slider.prototype = {
        _init: function (options) {
            this.options = $.extend(true, {}, $.Slider.defaults, options);
            this.$slides = this.$el.find('div.da-slide');
            this.slidesCount = this.$slides.length;
            this.current = this.options.current;
            if (this.current < 0 || this.current >= this.slidesCount) {
                this.current = 0;
            }
            this.$slides.eq(this.current).addClass('da-slide-current');
            var $navigation = $('<nav class="da-dots"/>');
            for (var i = 0; i < this.slidesCount; ++i) {
                $navigation.append('<span/>');
            }
            $navigation.appendTo(this.$el);
            this.$pages = this.$el.find('nav.da-dots > span');
            this.$navNext = this.$el.find('span.da-arrows-next');
            this.$navPrev = this.$el.find('span.da-arrows-prev');
            this.isAnimating = false;
            this.bgpositer = 0;

            this._updatePage();
            // load the events
            this._loadEvents();
            // slideshow
            if (this.options.autoplay) {
                this._startSlideshow();
            }
        },
        _navigate: function (page, dir) {
            var $current = this.$slides.eq(this.current), $next;
            if (this.current === page || this.isAnimating) return false;
            this.isAnimating = true;
            // check dir
            var classTo, classFrom, d;
            if (!dir) {
                ( page > this.current ) ? d = 'next' : d = 'prev';
            }
            else {
                d = dir;
            }
            if (d === 'next') {
                classTo = 'da-slide-toleft';
                classFrom = 'da-slide-fromright';
                ++this.bgpositer;
            }
            else {
                classTo = 'da-slide-toright';
                classFrom = 'da-slide-fromleft';
                --this.bgpositer;
            }
            this.$el.css('background-position', this.bgpositer * this.options.bgincrement + '% 0%');
            this.current = page;
            $next = this.$slides.eq(this.current);
            var rmClasses = 'da-slide-toleft da-slide-toright da-slide-fromleft da-slide-fromright';
            $current.removeClass(rmClasses);
            $next.removeClass(rmClasses);
            $current.addClass(classTo);
            $next.addClass(classFrom);
            $current.removeClass('da-slide-current');
            $next.addClass('da-slide-current');
            this._updatePage();
        },
        _updatePage: function () {
            this.$pages.removeClass('da-dots-current');
            this.$pages.eq(this.current).addClass('da-dots-current');
        },
        _startSlideshow: function () {
            var _self = this;
            this.slideshow = setTimeout(function () {
                var page = ( _self.current < _self.slidesCount - 1 ) ? page = _self.current + 1 : page = 0;
                _self._navigate(page, 'next');
                if (_self.options.autoplay) {
                    _self._startSlideshow();
                }
            }, this.options.interval);
        },
        page: function (idx) {
            if (idx >= this.slidesCount || idx < 0) {
                return false;
            }
            if (this.options.autoplay) {
                clearTimeout(this.slideshow);
                this.options.autoplay = false;
            }
            this._navigate(idx);
        },
        _loadEvents: function () {
            var _self = this;
            this.$pages.on('click.cslider', function () {
                _self.page($(this).index());
                return false;
            });
            this.$navNext.on('click.cslider', function () {
                if (_self.options.autoplay) {
                    clearTimeout(_self.slideshow);
                    _self.options.autoplay = false;
                }
                var page = ( _self.current < _self.slidesCount - 1 ) ? page = _self.current + 1 : page = 0;
                _self._navigate(page, 'next');
                return false;
            });
            this.$navPrev.on('click.cslider', function () {
                if (_self.options.autoplay) {
                    clearTimeout(_self.slideshow);
                    _self.options.autoplay = false;
                }
                var page = ( _self.current > 0 ) ? page = _self.current - 1 : page = _self.slidesCount - 1;
                _self._navigate(page, 'prev');
                return false;
            });
            if (!this.options.bgincrement) {
                this.$el.on('webkitAnimationEnd.cslider animationend.cslider OAnimationEnd.cslider', function (event) {
                    if (event.originalEvent.animationName === 'toRightAnim4' || event.originalEvent.animationName === 'toLeftAnim4') {
                        _self.isAnimating = false;
                    }
                });
            }
            else {
                this.$el.on('webkitTransitionEnd.cslider transitionend.cslider OTransitionEnd.cslider', function (event) {
                    if (event.target.id === _self.$el.attr('id'))
                        _self.isAnimating = false;
                });
            }
        }
    };
    var logError = function (message) {
        if (this.console) {
            console.error(message);
        }
    };
    $.fn.cslider = function (options) {
        if (typeof options === 'string') {
            var args = Array.prototype.slice.call(arguments, 1);
            this.each(function () {
                var instance = $.data(this, 'cslider');
                if (!instance) {
                    logError("cannot call methods on cslider prior to initialization; " +
                    "attempted to call method '" + options + "'");
                    return;
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    logError("no such method '" + options + "' for cslider instance");
                    return;
                }
                instance[options].apply(instance, args);
            });
        }
        else {
            this.each(function () {
                var instance = $.data(this, 'cslider');
                if (!instance) {
                    $.data(this, 'cslider', new $.Slider(options, this));
                }
            });
        }
        return this;
    };
}));
