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
			autoIncrement: true,
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
	  	var ai = this.autoIncrement;
		this.table = this.db.createObjectStore(this.name, {keyPath: kp, autoIncrement:ai});
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
		this.table.put(data);
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
		var request = indexedDB.open(this.name);

		var This = this;
		request.onupgradeneeded = function() {
		  // The database did not previously exist, so create object stores and indexes.
		  This.db = request.result;
		  This.t = {};
		  for(var table in This.tables){
		  	//Instance the table name in the object.
		  	This.tables[table].db = This.db;
		  	This.t[table] = new _Table(This.tables[table]);
		  }
		};

		request.onsuccess = function() {
			This.db = request.result;
			if(typeof callback === 'function'){
				if(typeof This.data === 'object'){
					for(var k in This.data){
						if(This.data.hasOwnProperty(k)){
							This.populate(k, This.data[k], function(){
							});
						}
					}
				}
				callback();
			}
		};
	}

	//Multiple data insertion
	_Data.prototype.populate = function(tableName, data, callback){
		//var table = this.t[tableName];
		var tx = this.db.transaction(tableName, "readwrite");
		var table = tx.objectStore(tableName);

		for(var i = 0, len = data.length; i < len; i++){
			var d = data[i];
			table.put(d);
		}

		tx.oncomplete = function() {
		  // All requests have succeeded and the transaction has committed.
		  if(typeof	callback === 'function'){
		  	callback();
		  }
		};
	}

	_Data.prototype.prepareSearch = function(tableName, index){
		var tx = this.db.transaction(tableName, "readonly");
		var table = tx.objectStore(tableName);
		var index = table.index(index);

		return {tx:tx, table:table, index:index};
	}

	_Data.prototype.searchByIndex = function(tableName, index, needle, callback){
		var j = this.prepareSearch(tableName, index);
		var tx = j.tx;
		var table = j.table;
		var index = j.index;

		var request = index.get(needle);
		var results = [];
		request.onsuccess = function() {
			var matching = request.result;
			if (matching !== undefined) {
				// A match was found.
				results.push(matching);
			} else {
				// No match was found.
			}
			if(typeof callback === 'function'){
				callback(results);
			}
		};
	}

	_Data.prototype.searchByCursor = function(tableName, index, needle, callback){
		var j = this.prepareSearch(tableName, index);
		var tx = j.tx;
		var table = j.table;
		var index = j.index;

		var results = [];
		index.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if (cursor) {
			// cursor.key is a name, like "Bill", and cursor.value is the whole object.
			results.push(cursor.value);
			cursor.continue();
			}else{
				if(typeof callback === 'function'){
					callback(results);
				}
			}
		};
	}

	_Data.prototype.search = function(tableName, index, needle, type, callback){
		if(typeof type === 'undefined'){
			type = 'any'; //It could also be "only"
		}
		var tx = this.db.transaction(tableName, "readonly");
		var table = tx.objectStore(tableName);
		var index = table.index(index);

		var request;
		switch(type){
			case 'only':
				var request = index.openCursor(IDBKeyRange.only(needle));
			break;
			case 'any':
			default:
				var request = index.openCursor(IDBKeyRange.lowerBound(needle));
			break;
		}
		var data = [];
		request.onsuccess = function() {
			var cursor = request.result;
			if (cursor) {
				// Called for each matching record.
				data.push(cursor.value);
				cursor.continue();
			} else {
				// No more matching records.
				if(typeof callback === 'function'){
				callback(data);
				}
			}
		};
	}

	_Data.prototype.lastID = function(tableName, index, callback) {
		var tx = this.db.transaction(tableName, "readonly");
		var table = tx.objectStore(tableName);
		var index = table.index(index);
		var request = index.count();

		request.onsuccess = function(e){
			var result = e.target.result;

			var req = index.openCursor(IDBKeyRange.only(result));
			var data = {};

			req.onsuccess = function(x){
				var result = x.target;
				
				if(result.result){
					callback(result.result.value);
				}else{
					callback(null);
				}
			}
		}
		
		var data = {};
	};

	window.DB = function(j){
		return new _Data(j);
	}
})();