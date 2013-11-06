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

		var t = this;
		this.source.searchRange('activities', 'by_date', range.lower, range.upper, function(activities){
			t.utcdate_to_gmt(activities, callback);
		});
	};

	Data.prototype.utcdate_to_gmt = function(activities, callback) {
		callback = (typeof callback === 'function') ? callback : function(){};

		//Current difference from UTC
		var offset = new Date().getTimezoneOffset();

		for(var i = 0, len = activities.length; i < len; i++){
			var dt = activities[i].datetime;
			var local_time =   new Date( dt.getTime() - ( dt.getTimezoneOffset() * 60000 ) );
			console.log('local_time', local_time);
			local_time = dateToObj(local_time);
			for(var k in local_time){
				if(local_time.hasOwnProperty(k)){
					activities[i][k] = local_time[k];
				}
			}
		}

		callback(activities);
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
			break;
			case 'week':
				amount = amount * 7; // 7 days
			break;
			case 'month':
				amount = amount * 30; // 30 days
			break;
			case 'year':
				amount = amount * 365; // 365 days
			break;
		}

		amount = amount * 1000 * 3600 * 24; //Milliseconds
		
		lower = new Date(now_utc - amount);
		r.lower = lower;

		r.upper = datetoUTC(r.upper).date;
		r.lower = datetoUTC(r.lower).date;

		return r;
	};

	window.Activities = function(j){
		return new Data(j);
	}

})();