(function(){
	"use strict";

	var Data = function(j){
		var defaults = {
			get: 'all', // all, id
			date: {}, // see dateconfig.class.js response
			id: 0,
			idType: ''
		};

		var js = {data:j, defaults:defaults};
		Initclass.call(this, js);

		this.startSource();
	};

	Data.prototype.startSource = function() {
		this.source = App._wallet;
	};

	Data.prototype.gatherData = function(callback) {
		if(typeof this.source === 'object'){
			callback = (typeof callback === 'function') ? callback : function(){};

			var d = [];
			var func = 'gather_by_'+this.get;
			if(typeof this[func] === 'function'){
				d = this[func](callback);
			}else{
				console.log('get activities by: "'+this.get+'" is not supported.');
			}
		}
	};

	/**
	 * Gets all activities of current wallet
	 * @return {object} array of activities
	 */
	Data.prototype.gather_by_all = function() {
		
	};

	/**
	 * Gets one activity, based on a given id
	 * @return {object} array of activity
	 */
	Data.prototype.gather_by_id = function() {
		
	};

	/**
	 * Gets all activities of current wallet based on a type of activity (incomes, outcomes)
	 * @return {object} array of activities
	 */
	Data.prototype.gather_by_type = function() {
		
	};

	/**
	 * Gets all activities of current wallet based on a date (see dateconfig.class.js response)
	 * @return {object} array of activities
	 */
	Data.prototype.gather_by_date = function(callback) {
		var now = new Date();
		var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

		var range = {
			lower: now_utc,
			upper: now_utc
		}

		if(typeof this.date.range === 'object'){
			range.lower = this.date.range.date1;
			range.upper = this.date.range.date2;
		}else{
			range = this.convert_date(this.date.type);
		}

		console.log('range', range);

		this.source.searchRange('activities', 'by_date', range.lower, range.upper, function(activities){
			callback(activities);
		});
	};

	Data.prototype.convert_date = function(date) {
		var r = {};

		var now = new Date();
		var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

		r.upper = now_utc;

		var type = date.match(/([^\d^-]+)/gi)[0].toLowerCase();
		var amount = date.match(/(\d+)/gi)[0];
		amount = (isNaN(parseInt(amount))) ? 0 : parseInt(amount);

		var lower;
		switch(type){
			case 'day':
				amount = amount - 1;
				lower = new Date(now.getUTCFullYear(), now.getUTCMonth(), (now.getUTCDate() - amount),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
			break;
			case 'week':
				var amount = amount * 7; // 7 days
				lower = new Date(now.getUTCFullYear(), now.getUTCMonth(), (now.getUTCDate() - amount),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
			break;
			case 'month':
				lower = new Date(now.getUTCFullYear(), (now.getUTCMonth() - amount), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
			break;
			case 'year':
				lower = new Date((now.getUTCFullYear() - amount), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
			break;
		}

		r.lower = lower;

		r.upper = datetoUTC(r.upper).date;
		r.lower = datetoUTC(r.lower).date;

		return r;
	};

	window.Activities = function(j){
		return new Data(j);
	}

})();