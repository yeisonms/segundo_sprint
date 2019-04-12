const usuario = require('../usuario')
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






const matricularCursoId = (id, estudiante) => {



    listar();
    let curso = listadoCursos.find(cur => cur.id === id)
    if (!curso) {
        return [estudiante, false]
    } else {
        if (curso.matriculados.find(est => est === estudiante.documento)) {
            return [estudiante, false]
        } else {
            curso.matriculados.push(estudiante.documento);
            guardar();
            estudiante.listaCursos.push(curso.id);
            usuario.guardar()
            return [estudiante, true];
            //return "Te has matriculado al curso: " + curso.nombre;

        }
    }
}

const eliminarinscrito = (id, documento) => {
    listar();
    var idobtenido = id;
    var documentoobtenido = documento.documento;
    listadoUsuarios = require('./listadoUsuarios.json');
    let estudiantes = listadoUsuarios.filter(estCurso => estCurso.rol != "nn");
    estudiantes.forEach(usuario => {
        if (usuario.documento == documentoobtenido) {
            let nuevosCursosEst = usuario.listaCursos.filter(estCurso => estCurso != idobtenido);
            usuario.listaCursos = nuevosCursosEst;
        }
    });


    //para eliminar el curso
    let materias = listadoCursos.filter(lc => lc.nombre != "ASD");
    materias.forEach(cur_so => {
        if (cur_so.id == idobtenido) {
            console.log("el id del curso es" + cur_so.id);
            let nuevosCursos = cur_so.matriculados.filter(curEst => curEst != documentoobtenido);
            cur_so.matriculados = nuevosCursos;
        }
    });

    listadoCursos = materias;
    listadoUsuarios = estudiantes;
    guardar();
    guardarUsuarios();

    return "Eliminado correctamente";


}

const eliminarinscritoCoordinador = (id, documento) => {
    listar();
    var idobtenido = id;
    var documentoobtenido = documento;
    listadoUsuarios = require('./listadoUsuarios.json');
    let estudiantes = listadoUsuarios.filter(estCurso => estCurso.rol != "nn");
    estudiantes.forEach(usuario => {
        if (usuario.documento == documentoobtenido) {
            let nuevosCursosEst = usuario.listaCursos.filter(estCurso => estCurso != idobtenido);
            usuario.listaCursos = nuevosCursosEst;
        }
    });


    //para eliminar el curso
    let materias = listadoCursos.filter(lc => lc.nombre != "ASD");
    materias.forEach(cur_so => {
        if (cur_so.id == idobtenido) {
            console.log("el id del curso es" + cur_so.id);
            let nuevosCursos = cur_so.matriculados.filter(curEst => curEst != documentoobtenido);
            cur_so.matriculados = nuevosCursos;
        }
    });

    listadoCursos = materias;
    listadoUsuarios = estudiantes;
    guardar();
    guardarUsuarios();

    return "Eliminado correctamente";


}

const cambiarEstado = (id) => {
    listar();
    let seleccionado = listadoCursos.find(curso => curso.id === id);
    console.log(seleccionado);
    if (seleccionado.estado === 'disponible') {
        seleccionado.estado = 'cerrado'
    } else {
        seleccionado.estado = 'disponible'
    }
    guardar();
}


module.exports = {
    crearcurso,

    matricularCursoId,
    eliminarinscrito,
    eliminarinscritoCoordinador,
    cambiarEstado
}
