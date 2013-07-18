/**
 * Class for handling the data
 * ===========================
 *
 * For now it will use IndexedDB, the idea is to abstract it and change the technology if needed.
 */

(function(){
	if(!Initclass){ throw new Error('Initclass is not defined.') };

	var _Table = function(j){
		defaults = {
			db: {},
			name: 'table',
			keyPath: 'keyPath',
			indexes: {
				index1: {title:'index1', column:'column1', properties:{unique:true}},
				index2: {title:'index2', column:'column2'}
			},
			columns: {
				index1:1, // <----- Integer
				column1:'string', // <----- String
				column2:{}, // <----- Object
			}
		}

		var js = {data:j, defaults:defaults};
		Initclass.call(this, js);

		this.init();
	};

	_Table.prototype.init = function(){
		var indexes = this.indexes;
	  	var kp = this.keyPath;
		this.table = this.db.createObjectStore(this.name, {keyPath: kp});
		this.i = {};

	  	//Iterate in search of more indexes.
	  	for(var index in indexes){
	  		var ind = indexes[index];
	  		var title = ind.title;
	  		var column = ind.column;
	  		var properties = {};
	  		if(typeof ind.properties === 'object'){
	  			properties = ind.properties;
	  		}
	  		
	  		this.i[index] = this.table.createIndex(title, column, properties);
	  	}
	}

	_Table.prototype.insert = function(data){
		this.table.put(d);
	};

	_Table.prototype.remove = function(id){

	};

	var _Data = function(j){
		var defaults = {
			name:'database', //Change it to something you will use (Library, wallet, etc).
			tables: {}
		};

		var js = {data:j, defaults:defaults};

		Initclass.call(this, js);
	}

	_Data.prototype.initialize = function(callback){
		this.request = indexedDB.open(this.name);

		var This = this;
		this.request.onupgradeneeded = function() {
		  // The database did not previously exist, so create object stores and indexes.
		  This.db = This.request.result;
		  This.t = {};
		  for(var table in This.tables){
		  	//Instance the table name in the object.
		  	This.tables[table].db = This.db;
		  	This.t[table] = new _Table(This.tables[table]);
		  }
		};

		this.request.onsuccess = function() {
			This.db = This.request.result;
			if(typeof callback === 'function'){
				callback();
			}
		};
	}

	//Multiple data insertion
	_Data.prototype.populate = function(tableName, data){
		//var table = this.t[tableName];
		var tx = this.db.transaction(tableName, "readwrite");
		var table = tx.objectStore(tableName);

		for(var i = 0, len = data.length; i < len; i++){
			var d = data[i];
			table.insert(d);
		}

		tx.oncomplete = function() {
		  // All requests have succeeded and the transaction has committed.
		};
	}

	_Data.prototype.search = function(tableName, index, needle, type){
		if(typeof type === 'undefined'){
			type = 'any'; //It could also be "only"
		}
		var tx = this.db.transaction(tableName, "readonly");
		var db = tx.objectStore(tableName);
		var index = db.index(index);

		var request;
		switch(type){
			case 'only':
				var request = index.openCursor(IDBKeyRange.only(needle));
			case 'all':
			default:
				var request = index.openCursor(IDBKeyRange.lowerBound(0));
			break;
		}
		var data = [];
		request.onsuccess = function() {
		  var cursor = request.result;
		  if (cursor) {
		  	console.log(cursor.value);
		    // Called for each matching record.
		    data.push(cursor.value);
		    cursor.continue();
		  } else {
		    // No more matching records.
		  }
		};

		return data;
	}

	window.DB = function(j){
		return new _Data(j);
	}
})();