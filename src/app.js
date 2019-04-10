//requires
require('./config/config');
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');

const mongoose = require('mongoose')
require('./helpers')

const directoriopublico = path.join(__dirname, '../public');
const dirNode_modules = path.join(__dirname, '../node_modules')

app.use(express.static(directoriopublico));



app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(require('./routes/index'));

mongoose.connect('mongodb://localhost/asignaturas', { useNewUrlParser: true }, (err, resultado) => {
    if (err) {
        return console.log(err)

    }
    console.log("conectado")
});


app.listen(process.env.PORT, () => {
    console.log('Escuchando en el puerto ' + process.env.PORT);
});