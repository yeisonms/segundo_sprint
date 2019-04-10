const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const usuario = require('../usuario');
const curso = require('../cursos')
const Curso = require('./../models/cursos')
const Usuario = require('./../models/usuario')
const bcrypt = require('bcrypt');
var session = require('express-session')
require('../helpers')

const dirViews = path.join(__dirname, '../../views');
const directoriopartials = path.join(__dirname, '../../partials');




app.set('view engine', 'hbs');
app.set('views', dirViews)
hbs.registerPartials(directoriopartials);





var usuariologeado;

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
app.get('/registroexitoso', (req, res) => {
    res.render('registroexitoso', {});
});

app.get('/registrocurso', (req, res) => {
    res.render('registrocurso', {});

});
app.get('/coordinador', (req, res) => {
    res.render('coordinador', {});

});
app.get('/mostrarcurso', (req, res) => {
    res.render('mostrarcurso', {});
});
/* app.post('/coordinador', (req, res) => {
    res.render('coordinador', {
        nombre: usuariologeado.nombre,
         rol: usuariologeado.rol, 
    });
})  */
app.post('/matricula', (req, res) => {
    let texto = curso.matricularCursoId(parseInt(req.body.idcurso), usuariologeado);
    console.log(texto);

    usuariologeado = texto[0];
    let mensaje = ""
    if (texto[1]) {
        mensaje = "Estudiante ingresado correctamente";
    } else {
        mensaje = "Ya esta registrado al curso"
    }
    res.render('aspirante', {
        nombre: usuariologeado.nombre,
        rol: usuariologeado.rol,
        confirmacion: mensaje,
        aspirante: usuariologeado
    });

});
app.post('/registro', (req, res) => {
    let usuario = new Usuario.crearUsuario({
        nombre: req.body.nombre,
        password: bcrypt.hashSync(req.body.password, 10),
        cedula: parseInt(req.body.cedula),
        correo: req.body.correo,
        telefono: parseInt(req.body.telefono),
        estado: "aspirante"
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

app.post('/registrocurso', (req, res) => {

    let cursos = new Curso.crearcurso({
        nombre: req.body.nombre,
        id: parseInt(req.body.id),
        descripcion: req.body.descripcion,
        valor: parseInt(req.body.valor),
        modalidad: req.body.modalidad,
        ih: parseInt(req.body.ih),
        estado: "disponible"
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

app.post('/ingresar', (req, res) => {
    Usuario.crearUsuario.findOne({ nombre: req.body.usuario }, (err, resultados) => {
        console.log(resultados)
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
            req.session.usuario = resultados._id
                /* res.render('ingresar', {
                    mensaje: "bienvenido " + resultados.nombre + req.session.usuario

                }) */
            usuariologeado = resultados;
            switch (resultados.estado) {
                case 'aspirante':
                    res.render('aspirante', {
                        nombre: resultados.nombre,
                        estado: resultados.estado,
                        aspirante: usuariologeado
                    });
                    break;
                case 'coordinador':
                    res.render('registrocurso', {
                        /*   nombre: resultados.nombre,
                          estado: resultados.estado, */
                    });
                    break;
            }
        }


    })


})


/* app.post('/login', (req, res) => {
    Usuario.crearUsuario.findOne({ nombre: req.body.nombre }, (err, resultados) => {
        console.log(resultados)
        if (err) {
            return console.log(err)

        }

        if (!resultados) {
            res.render('login', {
                alerta: 'Nombre de usuario o cedula incorrectos'
            })
            if (!bcrypt.compareSync(req.body.password, resultados.password))
                return res.render('coordinador')

        }

        res.render('coordinador', {
            nombre: resultados.nombre

        })

    })


}); */
/* app.post('/login', (req, res) => {
    let exito = usuario.autenticar(req.body.nombre, parseInt(req.body.cedula));
    if (!exito) {
        res.render('login', {
            alerta: 'Nombre de usuario o cedula incorrectos'
        });
    } else {
        usuariologeado = exito;
        switch (exito.rol) {
            case 'aspirante':
                res.render('aspirante', {
                    nombre: exito.nombre,
                    rol: exito.rol,
                    aspirante: usuariologeado
                });
                break;
            case 'coordinador':
                res.render('coordinador', {
                    nombre: exito.nombre,
                    rol: exito.rol,
                });
                break;
        }
    }
}); */
app.post('/eliminaCursoAspirante', (req, res) => {
    let id = req.body.boton;
    let texto = curso.eliminarinscrito(id, usuariologeado);
    console.log(texto);
    res.render('aspirante', {
        nombre: usuariologeado.nombre,
        rol: usuariologeado.rol,
        confirmacion: texto,
        aspirante: usuariologeado
    });
});
app.post('/cambioEstado', (req, res) => {
    curso.cambiarEstado(parseInt(req.body.botonCambiar));
    res.render('coordinador', {
        nombre: usuariologeado.nombre,
        rol: usuariologeado.rol
    });
})
app.post('/eliminaAspiranteCoordinador', (req, res) => {
    let id = req.body.botonCoordinador;
    var array = id.split(";");
    var idcurso = array[0];
    var estudiante = array[1];
    let texto = curso.eliminarinscritoCoordinador(idcurso, estudiante);
    console.log(texto);
    res.render('coordinador', {});
});

app.post('/eliminaAspiranteCoordinador2', (req, res) => {
    let texto = curso.eliminarinscritoCoordinador(req.body.id, req.body.cedula);
    res.render('datoscurso', {
        id: req.body.id,
        usuario: usuariologeado
    });
});


app.get('*', (req, res) => {
    res.render('error', {
        estudiante: 'error mijo'
    });
});

module.exports = app