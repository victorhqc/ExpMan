(function(App){
	"use strict";

	var Module = function(){

		this.defaultjs = {
			css: {load: false},
			html: {load: true},
			js: {load: false},
			translate: {load: true}
		}

		this.a = App;
		this.renderWallets();
	};

	Module.prototype.loadSubFile = function(file, container, callback, params) {
		
		callback = (typeof callback !== 'function') ? function(){} : callback;
		params = (typeof params !== 'object') ? this.defaultjs : params;
		var extensions = {translate: 'xml', html: 'html', js: 'js'};

		for(var p in params){
			if(params.hasOwnProperty(p)){
				if(params[p].load === true){
					var ex = (typeof extensions[p] === 'undefined') ? '' : '.'+extensions[p];
					params[p].file = file + ex;
				}
			}
		}

		this.a.div = container;
		var t = this;
		this.a.current.start(callback, params);
	};

	//Creates the DOM for wallets
	Module.prototype.renderWallets = function(){
		var container = document.getElementById('wallet-container');
		container.innerHTML = '';

		var wallets = App.wallets;

		var wallet = this.newBlankWallet();
		container.appendChild(wallet.render());

		for(var i = 0, len = wallets.length; i < len; i++){
			var w = wallets[i];
			var wal = this.renderWallet(w);
			container.appendChild(wal);

			// 2 - Small devices
			// 3 - Medium and large devices
			if(i % 2 === 0 || i % 3 === 0){
				var clear = document.createElement('div');
				clear.className = 'clearfix';
			}

			if(i % 2 === 0){
				clear.className = clear.className + 'visible-sm';
			}

			if(i % 3 === 0){
				clear.className = clear.className + 'visible-md visible-lg';
			}
		}

		this.a.current.translate();
	}

	Module.prototype.renderWallet = function(d){
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

		return wallet.render();
	}

	Module.prototype.newBlankWallet = function(){
		//Blank wallet
		var t = this;
		var j = {container:'#wallet-container', icon:'glyphicon glyphicon-plus', buttonClass:'btn btn-primary', callback:function(wallet){
			var title = t.a.current.getText('create-title');
			var description = t.a.current.getText('create-description');
			var jm = {title:title, subtitle: description, message:'', createHelper: function(modal){
				var dynamicContent = document.createElement('div');
				dynamicContent.id = 'dynamo';
				modal.body.appendChild(dynamicContent);
				t.loadSubFile('new-wallet', '#dynamo', function(){
					modal.show();

					var btnok = document.createElement('button');
					btnok.className = 'btn btn-success';
					var spanbtn = document.createElement('span');
					spanbtn.id = 'btn-ok';
					btnok.appendChild(spanbtn);
					var labelbtn = t.a.current.getText('btn-ok');
					spanbtn.appendChild(document.createTextNode(labelbtn));

					var icon = document.createElement('i');
					icon.className = 'glyphicon glyphicon-ok';

					btnok.appendChild(icon);

					modal.footer.appendChild(btnok);

					var inp = document.getElementById('inputName');
					var textarea = document.getElementById('areaDescription');

					btnok.addEventListener('click', function(){
						var js = {name: inp.value, description:textarea.value, button: 'choose-wallet'};
						var data = {modal: modal, wallet:wallet, data:js};
						t.createWallet(data);
					});
				});
			}};
			var modal = new Modal(jm);
		}};
		var addWallet = new Wallet(j);

		return addWallet;
	}

	Module.prototype.createWallet = function(d){
		var walletStructure = App._data.walletStructure;
		walletStructure.name = d.data.name;
		var today = new Date();
		d.data.dateCreated = today;
		var wallet = DB(walletStructure);
		var t = this;
		wallet.initialize(function(){
			App._wallets.push(wallet);
			var arr = [d.data];
			App.bank.populate('wallets', arr, function(){
				window._App.searchWallets(t, function(t){
					t.renderWallets();
					d.modal.vaporize();
				});
			});
		});
	}

	new Module();

})(App);