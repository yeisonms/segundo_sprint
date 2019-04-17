const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const Curso = require('./../models/cursos')
const Usuario = require('./../models/usuario')
const bcrypt = require('bcrypt');
var session = require('express-session')
var usuariologeado;
require('../helpers')

const dirViews = path.join(__dirname, '../../views');
const directoriopartials = path.join(__dirname, '../../partials');

app.set('view engine', 'hbs');
app.set('views', dirViews)
hbs.registerPartials(directoriopartials);
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true

}))


app.get('/', (req, res) => {

  Curso.crearcurso.find().exec((err, respuesta) => {
    if (err) {
      return console.log(err)

    }
    res.render('index', {
      listado: respuesta


    })
  })
});
app.get('/cursoscreados', (req, res) => {

  Curso.crearcurso.find().exec((err, respuesta) => {
    if (err) {
      return console.log(err)

    }
    res.render('cursoscreados', {
      listado: respuesta

    })
  })

});
app.get('/login', (req, res) => {
  res.render('login', {});
});
app.get('/registro', (req, res) => {
  res.render('registro', {});
});
app.get('/registrocurso', (req, res) => {
  res.render('registrocurso', {});

});
app.get('/mostrarcurso', (req, res) => {
  res.render('mostrarcurso', {});
});


app.post('/matricula', async(req, res) => {
  let listaCursos;
  let mensaje;
  await Curso.crearcurso.find({}, (err, result)=>{
    if (err) {
      console.log("no se pudieron obtener los cursos");
    }
    listaCursos = result;
  })
  await Curso.crearcurso.findOneAndUpdate({id: req.body.idcurso},{$addToSet:{matriculados:usuariologeado.documento}}, (err, result)=>{
    if (err) {
      console.log(err);
    }
    if (result.matriculados.find(cc=>cc==usuariologeado.documento)) {
      mensaje = "Ya estas matriculado en este Curso";
    }else{
      mensaje = "Matricula exitosa";
    }
  })
  await Usuario.crearUsuario.findOneAndUpdate({documento:usuariologeado.documento}, {$addToSet:{listaCursos:parseInt(req.body.idcurso)}}, {new:true}, (err,resultado)=>{
    if (err) {
      return console.log("error");
    }
    usuariologeado=resultado;
  })
  res.render('aspirante', {
    nombre: usuariologeado.nombre,
    rol: usuariologeado.rol,
    aspirante: usuariologeado,
    lista:listaCursos,
    confirmacion:mensaje
  });

});
app.post('/registro', (req, res) => {
  let usuario = new Usuario.crearUsuario({
    nombre: req.body.nombre,
    password: bcrypt.hashSync(req.body.password, 10),
    documento: parseInt(req.body.cedula),
    correo: req.body.correo,
    telefono: parseInt(req.body.telefono)
  })
  usuario.save((err, resultado) => {
    if (err) {
      res.render('registroexitoso', {
        mostrar: err
      })
    }
    res.render('registroexitoso', {
      mostrar: resultado
    })
  })
});
app.post('/coordinador', async(req, res) => {
  let listaCursos;
  let listaUsuarios;
  await Curso.crearcurso.find({}, (err, result)=>{
    if (err) {
      console.log("no se pudieron obtener los cursos");
    }
    listaCursos = result;
  })
  await Usuario.crearUsuario.find({}, (err, result)=>{
    if (err) {
      console.log("no se pudieron obtener los usuarios");
    }
    listaUsuarios = result;
  })
  res.render('coordinador', {
    nombre:usuariologeado.nombre,
    rol:usuariologeado.rol,
    listaU:listaUsuarios,
    listaC:listaCursos
  });
})
app.post('/registrocurso', (req, res) => {
  let cursos = new Curso.crearcurso({
    nombre: req.body.nombre,
    id: parseInt(req.body.id),
    descripcion: req.body.descripcion,
    valor: parseInt(req.body.valor),
    modalidad: req.body.modalidad,
    ih: parseInt(req.body.ih)
  })
  cursos.save((err, resultado) => {
    if (err) {
      res.render('mostrarcurso', {
        mostrar: err
      })
    }
    res.render('mostrarcurso', {
      mostrar: resultado
    })
  })
});
app.post('/administrar', (req, res)=> {
  Usuario.crearUsuario.find({rol:{$in:["aspirante", "docente"]}},{nombre:1, documento:1, rol:1}, (err, resultado)=>{
    if (err) {
      console.log("error al consultar base de datos");
    }
    res.render('administrador',{
      listadoU:resultado
    })
  })
})
app.post('/actualizarUsuario', async(req, res)=>{
  let doc = req.body.documento;
  let listadoU;
  await Usuario.crearUsuario.find({rol:{$in:["aspirante", "docente"]}},{nombre:1, documento:1, rol:1}, (err, resultado)=>{
    if (err) {
      console.log("error al consultar base de datos");
    }
    listadoU=resultado;
  })
  Usuario.crearUsuario.findOne({documento:doc},{nombre:1,documento:1,correo:1,rol:1,telefono:1},(err,resultado)=>{
    if (err) {
      console.log(err);
    }
    res.render('administrador',{
      listadoU:listadoU,
      perfil:resultado
    })
  })
})
app.post('/ingresar', async(req, res) => {
  let listaCursos;
  let listaUsuarios;
  await Curso.crearcurso.find({}, (err, result)=>{
    if (err) {
      console.log("no se pudieron obtener los cursos");
    }
    listaCursos = result;
  })
  await Usuario.crearUsuario.find({}, (err, result)=>{
    if (err) {
      console.log("no se pudieron obtener los usuarios");
    }
    listaUsuarios = result;
  })

  Usuario.crearUsuario.findOne({ nombre: req.body.usuario }, (err, resultados) => {
    if (err) {
      return console.log(err)
    }
    if (!resultados) {
      return res.render('ingresar', {
        mensaje: "Nombre de usuario o cedula incorrectos"
      })
    }
    if (!bcrypt.compareSync(req.body.password, resultados.password)) {
      return res.render('ingresar', {
        mensaje: "contraseña no es correcta"
      })
    } else {
      //req.session.usuario = resultados._id
      usuariologeado = resultados;
      switch (resultados.rol) {
        case 'aspirante':
        res.render('aspirante', {
          nombre: resultados.nombre,
          rol: resultados.rol,
          aspirante: usuariologeado,
          lista:listaCursos
        });
        break;
        case 'coordinador':
        res.render('coordinador', {
          nombre:usuariologeado.nombre,
          rol:usuariologeado.rol,
          listaU:listaUsuarios,
          listaC:listaCursos
        });
        break;
      }
    }
  })
})
app.post('/eliminaCursoAspirante', async(req, res) => {
  let listaCursos;
  let mensaje;
  await Curso.crearcurso.find({}, (err, result)=>{
    if (err) {
      console.log("no se pudieron obtener los cursos");
    }
    listaCursos = result;
  })
  await Curso.crearcurso.findOneAndUpdate({id: req.body.boton},{$pull:{matriculados:usuariologeado.documento}}, (err, result)=>{
    if (err) {
      console.log(err);
    }
    mensaje="Curso eliminado con exito!";
  })
  await Usuario.crearUsuario.findOneAndUpdate({documento:usuariologeado.documento}, {$pull:{listaCursos:parseInt(req.body.boton)}}, {new:true}, (err,resultado)=>{
    if (err) {
      return console.log("error");
    }
    usuariologeado=resultado;
  })
  res.render('aspirante', {
    nombre: usuariologeado.nombre,
    rol: usuariologeado.rol,
    aspirante: usuariologeado,
    lista:listaCursos,
    confirmacion:mensaje
  });
});
app.post('/cambioEstado', (req, res) => {

})
app.post('/eliminaAspiranteCoordinador', (req, res) => {

});
app.post('/eliminaAspiranteCoordinador2', async (req, res) => {
  let curso;
  let listaUsuarios;
  await Curso.crearcurso.findOneAndUpdate({id: parseInt(req.body.id)},{$pull:{matriculados:parseInt(req.body.cedula)}}, {new:true}, (err, result)=>{
    if (err) {
      console.log(err);
    }
    curso=result;
  })
  await Usuario.crearUsuario.findOneAndUpdate({documento:parseInt(req.body.cedula)}, {$pull:{listaCursos:parseInt(req.body.id)}}, {new:true}, (err,resultado)=>{
    if (err) {
      return console.log("error");
    }
  })
  await Usuario.crearUsuario.find({}, (err, result)=>{
    if (err) {
      console.log("no se pudieron obtener los usuarios");
    }
    listaUsuarios = result;
  })
  res.render('datoscurso', {
    curso:curso,
    listaU:listaUsuarios
  });
});


app.get('*', (req, res) => {
  res.render('error', {
    estudiante: 'error mijo'
  });
});

module.exports = app
