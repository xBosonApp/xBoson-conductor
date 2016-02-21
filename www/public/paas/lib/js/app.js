/*
 * VARIABLES
 * Description: All Global Vars
 */
// Impacts the responce rate of some of the responsive elements (lower value affects CPU but improves speed)
$.throttle_delay = 350;

// The rate at which the menu expands revealing child elements on click
$.menu_speed = 235;

// Note: You will also need to change this variable in the "variable.less" file.
$.navbar_height = 49;

/*
 * APP DOM REFERENCES
 * Description: Obj DOM reference, please try to avoid changing these
 */
$.root_ = $('body');
$.left_panel = $('#left-panel');
$.shortcut_dropdown = $('#shortcut');
$.bread_crumb = $('#ribbon ol.breadcrumb');

// desktop or mobile
$.device = null;

/*
 * APP CONFIGURATION
 * Description: Enable / disable certain theme features here
 */
$.navAsAjax = true; // Your left nav in your app will no longer fire ajax calls

// Please make sure you have included "jarvis.widget.js" for this below feature to work
$.enableJarvisWidgets = true;

// Warning: Enabling mobile widgets could potentially crash your webApp if you have too many
// widgets running at once (must have $.enableJarvisWidgets = true)
$.enableMobileWidgets = false;


/*
 * DETECT MOBILE DEVICES
 * Description: Detects mobile device - if any of the listed device is detected
 * a class is inserted to $.root_ and the variable $.device is decleard.
 */

/* so far this is covering most hand held devices */
var ismobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

if (!ismobile) {
  // Desktop
  $.root_.addClass("desktop-detected");
  $.device = "desktop";
} else {
  // Mobile
  $.root_.addClass("mobile-detected");
  $.device = "mobile";

  // Removes the tap delay in idevices
  // dependency: js/plugin/fastclick/fastclick.js
  //FastClick.attach(document.body);
}

/* ~ END: CHECK MOBILE DEVICE */

/*
 * DOCUMENT LOADED EVENT
 * Description: Fire when DOM is ready
 */

$(document).ready(function () {
  $("body [title]").poshytip();
  /*
   * Fire tooltips
   */
  if ($("[rel=tooltip]").length) {
    $("[rel=tooltip]").tooltip();
  }

  //TODO: was moved from window.load due to IE not firing consist
  nav_page_height();

  // INITIALIZE LEFT NAV
//  if (!null) {
//    $('nav ul').jarvismenu({
//      accordion: true,
//      speed: $.menu_speed,
//      closedSign: '<em class="fa fa-chevron-right"></em>',
//      openedSign: '<em class="fa fa-chevron-down"></em>'
//    });
//  } else {
//    alert("Error - 菜单项不存在");
//  }

  // COLLAPSE LEFT NAV
  $('.minifyme').click(function (e) {
    $('body').toggleClass("minified");
    $(this).effect("highlight", {}, 500);
    e.preventDefault();
  });

  // HIDE MENU
  $('#hide-menu >:first-child > a').click(function (e) {
    $('body').toggleClass("hidden-menu");
    e.preventDefault();
  });

  // SHOW & HIDE Shortcut
  $('#show-shortcut').click(function (e) {
    if ($.shortcut_dropdown.is(":visible")) {
      shortcut_buttons_hide();
    } else {
      shortcut_buttons_show();
    }
    e.preventDefault();
  });

  // SHOW & HIDE MOBILE SEARCH FIELD
  $('#search-mobile').click(function () {
    $.root_.addClass('search-mobile');
  });

  $('#cancel-search-js').click(function () {
    $.root_.removeClass('search-mobile');
  });

  // RESET WIDGETS
  $('#refresh').click(function (e) {
    location.reload();
    e.preventDefault();
  });

  // LOGOUT BUTTON
  $('#logout a').click(function (e) {
    //get the link
    var $this = $(this);
    $.loginURL = $this.attr('href');
    $.logoutMSG = $this.data('logout-msg');

    // ask verification
    $.SmartMessageBox({
      title: "<i class='fa fa-sign-out txt-color-orangeDark'></i> 注销 <span class='txt-color-orangeDark'><strong>" + $('#show-shortcut').text() + "</strong></span> ?",
      content: $.logoutMSG || "为了安全请先注销后关闭浏览器",
      buttons: '[No][Yes]'
    }, function (ButtonPressed) {
      if (ButtonPressed == "Yes") {
        zy.g.am.app = '';
        zy.g.am.mod = '';
        zy.net.get('user/logout', null, null, null, function(){
          var ls = $.initNamespaceStorage(location.hostname + '_zy_user_info').localStorage;
          ls.removeAll();
          setTimeout(logout, 1000);
        });
        $.root_.addClass('animated fadeOutUp');
      }
    });
    e.preventDefault();
  });

  /*
   * LOGOUT ACTION
   */
  function logout() {
    window.location = $.loginURL;
  }

  /*
   * SHORTCUTS
   */
  // SHORT CUT (buttons that appear when clicked on user name)
  $.shortcut_dropdown.find('a').click(function (e) {
    e.preventDefault();
    window.location = $(this).attr('href');
    setTimeout(shortcut_buttons_hide, 300);
  });

  // ACTIVITY
  // ajax drop
  $('#activity').click(function(e) {
    var $this = $(this);

    if ($this.find('.badge').hasClass('bg-color-red')) {
      $this.find('.badge').removeClassPrefix('bg-color-');
      $this.find('.badge').text("0");
      // console.log("Ajax call for activity")
    }

    if (!$this.next('.ajax-dropdown').is(':visible')) {
      $this.next('.ajax-dropdown').fadeIn(150);
      $this.addClass('active');
    } else {
      $this.next('.ajax-dropdown').fadeOut(150);
      $this.removeClass('active')
    }

    var mytest = $this.next('.ajax-dropdown').find('.btn-group > .active > input').attr('id');
    //console.log(mytest)

    e.preventDefault();
  });

  $('input[name="activity"]').change(function() {
    //alert($(this).val())
    var $this = $(this);

    url = $this.attr('id');
    container = $('.ajax-notifications');

    loadURL(url, container);

  });

  $(document).mouseup(function(e) {
    if (!$('.ajax-dropdown').is(e.target)// if the target of the click isn't the container...
    && $('.ajax-dropdown').has(e.target).length === 0) {
      $('.ajax-dropdown').fadeOut(150);
      $('.ajax-dropdown').prev().removeClass("active")
    }
  });

  // SHORTCUT buttons goes away if mouse is clicked outside of the area
  $(document).mouseup(function (e) {
    // if the target of the click isn't the container...
    if (!$.shortcut_dropdown.is(e.target) && $.shortcut_dropdown.has(e.target).length === 0) {
      shortcut_buttons_hide();
    }
  });

  // SHORTCUT ANIMATE HIDE
  function shortcut_buttons_hide() {
    $.shortcut_dropdown.animate({
      height: "hide"
    }, 300, "easeOutCirc");
    $.root_.removeClass('shortcut-on');

  }

  // SHORTCUT ANIMATE SHOW
  function shortcut_buttons_show() {
    $.shortcut_dropdown.animate({
      height: "show"
    }, 200, "easeOutCirc");
    $.root_.addClass('shortcut-on');
  }

});

