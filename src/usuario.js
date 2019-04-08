const fs = require('fs');

let listadoUsuarios = [];

const crear = (nombre, documento, correo, telefono) => {
  listar();
  let user = {
    nombre:nombre,
    documento:documento,
    correo:correo,
    telefono:telefono,
    rol:'aspirante',
    listaCursos:[]
  };
  if (listadoUsuarios.length==0) {
    listadoUsuarios.push(user);
    console.log(listadoUsuarios);
    guardar();
    return "Usuario creado con exito"
  }
  else {
    let duplicado = listadoUsuarios.find(cc => cc.documento == user.documento);
    if (!duplicado) {
      listadoUsuarios.push(user);
      console.log(listadoUsuarios);
      guardar();
      return "Usuario creado con exito"
    }
    else {
      return "Ese numero de cedula ya se encuentra en uso"
    }
  }
};

const listar = () => {
  try {
    listadoUsuarios = require('./listadoUsuarios.json');
  } catch (e) {
    listadoUsuarios = [];
  }
};

const guardar = ()=> {
  let datos = JSON.stringify(listadoUsuarios);
  fs.writeFile('./src/listadoUsuarios.json', datos, (err)=>{
    if (err) throw (err);
    console.log("Usuarios guardados");
  })
};

const autenticar = (nombre, cedula) => {
  listar();
  let solicitante = listadoUsuarios.find(sol => sol.documento === cedula && sol.nombre === nombre);
  if (!solicitante) {
    return false;
  }else {
    return solicitante;
  }
}

module.exports = {
  crear,
  autenticar,
  guardar
}
