(function(){
	if(!Initclass){ throw new Error('Initclass is not defined.') };
	
	var _Wallet = function(j){
		
		var defaults = {
			name: 'new-wallet',
			description: 'wallet-description',
			dateCreated:{},
			container: 'body',
			button: 'new-btn-wallet',
			callback: function(){}
		}

		var js = {data:j, defaults:defaults};
		Initclass.call(this, js);

		//Avoiding duplicate ID's
		this.id = this.name+'_dom';

		this.render();
	}

	//DOM creation
	_Wallet.prototype.render = function(){
		var li = document.createElement('li');
		li.className = 'span3';

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
		btn.className = 'btn';

		var icon = document.createElement('i');
		icon.className = 'icon-ok';
		btn.appendChild(icon);
		var txtBtn = document.createElement('span');
		txtBtn.setAttribute('data-ltag', this.button);
		btn.appendChild(txtBtn);

		block.appendChild(btn);

		var This = this;
		btn.addEventListener('click', function(){
			This.callback(this)
		});

		var container = document.querySelector(this.container);
		li.appendChild(div);
		container.appendChild(li);
	}

	window.Wallet = function(j){
		return new _Wallet(j);
	}
})();