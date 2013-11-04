(function(){
	"use strict";

	var Config = function(j){

		var defaults = {
			firstDayOfWeek: 1, // Monday
			periods: {
				day: [1, 2, 3],
				week: [1, 2],
				month: [1, 2],
				year: [1],
				custom: ['']
			},
			container: 'body'
		}

		var js = {data:j, defaults:defaults};
		Initclass.call(this, js);

		this.init();
	}

	/**
	 * Builds the dom and initializes functionality
	 * @return {undefined} no return value
	 */
	Config.prototype.init = function() {
		this.container = document.querySelector(this.container);

		this.innerContainer = document.createElement('form');
		this.innerContainer.className = 'form-horizontal'

		this.container.appendChild(this.innerContainer);

		if(this.container !== null){
			this.buildSContainer();
		}else{
			console.log('The container is not found, please, check again');
		}
	};

	/**
	 * Gets the chosen date by user, and/or the custom range
	 * @return {object} chosen date
	 */
	Config.prototype.getData = function() {
		var r = {};
		r.selector = this.selector.options[this.selector.selectedIndex].value;

		if(typeof this.date1 === 'object'){
			r.range = {};
			r.range.date1 = this.date1.value;
			r.range.date2 = this.date2.value;
		}

		return r;
	};

	Config.prototype.buildSContainer = function() {
		var scontainer = document.createElement('div')
		scontainer.className = 'form-group';

		var label = document.createElement('label');
		label.className = 'col-sm-4 control-label';
		label.setAttribute('for', 'date_selector');
		label.setAttribute('data-ltag', 'dateselector-label');
		var t = App.current.getMainText('dateselector-label');
		label.appendChild(document.createTextNode(t));
		scontainer.appendChild(label);


		var selector = this.buildSelector();
		var div = document.createElement('div');
		div.className = 'col-sm-8';
		div.appendChild(selector);
		scontainer.appendChild(div);


		this.innerContainer.appendChild(scontainer);
	};

	/**
	 * Builds the main date selector
	 * @return {object} returns DOM object (the selector)
	 */
	Config.prototype.buildSelector = function() {
		var selector = document.createElement('select');
		selector.className = 'form-control date-selector';
		selector.id = 'date_selector';

		var periods = Object.keys(this.periods);

		for(var i = 0, len = periods.length; i < len; i++){
			var key = periods[i];
			var period = this.periods[key];

			for(var j = 0, len2 = period.length; j < len2; j++){
				var p = period[j];
				var tag = (typeof p === 'number') ? key+'-'+p : key;

				var option = document.createElement('option');
				option.setAttribute('data-tag', tag);
				option.value = tag;

				var span = document.createElement('span');
				span.setAttribute('data-ltag', tag);
				var t = App.current.getMainText(tag);
				span.appendChild(document.createTextNode(t));
				option.appendChild(span);

				selector.appendChild(option);
			}
		}

		selector._t = this;
		selector.onchange = function(e){ 
			var s = e.target;
			var chosen = s.options[s.selectedIndex];
			var tag = chosen.getAttribute('data-tag');

			if(tag === 'custom'){
				s._t.buildDateRange();
			}else{
				s._t.deleteDateRange();
			}
		}


		this.selector = selector;
		return selector;
	};

	/**
	 * Builds the "date 1" and "date 2" inputs to make a custom date range
	 * @return {undefined} no return value
	 */
	Config.prototype.buildDateRange = function() {
		this.deleteDateRange();

		var date = new Date().toISOString();
		date = date.match(/([0-9]+){4}[-]([0-9]+){2}[-]([0-9]+){2}/gi)[0];

		//Date 1
		//-------------------------
		this.buildDateContainer(1);
		this.date1.value = date;

		//Date 2
		//-------------------------
		this.buildDateContainer(2);
		this.date2.value = date;
		
	};

	Config.prototype.buildDateContainer = function(no) {
		var container = document.createElement('div');
		container.className = 'form-group date-container';

		var label = document.createElement('label');
		label.className = 'col-sm-4 control-label';
		label.setAttribute('for', 'range-date-'+no);
		label.setAttribute('data-ltag', 'range-date-'+no);
		var t = App.current.getMainText('range-date-'+no);
		label.appendChild(document.createTextNode(t));

		container.appendChild(label);

		var d = document.createElement('div');
		d.className = 'col-sm-8';
		var date = this.buildDate('range-date-'+no);
		d.appendChild(date);
		this['date'+no] = date.getElementsByClassName('form-control')[0];
		container.appendChild(d);

		this.innerContainer.appendChild(container);
	};

	/**
	 * Builds the date input individually.
	 * @return {object} returns DOM object
	 */
	Config.prototype.buildDate = function(id) {
		var container = document.createElement('div');
		container.className = 'input-group';

		var span = document.createElement('span');
		span.className = 'input-group-addon';
		container.appendChild(span);

		var i = document.createElement('i');
		i.className = 'glyphicon glyphicon-calendar';
		span.appendChild(i);

		var input = document.createElement('input');
		input.type = 'date';
		input.className = 'form-control';
		input.id = (typeof id === 'string') ? id : '';

		container.appendChild(input);

		return container;
	};

	/**
	 * Deletes both "date 1" and "date 2" inputs
	 * @return {undefined} no return value
	 */
	Config.prototype.deleteDateRange = function() {
		var prev = this.innerContainer.querySelectorAll('.date-container');
		if(prev.length > 0){
			delete this.date1;
			delete this.date2;

			for(var i = 0, len = prev.length; i < len; i++){
				prev[i].parentNode.removeChild(prev[i]);
			}
		}
	};

	window.DateConfig = function(j){
		return new Config(j);
	}
})();