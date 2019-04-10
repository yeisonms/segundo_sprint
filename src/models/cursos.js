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
    ih: {

        type: Number


    },
    valor: {

        type: Number,
        require: true
    },
    modalidad: {

        type: String

    },
    estado: {
        type: String
    }
});
cursoSchema.plugin(uniqueValidator);
const crearcurso = mongoose.model('crearcurso', cursoSchema);


//////
const listar = () => {
    try {
        listadoCursos = require('./listadoCursos.json');
    } catch (e) {
        listadoCursos = [];
    }
};

const guardar = () => {
    let datos = JSON.stringify(listadoCursos);
    fs.writeFile('./src/listadoCursos.json', datos, (err) => {
        if (err) throw (err);
        console.log("Cursos guardados!");
    })
};

const guardarUsuarios = () => {
    let datos = JSON.stringify(listadoUsuarios);
    fs.writeFile('./src/listadoUsuarios.json', datos, (err) => {
        if (err) throw (err);
        console.log("Usuarios guardados");
    })
};

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