// Importación de módulos necesarios para el proyecto
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");
const secretKey = "api skaterpark v.1.0.";
const fs = require ("fs");

// Importación de funciones con las querys que procesan sobre la BD
const { nuevoSkater, consultaSkaters, consultaSkater, eliminarSkater, modificarSkater, autorizarSkater } = require("./querys");

// Configuración ruta de lectura de archivos
app.use(express.static(`${__dirname}/assets`));

// Configuración body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración handlebars y sus rutas
app.set("view engine", "handlebars");
app.engine(
  "handlebars",
  exphbs.engine({
    layoutsDir: __dirname + "/views",
    partialsDir: __dirname + "/views/components/",
  })
);

// Configuración fileupload
const expressFileUpload = require("express-fileupload");
const { data } = require("jquery");
app.use(expressFileUpload({
  limits: { fileSize: 5000000 },
  abortOnLimit: true,
  responseOnLimit: "El peso del archivo que intentas subir supera ellimite permitido",
}));

// Configuración rutas de acceso para consumir framework boostrap y jquery
app.use("/bootstrap", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use("/BootstrapJs", express.static(__dirname + "/node_modules/bootstrap/dist/js/"));
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist"));

// Rutas de ejeución CRUD
app.get("/", async (req, res) => {
  const data = await consultaSkaters();
  res.render("index", {
    layout: "index",
    skaters: data
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    layout: "login",
  });
});

app.get("/login-admin", (req, res) => {
  res.render("loginAdmin", {
    layout: "loginAdmin",
  });
});



app.get("/registro", (req, res) => {
  res.render("registro", {
    layout: "registro",
  });
});

function registrar(skater, req, res) {
  try {      
    const { foto_skater } = req.files;
    foto_skater.mv(`${__dirname}/assets/img/${skater.nombre_foto}`, async (err) => {
      await nuevoSkater(skater);
      res.redirect("/");
    });
  } catch (error) {
    res.send(`
      <h2 style="text-align:center">¡ERROR EN FORMULARIO!</h2>
      <h3 style="text-align:center">...revisar completitud datos, todos los campos son obligatorios...</h3>
    `)
  };  
}

app.post("/registro", async (req, res) => {
  const { email, nombre, password, year, especialidad } = req.body;

  const skater = {
    email: email,
    nombre: nombre,
    password: password,
    year: year,
    especialidad: especialidad,
    nombre_foto: `${uuidv4()}.png`
  };

  const dataSkater = await consultaSkater(email);

  if (dataSkater === undefined) {
    registrar(skater, req, res);
  } else if (email != dataSkater.email) {
    registrar(skater, req, res);
  } else {
    res.send(`<h2 style="text-align:center">...email: ${email} ya registrado...</h2>`)    
  };
});

app.get("/eliminar-skater", async (req, res) => {
  const { email } = req.query;
  const dataSkater = await consultaSkater(email)
  fs.unlink(`${__dirname}/assets/img/${dataSkater.foto}`, (err) => {
    if (err) {
      const { code } = err;
      console.log(`Error código al eliminar imagen: ${code}`);
    } else {
      eliminarSkater(dataSkater.email)
      res.redirect("/");
    }
  });
});

app.post("/dashboard", async (req, res) => {
  const { email, nombre, password, year, especialidad } = req.body;
  const skater = {
    email: email,
    nombre: nombre,
    password: password,
    year: year,
    especialidad: especialidad
  };
  const skaterModificado = await modificarSkater(skater)
  res.redirect("/");
});

app.get("/admin", async (req, res) => {
  const data = await consultaSkaters();
  res.render("admin", {
    layout: "admin",
    skaters: data
  });
});

app.post("/admin", async (req, res) => {
  try {    
    const skater = req.body
    await skater.forEach(data => autorizarSkater(data));
    res.redirect("/");
  } catch (err) {
    console.log("error en put autorización " + err)
  }
})

// Validando administrador con JWT
const credencialesAdministrador = {
  login: "admin",
  password: "1234"
}

app.get("/validador-admin", async (req, res) => {
  const { login, password } = req.query;
  const dataSkaters = await consultaSkaters();
  if (login === credencialesAdministrador.login && password === credencialesAdministrador.password) {
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 300,
        data: dataSkaters,
      },
      secretKey
    );
    res.send(`
      <a href="/dashboard-admin?token=${token}"> <h2 style="text-align:center"> ¡¡¡Bienvenid@!!!... Pincha aquí para ir a tus sitio de administrador</h2> </a>
      <script>
        localStorage.setItem("token", JSON.stringify("${token}"))
      </script>
    `);
  } else {
    res.send(`<h2 style="text-align:center">...login o contraseña incorrecta...</h2`);
  }
});

app.get("/dashboard-admin", (req, res) => {
  let { token } = req.query;
  jwt.verify(token, secretKey, (err, decoded) => {
    err
    ? res.status(401).send({
      error: "401 No autorizado",
      message: err.message,
    })
    :
    res.render("admin", {
      layout: "admin",
      skaters: decoded.data
    });
  });
});

// Validando skater con JWT
app.get("/validador", async (req, res) => {
  const { email, password } = req.query;
  const dataSkater = await consultaSkater(email);
  if (dataSkater !== undefined) {
    if (email === dataSkater.email && password === dataSkater.password) {
      const token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 300,
          data: dataSkater,
        },
        secretKey
      );
      res.send(`
        <a href="/dashboard?token=${token}"> <h2 style="text-align:center"> ¡¡¡Bienvenid@ ${dataSkater.nombre.toUpperCase()}!!!... Pincha aquí para ir a tus datos</h2> </a>
        <script>
          localStorage.setItem("token", JSON.stringify("${token}"))
        </script>
      `);
    } else {
      res.send(`<h2 style="text-align:center">...email o contraseña incorrecta...</h2`);
    }
  } else {
    res.send(`<h2 style="text-align:center">...email no registrado...</h2`);
  }
})

app.get("/dashboard", (req, res) => {
  let { token } = req.query;
  jwt.verify(token, secretKey, (err, decoded) => {
    err
    ? res.status(401).send({
      error: "401 No autorizado",
      message: err.message,
    })
    :
    res.render("datos", {
      layout: "datos",
      skater: decoded.data
    });
  });
});

// Servidor activo
app.listen(3000, () => console.log("Servidor activo en puerto 3000"))