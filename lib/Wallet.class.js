(function(){
	if(!Initclass){ throw new Error('Initclass is not defined.') };
	
	var _Wallet = function(j){
		
		var defaults = {
			name: 'new-wallet',
			description: 'wallet-description',
			dateCreated:{},
			button: 'new-btn-wallet',
			buttonClass: 'btn btn-success',
			icon: 'icon-ok',
			chosen: false,
			chosenBtn: 'chosen-wallet',
			callback: function(){}
		}

		var js = {data:j, defaults:defaults};
		Initclass.call(this, js);

		//Avoiding duplicate ID's
		this.id = this.name+'_dom';
	}

	//DOM creation
	_Wallet.prototype.render = function(){
		var li = document.createElement('div');
		li.className = 'col-sm-4 col-md-3';

		var div = document.createElement('div');
		//div.href = '#';
		div.className = 'wallet thumbnail';
		div.id = this.id;

		var img = document.createElement('div');
		img.className = 'img-wallet';

		div.appendChild(img);

		var block = document.createElement('div');
		block.className = 'caption';
		div.appendChild(block);

		var title = document.createElement('h4');
		if(this.name === 'new-wallet'){
			title.setAttribute('data-ltag', this.name);
		}else{
			var text = document.createTextNode(this.name);
			title.appendChild(text);
		}

		block.appendChild(title);

		var description = document.createElement('p');
		if(this.description === 'wallet-description'){
			description.setAttribute('data-ltag', this.description);
		}else{
			var text = document.createTextNode(this.description);
			description.appendChild(text);
		}

		block.appendChild(description);

		var btn = document.createElement('button');
		btn.className = this.buttonClass;



		var txtBtn = document.createElement('span');
		txtBtn.setAttribute('data-ltag', this.button);
		btn._span = txtBtn;
		btn.appendChild(txtBtn);

		var icon = document.createElement('i');
		icon.className = this.icon;
		btn.appendChild(icon);
		btn._icon = icon;

		this._btn = btn;

		block.appendChild(btn);

		var This = this;
		btn.addEventListener('click', function(){
			This.callback(This, this);
		});

		li.appendChild(div);

		if(this.chosen === true){
			this.choose();
		}

		return li;
	}

	_Wallet.prototype.free = function(tag, text) {
		this._btn.removeAttribute('disabled');
		this._btn._icon.className = '';
		this.updateBtnText(tag, text);
	};

	_Wallet.prototype.choose = function(tag, text) {
		this._btn.setAttribute('disabled', 'disabled');
		this._btn._icon.className = 'glyphicon glyphicon-ok';
		this.updateBtnText(tag, text);
	};

	_Wallet.prototype.updateBtnText = function(tag, text) {
		this._btn._span.setAttribute('data-ltag', tag);
		this._btn._span.innerHTML = '';
		this._btn._span.appendChild(document.createTextNode(text));
	};

	window.Wallet = function(j){
		return new _Wallet(j);
	}
})();