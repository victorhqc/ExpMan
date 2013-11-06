(function(App){
	"use strict";

	var Module = function(){

		var t = this;
		var j = {
			container: '#config',
			choosed: function(dateconfig, data){
				t.getActivities(data, function(t, act){
					t.load();
				});
			}
		};

		this.activities = [];

		this.dateconfig = new DateConfig(j);
		this.getActivities(this.dateconfig.getData(), function(t, activities){
			t.load();
		});
	}

	Module.prototype.load = function() {
		this.activitiesTable();
	};

	Module.prototype.getActivities = function(date, callback) {
		callback = (typeof callback === 'function') ? callback : function(){};

		this.date = date;

		var j = {
			get: 'date',
			date: this.date
		}

		var activities = new Activities(j);
		var t = this;
		activities.gatherData(function(data){
			t.activities = data;
			callback(t, data);
		});

	};

	Module.prototype.activitiesTable = function() {
		var table = document.getElementById('activities-table');
		var tbody = table.getElementsByTagName('tbody')[0];
		tbody.innerHTML =  '';

		var activities = this.activities;
		console.log('activities', activities);
		var cats = ['i', 'date', 'amount', 'category'];

		for(var i = 0, len = activities.length; i < len; i++){
			var activity = activities[i];
			activity.i = i + 1;

			var tr = document.createElement('tr');

			for(var j = 0, len2 = cats.length; j < len2; j++){
				var cat = cats[j];

				var td = document.createElement('td');
				var t = (activity.hasOwnProperty(cat)) ? activity[cat] : '';
				td.appendChild(document.createTextNode(t));

				tr.appendChild(td);
			}

			tbody.appendChild(tr);
		}
	};

	var m = new Module();
})(App);