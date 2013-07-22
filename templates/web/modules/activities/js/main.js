(function(){
	"use strict";
	var init = function(){
		this.functionallity();
	}

	init.prototype.functionallity = function() {
		var btns = document.querySelectorAll('.main-btn');
		for(var i = 0, len = btns.length; i < len; i++){
			var btn = btns[i];
			btn.addEventListener('click', function(){
				var type = this.getAttribute('data-type');
				var registering = 'registering-'+type;
				var t = App.current.language.getText(registering);
				var title = document.getElementById('activity-title');
				title.innerHTML = t;

				var dc = document.getElementById('activity-data');
				dc.style.display = 'block';
			});
		}
	};

	new init();
})();