(function(){
	"use strict";

	var init = function(){
		this.buildMenu(App._data.groups);
		this.menuValidation();
		this.renderWallets();
	};

	init.prototype.buildMenu = function(groups){
		var id =  Template.template.menu.getId();
		var menu = document.getElementById(id);

		var main = '#'+Template.template.main.getId();
		//main = document.getElementById(main);

		//Building categories
		for(var g in groups){
			var ul = document.createElement('ul');
			ul.className = 'nav nav-list';
			ul.id = 'sidebarMenu';
			if(groups.hasOwnProperty(g)){
				//Build modules

				var title = document.createElement('li');
				title.className = 'nav-header';
				title.setAttribute('data-ltag', g);
				ul.appendChild(title);

				for(var gm in groups[g]){
					if(groups[g].hasOwnProperty(gm)){
						var module = document.createElement('li');
						var a = document.createElement('a');
						a.href = '#';
						a.setAttribute('data-group', g);
						a.setAttribute('data-ltag', gm);
						a.setAttribute('data-module', gm);
						module.appendChild(a);

						a.addEventListener('click', function(){
							if(hasClass(this, 'muted') === null){
								var elms = menu.getElementsByTagName('a');
								addClass(this.parentNode, 'active');
								for(var i = 0, len = elms.length; i < len; i++){
									if(elms[i] !== this){
										removeClass(elms[i].parentNode, 'active');
									}
								}

								var mod = this.getAttribute('data-module');
								App.getModule(mod);
								var js = {
									'div_id':main
								};
								var This = this;
								App.current.init(js, function(){

								});
							}
						})

						ul.appendChild(module);
					}
				}
				menu.appendChild(ul);
			}
		}
	}

	init.prototype.menuValidation = function(){
		//Only when a walet is selected the main buttons will be active.
		var navs = document.querySelectorAll('#sidebarMenu a[data-group="use"]');
		var block = false;
		if(App.selectedWallet === undefined){
			//Block menu
			block = true;
		}

		for(var i = 0, len = navs.length; i < len; i++){
			var nav = navs[i];
			if(block === true){
				addClass(nav, 'muted');
			}else{
				removeClass(nav, 'muted');
			}
		}
	}

	//Creates the DOM for wallets
	init.prototype.renderWallets = function(){
		var wallets = App.wallets;

		var wallet = this.newBlankWallet();

		for(var i = 0, len = wallets.length; i < len; i++){
			var w = wallets[i];
			this.renderWallet(w);
		}

		//Add text to the "new-wallet"
		App.language.translate();
	}

	init.prototype.renderWallet = function(d){
		d.container = '#wallet-container';
		var t = this;
		d.callback = function(wallet, btn){
			App.selectedWallet = wallet;
			if(App._wallet !== undefined){
				App._wallet.close();
			}
			var request = window.indexedDB.open(wallet.name);
			request.onsuccess = function(event) {
				App._wallet = request.result;
			};
			t.menuValidation();
		};
		var wallet = new Wallet(d);
	}

	init.prototype.newBlankWallet = function(){
		//Blank wallet
		var This = this;
		var j = {container:'#wallet-container', icon:'icon-white icon-plus', buttonClass:'btn btn-primary', callback:function(wallet){
			var title = App.language.getMainText('create-title');
			var description = App.language.getMainText('create-description');
			var jm = {title:title, message:description, createHelper: function(modal){
				var dynamicContent = document.createElement('div');
				dynamicContent.id = 'dynamo';
				modal.body.appendChild(dynamicContent);
				new Vi({url:Template.skin+'/html/new-wallet.html', div:'#dynamo'}).contenido(function(){
					var labelName = App.language.getMainText('create-name');
					var l = document.getElementById('label-name');
					l.innerHTML = labelName;
					var placeholderName = App.language.getMainText('create-name-placeholder');
					var inp = document.getElementById('inputName');
					inp.placeholder = placeholderName;

					var labeldesc = App.language.getMainText('label-description');
					var inpdesc = document.getElementById('description-label');
					inpdesc.innerHTML = labeldesc;

					modal.show();

					var btnok = document.createElement('button');
					btnok.className = 'btn btn-success';
					var spanbtn = document.createElement('span');
					spanbtn.id = 'btn-ok';
					btnok.appendChild(spanbtn);
					var labelbtn = App.language.getMainText('btn-ok');
					spanbtn.innerHTML = labelbtn;

					var textarea = document.getElementById('areaDescription');

					modal.footer.appendChild(btnok);

					btnok.addEventListener('click', function(){
						var js = {name: inp.value, description:textarea.value};
						var data = {modal: modal, wallet:wallet, data:js};
						This.createWallet(data);
					});
				});
			}};
			var modal = new Modal(jm);
		}};
		var addWallet = new Wallet(j);

		return addWallet;
	}

	init.prototype.createWallet = function(d){
		var walletStructure = App._data.walletStructure;
		walletStructure.name = d.data.name;
		var today = new Date();
		d.data.dateCreated = today;
		var wallet = DB(walletStructure);
		wallet.initialize(function(){
			App._wallets.push(wallet);
			var arr = [d.data];
			App.bank.populate('wallets', arr, function(){
				d.modal.hide();
			});
		});
	}

	new init();

})();