var Template;
var App;
(function(){
	"use strict";
	window.onload = function(){
		//Get the modules
		new Vi({url:'data/modules.json', response:'json'}).respondo(function(r){
			var modules = {};
			var defaultTemplate = 'templates/web';
			for(var k in r.groups){
				if(r.groups.hasOwnProperty(k)){
					for(var kg in r.groups[k]){
						if(r.groups[k].hasOwnProperty(kg)){
							modules[kg] = {};
							modules[kg].nombre = kg;
							modules[kg].url = defaultTemplate+'/modules/';
						}
					}
				}
			}
			var js = {name:'web', modules:modules};
			App = new Sistema(js);
			App._data = r;
			App.init(function(){
				initializeWallets(function(){
					searchWallets(function(){
						Template = new Layout({skin:defaultTemplate, name:'web'});
						Template.init(function(){
						});
					});
				});
			});
		});
	};


	//Initialize Wallets
	function initializeWallets(callback){
		var mainStructure = App._data.mainStructure;
		mainStructure.name = 'bank';
		var bank = DB(mainStructure);
		bank.initialize(function(){
			App.bank = bank;
			if(typeof callback === 'function'){
				callback();
			}
		});
	}

	//Search for existing wallets
	function searchWallets(callback){
		App.bank.search('wallets', 'by_name', '', 'all', function(wallets){
			App.wallets = wallets;
			App._wallets = [];
			if(typeof callback === 'function'){
				callback();
			}
		});	
	}

})();

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