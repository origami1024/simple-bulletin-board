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
const { Pool } = require('pg')

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
pool.connect();

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
  //console.log('REFRESH ASKED! ', req.query.i)
  
  pool.query('SELECT * FROM notices where ad_id>' + req.query.i + ';')
  .then(res1 => {
    res.send(res1.rows)
  })
  .catch(e => console.error(e.stack))
  
});
/////////////////

//add new!
///////////////////
app.get('/new.bat', function(req, res) {
  //console.log('add a ad:', req.query)
  let que = `INSERT INTO notices(author_id, title, text, contacts, hits) 
  VALUES(10001, $1, $2, $3, 0 );`
  let values = [req.query.title, req.query.text, req.query.cont]
  console.log('que generated', que)
  //pool.connect();
  pool.query(que, values).then(res1 => {
    res.send('ok')
  })
  //pool.end();
});
//////////////////

//hits
//////////////////
app.get('/hit.bat', function(req, res) {
  console.log('Hit on id: ', req.query.id)
  //put the hits into the table
  
  //res.send('BUGGER!')
  /*
  pool.query('SELECT * FROM notices where ad_id>' + req.query.i + ';')
  .then(res1 => {
    res.send(res1.rows)
  })
  .catch(e => console.error(e.stack))
  */
});
/////////////////

//init the table notices in postgre db
///////////////////
app.get('/init.bat', function(req, res1) {
  console.log('init the table the experminte:', req.query)
  let que = `CREATE TABLE notices (
    ad_id integer NOT NULL,
    author_id integer NOT NULL,
    title character varying(50) NOT NULL,
    text character varying(500) NOT NULL,
    contacts character varying(500) NOT NULL,
    created_on timestamp without time zone DEFAULT now() NOT NULL,
    hits integer NOT NULL
);`
  pool.connect();

  pool.query(que, (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    
  }).then(res => {
    res1.send('then then')
  })
  //let values = [req.query.title, req.query.text, req.query.cont]
  //console.log('que generated', que) 
  //pool.query(que, values) 
});

////////////////

app.listen(PORT);
