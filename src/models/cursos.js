const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const cursoSchema = Schema({
    nombre: {
        type: String,
        require: true
    },
    id: {
        type: Number,
        require: true
    },
    descripcion: {
        type: String,
        require: true
    },
    valor: {
      type: Number,
      require: true
    },
    ih: {
        type: Number
    },
    modalidad: {
        type: String
    },
    estado: {
        type: String
    },
    matriculados: {
        type:[]
    }
});
cursoSchema.plugin(uniqueValidator);
const crearcurso = mongoose.model('crearcurso', cursoSchema);

module.exports = {
    crearcurso
}
