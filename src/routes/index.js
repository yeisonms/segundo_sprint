require('../helpers');
var helpers = require('handlebars-helpers')();
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
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const multer = require('multer')

app.set('view engine', 'hbs');
app.set('views', dirViews);
hbs.registerPartials(directoriopartials);
var upload = multer({
  limits: {
    fileSize: 10000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error('no es un archivo valido'))
    }
    cb(null, true)
  }
})

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
app.get('/salir', (req,res)=>{
  req.session.destroy((err)=>{
    if (err) throw new Error(err);
  })
  res.redirect('/');
})
app.post('/cursoscreados', (req, res) => {
  Curso.crearcurso.find().exec((err, respuesta) => {
    if (err) {
      throw new Error(err);
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
app.post('/registroC', (req, res) => {
  res.render('registrocurso', {});
});
app.post('/matricula', async(req, res) => {
  let listaC;
  let mensaje;
  let cursosAspirante;
  await Usuario.crearUsuario.findByIdAndUpdate(req.session.usuario, {$addToSet:{listaCursos:parseInt(req.body.idcurso)}},{new:true},(err,usuario)=>{
    if (err) {
      throw new Error(err);
    }else {
      Curso.crearcurso.findOneAndUpdate({id:req.body.idcurso},{$addToSet:{matriculados:usuario.documento}}, (err, curso)=>{
        if (err) {
          throw new Error(err)
        }else if (curso.matriculados.find(cc=>cc==usuario.documento)) {
          mensaje="Ya estas matriculado en este curso";
        }else {
          mensaje="¡Te has matriculado exitosamente!"
        }
        cursosAspirante=usuario.listaCursos;
      })
    }
  })
  Curso.crearcurso.find({}, (err, result)=>{
    if (err) {
      throw new Error("no se pudieron obtener los cursos");
    }else {
      listaC = result;
      res.render('aspirante', {
        nombre: req.session.nombre,
        rol: req.session.rol,
        cursosAspirante: cursosAspirante,
        lista:listaC,
        confirmacion:mensaje
      });
    }
  })
});
app.post('/registro', (req, res) => {
    const msg = {
        to: req.body.correo,
        from: 'yeisonm@unicauca.edu.co',
        subject: 'Bienvenido',
        text: 'Bienvenido a la página de Node.JS'
    };
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
          sgMail.send(msg);
          let mensaje = `<h3 style="color:red;"><b>Usuario registrado!</b></h3><br><p>Nombre: ${resultado.nombre}</p><br><p>Documento: ${resultado.documento}</p><br><p>Telefono: ${resultado.telefono}</p><br><p>Correo electronico: ${resultado.correo}</p><br>`
          res.render('registroexitoso', {
            mostrar: mensaje
          })
        }
    })
});
app.post('/coordinador', async(req, res) => {
  let listaCursos;
  let listaUsuarios;
  await Curso.crearcurso.find({}, (err, result)=>{
    if (err) {
      throw new Error(err);
    }
    listaCursos = result;
  })
  await Usuario.crearUsuario.find({}, (err, result)=>{
    if (err) {
      throw new Error(err);
    }
    listaUsuarios = result;
  })
  Usuario.crearUsuario.find({rol:{$in:["docente"]}},{nombre:1, documento:1}, (err, docentes)=>{
    if (err) {
      throw new Error(err);
    }
    res.render('coordinador', {
      nombre:req.session.nombre,
      rol:req.session.rol,
      listaU:listaUsuarios,
      listaC:listaCursos,
      docentes:docentes
    });
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
      req.session.usuario=usuario._id;
      req.session.nombre=usuario.nombre;
      req.session.rol=usuario.rol;
      switch (usuario.rol) {
        case 'aspirante':
        res.render('aspirante', {
          nombre: usuario.nombre,
          rol: usuario.rol,
          cursosAspirante: usuario.listaCursos,
          lista:listaC,
          sesion:true
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
            docentes:docentes,
            sesion:true
          });
        })
        break;
        case 'docente':
          res.render('docente',{
            nombre:usuario.nombre,
            rol:usuario.rol,
            listaU:listaU,
            listaC:listaC,
            sesion:true,
            cursosAsignados:usuario.listaCursos
          })
      }
    }
  })
});
app.post('/registrocurso', upload.single('archivo'), (req, res) => {
    let cursos = new Curso.crearcurso({
        nombre: req.body.nombre,
        id: parseInt(req.body.id),
        descripcion: req.body.descripcion,
        valor: parseInt(req.body.valor),
        modalidad: req.body.modalidad,
        ih: parseInt(req.body.ih),
        info: req.file.buffer
    })
    cursos.save((err, resultado) => {
        if (err) {
            res.render('mostrarcurso', {
                mostrar: err
            })
        }
        informacion = resultado.info.toString('base64')
        res.render('mostrarcurso', {
            mostrar: informacion,
            infon: resultado.nombre,
            infoid: resultado.id,
            infod: resultado.descripcion,
            infov: resultado.valor,
            infom: resultado.modalidad
        })
    })
});
app.post('/eliminaCursoAspirante', async(req, res) => {
  let listaC;
  let mensaje;
  let cursosAspirante;
  await Usuario.crearUsuario.findByIdAndUpdate(req.session.usuario, {$pull:{listaCursos:parseInt(req.body.boton)}}, {new:true}, (err,usuario)=>{
    if (err) {
      throw new Error(err);
    }else {
      Curso.crearcurso.findOneAndUpdate({id: req.body.boton},{$pull:{matriculados:usuario.documento}}, (err, result)=>{
        if (err) {
          throw new Error(err);
        }
        mensaje="Curso eliminado con exito!";
      });
    }
    cursosAspirante=usuario.listaCursos;
  });
  Curso.crearcurso.find({}, (err, result)=>{
    if (err) {
      throw new Error("no se pudieron obtener los cursos");
    }else {
      listaC = result;
      res.render('aspirante', {
        nombre: req.session.nombre,
        rol: req.session.rol,
        cursosAspirante: cursosAspirante,
        lista:listaC,
        confirmacion:mensaje
      });
    }
  })
});
app.post('/eliminaAspiranteCoordinador2', async(req, res) => {
  let curso;
  await Curso.crearcurso.findOneAndUpdate({id: parseInt(req.body.id)},{$pull:{matriculados:parseInt(req.body.cedula)}}, {new:true}, (err, result)=>{
    if (err) {
      throw new Error(err);
    }
    curso=result;
  })
  await Usuario.crearUsuario.findOneAndUpdate({documento:parseInt(req.body.cedula)}, {$pull:{listaCursos:parseInt(req.body.id)}}, {new:true}, (err,resultado)=>{
    if (err) {
      throw new Error(err);
    }
  })
  Usuario.crearUsuario.find({}, (err, listaUsuarios)=>{
    if (err) {
      throw new Error(err);
    }
    res.render('datoscurso', {
      curso:curso,
      listaU:listaUsuarios
    });
  })
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
          nombre:req.session.nombre,
          rol:req.session.rol,
          listaU:listaUsuarios,
          listaC:listaCursos,
          docentes:resultado
        });
      });
    });
  });

});
app.post('/administrar', (req, res)=> {
  Usuario.crearUsuario.find({rol:{$in:["aspirante", "docente"]}},{nombre:1, documento:1, rol:1}, (err, resultado)=>{
    if (err) {
      throw new Error(err);
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
app.post('/confirmarActualizacion', async(req, res)=>{
  let perfil;
  await Usuario.crearUsuario.findOneAndUpdate({_id:ObjectId(req.body.id)}, {$set:{nombre:req.body.nombre, documento:parseInt(req.body.documento),telefono:parseInt(req.body.telefono),correo:req.body.correo}},{new:true,runValidators:true,context:'query'},(err,resultado)=>{
    if (err) {
      res.render('administrador',{
        mensaje:err
      })
    }
    perfil = resultado;
  })
  Usuario.crearUsuario.find({rol:{$in:["aspirante", "docente"]}},{nombre:1, documento:1, rol:1}, (err, resultado)=>{
    if (err) {
      throw new Error("no se cargaron los usuarios")
    }
    res.render('administrador',{
      listadoU:resultado,
      perfil:perfil,
      mensaje:"Datos actulizados!"
    })
  })
})
app.post('/cambioRol', async(req,res)=>{
  let perfil;
  await Curso.crearcurso.updateMany({matriculados:{$all:[parseInt(req.body.documento)]}},{$pull:{matriculados:parseInt(req.body.documento)}},{new:true},(err,resultado)=>{
    if (err) {
      throw new Error(err);
    }
  })
  await Usuario.crearUsuario.findOneAndUpdate({documento:req.body.documento},{$set:{listaCursos:[],rol:req.body.rol}},{new:true}, (err,resultado)=>{
    if (err) {
      throw new Error(err);
    }
    perfil=resultado;
  })
  Usuario.crearUsuario.find({rol:{$in:["aspirante", "docente"]}},{nombre:1, documento:1, rol:1}, (err, resultado)=>{
    if (err) {
      throw new Error("no se cargaron los usuarios")
    }
    res.render('administrador',{
      listadoU:resultado,
      perfil:perfil,
      mensaje2:"Rol actualizado!"
    })
  })
})
app.post('/aspirante', async(req, res) => {
  let cursosAspirante;
  await Usuario.crearUsuario.findById(req.session.usuario,(err,usuario)=>{
    if (err) {
      throw new Error(err);
    }else {
        cursosAspirante=usuario.listaCursos;
    }
  })
  Curso.crearcurso.find({}, (err, listaCursos)=>{
    if (err) {
      throw new Error(err)
    }else {
      res.render('aspirante', {
        nombre: req.session.nombre,
        rol: req.session.rol,
        cursosAspirante: cursosAspirante,
        lista:listaCursos
      });
    }
  })
});
app.post('/docente', async(req, res) => {
  let cursosDocente;
  let listaU;
  let listaC;
  await Usuario.crearUsuario.findById(req.session.usuario,(err,usuario)=>{
    if (err) {
      throw new Error(err);
    }else {
        cursosDocente=usuario.listaCursos;
    }
  })
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
  res.render('docente',{
    nombre:req.session.nombre,
    rol:req.session.rol,
    listaU:listaU,
    listaC:listaC,
    cursosAsignados:cursosDocente
  })
});


    /* var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, 'public/uploads')
        },
        filename: function(req, file, cb) {
            cb(null, 'info' + req.body.nombre + path.extname(file.originalname))
        }
    }) */

app.get('*', (req, res) => {
    res.render('error', {
        estudiante: 'error mijo'
    });
});

module.exports = app