/*
 * RESIZER WITH THROTTLE
 * Source: http://benalman.com/code/projects/jquery-resize/examples/resize/
 */
(function ($, window, undefined) {

  var elems = $([]),
    jq_resize = $.resize = $.extend($.resize, {}),
    timeout_id, str_setTimeout = 'setTimeout',
    str_resize = 'resize',
    str_data = str_resize + '-special-event',
    str_delay = 'delay',
    str_throttle = 'throttleWindow';

  jq_resize[str_delay] = $.throttle_delay;

  jq_resize[str_throttle] = true;

  $.event.special[str_resize] = {

    setup: function () {
      if (!jq_resize[str_throttle] && this[str_setTimeout]) {
        return false;
      }

      var elem = $(this);
      elems = elems.add(elem);
      $.data(this, str_data, {
        w: elem.width(),
        h: elem.height()
      });
      if (elems.length === 1) {
        loopy();
      }
    },
    teardown: function () {
      if (!jq_resize[str_throttle] && this[str_setTimeout]) {
        return false;
      }

      var elem = $(this);
      elems = elems.not(elem);
      elem.removeData(str_data);
      if (!elems.length) {
        clearTimeout(timeout_id);
      }
    },

    add: function (handleObj) {
      if (!jq_resize[str_throttle] && this[str_setTimeout]) {
        return false;
      }
      var old_handler;

      function new_handler(e, w, h) {
        var elem = $(this),
          data = $.data(this, str_data);
        if (data) { /* Modify J.ym 14.6.5 */
            data.w = w !== undefined ? w : elem.width();
            data.h = h !== undefined ? h : elem.height();

        }
        old_handler.apply(this, arguments);
      }
      if ($.isFunction(handleObj)) {
        old_handler = handleObj;
        return new_handler;
      } else {
        old_handler = handleObj.handler;
        handleObj.handler = new_handler;
      }
    }
  };

  function loopy() {
    timeout_id = window[str_setTimeout](function () {
      elems.each(function () {
        var elem = $(this),
          width = elem.width(),
          height = elem.height(),
          data = $.data(this, str_data);
        if (width !== data.w || height !== data.h) {
          elem.trigger(str_resize, [data.w = width, data.h = height]);
        }
      });
      loopy();
    }, jq_resize[str_delay]);
  }
})(jQuery, this);

/*
 * NAV OR #LEFT-BAR RESIZE DETECT
 * Description: changes the page min-width of #CONTENT and NAV when navigation is resized.
 * This is to counter bugs for min page width on many desktop and mobile devices.
 * Note: This script uses JSthrottle technique so don't worry about memory/CPU usage
 */
// Fix page and nav height
function nav_page_height() {
  var setHeight = $('#main').height();
  //menuHeight = $.left_panel.height();

  var windowHeight = $(window).height() - $.navbar_height;
  //set height

  if (setHeight > windowHeight) { // if content height exceedes actual window height and menuHeight
    $.left_panel.css('min-height', setHeight + 'px');
    $.root_.css('min-height', setHeight + $.navbar_height + 'px');

  } else {
    $.left_panel.css('min-height', windowHeight + 'px');
    $.root_.css('min-height', windowHeight + 'px');
  }
}

$('#main').resize(function () {
  nav_page_height();
  check_if_mobile_width();
});

$('nav').resize(function () {
  nav_page_height();
});

function check_if_mobile_width() {
  if ($(window).width() < 979) {
    $.root_.addClass('mobile-view-activated');
  } else if ($.root_.hasClass('mobile-view-activated')) {
    $.root_.removeClass('mobile-view-activated');
  }
}
/* ~ END: NAV OR #LEFT-BAR RESIZE DETECT */

/*
 * 检查 IE VERSION
 * Description: A short snippet for detecting versions of IE in JavaScript
 * without resorting to user-agent sniffing
 * RETURNS:
 * If you're not in IE (or IE version is less than 5) then:
 * //ie === undefined
 *
 * If you're in IE (>=5) then you can determine which version:
 * // ie === 7; // IE7
 *
 * Thus, to detect IE:
 * // if (ie) {}
 *
 * And to detect the version:
 * ie === 6 // IE6
 * ie > 7 // IE8, IE9 ...
 * ie < 9 // Anything less than IE9
 */

