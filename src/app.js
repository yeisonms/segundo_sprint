require('./helpers')
require('./config/config');
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const directoriopublico = path.join(__dirname, '../public');
const dirNode_modules = path.join(__dirname, '../node_modules');
app.use(express.static(directoriopublico));
app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('./routes/index'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use((req, res, next)=>{
  if (req.session.usuario) {
    res.locals.sesion=true;
    res.locals.nombre=req.session.nombre;
    res.locals.rol=req.session.rol;
  }
  next();
})
mongoose.connect(process.env.URLDB, { useNewUrlParser: true }, (err, resultado) => {
    if (err) {
        return console.log(err);
    }
    console.log("conectado");
});
app.listen(process.env.PORT, () => {
    console.log('Escuchando en el puerto ' + process.env.PORT);
});
