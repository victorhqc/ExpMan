(function(){
	"use strict";
	buildMenu(App._data.groups);

	renderWallets();

	function buildMenu(groups){
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

	//Creates the DOM for wallets
	function renderWallets(){
		var wallets = App.wallets;

		var wallet = newBlankWallet();

		for(var i = 0, len = wallets.length; i < len; i++){
			var w = wallets[i];
			renderWallet(w);
		}

		//Add text to the "new-wallet"
		App.language.translate();
	}

	function renderWallet(d){
		d.container = '#wallet-container';
		d.callback = function(wallet, btn){
			App.selectedWallet = wallet;
		};
		var wallet = new Wallet(d);
	}

	function newBlankWallet(){
		//Blank wallet
		var j = {container:'#wallet-container', callback:function(wallet){
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
						createWallet(data);
					});
				});
			}};
			var modal = new Modal(jm);
		}};
		var addWallet = new Wallet(j);

		return addWallet;
	}

	function createWallet(d){
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

})();