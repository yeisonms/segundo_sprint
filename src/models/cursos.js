const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const cursoSchema = Schema({
    nombre: {
        type: String,
        require: true,
        trim:true
    },
    id: {
        type: Number,
        require: true,
        trim:true,
        unique:true
    },
    descripcion: {
        type: String,
        require: true,
        trim:true
    },
    valor: {
      type: Number,
      require: true,
      trim:true
    },
    ih: {
        type: Number,
        trim:true
    },
    modalidad: {
        type: String
    },
    estado: {
        type: String,
        default:"disponible"
    },
    matriculados: {
        type:Array,
        default:[]
    }
});
cursoSchema.plugin(uniqueValidator);
const crearcurso = mongoose.model('crearcurso', cursoSchema);

module.exports = {
    crearcurso
}
