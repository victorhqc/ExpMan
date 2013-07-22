(function(){
	"use strict";
	var init = function(){
		var This = this;
		this.initialize(function(){
			This.mainFunctionallity();
		});
	}

	init.prototype.initialize = function(callback){
		var This = this;
		this.searchActivities('Income', function(a){
			This.fillIncomes(a);
			This.searchActivities('Expense', function(a){
				This.fillExpenses(a);

				if(typeof callback === 'function'){
					callback();
				}
			});
		});
	}

	init.prototype.mainFunctionallity = function(){
		var This = this;
		var btnI = document.getElementById('new-expense-btn');
		btnI.addEventListener('click', function(){
			This.getType('Expense', function(r){
				r = r[0];
				This.newCategory(r);
			});
		});

		var btnE = document.getElementById('new-income-btn');
		btnE.addEventListener('click', function(){
			This.getType('Income', function(r){
				r = r[0];
				This.newCategory(r);
			});
		});
	}

	init.prototype.getType = function(type, callback){
		App.bank.searchByIndex('types', 'by_name', type, function(r){
			if(typeof callback === 'function'){
				callback(r);
			}
		});
	}

	//Search for expenses
	init.prototype.searchActivities = function(type, callback){
		//Get the idType
		this.getType(type, function(r){
			var id = r[0].idType;
			App.bank.search('categories', 'by_type', id, 'only', function(activities){
				App.incomeCategories = activities;
				if(typeof callback === 'function'){
					callback(activities);
				}
			});
		});
	}

	init.prototype.newCategory = function(d){
		var This = this;
		var title = App.current.language.getText('create-title');
		var description = App.current.language.getText('create-description');
		var jm = {title:title, message:description, createHelper: function(modal){
			var dynamicContent = document.createElement('div');
			dynamicContent.id = 'dynamo';
			modal.body.appendChild(dynamicContent);
			new Vi({url:App.current.getUrl()+'/html/new.html', div:'#dynamo'}).contenido(function(){
				modal.show();
				
				App.current.language.translateDOM('input-name');


				var btnok = document.createElement('button');
				btnok.className = 'btn btn-success';
				var spanbtn = document.createElement('span');
				spanbtn.id = 'btn-ok';
				btnok.appendChild(spanbtn);
				var labelbtn = App.current.language.getText('btn-ok');
				spanbtn.innerHTML = labelbtn;
				modal.footer.appendChild(btnok);

				btnok.addEventListener('click', function(){
					var name = document.getElementById('inputname').value;
					var data = {idType: d.idType, name:name};
					This.registerNewCategory(data, function(){
						This.initialize(function(){
							modal.hide();
						});
					});
				});
			});
		}};
		var modal = new Modal(jm);
	}

	init.prototype.registerNewCategory = function(d, callback){
		d = [d];
		App.bank.populate('categories', d, function(){
			if(typeof callback === 'function'){
				callback();
			}
		});
	}

	init.prototype.newCategoryNode = function(p, d){
		var e = document.createElement('div');
		e.className = 'span6';
		e.appendChild(document.createTextNode(d.name));
		e.setAttribute('data-id', d.idCategory);

		var op = document.createElement('div');
		op.className = 'span6 operations';

		p.appendChild(e);
		p.appendChild(op);

		var c = document.createElement('div');
		c.className = 'row-fluid';
		c.appendChild(e);
		c.appendChild(op);

		p.appendChild(c);
		return e;
	}

	init.prototype.fillCategories = function(ul, act){
		ul.innerHTML = '';
		for(var i = 0, len = act.length; i < len; i++){
			var a = act[i];
			this.newCategoryNode(ul, a);
		}
	}

	init.prototype.fillIncomes = function(act){
		var ul = document.getElementById('income-list');
		this.fillCategories(ul, act);
	};

	init.prototype.fillExpenses = function(act){
		var ul = document.getElementById('expense-list');
		this.fillCategories(ul, act);
	};

	new init();
})();