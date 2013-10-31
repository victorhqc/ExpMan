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

		var This = this;
		this.initialize(function(){
			This.mainFunctionallity();
		});
	}

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

	Module.prototype.initialize = function(callback){
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

	Module.prototype.mainFunctionallity = function(){
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

	Module.prototype.getType = function(type, callback){
		App.bank.searchByIndex('types', 'by_name', type, function(r){
			if(typeof callback === 'function'){
				callback(r);
			}
		});
	}

	//Search for expenses
	Module.prototype.searchActivities = function(type, callback){
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

	Module.prototype.newCategory = function(d){
		var t = this;
		var title = this.a.current.getText('create-title');
		var description = this.a.current.getText('create-description');
		var jm = {title:title, subtitle:description, message: '', createHelper: function(modal){
			var dynamicContent = document.createElement('div');
			dynamicContent.id = 'dynamo';
			modal.body.appendChild(dynamicContent);

			t.loadSubFile('new', '#dynamo', function(){
				modal.show();

				var btnok = document.createElement('button');
				btnok.className = 'btn btn-success';
				var spanbtn = document.createElement('span');
				spanbtn.id = 'btn-ok';
				btnok.appendChild(spanbtn);
				var labelbtn = t.a.current.getText('btn-ok');
				spanbtn.innerHTML = labelbtn;

				var icon = document.createElement('i');
				icon.className = 'glyphicon glyphicon-ok';
				btnok.appendChild(icon);

				modal.footer.appendChild(btnok);

				btnok.addEventListener('click', function(){
					var name = document.getElementById('inputname').value;
					var data = {idType: d.idType, name:name};
					t.registerNewCategory(data, function(){
						t.initialize(function(){
							modal.vaporize();
						});
					});
				});
			});
		}};
		var modal = new Modal(jm);
	}

	Module.prototype.registerNewCategory = function(d, callback){
		d = [d];
		App.bank.populate('categories', d, function(){
			if(typeof callback === 'function'){
				callback();
			}
		});
	}

	Module.prototype.newCategoryNode = function(parent, d, num){

		var keys = ['i', 'name'];

		var tr = document.createElement('tr');
		tr._data = d;

		for(var i = 0, len = keys.length; i < len; i++){
			d.i = num + 1;
			var k = keys[i];

			var td = document.createElement('td');
			var text = document.createTextNode(d[k]);
			td.appendChild(text);
			tr.appendChild(td);
		}

		//Operations
		var td = document.createElement('td');
		var op_container = document.createElement('div');
		op_container.className = 'op_container';

		var operations = {
			edit: {
				icon: 'glyphicon glyphicon-pencil',
				button: 'btn btn-default'
			},
			remove: {
				icon: 'glyphicon glyphicon-remove',
				button: 'btn btn-danger'
			}
		};

		for(var k in operations){
			if(operations.hasOwnProperty(k)){
				var btn = document.createElement('button');
				btn.className = operations[k].button + ' pull-left';
				var icon = document.createElement('i');
				icon.className = operations[k].icon;
				btn.appendChild(icon);

				op_container.appendChild(btn);
			}
		}

		var fix = document.createElement('div');
		fix.className = 'clearfix';
		op_container.appendChild(fix);

		td.appendChild(op_container);

		tr.appendChild(td);
		tr._op_container = op_container;

		parent.appendChild(tr);
	}

	Module.prototype.fillCategories = function(ul, act){
		ul.innerHTML = '';
		for(var i = 0, len = act.length; i < len; i++){
			var a = act[i];
			this.newCategoryNode(ul, a, i);
		}
	}

	Module.prototype.fillIncomes = function(act){
		var ul = document.getElementById('income-list');
		this.fillCategories(ul, act);
	};

	Module.prototype.fillExpenses = function(act){
		var ul = document.getElementById('expense-list');
		this.fillCategories(ul, act);
	};

	var m = new Module();
})(App);