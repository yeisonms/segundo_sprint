const hbs = require('hbs');
const usuario = require('./models/usuario');
const curso = require('./models/cursos');

hbs.registerHelper('listarCursos', (listado) => {

    let texto = `<table class='table table-striped'>
    <thead class='thead-dark'>
    <th> Nombre </th>
    <th > Id </th>
    <th> Descripción </th>
    <th> Valor </th>
    <th> Modalidad </th>
    <th> Intensidad horaria </th>
    <th> estado </th>
    </thead>
    <tbody>`;

    listado.forEach(cursocre => {
        texto = texto +
            '<tr id="idcursoestudiante">' +
            '<td>' + cursocre.nombre + '</td>' +
            '<td>' + cursocre.id + '</td>' +
            '<td>' + cursocre.descripcion + '</td>' +
            '<td>' + cursocre.valor + '</td>' +
            '<td>' + cursocre.modalidad + '</td>' +
            '<td>' + cursocre.ih + '</td>' +
            '<td>' + cursocre.estado + '</td></tr>';

    })
    texto = texto + '</tbody></table>';
    return texto;

});
hbs.registerHelper('listarCursos2', (listado) => {

  if (!listado.length) {
    return "no hay cursos disponibles en el momento";
  } else {
    let disponibles = listado.filter(cursos => cursos.estado === "disponible");
    if (!disponibles) {
      return "Todos los cursos se han cerrado";
    } else {
      let texto = `<div class='accordion' id='accordionExample'>`;
      i = 1;
      disponibles.forEach(curso => {
        texto = texto +
        `<div class="card">
          <div class="card-header" id="heading${i}">
            <h2 class="mb-0">
            <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="true" aria-controls="collapse${i}">
            Nombre: ${curso.nombre} <br>
            Identificador de curso: ${curso.id} <br>
            Valor del curso: ${curso.valor} <br>
            </button>
            </h2>
          </div>

          <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordionExample">
            <div class="card-body">
              Descripcion del curso:  ${curso.descripcion}<br>
              La modalidad es: ${curso.modalidad}<br>
              La intensidad horaria es: ${curso.ih}<br>
            </div>
          </div>
        </div>`;
        i++;
      })
      texto = texto + '</div>';
      return texto;
    }
  }
})
hbs.registerHelper('listarCursosCoordinador', (listadoCursos, listadoUsuarios, docentes) => {
    let tablaUsuario =
        i = 1;
    let texto = '';
    if (!listadoCursos.length) {
        return "no hay cursos creados"
    } else {
        listadoCursos.forEach(curso => {
            texto = texto + '<div class="panel-group">' +
                '<div class="panel panel-default">' +
                '<div class="panel-heading">' +
                '<h4 class="panel-title">' +
                '<a data-toggle="collapse" href="#collapse' + i + '"> Curso : ' + curso.nombre + ' -- Id: ' + curso.id + ' -- Estado: ' + curso.estado + ' -- Matriculados: (' + curso.matriculados.length + ')</a>' +
                '</h4>' +
                '</div>' +
                '<div id="collapse' + i + '" class="panel-collapse collapse">';
            texto = texto + '<div class="panel-body">' +
                '<form action="/eliminaAspiranteCoordinador" method="post"><table class="table table-striped">' +
                '<thead class="thead-dark">' +
                '<th> Nombre </th>' +
                '<th > Documento </th>' +
                '<th> Email </th>' +
                '<th> Telefono </th>' +
                '<th> Eliminar </th>' +
                '</thead>' +
                '<tbody>';
            curso.matriculados.forEach(usuario => {
                let usuarioCurso = listadoUsuarios.find(cur => cur.documento === usuario)
                texto = texto +
                    '<tr id="idcursoestudiante">' +
                    '<td>' + usuarioCurso.nombre + '</td>' +
                    '<td>' + usuarioCurso.documento + '</td>' +
                    '<td>' + usuarioCurso.correo + '</td>' +
                    '<td>' + usuarioCurso.telefono + '</td>' +
                    '<td><button type="submit" value=' + curso.id + ';' + usuarioCurso.documento + ' class="btn btn-danger" name="botonCoordinador">Eliminar</button></td>' +
                    '</tr>';

            });
            texto = texto + '</tbody></table></form>';

            if (curso.estado === 'disponible') {
                texto = texto + `<form action="/cerrarCurso" method="post">
                                  <div class='form-row'>
                                    <div class='form-group col-md-4'>
                                      <label for="documentoDocente">Elige un docente!</label>
                                      <select class='form-control' style='width:400px' name='documentoDocente' id='documentoDocente' required>
                                        <option selected></option>`;
                docentes.forEach(doc =>{
                  texto= texto+ `<option value='${doc.documento}'>Nombre: ${doc.nombre} -- Documento: ${doc.documento}</option>`;
                })

                texto=texto+ `</select></div><div class='form-group col-md-4'>
                                              <button type="submit" value='${curso.id}' class="btn btn-danger" name="idCurso">Cerrar inscripciones</button>
                                              </div>
                                            </div>
                                          </form>`;
            } else {
                texto = texto + `<form action="/abrirCurso" method="post">
                                  <div class='form-row'>
                                    <div class='form-group col-md-2'>
                                      <button disabled type="submit" value="${curso.id}" class="btn btn-danger" name="botonAbrir">Abrir inscripciones</button>
                                    </div>
                                    <div class='form-group col-md-4'>`
                let docente=docentes.find(doc => doc.documento === curso.docente);
                texto = texto +      `<p>Docente: ${docente.nombre} || Documento: ${docente.documento}</p>
                                    </div>
                                  </div>
                                </form>`;

            }
            texto = texto + '</div></div></div></div></div>';
            i++;
        })
        texto = texto + '';
        return texto;
    }
})
hbs.registerHelper('selectCursos2', (listado) => {

          if (!listado) {
            return console.log("no hay cursos creados");
          }else {
            let disponibles = listado.filter(cursos => cursos.estado === "disponible")
            if (!disponibles) {
              return "Todos los cursos se han cerrado"
            } else {
              let texto = "<form action='/matricula' method='post'>";
              texto = texto + " <div class='form-row'><div class='form-group col-md-2'><select class='form-control' style='width:200px' name='idcurso' id='idcurso' >";
              texto = texto + "<option value ='-1'>--Seleccione--</option>";

              disponibles.forEach(curso => {
                texto = texto + '<option value=' + curso.id + '>' + curso.id + ' - ' + curso.nombre + '</option>';

              })
              texto = texto + '</select></div><div class="form-group col-md-6">' +
              '<button type="submit" class="btn btn-dark">Registrar</button>' +
              '</div></div></form>';
              return texto;
          }
        }
})
hbs.registerHelper('miscursos', (aspirante, listado) => {
    if (!aspirante.listaCursos.length) {
        return "No tienes cursos inscritos"
    } else {
        let texto = `<form action='/eliminaCursoAspirante' method='post'>
                      <table class='table table-striped'>
                        <thead class='thead-dark'>
                          <th> Nombre </th>
                          <th> Id </th>
                          <th> Descripción </th>
                          <th> Valor </th>
                          <th> Modalidad </th>
                          <th> Intensidad horaria </th>
                          <th> Estado </th>
                          <th> Eliminar </th>
                        </thead>
                        <tbody>`;
        aspirante.listaCursos.forEach(id => {
            let curso = listado.find(crc => crc.id === id);
            texto = texto + `<tr>
                              <td>${curso.nombre}</td>
                              <td>${curso.id}</td>
                              <td>${curso.descripcion}</td>
                              <td>${curso.valor}</td>
                              <td>${curso.modalidad}</td>"
                              <td>${curso.ih}</td>
                              <td>${curso.estado}</td>
                              <td><button type='submit' value='${curso.id}' class='btn btn-danger' name='boton'>Eliminar</button></td>
                            </tr>`;
        })
        texto = texto + `</tbody></table></form>`;
        return texto;
    }
})
hbs.registerHelper('integrantesCurso', (curso, listadoUsuarios) => {
    let texto = '<h3>Lista integrantes del curso ' + curso.nombre + '</h3><br>'
    texto = texto + "<table class='table table-striped'> \
              <thead class='thead-dark'> \
              <th> Nombre </th> \
              <th > Documento </th> \
              <th> Email </th> \
              <th> Teléfono </th> \
              </thead> \
              <tbody>";

    curso.matriculados.forEach(usuario => {
        let usuarioCurso = listadoUsuarios.find(cur => cur.documento === usuario)
        texto = texto +
            '<tr id="idcursoestudiante">' +
            '<td>' + usuarioCurso.nombre + '</td>' +
            '<td>' + usuarioCurso.documento + '</td>' +
            '<td>' + usuarioCurso.correo + '</td>' +
            '<td>' + usuarioCurso.telefono + '</td></tr>'

    })
    texto = texto + '</tbody></table>';
    return texto;
})
hbs.registerHelper('listarUsuarios', (listadoU)=>{
  if (!listadoU) {
    return `<form action="/registro" method="get">
      <div class="col-md-6">
        <p>No hay ningun Usuario creado, Ve y crea uno!</p>
        <button type="submit" class="btn btn-dark">Crear usuario</button>
      </div>
    </form>`
  }else {
      let texto = "<form action='/actualizarUsuario' method='post'>";
      texto = texto + " <div class='form-row'><div class='form-group col-md-4'><select class='form-control' style='width:500px' name='documento' id='documento' >";
      texto = texto + "<option value ='-1'>--Seleccione--</option>";

      listadoU.forEach(usuario => {
        texto = texto + '<option value=' + usuario.documento + '>' + usuario.nombre + ' - ' + usuario.documento + ' || rol: '+ usuario.rol + '</option>';

      })
      texto = texto + '</select></div><div class="form-group col-md-6">' +
      '<button type="submit" class="btn btn-dark">Seleccionar</button>' +
      '</div></div></form>';
      return texto;
  }

})
hbs.registerHelper('mostrarPerfil', (perfil)=>{
  if (!perfil) {
    return ""
  }else {
    let texto;
    texto = `<div class="d-flex justify-content-center align-items-center container ">
              <div class="row">
                <form class="well form-horizontal" action="/confirmarActualizacion" method="post">
                  <div class="form-row">
                    <div class="form-group col-md-6">
                      <label for="nombre">Nombre</label>
                      <input type="text" name="nombre" id="nombre" required  placeholder="${perfil.nombre}" class="form-control" name="nombre" value="${perfil.nombre}">
                    </div>
                    <div class="form-group col-md-6">
                    <label for="documento">Documento</label>
                    <input type="number" class="form-control" id="documento" placeholder="${perfil.documento}" name="documento" required value="${perfil.documento}">
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group col-md-6">
                      <label for="telefono">Telefono</label>
                      <input type="number" name="telefono" id="telefono" required  placeholder="${perfil.telefono}" class="form-control" value="${perfil.telefono}">
                    </div>
                    <div class="form-group col-md-6">
                    <label for="correo">Correo electronico</label>
                    <input type="name" class="form-control" id="correo" placeholder="${perfil.correo}" name="correo" required value="${perfil.correo}">
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group col-md-6">
                      <label for="rol">Rol</label>
                      <select id="rol" class="form-control " name="rol" required>
                        <option selected></option>
                        <option>aspirante</option>
                        <option>docente</option>
                      </select>
                    </div>
                    <div class="form-group col-md-6">
                      <label for="id">Id usuario</label>
                      <input type="text" class="form-control" id="correo" placeholder="${perfil._id}" name="id" required value="${perfil._id}" readonly >
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group col-md-6">
                      <h4>El rol actual es: <b>${perfil.rol}</b></h4>
                    </div>
                    <div class="form-group col-md-6">
                      <button class="btn btn-dark">Actualizar</button>
                    </div>
                </div>
              </form>
              <div class="form-group col-md-6">
                <form action="/coordinador" method="post">
                  <button type="submit" class="btn btn-dark" name="usuario">Cancelar</button>
                </form>
              </div>
            </div>
          </div>`;
    return texto;
  }
})
