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
				t.get_chosenWallet(t, function(t, chosen){
					dhtmlHistory.initialize();
					dhtmlHistory.addListener(t.handleHistory);

					var chosen_wallet = chosen;
					for(var i = 0, len = App.wallets.length; i < len; i++){
						var wallet = App.wallets[i];
						if(chosen !== null && chosen.idWallet === wallet.idWallet){
							chosen_wallet = wallet;
						}
					}

					t.openWallet(chosen_wallet, function(){
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

		this.a.bank.search('wallets', 'by_name', '', 'all', function(wallets){
			App.wallets = wallets;
			App._wallets = [];
			
			callback(obj);
		});	
	}

	Main.prototype.openWallet = function(wallet, callback) {
		if(wallet === null){
			callback();

			return;
		}
		
		if(this.a._wallet !== undefined){
			delete this.a._wallet;
		}

		var d = datetoUTC();
		var arr = {idWallet: wallet.idWallet};
		arr.date = d.date;
		arr.time = d.time;

		arr = [arr];

		App._chosen = wallet;
		
		var request = window.indexedDB.open(wallet.name);
		var t = this;

		request.onsuccess = function(event) {
			var wallet_db = request.result;

			var mainStructure = App._data.walletStructure;
			mainStructure.name = wallet_db.name;
			var wallet = DB(mainStructure);
			App._wallet = wallet;
			App._wallet.initialize(function(){
				App.bank.populate('chosen_wallet', arr, callback);
			});
		};
	};

	Main.prototype.get_chosenWallet = function(obj, callback) {
		callback = (typeof callback === 'function') ? callback : function(){};

		this.a.bank.lastID('chosen_wallet', 'by_chosen', function(d){
			callback(obj, d);
		});
	};

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

function datetoUTC(date){
	date = (typeof date === 'object' && date.hasOwnProperty('getFullYear') === true) ? date : new Date();
	var r = {};

	//Date and time
	var utc = date.toISOString();
	r.date = utc.match(/([0-9]{4}[-][0-9]{2}[-][0-9]{2})/gi)[0];
	r.time = utc.match(/[0-9]{2}[:][0-9]{2}[:][0-9]{2}[.]?[0-9]{0,3}/gi)[0];

	return r;
}