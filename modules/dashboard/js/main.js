(function(App){
	"use strict";

	var Module = function(){

		var t = this;
		var j = {
			container: '#config',
			choosed: function(dateconfig, data){
				t.getActivities(data);
			}
		};

		this.activities = [];

		this.dateconfig = new DateConfig(j);
		this.getActivities(this.dateconfig.getData(), function(t){

		});
	}

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
			callback(t);
		});

	};

	Module.prototype.activitiesTable = function() {
		
	};

	var m = new Module();
})(App);