// TODO: delete this function later on - no longer needed (?)
var ie = (function () {

  var undef, v = 3,
    div = document.createElement('div'),
    all = div.getElementsByTagName('i');

  while (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', all[0]);

  return v > 4 ? v : undef;

}()); // do we need this?


/*
 * 自定义菜单 MENU PLUGIN
 */
$.fn.extend({

  //pass the options variable to the function
  jarvismenu: function (options) {

    var defaults = {
      accordion: 'true',
      speed: 200,
      closedSign: '[+]',
      openedSign: '[-]'
    };

    // Extend our default options with those provided.
    var opts = $.extend(defaults, options);
    //Assign current element to variable, in this case is UL element
    var $this = $(this);

    //add a mark [+] to a multilevel menu
    $this.find("li").each(function () {
      if ($(this).find("ul").size() !== 0) {
        //add the multilevel sign next to the link
        $(this).find("a:first").append("<b class='collapse-sign'>" + opts.closedSign + "</b>");

        //avoid jumping to the top of the page when the href is an #
        if ($(this).find("a:first").attr('href') == "#") {
          $(this).find("a:first").click(function () {
            return false;
          });
        }
      }
    });

    //open active level
    $this.find("li.active").each(function () {
      $(this).parents("ul").slideDown(opts.speed);
      $(this).parents("ul").parent("li").find("b:first").html(opts.openedSign);
      $(this).parents("ul").parent("li").addClass("open");
    });

    $this.find("li a").click(function () {

      if ($(this).parent().find("ul").size() !== 0) {

        if (opts.accordion) {
          //Do nothing when the list is open
          if (!$(this).parent().find("ul").is(':visible')) {
            parents = $(this).parent().parents("ul");
            visible = $this.find("ul:visible");
            visible.each(function (visibleIndex) {
              var close = true;
              parents.each(function (parentIndex) {
                if (parents[parentIndex] == visible[visibleIndex]) {
                  close = false;
                  return false;
                }
              });
              if (close) {
                if ($(this).parent().find("ul") != visible[visibleIndex]) {
                  $(visible[visibleIndex]).slideUp(opts.speed, function () {
                    $(this).parent("li").find("b:first").html(opts.closedSign);
                    $(this).parent("li").removeClass("open");
                  });

                }
              }
            });
          }
        } // end if
        if ($(this).parent().find("ul:first").is(":visible") && !$(this).parent().find("ul:first").hasClass("active")) {
          $(this).parent().find("ul:first").slideUp(opts.speed, function () {
            $(this).parent("li").removeClass("open");
            $(this).parent("li").find("b:first").delay(opts.speed).html(opts.closedSign);
          });

        } else {
          $(this).parent().find("ul:first").slideDown(opts.speed, function () {
            /*$(this).effect("highlight", {color : '#616161'}, 500); - disabled due to CPU clocking on phones*/
            $(this).parent("li").addClass("open");
            $(this).parent("li").find("b:first").delay(opts.speed).html(opts.openedSign);
          });
        } // end else
      } // end if
    });
  } // end function
});

/* ~ END: CUSTOM MENU PLUGIN */

/*
 * 元素是否存在
 * Description: returns true or false
 * Usage: $('#myDiv').doesExist();
 */
jQuery.fn.doesExist = function () {
  return jQuery(this).length > 0;
};

/*
 * 全屏显示
 */
// Find the right method, call on correct element
function launchFullscreen(element) {

  if (!$.root_.hasClass("full-screen")) {

    $.root_.addClass("full-screen");

    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }

  } else {

    $.root_.removeClass("full-screen");

    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }

  }

}

/*
 * 初始化 FORMS
 * Description: Select2, Masking, Datepicker, Autocomplete
 */

function runAllForms() {

  /*
   * BOOTSTRAP SLIDER PLUGIN
   * Usage: 进度条
   * Dependency: js/plugin/bootstrap-slider
   */
  if ($.fn.slider) {
    $('.slider').slider();
  }

  /*
   * SELECT2 PLUGIN
   * Usage: 选择框
   * Dependency: js/plugin/select2/
   */
  if ($.fn.select2) {
    $('.select2').each(function () {
      var $this = $(this);
      var width = $this.attr('data-select-width') || '100%';
      //, _showSearchInput = $this.attr('data-select-search') === 'true';
      $this.select2({
        //showSearchInput : _showSearchInput,
        allowClear: true,
        width: width
      });
    });
  }

  /*
   * MASKING 遮罩
   * Dependency: js/plugin/masked-input/
   */
  if ($.fn.mask) {
    $('[data-mask]').each(function () {

      var $this = $(this);
      var mask = $this.attr('data-mask') || 'error...',
        mask_placeholder = $this.attr('data-mask-placeholder') || 'X';

      $this.mask(mask, {
        placeholder: mask_placeholder
      });
    });
  }

  /*
   * Autocomplete
   * Dependency: js/jqui
   */
  if ($.fn.autocomplete) {
    $('[data-autocomplete]').each(function () {

      var $this = $(this);
      var availableTags = $this.data('autocomplete') || ["The", "Quick", "Brown", "Fox", "Jumps", "Over", "Three", "Lazy", "Dogs"];

      $this.autocomplete({
        source: availableTags
      });
    });
  }

  /*
   * JQUERY UI DATE
   * Dependency: js/libs/jquery-ui-1.10.3.min.js
   * Usage:
   */
  if ($.fn.datepicker) {
    $('.datepicker').each(function () {
      var $this = $(this);
      var dataDateFormat = $this.attr('data-format') || 'yyyy-mm-dd';
      $this.datepicker({
        format: dataDateFormat,
        language: "zh-CN",
        forceParse: false,
        autoclose: true
      });
      $this.css('z-index','1051');
    });
    //Twitter bootstrap multiple modal error
//    $.fn.modal.Constructor.prototype.enforceFocus = function() {};
  }

  /*
   * AJAX BUTTON LOADING TEXT
   * Usage: <button type="button" data-loading-text="Loading..." class="btn btn-xs btn-default ajax-refresh"> .. </button>
   */
  $('button[data-loading-text]').on('click', function () {
    var btn = $(this);
    btn.button('loading');
    setTimeout(function () {
//      btn.button('reset');
    }, 20000);
  });

}
/* ~ END: INITIALIZE FORMS */

