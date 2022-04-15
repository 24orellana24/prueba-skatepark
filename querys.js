// Importación de módulos necesarios para el proyecto
const { Pool } = require("pg");

// Configuración para acceder y procesar sobre la BD
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "postgres",
  database: "skatepark",
  port: 5432,
});

// Función para consultar a un skater de acuerdo a su email
async function consultaSkater(email) {
  try {
    const SQLquery = {
      text: `SELECT * FROM skaters WHERE email=$1`,
      values: [email]
    }
    const dataSkater = await pool.query(SQLquery);
    return dataSkater.rows[0];
  } catch (err) {
    console.log(`Error en query consulta skater:\n${err}`);
    return err.code;
  }
}

// Función para consultar a todos los skater de la BD
async function consultaSkaters() {
  try {
    const SQLquery = {
      text: `SELECT * FROM skaters`,
    }
    const result = await pool.query(SQLquery);
    return result.rows;
  } catch (err) {
    console.log(`Error en query consulta skaters:\n${err.code}`);
    return err.code;
  }
}

// Función para ingresar a un nuevo skater a la BD
async function nuevoSkater(skater) {
  try {
    const SQLquery = {
      text: `
      INSERT INTO
      skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado)
      values ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;`,
      values: [skater.email, skater.nombre, skater.password, Number(skater.year), skater.especialidad, skater.nombre_foto, 'false']
    }
    const result = await pool.query(SQLquery);
    return result.rows;
  } catch (err) {
    console.log(`Error en query nuevo skater:\n${err}`);
    return err.code;
  }
}

// Función para eliminar a un skater de la BD según su mail
async function eliminarSkater(email) {
  try {
    const SQLquery = {
      text: `DELETE FROM skaters WHERE email=$1`,
      values: [email]
    }
    const result = await pool.query(SQLquery);
    return result.rows;
  } catch (err) {
    console.log(`Error en query eliminar skaters:\n${err}`);
    return err;
  }
}

// Función para modificar a un skater de la BD según su mail
async function modificarSkater(skater) {
  try {
    const SQLquery = {
      text: 'UPDATE skaters SET nombre=$1, password=$2, anos_experiencia=$3, especialidad=$4, estado=$5 WHERE email=$6 RETURNING *;',
      values: [skater.nombre, skater.password, skater.year, skater.especialidad, 'false', skater.email]
    }
    const data = await pool.query(SQLquery);
    return data.rows
  } catch (err) {
    console.log(`Error en query modificar skaters:\n${err}`)
  }
}

// Función para cambiar el estado de un skater en la BD según su mail
async function autorizarSkater(skater) {
  try {
    const SQLquery = {
      text: 'UPDATE skaters SET estado=$1 WHERE email=$2 RETURNING *;',
      values: [skater.estado, skater.email]
    }
    const data = await pool.query(SQLquery);
    return data.rows
  } catch (err) {
    console.log(`Error en query autorizar skaters:\n${err}`)
  }
}

// Exportando funciones
module.exports = { nuevoSkater, consultaSkaters, consultaSkater, eliminarSkater, modificarSkater, autorizarSkater };