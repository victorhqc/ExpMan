function extend(subClass, superClass) {
    var F = function() {};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
}

//--------------------------------------
//Interfaces
var Interface = function(nombre, metodos) {
    if(arguments.length != 2) {
        throw new Error("Constructor de la Interfaz llamado con " + arguments.length +
        " argumentos, pero se esperaban exactamente 2.");
    }
    this.nombre = nombre;
    this.metodos = [];
    for(var i = 0, len = metodos.length; i < len; i++) {
        if(typeof metodos[i] !== 'string') {
        throw new Error("Constructor de la Interfaz espera que los nombres de los métodos sean "
        + "pasados como un string.");
    }
    this.metodos.push(metodos[i]);
    }
};

Interface.ensureImplements = function(object) {
    if(arguments.length < 2) {
        throw new Error("Funcion Interface.ensureImplements llamado con " +
        arguments.length + "argumentos, pero esperados al menos 2.");
    }
    for(var i = 1, len = arguments.length; i < len; i++) {
        var interface = arguments[i];
        if(interface.constructor !== Interface) {
            throw new Error("Funcion Interface.ensureImplements espera argumentos"
            + "dos y más para ser instancias de la Interface.");
        }
        for(var j = 0, methodsLen = interface.metodos.length; j < methodsLen; j++) {
            var metodo = interface.metodos[j];
            if(!object[metodo] || typeof object[metodo] !== 'function') {
                throw new Error("Function Interface.ensureImplements: objeto "
                + "no implementa " + interface.nombre
                + " . Metodo " + metodo + " no fue encontrado.");
            }
        }
    }
};