/*
 * 初始化 CHARTS
 * Description: Sparklines, PieCharts
 */
function runAllCharts() {
  /*
   * SPARKLINES
   * DEPENDENCY: js/plugins/sparkline/jquery.sparkline.min.js
   * See usage example below...
   */

  /* Usage:
   * <div class="sparkline-line txt-color-blue" data-fill-color="transparent" data-sparkline-height="26px">
   *  5,6,7,9,9,5,9,6,5,6,6,7,7,6,7,8,9,7
   * </div>
   */
  if ($.fn.sparkline) {
    $('.sparkline').each(function () {
      var $this = $(this);
      var sparklineType = $this.data('sparkline-type') || 'bar';

      // BAR CHART
      if (sparklineType == 'bar') {
        var barColor = $this.data('sparkline-bar-color') || $this.css('color') || '#0000f0',
          sparklineHeight = $this.data('sparkline-height') || '26px',
          sparklineBarWidth = $this.data('sparkline-barwidth') || 5,
          sparklineBarSpacing = $this.data('sparkline-barspacing') || 2,
          sparklineNegBarColor = $this.data('sparkline-negbar-color') || '#A90329',
          sparklineStackedColor = $this.data('sparkline-barstacked-color') || ["#A90329", "#0099c6", "#98AA56", "#da532c", "#4490B1", "#6E9461", "#990099", "#B4CAD3"];

        $this.sparkline('html', {
          type: 'bar',
          barColor: barColor,
          height: sparklineHeight,
          barWidth: sparklineBarWidth,
          barSpacing: sparklineBarSpacing,
          stackedBarColor: sparklineStackedColor,
          negBarColor: sparklineNegBarColor,
          zeroAxis: 'false'
        });

      }

      //LINE CHART
      if (sparklineType == 'line') {
        var sparklineHeight = $this.data('sparkline-height') || '20px',
          sparklineWidth = $this.data('sparkline-width') || '90px',
          thisLineColor = $this.data('sparkline-line-color') || $this.css('color') || '#0000f0',
          thisLineWidth = $this.data('sparkline-line-width') || 1,
          thisFill = $this.data('fill-color') || '#c0d0f0',
          thisSpotColor = $this.data('sparkline-spot-color') || '#f08000',
          thisMinSpotColor = $this.data('sparkline-minspot-color') || '#ed1c24',
          thisMaxSpotColor = $this.data('sparkline-maxspot-color') || '#f08000',
          thishighlightSpotColor = $this.data('sparkline-highlightspot-color') || '#50f050',
          thisHighlightLineColor = $this.data('sparkline-highlightline-color') || 'f02020',
          thisSpotRadius = $this.data('sparkline-spotradius') || 1.5;
        thisChartMinYRange = $this.data('sparkline-min-y') || 'undefined', thisChartMaxYRange = $this.data('sparkline-max-y') || 'undefined', thisChartMinXRange = $this.data('sparkline-min-x') || 'undefined', thisChartMaxXRange = $this.data('sparkline-max-x') || 'undefined', thisMinNormValue = $this.data('min-val') || 'undefined', thisMaxNormValue = $this.data('max-val') || 'undefined', thisNormColor = $this.data('norm-color') || '#c0c0c0', thisDrawNormalOnTop = $this.data('draw-normal') || false;

        $this.sparkline('html', {
          type: 'line',
          width: sparklineWidth,
          height: sparklineHeight,
          lineWidth: thisLineWidth,
          lineColor: thisLineColor,
          fillColor: thisFill,
          spotColor: thisSpotColor,
          minSpotColor: thisMinSpotColor,
          maxSpotColor: thisMaxSpotColor,
          highlightSpotColor: thishighlightSpotColor,
          highlightLineColor: thisHighlightLineColor,
          spotRadius: thisSpotRadius,
          chartRangeMin: thisChartMinYRange,
          chartRangeMax: thisChartMaxYRange,
          chartRangeMinX: thisChartMinXRange,
          chartRangeMaxX: thisChartMaxXRange,
          normalRangeMin: thisMinNormValue,
          normalRangeMax: thisMaxNormValue,
          normalRangeColor: thisNormColor,
          drawNormalOnTop: thisDrawNormalOnTop

        });

      }

      //PIE CHART
      if (sparklineType == 'pie') {

        var pieColors = $this.data('sparkline-piecolor') || ["#B4CAD3", "#4490B1", "#98AA56", "#da532c", "#6E9461", "#0099c6", "#990099", "#717D8A"],
          pieWidthHeight = $this.data('sparkline-piesize') || 90,
          pieBorderColor = $this.data('border-color') || '#45494C',
          pieOffset = $this.data('sparkline-offset') || 0;

        $this.sparkline('html', {
          type: 'pie',
          width: pieWidthHeight,
          height: pieWidthHeight,
          tooltipFormat: '<span style="color: {{color}}">&#9679;</span> ({{percent.1}}%)',
          sliceColors: pieColors,
          borderWidth: 1,
          offset: pieOffset,
          borderColor: pieBorderColor
        });

      }

      //BOX PLOT
      if (sparklineType == 'box') {
        var thisBoxWidth = $this.data('sparkline-width') || 'auto',
          thisBoxHeight = $this.data('sparkline-height') || 'auto',
          thisBoxRaw = $this.data('sparkline-boxraw') || false,
          thisBoxTarget = $this.data('sparkline-targetval') || 'undefined',
          thisBoxMin = $this.data('sparkline-min') || 'undefined',
          thisBoxMax = $this.data('sparkline-max') || 'undefined',
          thisShowOutlier = $this.data('sparkline-showoutlier') || true,
          thisIQR = $this.data('sparkline-outlier-iqr') || 1.5,
          thisBoxSpotRadius = $this.data('sparkline-spotradius') || 1.5,
          thisBoxLineColor = $this.css('color') || '#000000',
          thisBoxFillColor = $this.data('fill-color') || '#c0d0f0',
          thisBoxWhisColor = $this.data('sparkline-whis-color') || '#000000',
          thisBoxOutlineColor = $this.data('sparkline-outline-color') || '#303030',
          thisBoxOutlineFill = $this.data('sparkline-outlinefill-color') || '#f0f0f0',
          thisBoxMedianColor = $this.data('sparkline-outlinemedian-color') || '#f00000',
          thisBoxTargetColor = $this.data('sparkline-outlinetarget-color') || '#40a020';

        $this.sparkline('html', {
          type: 'box',
          width: thisBoxWidth,
          height: thisBoxHeight,
          raw: thisBoxRaw,
          target: thisBoxTarget,
          minValue: thisBoxMin,
          maxValue: thisBoxMax,
          showOutliers: thisShowOutlier,
          outlierIQR: thisIQR,
          spotRadius: thisBoxSpotRadius,
          boxLineColor: thisBoxLineColor,
          boxFillColor: thisBoxFillColor,
          whiskerColor: thisBoxWhisColor,
          outlierLineColor: thisBoxOutlineColor,
          outlierFillColor: thisBoxOutlineFill,
          medianColor: thisBoxMedianColor,
          targetColor: thisBoxTargetColor

        });

      }

      //BULLET
      if (sparklineType == 'bullet') {
        var thisBulletHeight = $this.data('sparkline-height') || 'auto',
          thisBulletWidth = $this.data('sparkline-width') || 2,
          thisBulletColor = $this.data('sparkline-bullet-color') || '#ed1c24',
          thisBulletPerformanceColor = $this.data('sparkline-performance-color') || '#3030f0',
          thisBulletRangeColors = $this.data('sparkline-bulletrange-color') || ["#d3dafe", "#a8b6ff", "#7f94ff"];

        $this.sparkline('html', {

          type: 'bullet',
          height: thisBulletHeight,
          targetWidth: thisBulletWidth,
          targetColor: thisBulletColor,
          performanceColor: thisBulletPerformanceColor,
          rangeColors: thisBulletRangeColors

        });

      }

      //DISCRETE
      if (sparklineType == 'discrete') {

        var thisDiscreteHeight = $this.data('sparkline-height') || 26,
          thisDiscreteWidth = $this.data('sparkline-width') || 50,
          thisDiscreteLineColor = $this.css('color'),
          thisDiscreteLineHeight = $this.data('sparkline-line-height') || 5,
          thisDiscreteThrushold = $this.data('sparkline-threshold') || 'undefined',
          thisDiscreteThrusholdColor = $this.data('sparkline-threshold-color') || '#ed1c24';

        $this.sparkline('html', {

          type: 'discrete',
          width: thisDiscreteWidth,
          height: thisDiscreteHeight,
          lineColor: thisDiscreteLineColor,
          lineHeight: thisDiscreteLineHeight,
          thresholdValue: thisDiscreteThrushold,
          thresholdColor: thisDiscreteThrusholdColor

        });

      }

      //TRISTATE
      if (sparklineType == 'tristate') {

        var thisTristateHeight = $this.data('sparkline-height') || 26,
          thisTristatePosBarColor = $this.data('sparkline-posbar-color') || '#60f060',
          thisTristateNegBarColor = $this.data('sparkline-negbar-color') || '#f04040',
          thisTristateZeroBarColor = $this.data('sparkline-zerobar-color') || '#909090',
          thisTristateBarWidth = $this.data('sparkline-barwidth') || 5,
          thisTristateBarSpacing = $this.data('sparkline-barspacing') || 2,
          thisZeroAxis = $this.data('sparkline-zeroaxis') || false;

        $this.sparkline('html', {

          type: 'tristate',
          height: thisTristateHeight,
          posBarColor: thisBarColor,
          negBarColor: thisTristateNegBarColor,
          zeroBarColor: thisTristateZeroBarColor,
          barWidth: thisTristateBarWidth,
          barSpacing: thisTristateBarSpacing,
          zeroAxis: thisZeroAxis

        });

      }

      //COMPOSITE: BAR
      if (sparklineType == 'compositebar') {

        var sparklineHeight = $this.data('sparkline-height') || '20px',
          sparklineWidth = $this.data('sparkline-width') || '100%',
          sparklineBarWidth = $this.data('sparkline-barwidth') || 3,
          thisLineWidth = $this.data('sparkline-line-width') || 1,
          thisLineColor = $this.data('sparkline-color-top') || '#ed1c24',
          thisBarColor = $this.data('sparkline-color-bottom') || '#333333';

        $this.sparkline($this.data('sparkline-bar-val'), {
          type: 'bar',
          width: sparklineWidth,
          height: sparklineHeight,
          barColor: thisBarColor,
          barWidth: sparklineBarWidth
          //barSpacing: 5
        });

        $this.sparkline($this.data('sparkline-line-val'), {
          width: sparklineWidth,
          height: sparklineHeight,
          lineColor: thisLineColor,
          lineWidth: thisLineWidth,
          composite: true,
          fillColor: false
        });

      }

      //COMPOSITE: LINE
      if (sparklineType == 'compositeline') {
        var sparklineHeight = $this.data('sparkline-height') || '20px',
          sparklineWidth = $this.data('sparkline-width') || '90px',
          sparklineValue = $this.data('sparkline-bar-val'),
          sparklineValueSpots1 = $this.data('sparkline-bar-val-spots-top') || null,
          sparklineValueSpots2 = $this.data('sparkline-bar-val-spots-bottom') || null,
          thisLineWidth1 = $this.data('sparkline-line-width-top') || 1,
          thisLineWidth2 = $this.data('sparkline-line-width-bottom') || 1,
          thisLineColor1 = $this.data('sparkline-color-top') || '#333333',
          thisLineColor2 = $this.data('sparkline-color-bottom') || '#ed1c24',
          thisSpotRadius1 = $this.data('sparkline-spotradius-top') || 1.5,
          thisSpotRadius2 = $this.data('sparkline-spotradius-bottom') || thisSpotRadius1,
          thisSpotColor = $this.data('sparkline-spot-color') || '#f08000',
          thisMinSpotColor1 = $this.data('sparkline-minspot-color-top') || '#ed1c24',
          thisMaxSpotColor1 = $this.data('sparkline-maxspot-color-top') || '#f08000',
          thisMinSpotColor2 = $this.data('sparkline-minspot-color-bottom') || thisMinSpotColor1,
          thisMaxSpotColor2 = $this.data('sparkline-maxspot-color-bottom') || thisMaxSpotColor1,
          thishighlightSpotColor1 = $this.data('sparkline-highlightspot-color-top') || '#50f050',
          thisHighlightLineColor1 = $this.data('sparkline-highlightline-color-top') || '#f02020',
          thishighlightSpotColor2 = $this.data('sparkline-highlightspot-color-bottom') || thishighlightSpotColor1,
          thisHighlightLineColor2 = $this.data('sparkline-highlightline-color-bottom') || thisHighlightLineColor1,
          thisFillColor1 = $this.data('sparkline-fillcolor-top') || 'transparent',
          thisFillColor2 = $this.data('sparkline-fillcolor-bottom') || 'transparent';

        $this.sparkline(sparklineValue, {
          type: 'line',
          spotRadius: thisSpotRadius1,
          spotColor: thisSpotColor,
          minSpotColor: thisMinSpotColor1,
          maxSpotColor: thisMaxSpotColor1,
          highlightSpotColor: thishighlightSpotColor1,
          highlightLineColor: thisHighlightLineColor1,
          valueSpots: sparklineValueSpots1,
          lineWidth: thisLineWidth1,
          width: sparklineWidth,
          height: sparklineHeight,
          lineColor: thisLineColor1,
          fillColor: thisFillColor1
        });

        $this.sparkline($this.data('sparkline-line-val'), {
          type: 'line',
          spotRadius: thisSpotRadius2,
          spotColor: thisSpotColor,
          minSpotColor: thisMinSpotColor2,
          maxSpotColor: thisMaxSpotColor2,
          highlightSpotColor: thishighlightSpotColor2,
          highlightLineColor: thisHighlightLineColor2,
          valueSpots: sparklineValueSpots2,
          lineWidth: thisLineWidth2,
          width: sparklineWidth,
          height: sparklineHeight,
          lineColor: thisLineColor2,
          composite: true,
          fillColor: thisFillColor2
        });
      }
    });

  } // end if

  /*
   * EASY PIE CHARTS
   * DEPENDENCY: js/plugins/easy-pie-chart/jquery.easy-pie-chart.min.js
   * Usage: <div class="easy-pie-chart txt-color-orangeDark" data-pie-percent="33" data-pie-size="72" data-size="72">
   *			<span class="percent percent-sign">35</span>
   *        </div>
   */

  if ($.fn.easyPieChart) {

    $('.easy-pie-chart').each(function () {
      var $this = $(this);
      var barColor = $this.css('color') || $this.data('pie-color'),
        trackColor = $this.data('pie-track-color') || '#eeeeee',
        size = parseInt($this.data('pie-size')) || 25;
      $this.easyPieChart({
        barColor: barColor,
        trackColor: trackColor,
        scaleColor: false,
        lineCap: 'butt',
        lineWidth: parseInt(size / 8.5),
        animate: 1500,
        rotate: -90,
        size: size,
        onStep: function (value) {
          this.$el.find('span').text(~~value);
        }
      });
    });

  } // end if

}
/* ~ END: INITIALIZE CHARTS */

