const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const usuarioSchema = Schema({
    nombre: {
        type: String,
        require: true,
        trim:true
    },
    documento: {
        type: Number,
        require: true,
        trim:true,
        min:0,
        unique:true
    },
    password: {
        type: String,
        require: true,
        trim:true
    },
    telefono: {
        type: Number,
        default:0,
        trim:true,
        unique:true
    },
    rol: {
        type: String,
        default:"aspirante"
    },
    correo: {
        type:String,
        default:"",
        trim:true,
        unique:true
    },
    listaCursos: {
        type:Array,
        default:[]
    }
});
usuarioSchema.plugin(uniqueValidator);
const crearUsuario = mongoose.model('crearUsuario', usuarioSchema);

module.exports = {
    crearUsuario
}
