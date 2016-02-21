var zy_time = function () {
  Init()
  function Init(cb) {
    // loadScript("lib/js/plugin/bootstrap-timepicker/bootstrap-timepicker.min.js");

  }


  function time_ss() {
    var option = {
      id: 'ss'
    };
  // console.log('time_ss', option)
    var show = function (con) {
      var length = con.find('table tr:eq(0) td').length;
      if (length > 1) {
        con.find('table tr').each(function () {
          $(this).children(':lt(4)').remove();
        })
      }

      con.attr('index', '0088')

    }
    var input = buildInput(show, null, option);
    $(input).attr('index', '0088')

    return input
  }

  function time_ss_mm() {
    var option = {
      id: 'mm'
    };
    var show = function (con) {
      var length = con.find('table tr:eq(0) td').length;
      if (length > 3) {
        con.find('table tr').each(function () {
          $(this).children(':lt(2)').remove()
        })
      }
      con.attr('index', '0089')

    }
    var input = buildInput(show, null, option);
    window.ss=input

    return input
  }

  function time_ss_mm_hh() {
    var option = {
      id: 'hh'
    };

    var input = buildInput(null, null, option);


    return input
  }

  function time_hh() {
    var option = {
      id: 'hour'
    };
    var show = function (con) {
      var length = con.find('table tr:eq(0) td').length;
      if (length > 1) {
        con.find('table tr').each(function () {
          $(this).children(':gt(0)').remove();
        })
      }

      con.attr('index', '0090');

    }
    var input = buildInput(show, null, option);
    $(input).attr('index', '0090');
    return input
  }

  function buildInput(show, hide, option) {
    // console.log('buildInput', option)

    var input = $('<input>');
    var true_input = $('<input>');

    input.css({ position: 'absolute', 'z-index': '-1' });


    true_input.attr({
      'type': 'text',
      'placeholder': '时间',
      'name': 'task_time'
    });

    true_input.on('click', function() {
      true_input.parent().prepend(input);
      var pos = true_input.offset();
      input.offset(pos);

      input.trigger('click');
    });
    
    // input.focus(function(){
    //   console.log(1)
    //   // var value=input.val()
    //   // if(value!==''){
    //   //   input.val('00:'+value);
    //   // }
    //   input.val('00:00:00')
    // })
    input.timepicker({
      showSeconds: true,
      secondStep: 10,
      showMeridian: false,
      minuteStep: 5,
      defaultTime: false,
    });

    input.on('show.timepicker', function (e) {
      // console.log(2)
      var tar = $('.bootstrap-timepicker-widget ');
      tar.attr('style', 'z-index:999999');
      show && show(tar);
    });

    input.on('changeTime.timepicker', function (e) {
      // console.log(3, e.time.seconds, input.val())

      // if (option.id == 'mm') input.val(e.time.value);
      // if (option.id == 'hour') input.val(e.time.value);

      if (option.id == 'ss') true_input.val(e.time.seconds);
      else if (option.id == 'mm') true_input.val(e.time.minutes + ':' + e.time.seconds);
      else if (option.id == 'hour') true_input.val(e.time.hours);
      else true_input.val(input.val());
    });

    input.on('hide.timepicker', function(e) {
      // console.log(e.time.value)
      window.ee=e

      //     var a=e.time.value
      // var times=a.split(':');
      // var values=[times[1],times[2]].join(':');
      // setTimeout(
      //   function(){
      //   if(option.id == 'ss') input.val(times[2]);
      // if(option.id == 'mm') input.val(values);
      // if(option.id == 'hour') input.val(times[0]);
      // },1000)
    });


    // input.focus(function(){
    //   console.log('index')
    // })


    // $('.bootstrap-timepicker-widget ').blur(function () {
    //   var tar=$('.bootstrap-timepicker-widget ')
    //   tar.css('z-index', '-999999');
    // hide&&hide()
    // });

    return true_input
  }


  function week() {
    var select = $('<select>');
    select.attr({
      'class': 'form-control',
      'name': 'task_interval'
    })
    var datas = [{
      "title": "周一",
      "value": '1'
    },
      {
        "title": "周二",
        "value": '2'
      },
      {
        "title": "周三",
        "value": '3'
      },
      {
        "title": "周四",
        "value": '4'
      },
      {
        "title": "周五",
        "value": '5'
      },
      {
        "title": "周六",
        "value": '6'
      }, {
        "title": "周日",
        "value": '7'
      }]

    $.each(datas, function (i, v) {
      var options = $('<option>');
      options.attr('value', v.value);
      options.html(v.title);
      select.append(options);
    })

    return select


  }

  function months() {
    var select = $('<select>');
    select.attr({
      'class': 'form-control',
      'name': 'task_date'

    })
    var datas = [{
      "title": "一月",
      "value": '1'
    },
      {
        "title": "二月",
        "value": '2'
      },
      {
        "title": "三月",
        "value": '3'
      },
      {
        "title": "四月",
        "value": '4'
      },
      {
        "title": "五月",
        "value": '5'
      },
      {
        "title": "六月",
        "value": '6'
      }, {
        "title": "七月",
        "value": '7'
      }, {
        "title": "八月",
        "value": '8'
      }, {
        "title": "九月",
        "value": '9'
      }, {
        "title": "十月",
        "value": '10'
      }, {
        "title": "十一月",
        "value": '11'
      }, {
        "title": "十二月",
        "value": '12'
      }]

    $.each(datas, function (i, v) {
      var options = $('<option>');
      options.attr('value', v.value);
      options.html(v.title);
      select.append(options);
    })

    return select
  }

  function days(month) {
    var match = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    var select = $('<select>');

    select.attr({
      'class': 'form-control',
      'name': 'task_interval'
    });
    var days = match[month || 2];

    for (var i = 1; i < days + 1; i++) {
      var options = $('<option>');
      options.attr('value', i);
      options.html(i);
      select.append(options);
    }

    return select
  }

  return {
    ss: time_ss,
    mm: time_ss_mm,
    hh: time_ss_mm_hh,
    hour: time_hh,
    week: week,
    month: months,
    day: days
  }
}