let listadoUsuarios = [];
// cosas por modificar
const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const usuarioSchema = Schema({
    nombre: {
        type: String,
        require: true
    },
    documento: {
        type: Number,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    telefono: {
        type: Number
    },
    estado: {
        type: String
    },
    correo: {
        type:String
    },
    listaCursos: {
        type:[]
    }
});
usuarioSchema.plugin(uniqueValidator);
const crearUsuario = mongoose.model('crearUsuario', usuarioSchema);

const autenticar = (nombre, cedula) => {
    listar();
    let solicitante = listadoUsuarios.find(sol => sol.documento === cedula && sol.nombre === nombre);
    if (!solicitante) {
        return false;
    } else {
        return solicitante;
    }
}

module.exports = {
    crearUsuario,
    autenticar,
}
