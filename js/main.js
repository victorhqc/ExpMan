var Template;
var App;

window.onload = function(){
	"use strict";
	Template = new Layout({skin:'templates/web', name:'web'});
	Template.init(function(){
		//Get the modules
		new Vi({url:'data/modules.json', response:'json'}).respondo(function(r){
			buildMenu(r.groups);

			var modules = {};
			for(var k in r.groups){
				if(r.groups.hasOwnProperty(k)){
					for(var kg in r.groups[k]){
						if(r.groups[k].hasOwnProperty(kg)){
							modules[kg] = {};
							modules[kg].nombre = kg;
							modules[kg].url = Template.skin+'/modules/';
						}
					}
				}
			}
			var js = {name:'web', modules:modules};
			App = new Sistema(js);
			App._data = r;
			App.init(function(){
				initializeWallets(function(){
					searchWallets();

					renderWallets();
				});
			});
		});
	});
};


//Initialize Wallets
function initializeWallets(callback){
	"use strict";
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
function searchWallets(){
	"use strict";
	var wallets = App.bank.search('wallets', 'by_name', '', 'all');
	App.wallets = wallets;
}

//Creates the DOM for wallets
function renderWallets(){
	"use strict";
	var wallets = App.wallets;

	//Blank wallet
	var j = {container:'#wallet-container', callback:function(){
		var modal = new Modal();
	}};
	var addWallet = new Wallet(j);

	//Add text to the "new-wallet"
	App.language.translate();

}

function buildMenu(groups){
	"use strict";
	var id =  Template.template.menu.getId();
	var menu = document.getElementById(id);

	var main = '#'+Template.template.main.getId();
	//main = document.getElementById(main);

	//Building categories
	for(var g in groups){
		if(groups.hasOwnProperty(g)){
			var title = document.createElement('h4');
			title.setAttribute('data-ltag', g);
			menu.appendChild(title);

			//Build modules
			var ul = document.createElement('ul');
			ul.id = 'sidebarMenu';
			for(var gm in groups[g]){
				if(groups[g].hasOwnProperty(gm)){
					var module = document.createElement('li');
					module.setAttribute('data-ltag', gm);
					module.setAttribute('data-module', gm);

					module.addEventListener('click', function(){
						this.setAttribute('disabled', 'disabled');
						var elms = menu.getElementsByTagName('li');
						addClass(this, 'clicked');
						for(var i = 0, len = elms.length; i < len; i++){
							if(elms[i] !== this){
								removeClass(elms[i], 'clicked');
							}
						}

						var mod = this.getAttribute('data-module');
						App.getModule(mod);
						var js = {
							'div_id':main
						};
						var This = this;
						App.current.init(js, function(){
							This.removeAttribute('disabled');
						});
					})

					ul.appendChild(module);
				}
			}
			menu.appendChild(ul);
		}
	}
}

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