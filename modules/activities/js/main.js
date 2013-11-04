(function(App){
	"use strict";
	var Module = function(){
		this.a = App;

		this.functionallity();
	}

	Module.prototype.getType = function(type, obj, callback){
		this.a.bank.searchByIndex('types', 'by_name', type, function(r){
			if(typeof callback === 'function'){
				callback(obj, r);
			}
		});
	}

	//Search for activities
	Module.prototype.searchActivities = function(type, obj, callback){
		//Get the idType
		this.getType(type, obj, function(obj, r){
			var id = r[0].idType;
			App.bank.search('categories', 'by_type', id, 'only', function(activities){
				App.incomeCategories = activities;
				if(typeof callback === 'function'){
					callback(obj, activities);
				}
			});
		});
	}

	Module.prototype.functionallity = function() {
		
		var btns = document.querySelectorAll('.main-btn');
		for(var i = 0, len = btns.length; i < len; i++){
			var btn = btns[i];
			btn._t = this;
			btn.addEventListener('click', function(){
				var type = this.getAttribute('data-type');
				var registering = 'registering-'+type.toLowerCase();
				var t = this._t.a.current.getText(registering);
				var title = document.getElementById('activity-title');
				title.innerHTML = t;

				this._t.searchActivities(type, this, function(obj, activities){
					obj._t._type = type;

					obj._t.fillActivities(activities);
					var dc = document.getElementById('activity-data');
					dc.style.display = 'block';
				});
			});
		}

		var form = document.getElementById('register-category');
		form._t = this;
		form.addEventListener('submit', function(e){
			if(e.preventDefault){
				e.preventDefault();
			}

			e.returnValue = false;

			this._t.register();
		}, false);
	};

	Module.prototype.fillActivities = function(activities) {
		var elm = document.getElementById('select-categories');
		elm.innerHTML = '';

		for(var i = 0, len = activities.length; i < len; i++){
			var activity = activities[i];
			var node = document.createElement('option');
			node.value = activity.idCategory;

			node.appendChild(document.createTextNode(activity.name));
			node._data = activity;

			elm.appendChild(node);
		}
	};

	Module.prototype.gather_new_data = function() {
		var values = {};
		var inputs = document.querySelectorAll('.form-control');

		for(var i = 0, len = inputs.length; i < len; i++){
			var input = inputs[i];

			if(input.name !== ''){
				values[input.name] = input.value;
			}
		}

		if(typeof values.amount !== 'undefined'){
			values.amount = values.amount.match(/([0-9]+)[.]?([0-9]+)/gi);
			if(values.amount !== null){
				var aux = parseFloat(values.amount[0]);
				values.amount = (isNaN(aux) === true) ? 0 : aux;
			}
		}

		//Type of activity
		var select = document.getElementById('select-categories');
		values.idCategory = select.options[select.selectedIndex].value;
		

		//Date and time
		var d = datetoUTC();
		values.date = d.date;
		values.time = d.time;
		values.datetime = d.datetime;

		return values;
	};

	Module.prototype.register = function(callback) {
		callback = (typeof callback === 'function') ? callback : function(){};
		var data = this.gather_new_data();
		var arr = [data];
		
		if(typeof this.a._wallet === 'object'){
			this.a._wallet.populate('activities', arr, callback);
		}
	};

	new Module();
})(App);