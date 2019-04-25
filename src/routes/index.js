require('../helpers')
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const Curso = require('./../models/cursos')
const Usuario = require('./../models/usuario')
const bcrypt = require('bcrypt');
const dirViews = path.join(__dirname, '../../views');
const directoriopartials = path.join(__dirname, '../../partials');
const session = require('express-session');
var ObjectId = require('mongodb').ObjectID;


app.set('view engine', 'hbs');
app.set('views', dirViews)
hbs.registerPartials(directoriopartials);
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));


app.get('/', (req, res) => {
  Curso.crearcurso.find().exec((err, respuesta) => {
    if (err) {
      throw new Error("no se pudieron traer los cursos");
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
    }else {
      let mensaje = `<h3 style="color:red;"><b>Usuario registrado!</b></h3><br><p>Nombre: ${resultado.nombre}</p><br><p>Documento: ${resultado.documento}</p><br><p>Telefono: ${resultado.telefono}</p><br><p>Correo electronico: ${resultado.correo}</p><br>`
      res.render('registroexitoso', {
        mostrar: mensaje
      })
    }
  })
});
app.post('/ingresar', async(req, res) => {
  let listaU;
  let listaC;
  await Curso.crearcurso.find({}, (err, listaCursos)=>{
    if (err) {
      console.log("no se pudieron obtener los cursos");
    }
    listaC=listaCursos;
  })
  await Usuario.crearUsuario.find({}, (err, listaUsuarios)=>{
    if (err) {
      console.log("no se pudieron obtener los usuarios");
    }
    listaU=listaUsuarios;
  })
  Usuario.crearUsuario.findOne({nombre:req.body.nombre}, (err, usuario) => {
    if (err) {
      return console.log(err)
    }
    if (!usuario) {
      return res.render('ingresar', {
        mensaje: "Nombre de usuario o clave incorrectos"
      })
    }
    if (!bcrypt.compareSync(req.body.password, usuario.password)) {
      return res.render('ingresar', {
        mensaje: "Nombre de usuario o clave incorrectos"
      })
    } else {
      req.session.usuario = usuario._id;
      req.session.nombre =usuario.nombre;
      req.session.rol=usuario.rol;
      switch (usuario.rol) {
        case 'aspirante':
        res.render('aspirante', {
          nombre: usuario.nombre,
          rol: usuario.rol,
          aspirante: usuario,
          lista:listaC
        });
        break;
        case 'coordinador':
        Usuario.crearUsuario.find({rol:{$in:["docente"]}},{nombre:1, documento:1}, (err, docentes)=>{
          if (err) {
            console.log("error al consultar base de datos");
          }
          res.render('coordinador', {
            nombre:usuario.nombre,
            rol:usuario.rol,
            listaU:listaU,
            listaC:listaC,
            docentes:docentes
          });
        })
        break;
      }
    }
  })
})


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
app.post('/cerrarCurso', async(req, res) => {
  await Curso.crearcurso.findOneAndUpdate({id:parseInt(req.body.idCurso)},{$set:{docente:parseInt(req.body.documentoDocente),estado:"cerrado"}},(err,resultado)=>{
    if (err) {
      throw new Error("no se pudo añadir el docente al curso");
    }
  })
  await Usuario.crearUsuario.findOneAndUpdate({documento:parseInt(req.body.documentoDocente)},{$addToSet:{listaCursos:parseInt(req.body.idCurso)}},(err,resultado)=>{
    if (err) {
      throw new Error("no se pudo añadir el curso al docente");
    }
  })
  Curso.crearcurso.find({}, (err, listaCursos)=>{
    if (err) {
      throw new Error("no se pudieron traer los cursos")
    }
    Usuario.crearUsuario.find({}, (err, listaUsuarios)=>{
      if (err) {
        throw new Error("no se pudieron traer los usuarios")
      }
      Usuario.crearUsuario.find({rol:{$in:["docente"]}},{nombre:1, documento:1}, (err, resultado)=>{
        if (err) {
          throw new Error("no se pudieron traer los docentes");
        }
        res.render('coordinador', {
          nombre:usuariologeado.nombre,
          rol:usuariologeado.rol,
          listaU:listaUsuarios,
          listaC:listaCursos,
          docentes:resultado
        });
      });
    });
  });

});
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
app.post('/confirmarActualizacion', (req, res)=>{
  Usuario.crearUsuario.findOneAndUpdate({_id:ObjectId(req.body.id)}, {$set:{nombre:req.body.nombre, documento:parseInt(req.body.documento),telefono:parseInt(req.body.telefono),correo:req.body.correo,rol:req.body.rol}},{new:true,runValidators:true,context:'query'},(err,resultado)=>{
    if (err) {
      res.render('administrador',{
        mensaje:err
      })
    }
    let perfil = resultado;
    Usuario.crearUsuario.find({rol:{$in:["aspirante", "docente"]}},{nombre:1, documento:1, rol:1}, (err, resultado)=>{
      if (err) {
        throw new Error("no se cargaron los usuarios")
      }
      res.render('administrador',{
        listadoU:resultado,
        perfil:perfil,
        mensaje:"Usuario Actualizado"
      })

    })
  })
})


app.get('*', (req, res) => {
  res.render('error', {
    estudiante: 'error mijo'
  });
});

module.exports = app
