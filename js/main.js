var App;

window.dhtmlHistory.create({
	toJSON: function(o) {
		return JSON.stringify(o);
	}
	, fromJSON: function(s) {
		return JSON.parse(s);
	}
});

(function(App){
	"use strict";
	var Main = function(){
		this.getConfig(function(r, t){
			var modules = Object.keys(r.modules)
			t.buildMenu(modules);

			t.start(r);
		});
	}

	/**
	 * Gets the main site configuration
	 * @return {json} Configuration
	 */
	Main.prototype.getConfig = function(callback) {
		var t = this;
		new Vi({url:'config.json', response: 'object'}).server(function(r){
			if(typeof callback === 'function'){
				callback(r, t);
			}
		});
	};

	Main.prototype.start = function(r) {
		var lang = this.browserLanguage();
		var modules = {};

		for(var k in r.modules){
			if(r.modules.hasOwnProperty(k)){
				modules[k] = {nombre: k, url:r.url};
			}
		}

		var j = {name: 'ExpMan', modules:modules, div:'#container', _div: '#container', currentLang: lang};
		this.a = new AppSystem(j);
		

		App = this.a;
		window.App = App;
		this.a._data = r;
		var t = this;

		this.initializeWallets(this, function(t){
			t.searchWallets(t, function(t){
				dhtmlHistory.initialize();
				dhtmlHistory.addListener(t.handleHistory);

				t.a.init(function(){
					var initialModule = dhtmlHistory.getCurrentLocation();
					if(initialModule == '/' || initialModule == ''){
						t.loadCategory('wallets');
					}else{
						var c = initialModule.substr(1);
						t.loadCategory(c);
					}
				});
			});
		});
	};

	Main.prototype.handleHistory = function(newLocation, historyData) {
		var category = newLocation.substr(1);
		m._cat = category;
		if(typeof m.a.current === 'object'){
			m.loadCategory(category);
		}
	};

	Main.prototype.buildMenu = function(modules) {
		this.menu = document.getElementById('main-menu');
		for(var i = 0, len = modules.length; i < len; i++){
			var m = modules[i];
			var li = document.createElement('li');
			li.id = 'm-'+m;

			var a = document.createElement('a');
			a.setAttribute('data-ltag', m);
			a.setAttribute('data-module', m);

			li.appendChild(a);
			this.menu.appendChild(li);

			a._t = this;
			a.addEventListener('click', function(){
				var category = this.getAttribute('data-module');
				this._t.loadCategory(category);
			});
		}
	};

	Main.prototype.cleanMenuCategory = function() {
		var lis = document.querySelectorAll('#main-menu>li');
		for(var i = 0, len = lis.length; i < len; i++){
			var li = lis[i];
			li.className = '';
		}
	};

	Main.prototype.activeMenuCategory = function(category) {
		var el = document.getElementById('m-'+category);
		this.cleanMenuCategory();
		el.className = 'active';
	};

	Main.prototype.loadCategory = function(category) {
		dhtmlHistory.add('/'+category, {message: "Module " +category});
		this.activeMenuCategory(category);

		this.a.div = this.a._div;
		this.a.getModule(category);
		this.a.current.start();
	};

	Main.prototype.browserLanguage = function() {
		var lang = navigator.language || navigator.userLanguage;
		lang = lang.match(/([a-z]+)/gi);
		if(lang !== null){
			lang = lang[0];
		}

		var l = '';
		switch(lang){
			case 'es':
				l = lang;
			break;
			default:
			case 'en':
				l = lang;
			break;
		}

		return l;
	};

	//Initialize Wallets
	Main.prototype.initializeWallets = function(obj, callback){
		callback = (typeof callback !== 'function') ? function(){} : callback;

		var mainStructure = App._data.mainStructure;
		mainStructure.name = 'bank';
		var bank = DB(mainStructure);
		bank.initialize(function(){
			App.bank = bank;
			callback(obj);
		});
	}

	//Search for existing wallets
	Main.prototype.searchWallets = function(obj, callback){
		callback = (typeof callback !== 'function') ? function(){} : callback;

		App.bank.search('wallets', 'by_name', '', 'all', function(wallets){
			App.wallets = wallets;
			App._wallets = [];
			
			callback(obj);
		});	
	}

	window._App = new Main();
})(App);

//Code thanks to Jake Trent
//http://rockycode.com/blog/addremove-classes-raw-javascript/

function hasClass(ele,cls) {
  return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

function addClass(ele,cls) {
  if (!hasClass(ele,cls)) ele.className += " "+cls;
}

function removeClass(ele,cls) {
  if (hasClass(ele,cls)) {
      var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
      ele.className=ele.className.replace(reg,' ');
  }
}

//Code thanks to Gabriele Romanto
//Modified by Victor Quiroz in Oct 2013
//http://gabrieleromanato.name/javascript-implementing-the-fadein-and-fadeout-methods-without-jquery/
(function() {
	"use strict";
	var FX = function(j){
		j = (typeof j === 'object') ? j : {};

		var defaults = {
			duration: 500,
			delay: 0,
			complete: function(){},
			easing: 'linear'
		}

		for(var k in defaults){
			if(defaults.hasOwnProperty(k)){
				if(j.hasOwnProperty(k) === false){
					j[k] = defaults[k];
				}else if(typeof j[k] !== typeof defaults[k]){
					console.log("There's been an error receiving '"+k, j);
					j[k] = defaults[k];
				}
			}
		}

		for(var k in j){
			if(j.hasOwnProperty(k)){
				this[k] = j[k];
			}
		}
	}

	FX.prototype.linear = function(progress) {
		return progress;
	};

	FX.prototype.quadratic = function(progress) {
		return Math.pow(progress, 2);
	};

	FX.prototype.swing = function(progress) {
		return 0.5 - Math.cos(progress * Math.PI) / 2;
	};

	FX.prototype.circ = function(progress) {
		return 1 - Math.sin(Math.acos(progress));
	};

	FX.prototype.back = function(progress, x) {
		return Math.pow(progress, 2) * ((x + 1) * progress - x);
	};

	FX.prototype.bounce = function(progress) {
		for(var a = 0, b = 1, result; 1; a += b, b /=2) {
			if(progress >= (7 - 4 * a) / 11){
				return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
			}
		}
	};

	FX.prototype.elastic = function(progress, x) {
		return Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * x / 3 * progress);
	};

	FX.prototype.animate = function(options) {
		var start = new Date;
		var t = this;
		var id = setInterval(function() {
			var timePassed = new Date - start;
			var progress = timePassed / t.duration;
			if (progress > 1) {
				progress = 1;
			}
			t.progress = progress;
			var delta = options.delta(progress);
			options.step(delta);
			if (progress == 1) {
				clearInterval(id);
				t.complete();
			}
		}, this.delay || 10);
	};

	FX.prototype.fadeOut = function(element) {
		var to = 1;
		var t = this;

		this.animate({
			delta: function(progress) {
				progress = t.progress;
				return t.swing(progress);
			},
			complete: t.complete,
				step: function(delta) {
				element.style.opacity = to - delta;
			}
		});
	}

	FX.prototype.fadeIn = function(element) {
		var to = 0;
		var t = this;

		this.animate({
			delta: function(progress) {
				progress = t.progress;
				return t.swing(progress);
			},
			complete: t.complete,
			step: function(delta) {
				element.style.opacity = to + delta;
			}
		});
	}

    window.FX = function(j){
    	return new FX(j);
    };
})()