/*
 * INITIALIZE JARVIS WIDGETS
 */
// Setup Desktop Widgets
function setup_widgets_desktop() {

  if ($.fn.jarvisWidgets && $.enableJarvisWidgets) {

    $('#widget-grid').jarvisWidgets({
      grid: 'article',
      widgets: '.jarviswidget',
      localStorage: true,
      deleteSettingsKey: '#deletesettingskey-options',
      settingsKeyLabel: '重置设置?',
      deletePositionKey: '#deletepositionkey-options',
      positionKeyLabel: '重置位置?',
      sortable: true,
      buttonsHidden: false,
      // toggle button
      toggleButton: true,
      toggleClass: 'fa fa-minus | fa fa-plus',
      toggleSpeed: 200,
      onToggle: function () {},
      // delete btn
      deleteButton: true,
      deleteClass: 'fa fa-times',
      deleteSpeed: 200,
      onDelete: function () {},
      // edit btn
      editButton: true,
      editPlaceholder: '.jarviswidget-editbox',
      editClass: 'fa fa-cog | fa fa-save',
      editSpeed: 200,
      onEdit: function () {},
      // color button
      colorButton: true,
      // full screen
      fullscreenButton: true,
      fullscreenClass: 'fa fa-expand | fa fa-compress',
      fullscreenDiff: 3,
      onFullscreen: function () {},
      // custom btn
      customButton: false,
      customClass: 'folder-10 | next-10',
      customStart: function () {
        alert('你好, 这是一个自定义按钮...');
      },
      customEnd: function () {
        alert('下次再会...');
      },
      // order
      buttonOrder: '%refresh% %custom% %edit% %toggle% %fullscreen% %delete%',
      opacity: 1.0,
      dragHandle: 'a',
      placeholderClass: 'jarviswidget-placeholder',
      indicator: true,
      indicatorTime: 600,
      ajax: true,
      timestampPlaceholder: '.jarviswidget-timestamp',
      timestampFormat: '更新时间: %y%/%m%/%d% %h%:%i%:%s%',
      refreshButton: true,
      refreshButtonClass: 'fa fa-refresh',
      labelError: '对不起有一个错误:',
      labelUpdated: '最新更新:',
      labelRefresh: '刷新',
      labelDelete: '删除 widget:',
      afterLoad: function () {},
      rtl: false, // 暂时不能切换!
      onChange: function () {

      },
      onSave: function () {

      },
      ajaxnav: $.navAsAjax // 应当保存在本地存储里 localstorage

    });

  }

}

