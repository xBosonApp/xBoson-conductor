/**
 * zy_chart 依赖 zy
 * zy_chart (JS库) 当前库依赖第三方库:
 * 1)highcharts.js
 */
if (zy) {

	var zy_chart = {
		g: {
			defaultOptions: {},
			chart_model: {},
			data: {},
			serial_get: null
		},
		typeZindex: {
			area: 5,
			areaspline: 30,
			bar: 10,
			column: 10,
			line: 50,
			pie: 0,
			scatter: 10,
			spline: 20,
			arearange: 40,
			areasplinerange: 41,
			columnrange: 0
		},
		colorGroup: [["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee"], ["#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF"], ['#ccc479', '#99ced1', '#99ecf6', '#99e0b8', '#e7e1c1'], ['#b89fb5', '#8cc288', '#f5fb51', '#5d828b', '#427894'], ['#e7c6e1', '#bbd7cb', '#ffff9a', '#cdebdf', '#c5c9ba']],
		current_idx: 0
	};

	function isnul(_obj) {
		return _obj == null || _obj == '';
	}

	// 生成一个随机 id
	function genid(type_str) {
		return type_str + '_' + parseInt(Math.random() * 100000) + '_t_' + (new Date()).getTime();
	}

	function getNextColor() {
		if (++zy_chart.current_idx >= zy_chart.colorGroup.length)
			zy_chart.current_idx = 0;
		return zy_chart.colorGroup[zy_chart.current_idx];
	}

	/** _type_idx: 0:错误 1:铃铛 2:消息 3:完成 */
	function showBox(_title, _txt, _time, _type_idx, _when_hide) {

		var types = [['fa fa-warning shake animated', '#C46A69'], ['fa fa-bell swing animated', '#3276B1'], ['fa fa-shield fadeInLeft animated', '#C79121'], ['fa fa-check', '#739E73']];
		_type_idx = _type_idx || 0;
		var t = types[_type_idx];

		$.smallBox({ // smallBox bigBox
			title: _title,
			content: _txt,
			color: t[1],
			icon: t[0],
			// number : "2",
			// sound : '',
			timeout: _time || (_type_idx === 0 ? 5000 : 2000)
		}, _when_hide);
	}

	/* 相同的对话框不会重复叠加的显示 */
	function showBoxOnly(_title, _txt, _time, _type_idx) {
		var c = showBoxOnly.caller;
		if (!c.__show_boox__) {
			c.__show_boox__ = true;
			showBox(_title, _txt, _time, _type_idx, function () {
				c.__show_boox__ = null;
			});
		}
	}

	// 把 Arguments 转换为数组，给 apply 调用
	function args_to_arr(args) {
		var arr = [];
		for (var i = 0; i < args.length; ++i) {
			arr[i] = args[i];
		}
		return arr;
	}

	/**
	 * 所有实用图表的页面, 只能调用该方法
	 * 否则通用事件会触发两次
	 */
	zy_chart.pageSetUp = function () {
		$.enableJarvisWidgets = false;
		window.pageSetUp();
		$.enableJarvisWidgets = true;
	};

	/**
	 * 合并chartOption
	 * @param {Object} 对象1
	 * @param {Object} 对象2
	 */
	zy_chart.merge = function () {
		var i, args = arguments,
			len, ret = {},
			doCopy = function (copy, original) {
				var value, key;
				if (typeof copy !== 'object') {
					copy = {};
				}

				for (key in original) {
					if (original.hasOwnProperty(key)) {
						value = original[key];
						if (value && typeof value === 'object' && Object.prototype.toString.call(value) !== '[object Array]' && key !== 'renderTo' && typeof value.nodeType !== 'number') {

							copy[key] = doCopy(copy[key] || {}, value);
						} else {
							copy[key] = original[key];
						}
					}
				}
				return copy;
			};
		if (args[0] === true) {
			ret = args[1];
			args = Array.prototype.slice.call(args, 2);
		}
		len = args.length;
		for (i = 0; i < len; i++) {
			ret = doCopy(ret, args[i]);
		}
		return ret;
	};

	/**
	 * 获取窗体JQ对象并对接工具
	 *
	 * jq_section -- 存放所有创建图表的 jq 对象
	 * ready_cb   -- 加载完成模板则回调，ready_cb:function({}){...}
	 * _app_name  -- 可以 null, 默认 'EWATERBI'
	 * _page_id   -- 唯一标识该页面的 id
	 */
	zy_chart.buildChartHandle = function (jq_section, ready_cb, _app_name, _page_id, _mark) {
		var template = $('.chart-template');
		var section = jq_section;
		var t_height = {};
		var compent_id = 0;
		var page_id = _page_id || ("zcp_id_" + location.href.replace(/[/W]|[.]|#|:|[?]/g, "_"));
		// 保存所有本地配置, 在 _load_from_server() 中初始化
		var page_setup;
		var mark = _mark || 's';
		//显示用 's' 编辑用'e'
		zy_chart.g.mark = mark;

		if (template.size() < 1) {
			zy.net.loadHTML("bi/html/zy_chart_widget.html", jq_section, waitTag);
		} else {
			waitTag();
		}

		function _admin() {
			if (page_id == '4E61A380-327D-11E4-8C21-0800200C9A66' || page_id == '4E61A380-327D-11E4-8C21-0800200C9A80')
				return true;
			return false;
		}

		//$(window).unload(_save_to_server);

		function _save_to_server() {
			// console.log('save server', page_setup);
			$.each(page_setup.chart_setting, function (_id, _conf) {
				_save_a_continer(_id);
			});
		}

		// _dom_id 容器 id, 页面唯一, 通常是 _createChartCon() 中的 id
		function _save_a_continer(_dom_id) {
			var c_conf = page_setup.chart_setting[_dom_id];

			_get_data({
				mod: 'chartbi',
				api: 'html_mod_add',
				r_parm: {
					// pageid 系统画面ID, domid 界面控件 ID, modid 关联ID,  optdata 选项 pid
					pageid: page_id,
					domid: _dom_id,
					modid: c_conf.modid,
					optdata: JSON.stringify(c_conf)
				}
			}, function (msg) {
				if (msg.ret == '0') {
					showBox("保存成功", "页面设置已经保存完成", 0, 3);
				} else {
					showBox("错误", msg.msg);
				}
			});
		}

		function _load_from_server(_cb_over) {
			page_setup = { // 保存所有本地配置
				chart_setting: { /* [id]: [setting] 在 _createChartCon() 中定义 */ },
				order: {},
				date: []
			};

			_get_data({
				mod: 'chartbi',
				api: 'html_mod_sel',
				r_parm: {
					pageid: page_id
				}
			}, function (mod_configs) {
				// console.log('_load_from_server', mod_configs);
				$.each(mod_configs.mods, function (_1, _conf) {
					page_setup.chart_setting[_conf.domid] = JSON.parse(_conf.optdata);
					page_setup.order[_conf.createdt] = _conf.domid;
					page_setup.date.push(_conf.createdt);
				});
				_restore_page();
				_cb_over && _cb_over();
			});
			_updateCharts();
		}

		function _restore_page() {
			page_setup.date.sort();
			$.each(page_setup.date, function (_1, _date) {
				var _id = page_setup.order[_date];
				if (!_id)
					return;
				var _chart_setting = page_setup.chart_setting[_id];
				_restore_page.chart_id = _id;
				_createChartCon.apply(_restore_page, _chart_setting.create_parm);
			});
			_updateCharts();
		}

		// -- 取得 api 的数据并回调 ==============================
		// _success: function(msg)
		// req_model: {r_parm, mod, api}
		function _get_data(req_model, _success, _nodata_cb) {
			var thiz = this;
			if(_admin())
			  var parm = $.extend({}, req_model.r_parm,{systag:'1'});
			else
			  var parm = $.extend({}, req_model.r_parm);
			if (parm.dt_from) {
				parm.flg = parm.flg ? '1' : '0';
			}

			var _cb = function (msg) {
				try {
					if (msg) {
						_success && _success(msg);
					} else {
						_nodata_cb && _nodata_cb(msg);
					}
				} catch (E) {
//					console.log("[_get_data]", E.stack);
					thiz.errorHandler && thiz.errorHandler(E);
				}
			};

			zy.g.am.mod = req_model.mod;
			zy.g.am.app = _app_name;
			zy.net.get("api/" + req_model.api, _cb, parm);
		}

		// 不需要再调用该方法, 过时,保留只为兼容
		function _updateCharts() {
			return true;
		}

		// 对 ready_cb 参数的回调
		function waitTag() {
			template = $('.chart-template').html();
			_load_from_server(_all_over);

			function _all_over() {
				ready_cb({
					/**
					 * 创建图表窗体容器
					 * row_id     -- 图表容器的id
					 * select_url -- 条件模态框的加载地址
					 * width      -- 1～12 相对图表的宽度
					 * title      -- 显示标题
					 */
					createChartCon: _createChartCon, //(row_id, select_url, width, title)
					/**
					 * 调用该方法更新所有数据和画面，最后调用, 允许运行多次，允许异步的调用
					 * 成功返回 true, 失败或正在更新返回 false
					 */
					updateCharts: _updateCharts,
					/** 得到当前画面，图表的数量 */
					getChartCount: function () {
						return compent_id;
					},

					save_config: _save_to_server,
					load_config: _load_from_server
				});
			}

		}

		function _createChartCon(row_id, select_url, width, title) {

			var args = arguments;
			if (args.length < 1)
				return;

			// console.log('_createChartCon', args);
			++compent_id;

			var defaultSeriesType = 'column';
			// 保存内部设置数据，用于恢复视图
			var chart_setting;
			var id = null;
			var newnode = $('<div></div>').html(template);
			var chart;
			// 图表 jq 对象
			var cont;
			var row;
			// 保存钻取前层级的数据
			var old_data;
			// 为 kpi 配置画面传递数据
			var kpi_config_data = _new_kpi_config();
			var cdate = zy_chart.createDataComponent(newnode.find('.date_widget'));

			// 调用顺序很重要
			_recover_container(this);
			_init_dom();
			//    build_theme();
			_set_title(title);
			_clear_data();
			_build_kpi_setting();
			_recover_container2();
			_set_jarv_widget();
			_check_width();

			newnode._clear_data = _clear_data;

			function _init_dom() {
				newnode.removeClass('col-lg-5');
				newnode.addClass('col-lg-' + width);
				newnode.attr('id', id);
				newnode.find('.jarviswidget').attr('id', 'wid-id-' + id);

				//Jquery UI 拖拽、大小变化
				newnode.find('#KpiTree').resizable({
					minHeight: 250,
					minWidth: 150
				});
				newnode.find('#ModTree').resizable({
					minHeight: 250,
					minWidth: 150
				});
				newnode.find('#searchDiv').draggable({
					containment: '#' + id
				});
				newnode.find('#KpiTree').draggable({
					containment: '#' + id
				});
				newnode.find('#ModTree').draggable({
					containment: '#' + id
				});

				switch (mark) {
				case 'e':
					editModDom();
					break;
				default:
					showModDom();
					break;
				}

				newnode.find('#searchDiv').hide();

				// 图表 jq 对象
				cont = newnode.find('.chart-containner');
				cont.attr('id', id);

				row = $('#' + row_id);
				if (row.length < 1) {
					row = section.append("<div class='row' id='" + row_id + "'></div>").find('#' + row_id);
				}
				row.append(newnode);
				newnode.show();

				function showModDom() {
					newnode.find('[index="select"]').remove();
					newnode.find('[index="savePlate"]').show();
				}

				function editModDom() {
					newnode.find('[index="savePlate"]').siblings('.dropdown-toggle').show();
					newnode.find('[index=table]').remove();
				}
			}

			// _keep_module: true, 保留模块数据
			function _clear_data(_keep_module) {
				var opt = create_chart_opt({
					title: ''
				}, bind_event());
				chart = cont.highcharts(opt).highcharts();

				old_data = {
					yAxis: [],
					xAxis: [],
					title: [],
					series: [],
					dt_from: [],
					sub_title: [],
					kpi_configs: [],
					x_index: {},
					x_index_ar: [],
					_opposite: true,
					x_previous_val: null,
					drill_level: 0,
					x_type_parm: []
				};

				if (_keep_module) {
					kpi_config_data.x_type = null;
					kpi_config_data.kpis = [];
				} else {
					kpi_config_data = _new_kpi_config();
				}
				//      push_drilldown_title('');
			}

			function _new_kpi_config() {
				return {
					modulename: null,
					moduleid: null,
					kpis: [],
					x_type: null,
					dimtag: null,
					moduleclass: null,
					update: _update_kpi_config
				};
			}

			function _get_kpi_config() {
				return kpi_config_data;
			}

			function _delete_self() {
				_get_data({
					mod: 'chartbi',
					api: 'html_mod_del',
					r_parm: {
						pageid: page_id,
						domid: id
					}
				}, function (msg) {
					if (msg.ret != '0') {
						showBox("错误", msg.msg);
					} else {
						page_setup.chart_setting[id] = null;
						delete page_setup.chart_setting[id];
					}
				});
			}

			// 从模块中取得数据, 串行请求保证显示顺序
			function _recive_kpi_to_chart(kpis_data) {
				// console.log('[_recive_kpi_to_chart]', kpis_data);
				var ki = -1,
					_k;
				_next();

				function _next() {
					if (++ki < kpis_data.kpis.length) {
						_k = kpis_data.kpis[ki];
						request_kpi(ki, _k);
					}
				}

				function request_kpi(_1, _k) {
					_k.title = kpi_config_data.modulename;
					_k.tree_data = {
						name: _k.name,
						leveld: true
					};

					_push_data(_k, true, _filter_kpi_api, _next);
				}

			}

			// _mod : {modid: "224f9cfc379344b0916fdb2f87a8d3a0"}
			// 选择现有 mod 触发该方法
			function _select_mod(_mod) {
				// console.log('[_select_mod]', _mod);
				_read_mod_from_server(_mod.modid, function (kpis_data) {
					if (old_data.drill_level == 0) {
						chart_setting.modid = kpi_config_data.moduleid;
					}
					var rparm = kpis_data.kpis[0].r_parm;
					if (kpis_data.kpis[0].r_parm.autotime) {
						for (i in kpis_data.kpis) {
							rparm = kpis_data.kpis[i].r_parm;
							rparm.flg = false;
							rparm.dt_from = '';
							cdate.fill_default(rparm);
						}
					}
					cdate.set(rparm);
					cdate.fix(rparm);
					_recive_kpi_to_chart(kpis_data);
					push_drilldown_title(time_to_title(rparm));
				});
			}

			function _read_mod_from_server(module_id, _when_over) {
				_get_data({
					mod: 'chartbi',
					api: 'mod_json_selone',
					r_parm: {
						modid: module_id
					}
				}, function (msg) {
					// msg: { mods:[{ jsondata:'', modid, modnm, modtype, pid }] }
					var mod = msg.mods[0];
					try {
					  
						var kpis = JSON.parse(mod.jsondata);
						kpi_config_data.moduleid = mod.modid;
						kpi_config_data.modulename = mod.modnm;
						kpi_config_data.moduleclass = mod.modtype;
						kpi_config_data.fileid = mod.fileid;
					//console.log(mod.jsondatakpis,kpi_config_data);
						if (mod.shareable == '1')
							kpi_config_data.shareable = mod.shareable;
						else
							kpi_config_data.shareable = '0';
						_when_over && _when_over(kpis);
					} catch (E) {
						zy.log('_read_mod_from_server : Err', E.stack || E);
					}
				});
			}

			function _recover_container(_caller) {
				if (_caller == _restore_page) {
					id = _caller.chart_id;
					chart_setting = page_setup.chart_setting[id];
				} else {
					id = genid('_ncc_' + page_id);
					chart_setting = page_setup.chart_setting[id] = {
						create_parm: args_to_arr(args),
						modid: null
					};
				}
				//console.log('[load mod]', chart_setting);
			}

			function _recover_container2() {
				if (chart_setting.modid) {
					_read_mod_from_server(chart_setting.modid, function (kpis_data) {
						var rparm = kpis_data.kpis[0].r_parm;
						if (kpis_data.kpis[0].r_parm.autotime) {
							for (i in kpis_data.kpis) {
								rparm = kpis_data.kpis[i].r_parm;
								rparm.flg = false;
								rparm.dt_from = '';
								cdate.fill_default(rparm);
							}
						}
						cdate.set(rparm);
						cdate.fix(rparm);
						_recive_kpi_to_chart(kpis_data);
						push_drilldown_title(time_to_title(rparm));
						_show_all_button();
					});
				}
			}

			function _show_all_button() {
				var items = ['save', 'config', 'clear', 'table', 'search', 'saveAs', 'SearchDiv'];
				zy_chart._showOrHide(newnode, items, true);
				zy_chart._btnDisable(newnode, items, false);
				newnode.find(".form-group").show();
				zy_chart.g.kpiconfig = _get_kpi_config();
			}

			// 当点击'配置'画面的确定/保存时回调, 更新画面显示
			// event: { act : 'save/submit/beforeSave', moduleid : 'xxxx' }
			function _update_kpi_config(event) {
				if (event.act == 'beforeSave') {
					// 点击 '保存' 按钮, 保存画面上的时间
					$.each(kpi_config_data.kpis, function (i, kpi) {
						kpi.r_parm = cdate.get();
					});
					return;
				}

				if (event.moduleid) {
					kpi_config_data.moduleid = event.moduleid;
				}
				if (old_data.drill_level == 0) {
					chart_setting.modid = kpi_config_data.moduleid;
				}
				if (event.act == 'submit') {
					zy_chart._btnDisable(newnode, ['save', 'saveAs'], false);
				}
				// console.log('[save mod.]', event.act, chart_setting, kpi_config_data);

				send_all_kpi_update();
				_clear_kpis_arr();
				_set_title(kpi_config_data.modulename);
				//      push_drilldown_title('');
			}

			function send_all_kpi_update() {
				$.each(kpi_config_data.kpis, function (_1, _kpi) {
					_kpi.update({
						action: 'display'
					});
				});
			}

			function _clear_kpis_arr() {
				var new_kpis = [];
				$.each(kpi_config_data.kpis, function (_1, k) {
					if (!k.removed) {
						new_kpis.push(k);
					}
				});
				kpi_config_data.kpis = new_kpis;
				if(kpi_config_data.kpis.length === 0){
				  kpi_config_data.dimtag = '';
          newnode.find('#KpiTree').hide();
          newnode.find("#KpiTree").find("ul").empty();
          newnode.find('[index=select]').html('显示KPI列表');
				}
			}

			function _set_jarv_widget() {

				function silderbarinit(columnstr) {
					var silderbar = "显示/隐藏: ";
					$.each(columnstr, function (i, type) {
						$.each(type, function (j, val) {
							if ("title" == j) {
								silderbar = silderbar + "-<a class='toggle-vis' data-column='" + i + "'>" + val + "</a>"
							}
						});
					});
					$('#zy_slider_bar').html(silderbar);
				}

				//datatable-初始化按钮点击事件
				function datatable_init(options) {
					jQuery.fn.dataTableExt.oSort['chinese-asc'] = function (x, y) {
						//javascript 本身提供的本地化比较函数。
						return x.localeCompare(y);
					};

					jQuery.fn.dataTableExt.oSort['chinese-desc'] = function (x, y) {
						return y.localeCompare(x);
					};

					jQuery.fn.dataTableExt.aTypes.push(function (sData) {
						var reg = /^[\u4e00-\u9fa5]{0,}$/;
						if (reg.test(sData)) {
							return 'chinese';
						}
						return null;
					});

					function buildHeader() {
						var arr = [];
						$.each(options.columns, function (i, v) {
							arr.push(v.title);
						});
						return arr;
					}

					function buildData() {
						return options.data;
						var str = '';
						$.each(options.data, function (i, v) {
							str += (JSON.stringify(v) + '+');
						});
						return str.replace(/(\+$)/g, "");
					}

					function OutData(str) {
						var condition = kpi_config_data.kpis[0].r_parm.dt_from + ' ~ ' + kpi_config_data.kpis[0].r_parm.dt_to;
						zy.g.am.mod = 'chartbi';
						zy.g.am.app = _app_name;
//						zy.g.am.app = 'EWATERBI';
						var r_parm = {
							chartdata: str,
							filenm: kpi_config_data.fileid,
							rowcount: options.data.length,
							colcount: options.data[0].length || 0,
							condition: condition
						};
						zy.net.postDownload("download/chart_prol_build", r_parm);
					}

					function buildAForm(obj) {
						var paramform = $('[name=file]').closest('form');
						paramform.children('input').remove();
						$('<input type="hidden">').attr('name', 'modid').val(obj.moduleid).appendTo(paramform);
						$('<input type="hidden">').attr('name', 'up_type').val('chart').appendTo(paramform);
						return paramform;
					}

					/*dataTable初始化参数 */
					var dataTable = {
						"language": {
							"sProcessing": "处理中...",
							"sLengthMenu": "显示 _MENU_ 项结果",
							"sZeroRecords": "没有匹配结果",
							"sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
							"sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
							"sInfoFiltered": "(由 _MAX_ 项结果过滤)",
							"sInfoPostFix": "",
							"sSearch": "搜索:",
							"sUrl": "",
							"sEmptyTable": "表中数据为空",
							"sLoadingRecords": "载入中...",
							"sInfoThousands": ",",
							"oPaginate": {
								"sFirst": "首页",
								"sPrevious": "上页",
								"sNext": "下页",
								"sLast": "末页"
							},
							"oAria": {
								"sSortAscending": ": 以升序排列此列",
								"sSortDescending": ": 以降序排列此列"
							}
						},
						"searching": false,
						// "autoWidth": true,
						"paging": true,
						// "ordering": true,
						// "info": true,
						// "destroy": true,
						// "scrollY": "auto",
						// "scrollCollapse": true,
						// "scrollX": true
					};
					// 合并初始化参数选项
					$('[index=fileName]').val(kpi_config_data.fileid)
					dataTable = $.extend({}, dataTable, options);
					var table = $('#zy_table').DataTable(dataTable);
					var dataTableS = $.extend({}, dataTable);
					dataTableS.paging = false;
					$('#ods').DataTable(dataTableS);
					$('#ods_wrapper').hide();
					$(".dataTables_length").removeClass("dataTables_length");

					silderbarinit(options.columns);

					$('a.toggle-vis').on('click', function (e) {
						e.preventDefault();
						var column = table.column($(this).attr('data-column'));
						column.visible(!column.visible());
					});

					$('[index=outData]').click(function () {
						var str = $('#ods').table2CSV({
							separator: ',',
							delivery: 'value',
							header: buildHeader()
						});
						OutData(str);
					})

					$('[index=upfile]').click(function () {
						if ($('[index=fileName]').val() != '') {
						  zy.g.am.app = _app_name;
							zy.g.am.mod = 'chartbi';
							zy.net.postForm("upload/uploadchart", buildAForm(kpi_config_data), function (msg) {
								if (msg) {
									//var fileid = msg.path[0].fileid;
									var filenm = msg.result[0].file_name;
									_get_data({
										api: 'mod_fileid_add',
										mod: 'chartbi',
										r_parm: {
											modid: kpi_config_data.moduleid,
											fileid: filenm
										}
									}, function (msg) {
										kpi_config_data.fileid = filenm;
										$('[index=fileName]').val(filenm);
										zy.ui.msg('提示信息', '模板上传成功', 's');
									});
								}
							});
						} else
							zy.ui.msg('提示信息', '请点击选择新模板', 'w');
					})
				}

				// 初始化窗体
				var _title = newnode.find('.chart-title').html();
				_set_title('');
				$.enableJarvisWidgets = false;
				var widopt = get_jar_options(_delete_self);
				if (mark == 'e') {
					widopt.deleteButton = false;
					widopt.toggleButton = false;
				}
				newnode.jarvisWidgets(widopt);
				$.enableJarvisWidgets = true;
				_set_title(_title);

				newnode.find('[index=search]').click(function () {
					$.each(kpi_config_data.kpis, function (_1, conf) {
						conf.update({
							action: 'date'
						});
					});
				});

				newnode.find('[index=table]').click(function () {
				  zy_chart.g.appnm = _app_name;
					var options = get_table_data();
					if (options.data.length > 0) {
						$.enableJarvisWidgets = false;
						zy.net.loadHTML("bi/html/zy_chart_table.html", $(".modelform"));
						datatable_init(options);
						$.enableJarvisWidgets = true;
					} else {
						showBoxOnly('数据表格', '表格中没有数据', 3000, 1);
					}
				});

				newnode.find('[index=savePlate]').click(function () {
					chart_setting.modid = kpi_config_data.moduleid;
					_save_a_continer(id);
				});
			}

			function _check_width() {
				newnode.find('.jarviswidget-fullscreen-btn').click(function () {
					newnode.find('#searchDiv').hide();
					newnode.find('#KpiTree').hide();
					newnode.find('#ModTree').hide();
					newnode.find("#KpiTree").find("ul").children().remove();
					newnode.find("#ModTree").find("ul").children().remove();
					newnode.find('[name=oldmod]').html('显示模块列表');
					newnode.find('[index=select]').html('显示KPI列表');
					newnode.find('[index=SearchDiv]').html('显示查询条件');
					if ($('#jarviswidget-fullscreen-mode').length > 0) {
						newnode.find('#searchDiv').draggable({
							containment: '#' + newnode.attr('id')
						});
						newnode.find('#KpiTree').draggable({
							containment: '#' + newnode.attr('id')
						});
						newnode.find('#ModTree').draggable({
							containment: '#' + newnode.attr('id')
						});
					} else {
						newnode.find('#searchDiv').draggable({
							containment: '#jarviswidget-fullscreen-mode'
						});
						newnode.find('#KpiTree').draggable({
							containment: '#jarviswidget-fullscreen-mode'
						});
						newnode.find('#ModTree').draggable({
							containment: '#jarviswidget-fullscreen-mode'
						});
					}
					setTimeout(function () {
						chart.reflow();
					}, 300);
				});
			}

			function buildModTree(json, parent) {
				var parent = newnode.find("#ModTree").find('ul');
				var result = json;

				var setting = {
					view: {
						showTitle: false,
						selectedMulti: false,
						showIcon: false,
						dblClickExpand: false
					},
					data: {
						key: {
							name: 'name'
						},
						simpleData: {
							enable: false
						}
					},
					edit: {
						drag: {
							isCopy: false,
							isMove: false
						},
						showRenameBtn: false,
						showRemoveBtn: false,
						enable: true,
					},
					callback: {
						onClick: onClick
					}
				};

				function onClick(event, treeId, treeNode, clickFlag) {
					if (!treeNode.children) {
						newnode._clear_data();
						newnode.find('.jarviswidget-editbox').show();
						zy_chart._showOrHide(newnode, ['config', 'clear', 'table', 'search', 'SearchDiv'], true);
						zy_chart._btnDisable(newnode, ['save', 'config', 'clear', 'table', 'search', 'saveAs', 'SearchDiv'], false);
						newnode.find(".form-group").show();
						newnode.find('[index="mod"]').show();
						_select_mod({
							modid: treeNode.modid
						});
					}
				}

				var zTreeObj = $.fn.zTree.init(parent, setting, result);
			};

			function buildKpiTree(json, newnode, whenDrop) {

				function buildSelData(_json) {
					var arr = [];
					$.each(_json, function (i, v) {
						if (v.children) {
							$.each(v.children, function (ii, vv) {
								if (!vv.isHidden) {
									arr.push({
										id: vv.name,
										name: vv.name,
										text: vv.name
									});
								}
							});
						}
					});
					return arr;
				}

				function SearchInput(_json) {
					newnode.find('[index=searchTree]').select2('destroy');
					newnode.find('[index=searchTree]').zySelectCustomData('', false, {}, buildSelData(_json));
				}

				newnode.find('[index=searchTree]').change(function () {
					$('.selectnode').removeClass('selectnode');
					if ($(this).parent().children('input').val() != '') {
						var name = $(this).parent().children('input').val();
						var nodes = zTreeObj.getNodeByParam("name", name, null);
						zTreeObj.selectNode(nodes);
						$('#' + nodes.tId + '_a').addClass('selectnode');
					}
				});

				var parent = newnode.find("#KpiTree").find('.ztree');
				var result = json;

				function _each(json) {
					$.each(json, function (i, v) {
						if (v.children) {
							_each(v.children);
						} else {
							v.isParent = true;
						}
					});
				}

				_each(result);

				var setting = {
					view: {
						showTitle: false,
						selectedMulti: false,
						showIcon: false,
						dblClickExpand: false
					},
					data: {
						key: {
							name: 'name'
						},
						simpleData: {
							enable: false
						}
					},
					edit: {
						drag: {
							isCopy: false,
							isMove: false
						},
						showRenameBtn: false,
						showRemoveBtn: false,
						enable: true,
					},
					callback: {
						onClick: onClick,
						onExpand: onExpand
					}
				};

				function onExpand(event, treeId, treeNode) {
					if (treeNode.level > 0) {
						if (!treeNode.children) {
							getIndex(treeNode);
						}
					} else {
						if (treeNode.children && treeNode.children.length > 0) {
							$.each(treeNode.children, function (i, v) {
								if (kpi_config_data.dimtag && (v.dimtag != kpi_config_data.dimtag))
									zTreeObj.hideNode(v);
								else
									zTreeObj.showNode(v);
							});
						}
					}
				}

				function onClick(event, treeId, treeNode, clickFlag) {
					if (treeNode.level > 0) {
						whenDrop(treeNode, function () {
							if (kpi_config_data.dimtag && kpi_config_data.dimtag!='') {
								var hideNodes = zTreeObj.getNodesByFilter(filter, false)
								zTreeObj.hideNodes(hideNodes);
								SearchInput(zTreeObj.getNodes());
							}
						});
						newnode.find('.jarviswidget-editbox').show();
						zy_chart._showOrHide(newnode, ['config', 'clear', 'table', 'search', 'SearchDiv'], true);
						zy_chart._btnDisable(newnode, ['save', 'config', 'clear', 'table', 'search', 'saveAs', 'SearchDiv'], false);
						newnode.find(".form-group").show();
						newnode.find('[index="mod"]').show();
					}
				}

				function getIndex(treeNode) {
					_get_data({
						mod: treeNode.moduleid,
						api: treeNode.apiid,
						parm: { // 不需要数据, 只要求结构
							dt_type: 4,
							dt_from: '1800-01-01',
							dt_to: '1800-01-01'
						}
					}, function (msg) {
						if (msg.kpilist) {
							$.each(msg.kpilist[0].apidata, function (index, value) {
								var newNode = {};
								newNode.name = value.name;
								newNode.apiid = treeNode.apiid;
								newNode.moduleid = treeNode.moduleid;
								newNode.leveld = 'i';
								newNode.dimtag = treeNode.dimtag;
								zTreeObj.addNodes(treeNode, newNode);
							});
						}
					});

				}

				var zTreeObj = $.fn.zTree.init(parent, setting, result);

				function filter(node) {
					return (node.level > 0) && (node.dimtag != kpi_config_data.dimtag);
				}

				if (kpi_config_data.dimtag && kpi_config_data.dimtag!='') {
					var hideNodes = zTreeObj.getNodesByFilter(filter, false)
					zTreeObj.hideNodes(hideNodes);
				}

				SearchInput(zTreeObj.getNodes());
			};

			function _build_kpi_setting() {
				function whenDrop(_data, whenOver) {
					_push_data({
						mod: _data.moduleid,
						api: _data.apiid,
						title: _data.name,
						dimtag: _data.dimtag,
						tree_data: _data, // 由 tree 传入的数据保存在 _chart_model 中
						r_parm: cdate.get()
					}, true, _filter_kpi_api, whenOver);

					return kpi_config_data;
				}

				function buildkpimenu() {
					function _classAndMod(json) {
						if (json != "undefined" && json.length > 0) {
							for (var i in json) {
								if (json[i].name == '用户自定义') {
									if (json[i].children.length > 0) {
										$.each(json[i].children, function (ii, v) {
											$('#zy_chart_saveAs').find('.widget-body').find('.dropdown-menu').append('<li><a>' + v.modtype + '</a></li>')
										});
									} else {
										zy.ui.msg('提示', '用户未定义分类', 's');
									}
								} else {
									zy.ui.msg('提示', '请创建新分类', 's');
								}
							}
						} else {}
					}

					newnode.find("[index = 'select']").click(function () {
						newnode.find('#ModTree ul').empty();
						newnode.find('#ModTree').hide();
						var Tree = newnode.find("#KpiTree").find("ul").children();

						if (Tree.length > 0) {
							$(this).html('显示KPI列表');
							newnode.find("#KpiTree").find("ul").children().remove();
							newnode.find('#KpiTree').hide();
						} else {
							$(this).html('关闭KPI列表');
							newnode.find('#KpiTree').show();

							_get_data({
								mod: 'chartbi',
								api: 'chartkpiall'
							}, function (msg) {
								newnode.find('[name="oldmod"]').html("显示模块列表");
								newnode.find(".tree").find('ul').children().remove();
								newnode.find('[index=searchTree]').val('');
								buildKpiTree(msg.mods, newnode, whenDrop);
								reflow();
							});
						}
					});

					newnode.find("[index='closeKpi']").click(function () {
						newnode.find("#KpiTree").find("ul").children().remove();
						newnode.find('#KpiTree').hide();
						newnode.find('[index="select"]').html('显示KPI列表');
						newnode.find("[name='oldmod']").html('显示模块列表');
						reflow();
					});

					newnode.find("[name='oldmod']").click(function () {
						newnode.find("#KpiTree").hide();
						newnode.find("#KpiTree").find("ul").children().remove();

						if (newnode.find("#ModTree li").length > 0) {
							$(this).html('显示模块列表');
							newnode.find("#ModTree").find("ul").children().remove();
							newnode.find('#ModTree').hide();
						} else {
							$(this).html('关闭模块列表');

							zy_chart._showOrHide(newnode, ['saveAs'], true);
							newnode.find('#KpiTree').hide();
							newnode.find('#ModTree').show();
							newnode.find('[index="mod"]').show();
							_get_data({
								mod: 'chartbi',
								api: 'mod_json_sel'
							}, function (msg) {
								newnode.find('[index="select"]').html("显示KPI列表");
								newnode.find("#ModTree").find('ul').children().remove();
								buildModTree(msg.pids, newnode, _select_mod);
								reflow();
							});
						}
					});

					newnode.find("[index = 'closeMod']").click(function () {
						newnode.find('[index="select"]').html('显示KPI列表');
						newnode.find("[name='oldmod']").html('显示模块列表');
						newnode.find("#ModTree").find("ul").children().remove();
						newnode.find("#KpiTree").find("ul").children().remove();
						newnode.find('#ModTree').hide();
						reflow();
					})

					newnode.find("[index='SearchDiv']").click(function () {
						if (newnode.find("[index='minSearchDiv']").closest('div.navbar-form:visible').length > 0) {
							$(this).html("显示查询条件");
							newnode.find("[index='minSearchDiv']").closest('div.navbar-form').hide();
						} else {
							$(this).html("关闭查询条件");
							newnode.find("[index='minSearchDiv']").closest('div.navbar-form').show();
						}
					})

					newnode.find("[index='closeSearchDiv']").click(function () {
						newnode.find("[index='SearchDiv']").html('显示查询条件');
						$(this).closest('div.navbar-form').hide();
					})

					newnode.find("[index='minSearchDiv']").click(function () {
						if ($(this).children('i').hasClass('fa-minus')) {
							$(this).closest('div.navbar-form').css('width', '20%');
							$(this).children('i').removeClass('fa-minus');
							$(this).children('i').addClass('fa-plus');
							$(this).parent().siblings().hide();
						} else {
							$(this).closest('div.navbar-form').css('width', '55%');
							$(this).parent().siblings().show();
							$(this).children('i').removeClass('fa-plus');
							$(this).children('i').addClass('fa-minus');
						}
					})
				};

				function initWidget() {
					newnode.find('#KpiTree').hide();
					newnode.find('#ModTree').hide();
					newnode.find('[index="mod"]').hide();
					zy_chart._showOrHide(newnode, ['config', 'clear', 'table', 'search'], false);
					zy_chart._btnDisable(newnode, ['save', 'saveAs'], true);

					newnode.find(".form-group").hide();
					newnode.find('.input-sm').val('');

					newnode.find("[index='saveAs']").click(function () {
					  zy_chart.g.appnm = _app_name;
						zy_chart.g.kpiconfig = _get_kpi_config();
						zy_chart.g.kpiconfig._admin = _admin();
						if (zy_chart.g.kpiconfig.kpis.length == 0)
							return false;
						zy.net.loadHTML("bi/html/zy_chart_saveAs.html", $(".modelform"));
					});

					newnode.find("[index ='reset']").click(function () {
						zy_chart._showOrHide(newnode, ['config', 'clear', 'table', 'search'], false)
						newnode.find(".form-group").hide();
						zy_chart._btnDisable(newnode, ['save'], true);
						newnode.find(".widget-body").find("ul").children().remove();
						$(this).btnDisable(true);
					});

					newnode.find("[name='newmod']").click(function () {
						newnode.find(".jarviswidget-editbox").hide();
						newnode.find(".form-group").hide();
						zy_chart._showOrHide(newnode, ['saveAs', 'config', 'clear', 'search'], false);
						zy_chart._btnDisable(newnode, ['save', 'saveAs'], true);
						newnode.find('#ModTree').hide();
						newnode.find('[index="select"]').html("显示KPI列表");
						newnode.find(".tree").find('ul').children().remove();
						newnode.find('#KpiTree').show();

						_clear_data();
						_get_data({
							mod: 'chartbi',
							api: 'chartkpiall'
						}, function (msg) {
							newnode.find(".tree").find('ul').children().remove();
							newnode.find('[index=searchTree]').val('');
							buildKpiTree(msg.mods, newnode, whenDrop);
							reflow();
						});
					});

					newnode.find('[index="config"]').click(function () {
					  zy_chart.g.appnm = _app_name;
						zy_chart.g.kpiconfig = _get_kpi_config();
						zy.net.loadHTML("bi/html/zy_chart_selectTable.html", $(".modelform"));
					});

          newnode.find('[index="clear"]').click(function() {
            zy_chart._btnDisable(newnode, ['config', 'clear', 'table', 'search', 'save'], true);
            if (newnode.find("#KpiTree").is(':visible')) {
              newnode.find("#KpiTree").find("ul").children().remove();
              //          newnode.find('#KpiTree').hide();
              _get_data({
                mod : 'chartbi',
                api : 'chartkpiall'
              }, function(msg) {
                newnode.find('[name="oldmod"]').html("显示模块列表");
                newnode.find(".tree").find('ul').children().remove();
                newnode.find('[index=searchTree]').val('');
                buildKpiTree(msg.mods, newnode, whenDrop);
                reflow();
              });
            }
            newnode.find("#searchDiv").hide();
            newnode.find('[index="SearchDiv"]').btnDisable(true);
            newnode.find('[index="SearchDiv"]').html("显示查询条件");
            _clear_data();
            _set_title(kpi_config_data.modulename);
          });

					newnode.find('[index="save"]').click(function () {
					  zy_chart.g.appnm = _app_name;
						zy_chart.g.kpiconfig = _get_kpi_config();
						var _api = {
							mod: 'chartbi',
							api: 'mod_json_add',
							r_parm: {
								modid: zy_chart.g.kpiconfig.moduleid,
								modnm: zy_chart.g.kpiconfig.modulename,
								jsondata: JSON.stringify(zy_chart.g.kpiconfig),
								modtype: zy_chart.g.kpiconfig.moduleclass,
								shareable: zy_chart.g.kpiconfig.shareable
							}
						}

						zy_chart.g.kpiconfig._admin = _admin();
						if (zy_chart.g.kpiconfig._admin)
							_api.r_parm.systag = '1'
						if (zy_chart.g.kpiconfig.kpis.length == 0)
							return false;
						if (zy_chart.g.kpiconfig.moduleid == null || zy_chart.g.kpiconfig.moduleid == '') {
							zy.net.loadHTML("bi/html/zy_chart_saveAs.html", $(".modelform"));
						} else {
							zy_chart.g.kpiconfig.update({
								act: 'beforeSave'
							});
							_get_data(_api, function (msg) {
								zy_chart.g.kpiconfig.update({
									act: 'save',
									moduleid: msg.res[0].data
								});
								$('#zy_chart_selectTable').modal('hide');
								zy.ui.msg("提示信息：", "模块:  " + zy_chart.g.kpiconfig.modulename + "  修改成功", "s");
							});
						}
					});

					zy_chart.pageSetUp();
				};

				function reflow() {
					chart.reflow();
				}

				buildkpimenu();
				initWidget();
			}

			/** 作为 _push_data() 的过滤器, 如果拖动一个指标则过滤器他指标 */
			function _filter_kpi_api(_msg, _chart_model) {
				//      return;
				// 有 level 则是单个指标
				if (!_chart_model.tree_data.leveld)
					return;

				var api_datas = _msg.kpilist[0].apidata;
				var _new_datas = [];

				$.each(api_datas, function (i, _kpi) {
					if (_kpi.name == _chart_model.tree_data.name) {
						_new_datas.push(_kpi);
					}
				});
				_msg.kpilist[0].apidata = _new_datas;
			}

			function _set_title(txt) {
				newnode.find('.chart-title').html(txt);
			}

			//XXX 无效，未完成
			//    function build_theme() {
			//      var toolbar = newnode.find('.jarviswidget-editbox .widget-toolbar');
			//      zy_chart.buildThemeButton(toolbar, function(_theme) {
			//        console.log('bt', chart.options, _theme);
			//        // 不能简单修改options，而是逐项修改 chart 的属性，重新调用 构造函数会导致钻取错误
			//        $.extend(true, chart.options, _theme);
			//        //chart.setOptions(_theme);
			//        chart.options.credits.enabled = !chart.options.credits.enabled;
			//        chart.redraw(false);
			//      });
			//    }

			function time_to_title(parm) {
				return parm.flg ? parm.dt_from + ' ~ ' + parm.dt_to : parm.dt_from;
			}

			function push_drilldown_title(title, sub_title) {
				if (!chart)
					return;
				sub_title && old_data.sub_title.push(sub_title);
				chart.setTitle({
					text: title
				}, {
					text: old_data.sub_title.join(' > ')
				}, false);
			}

			function get_table_data() {
				var options = {
					data: [],
					columns: [{
						title: kpi_config_data.dimtag,
          }]
				};
				var data = [];

				$.each(chart.xAxis[0].categories, function (i, x) {
					data[i] = [x];
				});

				$.each(chart.series, function (i, s) {
					var col = i + 1;
					options.columns[col] = {
						title: s.name + ' (' + s.options.unit + ')'
					};
					$.each(s.data, function (j, d) {
						data[d.x][col] = d.y;
					});
				});

				$.each(data, function (r, d) {
					if (d.length > 1) {
						for (var cc = options.columns.length - 1; cc >= 0; --cc) {
							if (!d[cc])
								d[cc] = '';
						}
						options.data.push(d);
					}
				});

				data = null;
				return options;
			}

			function bind_event() {
				return {
					drilldown: _drill_down,
					drillup: _drill_up
					//redraw: function() {alert(111) }
					//click:  _config_chart
				};
			}

			function check_dimTag(msg) {
				if (!kpi_config_data.dimtag) {
					kpi_config_data.dimtag = msg.kpilist[0].dimtag;
					return false;
				} else {
				  if(kpi_config_data.dimtag == '')
				    return false;
					return !(kpi_config_data.dimtag == msg.kpilist[0].dimtag);
				}
			}

			/** 类型不同返回 true */
			function check_x_type(msg) {
				try {
					var x_type = cdate.parseType(msg.datelist[0].datelists);
					if (x_type < 0) {
						x_type = msg.kpilist[0].x_type;
					}

					if (!kpi_config_data.x_type) {
						kpi_config_data.x_type = x_type;
						return false;
					} else {
						var ii = 0,
							jj = 0,
							equal = true;
						$.each(kpi_config_data.x_type, function (k, v) {
							equal = (x_type[k] == v) && equal;
							++ii;
						});
						$.each(x_type, function () {
							++jj
						});
						return false;
					}
				} catch (E) { /* 不用担心 */ }

				return false;
			}

			/**
       _chart_model: {
       mod: 'scjk', api: 'scjk1',
       title: '水厂供水量与耗电量',
       r_parm: { dt_from: '2014-01', dt_to: '2014-06'}
       }
       */
			function _push_data(_chart_model, _is_currnet_level, _data_filter, _when_over) {
				// this -> drill: {add_series:[], series_count:[], sub_title:'', event:{} }
				var drill = this;

				_get_data.call(drill, _chart_model, function (msg) {
					var series = [];

					if (check_x_type(msg) || check_dimTag(msg)) {
					  zy.log(check_x_type(msg));
					  zy.log(check_dimTag(msg));
						showBox('无效的操作', '当前指标的数据与图表中数据格式不兼容, 无法合并');
						return;
					}

					_data_filter && _data_filter(msg, _chart_model);
					build_y_axis(msg);
					build_x_axis(msg, drill.series_count == 0);
					build_series(msg, series, _chart_model);

					if (_is_currnet_level) {
						$.each(series, function (_i, s) {
							chart.addSeries(s, false);
						});
					} else {
						$.each(series, function (_i, s) {
							if (drill.series_count == 0) {
								chart.addSeriesAsDrilldown(drill.event.point, s, old_data.drill_level);
							} else {
								chart.addSeries(s, false);
								drill.add_series.push(s.id);
							}
							drill.series_count++;
						});
					}

					var maintitle = kpi_config_data.modulename || _chart_model.title || msg.title;
					_set_title(maintitle);
					//        push_drilldown_title('');
					chart.redraw();
					_when_over && _when_over();
				});
				return this;
			}

			function create_chart_opt(_api_data, _events) {
				var _options = {
					colors: getNextColor(),
					title: {
						text: _api_data.title
					},
					chart: {
						events: _events,
						defaultSeriesType: defaultSeriesType
					},
					legend: {
						/*
             layout: 'vertical',
             align: 'right',
             verticalAlign: 'middle',
             borderWidth: 0 */
					},
					tooltip: {},
					yAxis: [{
						title: ''
          }],
					xAxis: { /* lineWidth: 0, */
						categories: []
					},
					series: [ /* {  name: '无数据', data: [] } */ ],
					credits: {
						enabled: false
					},
					drilldown: {
						drillUpButton: {
							position: {
								y: 0,
								x: 0
							}
						}
					}
				};

				return _options;
			}

			function build_y_axis(_api_data) {
				var y_index = {};
				var kpilist = _api_data.kpilist[0].apidata;

				$.each(kpilist, function (i, k) {
					var y_id = k.unit;
					if (y_id == null || y_id == '')
						y_id = k.name;
					y_index[k.name] = i;
					k.y_id = y_id;

					if (!chart.get(y_id)) {
						var y_opt = {
							gridLineInterpolation: 'polygon',
							labels: {
								formatter: function () {
									return trans_num(this.value) + k.unit;
								}
							},
							title: {
								text: '' /*k.name*/
							},
							opposite: old_data._opposite,
							//options:  {index: i},
							id: y_id
						};
						old_data._opposite = !old_data._opposite;
						chart.addAxis(y_opt, false, false);
					}
				});

				_api_data.y_index = y_index;
			}

			function build_x_axis(_api_data, clear_x) {
				var x_index;
				var x = chart.xAxis[0];

				if (clear_x) {
					x.categories = [];
					x_index = old_data.x_index = {};
				} else {
					x_index = old_data.x_index || {};
				}

				if (_api_data.datelist) {
					$.each(_api_data.datelist, function (i, v) {
						var date = v.datelists;
						if (x_index[date] == null) {
							x.categories.push(date);
							x_index[date] = x.categories.length - 1;
						}
					});
				}

				old_data.x_index = _api_data.x_index = x_index;
			}

			function build_series(_api_data, series, _chart_model) {
				var names = {};
				var kpilist = _api_data.kpilist[0].apidata;
				var y_index = _api_data.y_index;
				var _x_type = _api_data.kpilist[0].x_type;
				var _notice = [];

				$.each(kpilist, function (i, kpi) {
					var _dats = [];
					var _name = kpi.name;
					var _drilldown = (kpi.kpiid && kpi.kpiid != '');
					var _series_id = _chart_model.mod + '_' + _chart_model.api + '_' + _name + '_' + old_data.drill_level;
					var _type = _chart_model.type || kpi.type || defaultSeriesType;

					// 不创建重复的数据项目
					if (chart.get(_series_id)) {
						_notice.push(_name);
						return;
					}

					series.push({
						name: _name,
						type: _type,
						data: _dats,
						yAxis: kpi.y_id,
						id: _series_id,
						unit: kpi.unit,
						zIndex: zy_chart.typeZindex[_type]
						//xAxis:      _api_data.x_id
					});

					api_data_to_series_data(_api_data, _dats, _name, kpi, _get_drill_module);

					// 压入 '配置' 画面的数据
					var kpi_conf = {
						mod: _chart_model.mod, // 当前指标获取数据的 mod(接口所在的模块)
						api: _chart_model.api, // 当前指标获取数据的 kpi
						kpiid: kpi.kpiid, // 保留
						name: _name, // 指标名称
						unit: kpi.unit, // 指标单位
						type: _type, // 图表显示类型
						r_parm: _chart_model.r_parm, // 请求 kpi 的参数
						visible: _chart_model.visible || 1, // 0/1 可见性

						drill_moduleid: _chart_model.drill_moduleid, // 用来钻取数据的模块id (模块是一个抽象的表)
						drill_modulename: _chart_model.drill_modulename, // 用来钻取数据的模块名称

						// event = {action:'', ...},
						// action: [date, 修改了查询时间] [display, 修改了显示]
						update: function (event) {
							if (!event)
								return;

							switch (event.action) {
							case 'date':
								_update_time(kpi_conf, _name, kpi, _series_id, _get_drill_module);
								break;

							case 'display':
								_update_display(kpi_conf, _series_id);
								break;
							}
						}
					};

					cdate.rmNotDate(kpi_conf.r_parm);
					kpi_config_data.kpis.push(kpi_conf);
					chart.reflow();

					function _get_drill_module() {
						return kpi_conf;
					}

				});
				// [End] $.each(kpilist

				if (_notice.length > 0) {
					showBox("拖拽的指标已经在图表中", _notice.join(','), null, 2);
				}

				function _update_display(kpi_conf, _series_id) {
					if (kpi_conf.removed) {
						chart.get(_series_id).remove();
					} else {
						var _series = chart.get(_series_id);
						_series.update({
							type: kpi_conf.type
						});
						_series.setVisible(kpi_conf.visible == 1);
					}
				}

				function _update_time(kpi_conf, _name, _kpi, _series_id, _get_drill_module) {
					var _n_chart_model = $.extend({}, _chart_model, true);
					kpi_conf.r_parm = _n_chart_model.r_parm = $.extend({}, _chart_model.r_parm, cdate.get());
					cdate.rmNotDate(kpi_conf.r_parm);
					push_drilldown_title(time_to_title(kpi_conf.r_parm));

					_get_data(_n_chart_model, function (msg) {
						var _series_data = [];
						_filter_kpi_api(msg, _chart_model);

						build_x_axis(msg, true);
						api_data_to_series_data(msg, _series_data, _name, _kpi, _get_drill_module);

						var _ser = chart.get(_series_id);
						_ser.setData(_series_data);
						_ser.userOptions.data = _series_data;
						//chart.redraw();
					});
				}

				function api_data_to_series_data(_api_data, _series_data, _name, kpi, _get_drill_module) {
					var _x_index = _api_data.x_index;
					$.each(_api_data.data, function (i, d) {
						var dd = {
							name: (kpi.type == 'pie' ? d.datetag : undefined),
							y: parseFloat(d[_name]),
							x: _x_index[d.datetag],
							drilldown: true,
							drill_data: {
								mod: kpi.mod, // 保留
								kpiid: kpi.kpiid, // 保留
								x_type: {}, // 当前 kpi 要传递给下一级 kpi 的参数
								get_drill_conf: _get_drill_module
							},
							events: {
								// click : function(_e) { console.log('点击数据', _e); }
							}
						};

						if (dd.x != undefined) {
							if (_x_type && _x_type.length) {
								$.each(_x_type, function (_i, _name) {
									dd.drill_data.x_type[_name] = d[_name];
									//xxx old_data.x_type_parm.push(dd.drill_data.x_type);
								});
							}
							_series_data.push(dd);
						}
					});
				} // [End] api_data_to_series_data

			} // [End] build_series

			function _drill_up(_e) {
				if (old_data.drilling)
					return;
				// 恢复x
				chart.xAxis[0].categories = old_data.xAxis.pop();
				old_data.x_index = old_data.x_index_ar.pop();

				// 恢复数据
				$.each(old_data.series.pop(), function (i, sid) {
					chart.get(sid).remove();
				});

				// 还原日期条件
				old_data.x_previous_val = old_data.dt_from.pop();

				// 还原 xxoo!
				kpi_config_data = old_data.kpi_configs.pop();
				old_data.x_type_parm.pop();

				// 恢复标题
				old_data.sub_title.pop();
				//      push_drilldown_title('');
				_set_title(kpi_config_data.modulename);

				old_data.drill_level--;
				chart.redraw();
			}

			function _drill_down(_e) {
				if (old_data.drilling)
					return;
				old_data.drilling = true;

				var chart = this;
				var drill_data = _e.point.drill_data;
				var kconf = drill_data.get_drill_conf();

				if (!kconf.drill_moduleid) {
					//        showBoxOnly('钻取数据', '该指标没有配置钻取,' + '请点击 "配置图表" 按钮配置钻取.', 0, 2);
					old_data.drilling = false;
					return;
				}

				var add_series = [];
				var bind_data = {
					add_series: add_series,
					series_count: 0,
					sub_title: '',
					event: _e,
					errorHandler: drill_rollback
				};

				drill_submit();

				function drill_submit() {
					old_data.kpi_configs.push(kpi_config_data);
					old_data.series.push(add_series);
					old_data.dt_from.push(old_data.x_previous_val);
					old_data.drill_level++;
					old_data.xAxis.push(chart.xAxis[0].categories);
					old_data.x_index_ar.push(old_data.x_index);
					kpi_config_data = _new_kpi_config();
					old_data.x_type_parm.push(drill_data.x_type);
				}

				function drill_rollback() {
					old_data.drilling = false;
					_drill_up();
				}

				_read_mod_from_server(kconf.drill_moduleid, function (kpis_data) {
					var k_idx = -1;
					if (kpis_data.kpis.length > 0) {
						_next_kpi();
					} else {
						showBoxOnly('钻取数据', '在 [' + kpi_config_data.modulename + '] 中没有收到任何数据，请配置该 MOD 后重试.', 6000, 2);
						drill_rollback();
					}

					function _next_kpi() {
						if (++k_idx < kpis_data.kpis.length) {
							get_a_kpi(kpis_data.kpis[k_idx]);
						} else {
							old_data.drilling = false;
						}
					}

					function get_a_kpi(_k) {
						_k.title = kpi_config_data.modulename;
						_k.tree_data = {
							name: _k.name,
							leveld: true
						};
						_k.r_parm = _parse_parm(_e.point.category, drill_data);
						// 多层钻取需要把之前的扩展查询条件组合
						$.each(old_data.x_type_parm, function (i, _x) {
							_k.r_parm = $.extend({}, _x, _k.r_parm);
						});
						_push_data.call(bind_data, _k, false, _filter_kpi_api, _next_kpi);
					}

				});
			}
      
      function _use_data_format(strto) {
        var _len =strto.length;
        var _year=strto.substring(0,4);
        var _month=strto.substring(_len-2); 
        if("04"==_month||"06"==_month||"09"==_month||"11"==_month) {
          strto+='-30';
        } else if("02"==_month){
          if((_year%4==0 && _year%100!=0)||(_year%100==0 && _year%400==0)) {
           strto+='-29';
          } else {
            strto+='-28';
          }
        } else {
          strto+='-31';
        }
        return strto;
      }
        
			// x_val - 当图表元素被点击,
			//         x 轴的实际数据, 作为参数传递到这里
			function _parse_parm(x_val, _drill_data) {
				var parm = $.extend({
					dt_from: null,
					dt_to: null,
					flg: false,
					dt_q: 0,
					dt_type: 0
				}, _drill_data.x_type);

				if (cdate.parseType(x_val) > 0) {
					_use_data(x_val);
				} else {
					if (old_data.x_previous_val) {
						_use_data(old_data.x_previous_val);
					} else {
						parm = $.extend(parm, cdate.get());
					}
				}
				
				function _use_data(_d) {
					var type = cdate.parseType(_d);

					// 如果x轴是日期, 则展开这个日期(把年转为当年的12个月)
					// 该方法只有在钻取时会被调用
					if (type > 0) {
						var fr = _d,
							to = _d,
							tp = type;
						switch (type) {
						case 1:
							fr += '-01';
							to += '-12';
						case 3:
							fr += '-01';
							to =_use_data_format(to);
						}
						if (++tp == 2)
							tp++;
						if (tp > 4)
							tp = 4;

						parm.dt_type = tp;
						parm.dt_from = fr;
						parm.dt_to = to;
						parm.flg = true;
						old_data.x_previous_val = _d;
						cdate.fix(parm);
					}
				}

				return cdate.completed(parm);
			} // [End] _parse_parm

			function trans_num(n) {
				if (_t(100000000, '亿'))
				;
				else if (_t(10000000, '千万'))
				;
				else if (_t(1000000, '百万'))
				;
				else if (_t(10000, '万'))
				;
				else if (_t(1000, '千'))
				;

				function _t(nn, xx) {
					if (n >= nn) {
						n = (n / nn).toFixed(2).replace(/\.00|0$/g, '') + xx;
						return true;
					}
					return false;
				}

				return n;
			}

			return {
				/**
				 * 并使用 api 提供的数据构建
				 * __chart_model -- 提供给图表的数据模型 {
				 *     mod       -- api 所在的 mod
				 *     api       -- 读取数据的api，同时作为新创建的窗体标签的 id，会被创建图表的函数引用
				 *     title     -- 图表标题
				 *     type      -- 显示类型
				 *     r_parm    -- 请求 api 的扩展参数
				 * }
				 */
				pushData: function (__chart_model) {
					_push_data(__chart_model, true);
				},
				/** 原始数据会被抹除 */
				clear_data: _clear_data,
				/** 设置容器的标题 */
				set_title: _set_title, // f(title)
				id: id,
				chart_obj: chart,
				container: cont
			}
		} // [End] _createChartCon

	};
	// [End] buildChartHandle

	/**
	 * 日期控件
	 */
	zy_chart.createDataComponent = function (parent_jq, option) {

		zy.net.loadHTML("bi/html/zy_chart_date.html", parent_jq)

		var i_fr = parent_jq.find('[index=dt_from]'),
			i_to = parent_jq.find('[index=dt_to]'),
			i_ty = parent_jq.find('[index=dt_type]'),
			i_fs = parent_jq.find('[index=dt_flag_state]'),
			i_fl = parent_jq.find('[index=dt_flag]');

		// dt_type: 1、年，2、（季），3、月，4、日,
		var DT_YEA = 1,
			DT_MON = 3,
			DT_DAY = 4,
			DT_SEA = 2;

		var date_parm_key = {
			dt_from: 1,
			dt_to: 1,
			dt_type: 1,
			flg: 1,
			dt_q: 1,
			autotime: 1
		};

		i_fr.css({
			cursor: 'cell'
		});
		i_to.css({
			cursor: 'cell'
		});
		i_ty.change(function () {
			_changeDate(i_ty.val());
		}).prop('checked', true).trigger('change');

		i_fl.change(function () {
			if (!this.checked) {
				i_fs.html('时间点');
				i_to.fadeOut();
			} else {
				i_fs.html('时间段');
				i_to.fadeIn();
			}
		}).prop('checked', true).trigger('change');

		/** 如果日期为空，则实行默认日期　*/
		function _auto_date(_parm) {
			if (_parm.flg) {
				if ((!isnul(_parm.dt_from)) && (!isnul(_parm.dt_to)))
					return;
			} else {
				if (!isnul(_parm.dt_from))
					return;
			}

			var now = new Date();
			_parm.autotime = true;

			function _fdate(y, m, d) {
				return (now.getFullYear() + y) + '-' + _2(now.getMonth() + 1 + m) + '-' + _2(now.getDate() + d);
			}

			function _2(_n) {
				return _n < 10 ? '0' + _n : _n;
			}

			if (parse_data(_parm.dt_from) < 0) {
				switch (parseInt(_parm.dt_type)) {
				case DT_DAY:
					_parm.dt_from = _fdate(0, 0, -1);
					break;
				case DT_MON:
					_parm.dt_from = _fdate(0, -1, 0);
					break;
				case DT_YEA:
					_parm.dt_from = _fdate(-1, 0, 0);
					break;
				case DT_SEA:
					break;
					//XXX季度未处理
				}
			}

			if (_parm.flg) {
				_parm.dt_to = _parm.dt_from;
			}
		} // [End] _auto_date

		function remove_x_parm(r_parm) {
			$.each(r_parm, function (k, v) {
				if (!date_parm_key[k]) {
					r_parm[k] = null;
					delete r_parm[k];
				}
			});
		}

		function _get_data_parm() {
			// flg: true 是范围, false 相同的日期
			var _parm = {
				dt_from: i_fr.val(),
				dt_to: i_to.val(),
				dt_type: parseInt(i_ty.val()),
				flg: i_fl.prop('checked'),
				dt_q: 0,
				autotime: false
			};

			_auto_date(_parm);
			if (!_parm.flg)
				_parm.dt_to = _parm.dt_from;
			return _fix_date(_completed_date(_parm));
		}

		function _set_data_parm(_r_parm) {
			i_fr.val(_r_parm.dt_from);
			i_to.val(_r_parm.dt_to);
			i_fl.prop('checked', _r_parm.flg).trigger('change');
			/* dt_from / dt_to 是年月日格式，不能直接传递给控件，
       利用　_changeDate　做格式转换 */
			(_r_parm.dt_type != DT_SEA) && _changeDate(DT_DAY);
			i_ty.val(_r_parm.dt_type);
			_changeDate(_r_parm.dt_type);
		}

		function _fix_date(_r_parm) {
			function __fix_date(date_str) {
				switch (parseInt(_r_parm.dt_type)) {
				case DT_YEA:
					date_str = date_str.replace(/-[0-9]{1,2}-/g, '-01-');
				case DT_MON:
					date_str = date_str.replace(/-[0-9]{1,2}$/g, '-01');
				case DT_DAY:
				case DT_SEA:
					//XXX季度未处理
				}
				return date_str;
			}


			_r_parm.dt_from = __fix_date(_r_parm.dt_from);
			_r_parm.dt_to = __fix_date(_r_parm.dt_to);
			return _r_parm;
		}

		/** 补全不完整的日期 */
		function _completed_date(_data_parm) {
			function _comp(_field) {
				switch (parse_data(_data_parm[_field])) {
				case DT_YEA:
					_data_parm[_field] += '-01';
				case DT_MON:
					_data_parm[_field] += '-01';
				case DT_DAY:
				case DT_SEA:
					//XXX 季度未完成
				}
			}

			_comp('dt_from');
			_comp('dt_to');
			return _data_parm;
		}

		function _season(_input) {
			var season = 0;
			var old_html, season_html = '<tr><td colspan="7">' + '<span class="season month" season="1">第一季度</span>' + '<span class="season month" season="2">第二季度</span>' + '<span class="season month" season="3">第三季度</span>' + '<span class="season month" season="4">第四季度</span>' + '</td></tr>';

			function _gpk() {
				return _input.data('datepicker').picker;
			}

			function _remove() {
				_input.off('click', set_html);
				_input.off('changeYearFillover', set_html);
				_input.off('changeDate', change_date);
				_input.off('change', _picker_event_change);
				set_html({}, old_html);
				_input.removeData('removeSeason');

				var d = _input.datepicker('getDate');
				if (d.getDay() > 0) {
					d.setMonth([0, 3, 6, 9][d.getMonth()]);
					_input.datepicker('setDate', d);
				}
			}

			function set_html(_e, _h) {
				var jq = _gpk().find(".datepicker-months tbody");
				old_html = jq.html();
				jq.html(_h || season_html);
				jq.find('.season').css({
					clear: 'both',
					width: '100%'
				});
				jq.find('[season=' + season + ']').addClass('active');
			}

			function change_date(_e) {
				var d = _e.date;
				if (d) {
					season = d.getMonth() + 1;
				}
			}

			function month_season(d, q) {
				if (!q) {
					if (d.getMonth() < 3)
						q = 1;
					else if (d.getMonth() > 8)
						q = 4;
					else if (d.getMonth() < 6)
						q = 2;
					else
						q = 3;
				}
				season = q;
				d.setMonth(q - 1);
				return d;
			}

			function _picker_event_change() {
				_input.off('change', _picker_event_change);
				var d = _input.datepicker('getDate');

				if (d.getFullYear() > 0) {
					month_season(d);
					_input.datepicker('setDate', d);
				}
			}


			_input.on('change', _picker_event_change);
			_input.on('changeDate', change_date);
			_input.on('changeYearFillover', set_html);
			_input.click(set_html);
			_input.data('removeSeason', _remove);
		}

		function _changeDate(_dtype) {
			var date_opt, func;

			(func = i_fr.data('removeSeason')) && func();
			(func = i_to.data('removeSeason')) && func();

			switch (parseInt(_dtype)) {
			case DT_YEA:
				date_opt = {
					forceParse: false,
					format: "yyyy",
					minViewMode: 2,
					startView: 1
				};
				break;
			case DT_SEA:
				date_opt = {
					format: "yyyy,m季度",
					minViewMode: 1
				};
				_season(i_fr);
				_season(i_to);
				break;
			case DT_MON:
				date_opt = {
					forceParse: false,
					format: "yyyy-mm",
					minViewMode: 1
				};
				break;
			case DT_DAY:
				date_opt = {
					format: "yyyy-mm-dd"
				};
				break;
			default:
				throw new Error("无效的数据格式:" + _dtype);
			}

			date_opt = $.extend({}, date_opt, {
				language: "zh-CN",
				autoclose: true
			});

			_set_datepicker(i_fr, date_opt);
			_set_datepicker(i_to, date_opt);
		}

		function _set_datepicker(_dt_input, _opt) {
			var od = _dt_input.datepicker('getDate');

			if (isNaN(od.getTime())) {
				od = _dt_input.val();
			}
			_dt_input.datepicker('remove');
			_dt_input.datepicker(_opt);
			_dt_input.datepicker('setDate', od);
		}

		function parse_data(_d) {
			if (/^[0-9]{4}$/g.test(_d)) {
				return 1;
			}
			if (/^[0-9]{4}-[0-9]{1,2}$/g.test(_d)) {
				return 3;
			}
			if (/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/g.test(_d)) {
				return 4;
			}
			if (/^[1-4]季$/g.test(_d)) {
				return 2;
			}
			return -1;
		}

		return {
			// 日期类型
			DT_DAY: DT_DAY,
			DT_YEAR: DT_YEA,
			DT_MONTH: DT_MON,
			DT_SEASON: DT_SEA

			// 改变控件中时间的(类型)格式,               并保持原日期数据不变
			// function(int:[date type num])
			,
			changeType: _changeDate

			// 补全日期,                例: 2014 -> 2014-01-01
			// function(object:[date_parm_key])
			,
			completed: _completed_date

			// 依据 dt_type 的类型,                修正日期值,
			// 例: dt_type:DT_YEAR, 2014-03-05 -> 2014-01-01
			// function(object:[date_parm_key])
			,
			fix: _fix_date

			// 设置日期到控件
			// function(object:[date_parm_key])
			,
			set: _set_data_parm

			// 从控件取得日期,                返回的日期经过了有效性／格式检查及补全
			// function() : return object:[date_parm_key]
			,
			get: _get_data_parm

			// 删除除日期之外的所有扩展查询条件
			// function(object:[date_parm_key])
			,
			rmNotDate: remove_x_parm

			// 如果日期为空，则实行默认日期
			// function(object:[date_parm_key])
			,
			fill_default: _auto_date

			// 解析日期格式,                返回格式id, 非日期返回 -1
			// function(string:'yyyy-mm-dd') : return int
			,
			parseType: parse_data
		}
	};

	zy_chart._showOrHide = function (node, obj, show) {
		$.each(obj, function (index, value) {
			if (show == true) {
				node.find('[index=' + value + ']').show();
			} else {
				node.find('[index=' + value + ']').hide();
			}
		});
	};

	zy_chart._btnDisable = function (node, obj, show) {
		$.each(obj, function (index, value) {
			if (show != true) {
				node.find('[index=' + value + ']').btnDisable(false);
			} else {
				node.find('[index=' + value + ']').btnDisable(true);
			}
		});
	};

	zy_chart._getMsg = function (obj, func) {
		var _cb = function (msg) {
			if (msg) {
				func(msg);
			}
		};
		zy.g.am.app = obj.app || zy_chart.g.appnm;
		zy.g.am.mod = obj.mod;
		if (typeof (obj.parm) != 'undefined') {
			zy.net.post("api/" + obj.api, _cb, obj.parm);
		} else {
			zy.net.post("api/" + obj.api, _cb);
		}
	};

	/**
	 * 更改主题
	 * @param {Object} jquery对象
	 * @param {Object} 主题对象
	 */
	zy_chart.changeTheme = function (obj, themes) {
		$.each(zy_chart.g.defaultOptions, function (index, value) {
			if (obj.highcharts().options.title.text == index) {
				obj.highcharts(zy_chart.merge(value, themes));
			}
		});
	};

	zy_chart.buildThemeButton = function (_parent, _cb_when_select) {
		var menu = _parent.find('ul');
		var _theme = theme;
		// 全局变量

		addTheme('默认', 'bg-color-white', {});

		$.each(_theme, function (name, value) {
			addTheme(value.name, value.className, _theme[name]);
		});

		function addTheme(title, className, _theme_obj) {
			var _id = genid('theme_id');
			menu.append("<li><span data-original-title='" + title + "' data-placement='top'" + "     rel='tooltip' class='" + className + "' id='" + _id + "'></span></li>");

			menu.find('#' + _id).click(function () {
				_cb_when_select(_theme_obj, title);
			});
		}

	};

	zy_chart.init_tooltip = function () {};

	function get_jar_options(on_delete) {
		return {
			grid: 'article',
			widgets: '.jarviswidget',
			localStorage: true,
			deleteSettingsKey: '.deletesettingskey-options',
			settingsKeyLabel: '重置设置?',
			deletePositionKey: '.deletepositionkey-options',
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
			onDelete: function () {
				on_delete && on_delete()
			},
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
			dragHandle: '> header',
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
			onChange: function () {},
			onSave: function () {},
			ajaxnav: $.navAsAjax // 应当保存在本地存储里 localstorage
		};
	}

} // [End] if