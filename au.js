/*
 *  Project: bootstrap-au
 *  Version: 0.5
 *  Author: Renhard Julindra
 *  License: MIT License
 */

 ;(function ($, window, document, undefined) {

 	var pluginName = "au",
 	dataKey = "plugin_" + pluginName;

 	var Plugin = function (element, options) {

 		this.element = element;

 		this.f = false;

 		this.options = {
 			min: 3,
 			delay: 300,
 			type: "POST",
 			url: "",
 			param: "q",
 			cur_value: "",
 			cur_text: ""
 		};

 		this.init(options);
 	};

 	Plugin.prototype = {
 		init: function (options) {
 			$.extend(this.options, options);

 			var el = this.element;
 			var opt = this.options;
 			
 			if(opt['min'] < 0) {
 				alert("Minimum characters must be >= 0");
 				return;
 			} else if(opt['delay'] < 0) {
 				alert("Delay must be >= 0");
 				return;
 			} else if(opt['type'].toLowerCase() != "post" && opt['type'].toLowerCase() != "get") {
 				alert("Request Type must be either POST or GET");
 				return;
 			} else if(opt['url'] == "") {
 				alert("URL is required");
 				return;
 			}

 			au_html = '<input class="form-control au-input"> <div class="au-message" style="display: none;"> <ul class="list-group"> <li class="list-group-item text-center"></li> </ul> </div> <div class="au-select" style="display: none;"> <ul class="list-group"> </ul> </div>'

 			el.hide();
 			el.after(au_html);
 			var au_input = el.closest('div').find('.au-input');
 			var au_select = el.closest('div').find('.au-select');
 			var au_message = el.closest('div').find('.au-message');
 			if(opt['cur_value'] != "") {
 				au_input.val(opt['cur_text']);
 				el.html('<option value="'+opt['cur_value']+'" selected>'+opt['cur_text']+'</option>');
 			}

 			el.closest('div').on('click focus', '.au-input', function(e) {
 				au_select.width(au_input.outerWidth(true));
 				au_message.width(au_input.outerWidth(true));
 				if(opt['min'] > 0) {
 					au_message.find('.list-group-item').text('Please enter '+opt['min']+' or more characters');
 					if(!el.val() && au_message.css('display') == 'none') {
 						au_message.show();
 					}	
 				} else if(!el.val()) {
 					au_input.keyup();
 				}
 				e.stopPropagation();
 			});

 			$('body').click(function(e) {
 				if(!el.val()) {
 					au_input.val('');
 					this.f = false;
 				}
 				if(au_select.css('display') != 'none') {
 					au_select.hide();
 				}
 				if(au_message.css('display') != 'none') {
 					au_message.hide();
 					e.preventDefault();
 					return;
 				}
 			});

 			el.closest('div').on('keydown', '.au-input', function(e) {
 				var now = au_select.find('.list-group-item.active');
 				var val = au_input.val();

 				if(e.keyCode == 40) {
 					if(now.length > 0) {
 						if(now.next('li').length > 0) {
 							now.next('li').addClass('active');
 							now.removeClass('active');
 							return;
 						} 
 					}
 					au_select.find('.list-group-item').removeClass('active');
 					au_select.find('.list-group-item').first().addClass('active');
 				} else if(e.keyCode == 38) {
 					if(now.length > 0) {
 						if(now.prev('li').length > 0) {
 							now.prev('li').addClass('active');
 							now.removeClass('active');
 							return;
 						}
 					}
 					au_select.find('.list-group-item').removeClass('active');
 					au_select.find('.list-group-item').last().addClass('active');
 				} else if(e.keyCode == 27) {
 					$('body').click();
 					au_input.blur();
 				} else if(e.keyCode == 13) {
 					if(now.length > 0) {
 						var text = now.text();
 						var value = now.attr('data-au-value');
 						au_input.val(text);
 						el.html('<option value="'+value+'" selected>'+text+'</option>');
 						$('body').click();
 						this.f = true;
 					}
 					e.preventDefault();
 					return;
 				} else if(e.keyCode == 8) {
 					if(el.val()) {
 						au_input.val('');
 						el.val('');
 						el.html('');
 						this.f = false;
 					}
 				} else {
 					if(el.val() && val != "" && this.f) {
 						e.preventDefault();
 						return;
 					}
 				}
 			});

 			el.closest('div').on('keyup', '.au-input', function(e) {
 				var val = au_input.val();

 				if(e.keyCode != 40 && e.keyCode != 38 && e.keyCode != 27 && e.keyCode != 13 && e.keyCode != 8) {
 					if(el.val() && val != "" && this.f) {
 						e.preventDefault();
 						return;
 					} else {
 						if(val.length < opt['min']) {
 							au_message.find('.list-group-item').text('Please enter '+(opt['min']-val.length)+' or more characters');
 							au_select.hide();
 							au_message.show();
 						} else {
 							au_message.find('.list-group-item').text('Loading');
 							au_select.hide();
 							au_message.show();

 							setTimeout(function() {
 								$.ajax({
 									type: opt['type'],
 									url: opt['url'],
 									data: opt['param']+'='+val,
 									dataType: 'json',
 									success: function(res){
 										au_select.find('.list-group').html('');

 										if(res.length > 0) {
	 										if(res.length >= 5) {
	 											for(var i=0; i<5; i++) {
	 												au_select.find('.list-group').append('<li class="list-group-item" data-au-value="'+res[i].id+'">'+res[i].text+'</li>');
	 											}
	 										} else {
	 											for(var i=0; i<res.length; i++) {
	 												au_select.find('.list-group').append('<li class="list-group-item" data-au-value="'+res[i].id+'">'+res[i].text+'</li>');
	 											}
	 										}

	 										au_message.hide();
	 										au_select.show();
	 									} else {
	 										au_message.find('.list-group-item').text('Not Found');
	 										au_select.hide();
	 										au_message.show();
	 									}
 									}
 								});
 							}, opt['delay']);
 						}
 					}
 				} else if(e.keyCode == 8) {
 					if(val.length < opt['min']) {
 						au_message.find('.list-group-item').text('Please enter '+(opt['min']-val.length)+' or more characters');
 						au_select.hide();
 						au_message.show();
 					} else {
 						au_message.find('.list-group-item').text('Loading');
 						au_select.hide();
 						au_message.show();

 						setTimeout(function() {
 							$.ajax({
 								type: opt['type'],
 								url: opt['url'],
 								data: opt['param']+'='+val,
 								dataType: 'json',
 								success: function(res){
 									au_select.find('.list-group').html('');

 									if(res.length > 0) {
 										if(res.length >= 5) {
 											for(var i=0; i<5; i++) {
 												au_select.find('.list-group').append('<li class="list-group-item" data-au-value="'+res[i].id+'">'+res[i].text+'</li>');
 											}
 										} else {
 											for(var i=0; i<res.length; i++) {
 												au_select.find('.list-group').append('<li class="list-group-item" data-au-value="'+res[i].id+'">'+res[i].text+'</li>');
 											}
 										}

 										au_message.hide();
 										au_select.show();
 									} else {
 										au_message.find('.list-group-item').text('Not Found');
 										au_select.hide();
 										au_message.show();
 									}
 								}
 							});
 						}, opt['delay']);
 					}
 				}
 			});

 			el.closest('div').on('mouseover', '.au-select .list-group-item', function() {
 				var over = $(this);
 				au_select.find('.list-group-item').removeClass('active');
 				over.addClass('active');
 			});

 			el.closest('div').on('click', '.au-select .list-group-item', function() {
 				var clicked = $(this);
 				var text = clicked.text();
 				var value = clicked.attr('data-au-value');
 				au_input.val(text);
 				el.html('<option value="'+value+'" selected>'+text+'</option>');
 				this.f = true;
 			});
 		},
 		destroy: function () {
 			this.f = false;
 		}
 	};

 	$.fn[pluginName] = function (options) {

 		var plugin = this.data(dataKey);

 		if (plugin instanceof Plugin) {
 			if (typeof options !== 'undefined') {
 				plugin.init(options);
 			}
 		} else {
 			plugin = new Plugin(this, options);
 			this.data(dataKey, plugin);
 		}

 		return plugin;
 	};

 }(jQuery, window, document));