// Setup Desktop Widgets
function setup_widgets_mobile() {
  if ($.enableMobileWidgets && $.enableJarvisWidgets) {
    setup_widgets_desktop();
  }
}
/* ~ END: INITIALIZE JARVIS WIDGETS */

/*
 * GOOGLE MAPS
 * description: Append google maps to head dynamically
 */
var gMapsLoaded = false;
window.gMapsCallback = function () {
  gMapsLoaded = true;
  $(window).trigger('gMapsLoaded');
};
window.loadGoogleMaps = function () {
  if (gMapsLoaded)
    return window.gMapsCallback();
  var script_tag = document.createElement('script');
  script_tag.setAttribute("type", "text/javascript");
  script_tag.setAttribute("src", "http://maps.google.com/maps/api/js?sensor=false&callback=gMapsCallback");
  (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
};
/* ~ END: GOOGLE MAPS */

/*
 * LOAD SCRIPTS
 * Usage:
 * Define function = myPrettyCode ()...
 * loadScript("lib/js/my_lovely_script.js", myPrettyCode);
 */
var jsArray = {};
function loadScript(url, callback) {

  if (!jsArray[url]) {
    jsArray[url] = true;

    // adding the script tag to the head as suggested before
    var body = document.getElementsByTagName('body')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // then bind the event to the callback function
    // there are several events for cross browser compatibility
    //script.onreadystatechange = callback;
    script.onload = callback;

    // fire the loading
    body.appendChild(script);

  } else if (callback) { // changed else to else if(callback)
    Console.log("JS 文件已经加载过了!");
    //execute function
    callback();
  }
}
/* ~ END: LOAD SCRIPTS */

/*
 * APP AJAX REQUEST SETUP
 * Description: Executes and fetches all ajax requests also
 * updates naivgation elements to active
 */
if ($.navAsAjax) {
//  // 初始化自动加载首页
//  if ($('nav').length) {
//    checkURL();
//  }

  $(document).on('click', 'nav a[href!="#"]', function (e) {
    e.preventDefault();
    var $this = $(e.currentTarget);

    // if parent is not active then get hash, or else page is assumed to be loaded
    if (!$this.parent().hasClass("active") && !$this.attr('target')) {

      // update window with hash
      // 也可以做移动设备的处理:  $.device === "mobile" - and save a little more memory
      if ($.root_.hasClass('mobile-view-activated')) {
        $.root_.removeClass('hidden-menu');
        window.setTimeout(function () {
          if (window.location.search) {
            window.location.href =
              window.location.href.replace(window.location.search, '')
              .replace(window.location.hash, '') + '#' + $this.attr('href');
          } else {
            window.location.hash = $this.attr('href');
          }
        }, 150);
        // it may not need this delay...
      } else {
        if (window.location.search) {
          window.location.href =
            window.location.href.replace(window.location.search, '')
            .replace(window.location.hash, '') + '#' + $this.attr('href');
        } else {
          $("#left-panel nav").find('li').removeClass();
          $this.closest('li').siblings('li').children('ul').slideUp();
          $this.parents('li').addClass('active');
          window.location.hash = $this.attr('href');
        }
      }
    }

  });

  // fire links with targets on different window
  $(document).on('click', 'nav a[target="_blank"]', function (e) {
    e.preventDefault();
    var $this = $(e.currentTarget);
    window.open($this.attr('href'));
  });

  // fire links with targets on same window
  $(document).on('click', 'nav a[target="_top"]', function (e) {
    e.preventDefault();
    var $this = $(e.currentTarget);
    window.location = ($this.attr('href'));
  });

  // all links with hash tags are ignored
  $(document).on('click', 'nav a[href="#"]', function (e) {
    // checkURL($(this).attr('uri'));
    e.preventDefault();
  });

  // DO on hash change
  $(window).on('hashchange', function () {
    checkURL();
  });
}

// CHECK TO SEE IF URL EXISTS
function checkURL() {
  
  if(!location.hash)
    return;
  //get the url by removing the hash
  var url = location.hash.replace(/^#/,'');
  // var url = location.hash.replace(/^#/, '');
  container = $('#content');
  // Do this if url exists (for page refresh, etc...)
  if (url) {
    // remove all active class
    $('nav li.active').removeClass("active");
    // match the url and add the active class

    $('nav li:has(a[href="' + url + '"])').addClass("active");

    var title = ($('nav a[href="' + url + '"]').attr('title'));

    // change page title from global var
    document.title = (title || document.title);
    //Console.log("page title: " + document.title);

    // parse url to jquery
    drawBreadCrumb();
    loadURL(url + location.search, container,$('nav a[href="' + url + '"]').attr('path'));
  } else {

    // grab the first URL from nav
    var $this = $('nav > ul > li:first-child > a[href!="#"]');
    // update hash
    window.location.hash = $this.attr('href');
  }
}

// LOAD AJAX PAGES
function loadURL(url, container,path) {
  
  console.log(url, container,path);
  
  var test = new RegExp(location.host+'/t');
  zy.g.comm.orgpath = path;
  if(test.test(location.href))
    var _u = 'http://'+location.host+'/t/'+path+'/'+url;
  else
    var _u = 'http://'+location.host+'/ui/'+path+'/'+url;
  $.ajax({
    type: "GET",
    url: _u,
    dataType: 'html',
    cache: true,
    beforeSend: function () {
      // cog placed
      container.html('<h1><i class="fa fa-cog fa-spin"></i> Loading...</h1>');

      // Only draw breadcrumb if it is main content material
      // TODO: see the framerate for the animation in touch devices

      if (container[0] == $("#content")[0]) {
        drawBreadCrumb();
        // scroll up
        $("html").animate({
          scrollTop: 0
        }, "fast");
      }
    },
    /*complete: function(){
            // alert("complete")
		},*/
    success: function (data) {
	    var host = location.host;
	    var test = new RegExp(host+'\/t');
	    var real = test.test(location.href)?'//'+host+'/t/':'//'+host+'/ui/';
      // cog replaced here...
      // Console.log("success");
      var result = _out(data,path);
      container.css({
        opacity: '0.0'
      }).html(result).delay(50).animate({
        opacity: '1.0'
      }, 300);
      // DO NOT REMOVE : GLOBAL FUNCTIONS!
      // pageSetUp();
    },
    error: function (xhr, ajaxOptions, thrownError) {
      loadURL('404.html', container, 'paas');
      // container.html('<h4 style="margin-top:10px; display:block; text-align:left"><i class="fa fa-warning txt-color-orangeDark"></i> Error 404! 找不到网页。</h4>');
    },
    async: false
  });
  //Console.log("ajax request sent");
}

function _out(str,path) {
  var result = '';
  var htmlbuf = str;
  var out_arr = extractCss(htmlbuf.toString(), out_arr,path);
  return out_arr;
}

// html - 输入 html 的字符串, 标签名字必须小写
// css_arr - 包含有引用 js 和引用 css 的字符串数组
function extractCss(str, css_arr,path) {
  var html = str;
	var host = location.host;
	var test = new RegExp(host+'\/t');
	var real = test.test(location.href)?'//'+host+'/t/':'//'+host+'/ui/';

	function findjs() {
		find("<script ", '>', function(tag) {
			if (tag.indexOf('src=') > 0) {
        tag = tag.replace(/src="/,'src="'+real+path+'/');
				if (tag.charAt(tag.length-2) == '/') {
					return tag;
				} else {
					//return tag + "</script>";
					return tag;
				}
			}else{
        return tag;
			}
		});
	}

	function findcss() {
		find("<link", ">",function(tag){
      tag = tag.replace(/href="/,'href="'+real+path+'/');
      return tag;
		});
	}

	function find(st_tag, ed_tag, filter) {
		var st = 0;
		for (;;) {
      var st = html.indexOf(st_tag, st);
			if (st > -1) {
				var ed = html.indexOf(ed_tag, st);
				if (ed > 0) {
					ed += ed_tag.length;
					var sub = html.substring(st, ed);
					var reg = new RegExp(sub);
					filter && (changesub = filter(sub));
					html = html.replace(reg,changesub);
					st = ed;
				} else {
					st += st_tag.length;
				}
			} else {
				break;
			}
		}
	}
	findcss();
	findjs();
	//zy.log('html:'+html);
	return html;
}

// UPDATE BREADCRUMB
function drawBreadCrumb() {
  var nav_elems = $('nav li.active > a'),
    count = nav_elems.length;

  //Console.log("breadcrumb")
  $.bread_crumb.empty();
  $.bread_crumb.append($("<li></li>"));
  nav_elems.each(function () {
    $.bread_crumb.append($("<li></li>").html($.trim($(this).clone().children(".badge").remove().end().text())));
    // update title when breadcrumb is finished...
    if (!--count) document.title = $.bread_crumb.find("li:last-child").text();
  });
}
/* ~ END: APP AJAX REQUEST SETUP */

/*
 * PAGE SETUP
 * Description: fire certain scripts that run through the page
 * to check for form elements, tooltip activation, popovers, etc...
 */
function pageSetUp() {

  if ($.device === "desktop") {
    // is desktop
    Console.log("pageSetUp = desktop");
    // activate tooltips
    $("body [title]").poshytip();
    // activate tooltips
    $("[rel=tooltip]").tooltip();

    // activate popovers
    $("[rel=popover]").popover();

    // activate popovers with hover states
    $("[rel=popover-hover]").popover({
      trigger: "hover"
    });

    // activate inline charts
    runAllCharts();

    // setup widgets
    setup_widgets_desktop();

    //setup nav height (dynamic)
    nav_page_height();

    // run form elements
    runAllForms();

  } else {

    // is mobile
    Console.log("pageSetUp = mobile");

    // activate popovers
    $("[rel=popover]").popover();

    // activate popovers with hover states
    $("[rel=popover-hover]").popover({
      trigger: "hover"
    });

    // activate inline charts
    runAllCharts();

    // setup widgets
    setup_widgets_mobile();

    //setup nav height (dynamic)
    nav_page_height();

    // run form elements
    runAllForms();

  }
}

// Keep only 1 active popover per trigger - also check and hide active popover if user clicks on document
$('body').on('click', function (e) {
  $('[rel="popover"]').each(function () {
    //the 'is' for buttons that trigger popups
    //the 'has' for icons within a button that triggers a popup
    if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
      $(this).popover('hide');
    }
  });
});
