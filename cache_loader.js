window.script_data = {}

function ScriptCache(){
	var thiz = this
	thiz.db = openDatabase('scriptCacheDB', '1.0', 'Javascript cache', 1000000);
	
	var nullDataHandler = function(transaction, error){ console.log(error); return true; }
	var errorHandler    = function(transaction, error){ console.log(error.message); return true; }
	
	thiz.db.transaction(function(transaction){
		transaction.executeSql('CREATE TABLE scripts(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, code TEXT NOT NULL);', [], nullDataHandler, errorHandler);
	});
	
	var create_script_elem = function(src){
		var script_elem = document.createElement('script');
		if (src) script_elem.src = src;
		script_elem.type = 'text/javascript';
		document.getElementsByTagName('head')[0].appendChild(script_elem);	
		return script_elem;
	}
	
	var get_code = function(script_name){
		if (window.script_data[script_name])
			return window.script_data[script_name].toString().replace(/^function\s*\(\)\s*\{/,'').slice(1,-1)
	}
	
	var store_in_cache = function(script_name, code){
		thiz.db.transaction(function(transaction){
			transaction.executeSql('insert into scripts (name, code) VALUES (?,?);', [script_name, code], nullDataHandler, errorHandler)
		})
	}
	
	var get_and_store = function(script_name){
		var the_codes = get_code(script_name)
		if (the_codes){
			create_script_elem().innerHTML = the_codes
			store_in_cache(script_name, the_codes)
		} else
			setTimeout(function(){ get_and_store(script_name) }, 100)
	}

	return {
		include: function(script_name){
			thiz.db.transaction(function(transaction){
				transaction.executeSql('select code from scripts where name=?;', [script_name], function(transaction, data){
					if (data.rows.length > 0)
						create_script_elem().innerHTML = data.rows.item(0).code
					else {
						create_script_elem(script_name)
						get_and_store(script_name)
					}
				}, errorHandler)
			});
		},
		clear_from_cache: function(script_name){
			thiz.db.transaction(function(transaction){
				transaction.executeSql('DELETE FROM scripts WHERE name=?;', [script_name], nullDataHandler, errorHandler)
			});
		}
	}
	
}

var sc = new ScriptCache()
sc.include('scriiip.js')
