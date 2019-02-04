/*
NOTICE BOARD
  USER AUTH
  CREATING AND VIEWING NOTICES/ADS
  COUNT THE HITS
  POSTGRESQL
*/
PORT = process.env.PORT || 8000;

const express = require('express')
const app = express();
const path = require('path');
const { Pool, Client } = require('pg')
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:1234@localhost:5432/postgres'
let sslTmp = false
if (connectionString != 'postgres://postgres:1234@localhost:5432/postgres'){
  sslTmp = true
  console.log('IS TRUE')
}
const pool = new Pool({
  connectionString: connectionString,
  ssl: sslTmp //this shud be true
})

function getNoticesAfterId(afterAdId) {
  resu = ''
  pool.query('SELECT * FROM notices')
  .then(res => {
    console.log(res.rows)
    resu = 'peperoni'
  })
  .catch(e => console.error(e.stack))

  return resu
}


app.get('/', function(req, res) {
    console.log('PURF ' + path)
    
    res.sendFile(path.join(__dirname, '/../dist/index.html'));
});
app.get('/assets/moon.png', function(req, res) {
  console.log('moono ' + path.join(__dirname, '/../dist/assets/moon.png'))
  
  res.sendFile(path.join(__dirname, '/../dist/assets/moon.png'));
});
app.get('/scripts/main1.js', function(req, res) {
  console.log('js asked ' + __dirname)
  
  res.sendFile(path.join(__dirname, '/../dist/scripts/main1.js'));
});


//refresh!
//////////////////
app.get('/refresh.bat', function(req, res) {
  console.log('REFRESH ASKED! ', req.query.i)
  pool.query('SELECT * FROM notices where ad_id>' + req.query.i)
  .then(res1 => {
    res.send(res1.rows)
  })
  .catch(e => console.error(e.stack))

});
/////////////////

//add new!
///////////////////
app.get('/new.bat', function(req, res) {
  console.log('add a ad:', req.query)
  let que = `INSERT INTO notices(author_id, title, text, contacts, hits) 
  VALUES(10001, $1, $2, $3, 0 )`
  let values = [req.query.title, req.query.text, req.query.cont]
  console.log('que generated', que)
  pool.query(que, values) 
});
//////////////////

//init the table notices in postgre db
///////////////////
app.get('/init.bat', function(req, res) {
  console.log('init the table:', req.query)
  let que = `CREATE TABLE notices (
    ad_id integer NOT NULL,
    author_id integer NOT NULL,
    title character varying(50) NOT NULL,
    text character varying(500) NOT NULL,
    contacts character varying(500) NOT NULL,
    created_on timestamp without time zone DEFAULT now() NOT NULL,
    hits integer NOT NULL
);`
  //let values = [req.query.title, req.query.text, req.query.cont]
  //console.log('que generated', que) 
  pool.query(que, values) 
});

////////////////

app.listen(PORT);
