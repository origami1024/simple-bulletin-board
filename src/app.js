
/*
NOTICE BOARD
  USER AUTH
  CREATING AND VIEWING NOTICES/ADS
  COUNT THE HITS
  POSTGRESQL
*/
const utils = require('./scripts/utils');

const PORT = process.env.PORT || 8000;

const fs = require('fs')
const express = require('express')
const app = express();
const path = require('path');
const { Pool } = require('pg')
const cookieParser = require('cookie-parser')
var multer  = require('multer')
var storage = multer.memoryStorage()
//var upload = multer({ dest: 'uploads/' })
var upload = multer({ storage: storage })

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


const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())




app.get('/', function(req, res) {
    console.log('client wants index ' + path)
    res.sendFile(path.join(__dirname, '/../dist/index.html'));
});
app.get('/assets/moon.png', function(req, res) {
  console.log('moono ' + path.join(__dirname, '/../dist/assets/moon.png'))
  res.sendFile(path.join(__dirname, '/../dist/assets/moon.png'));
});
app.get('/scripts/main1.js', function(req, res) {
  //console.log('js asked ' + __dirname)
  res.sendFile(path.join(__dirname, '/../dist/scripts/main1.js'));
});
app.get('/scripts/reg.js', function(req, res) {
  //console.log('js asked ' + __dirname)
  res.sendFile(path.join(__dirname, '/../dist/scripts/reg.js'));
});
app.get('/reg', function(req, res) {
  console.log('client wants register')
  res.sendFile(path.join(__dirname, '/../dist/reg.html'));
});

//refresh!
//////////////////
app.get('/refresh.bat', function(req, res) {
  //console.log('REFRESH ASKED! ', req.query.i)
  
  pool.query('SELECT ad_id, author_id, title, text, contacts, created_on, hits, categories, auname FROM notices WHERE ad_id>' + req.query.i + ' ORDER BY ad_id;')
  .then(res1 => {
    res.send(res1.rows)
  })
  .catch(e => console.error(e.stack))
  
});
/////////////////


//register new user
app.post('/newUser', function(req, res) {
  console.log('NEW USER!!!')
  console.log('login: ' + req.body.login)
  let que = `INSERT INTO users(userName, userMail, userPW, userAbout) 
  VALUES($1, $2, $3, $4);`
  let values = [req.body.login, req.body.mail, req.body.pw, req.body.about]
  console.log(values)
  pool.query(que, values).then(res1 => {
    res.send('ok')
  });
  //res.sendFile(path.join(__dirname, '/../dist/index.html'));
});
//




//make new ad, with img
app.post('/new.bat', upload.single('picInp'), function (req, res, next) {
  //console.log(req.body)
  //console.log(req.file)
  //so we got the data and the file here,
  //now step to put the file into db
  //req.file.buffer
  //console.log('oro: ', req.file.buffer)
  console.log('new.bat: req.body.auName:', req.body.auName)
  let que = `INSERT INTO notices(author_id, title, text, contacts, hits, pic, categories, auname) 
  VALUES(10001, $1, $2, $3, 0, $4, $5, $6 );`
  let values = [req.body.title, req.body.text, req.body.contacts, req.file.buffer, req.body.categories.split(','), req.body.auName]
  pool.query(que, values).then(res1 => {
    res.send('ok')
  });
});

//get img from db and save it to file, temporary function
//need to modify it, to send file back and show it in img src
app.get('/getImg.bat', function(req, res, next) {
  let dudu
  pool.query('select pic from notices where ad_id=96 limit 1;',
    function(err, readResult) {
    console.log('err',err,'pg readResult',readResult);
    console.log('URFU')
    console.log(readResult.rows[0].pic)
    dudu = readResult.rows[0].pic
    console.log('smurfu')
    console.log(dudu)
    fs.writeFile('fooq.png', dudu, function (err) {
      if (err) console.log(err);
    });
    res.json(200, {success: true});
  });
})
//////getImg.bat end

//get image on id from db and serve it
app.get('/imgpls', function(req, res, next) {
  //console.log("imgId", req.query.imgId)
  pool.query('select pic from notices where ad_id=' + req.query.imgId + ' limit 1;',
    function(err, readResult) {
    //console.log(readResult.rows[0].pic)
    res.send(readResult.rows[0].pic)
  });
})
//

/*10/02/19
app.post('/img.bat', function(req, res) {
  console.log(':body', req.body)
  //console.log('add a ad:rheaders', req.rawHeaders)
  //console.log('add a ad:keys', Object.keys(req))
  var base64Data = req.body.f.replace(/^data:image\/png;base64,/, "");

  require("fs").writeFile("out.png", base64Data, 'base64', function(err) {
    console.log(err);
  });

  res.send('okImgRecevied')
});
//add new!
///////////////////
//NO BINARY VERSION
app.post('/new.bat', function(req, res) {
  let que = `INSERT INTO notices(author_id, title, text, contacts, hits) 
  VALUES(10001, $1, $2, $3, 0 );`
  let values = [req.body.title, req.body.text, req.body.cont]
  pool.query(que, values).then(res1 => {
    res.send('ok')
  })
});*/
//////////////////


//hits
//////////////////
app.get('/hit.bat', function(req, res) {
  pool.query("update notices set hits = hits + 1 where ad_id=" + req.query.id + ';', ()=>{
    res.end()
  })
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


//login/logou
app.get('/logout', function(req, res) {
  res.cookie('state', '', {expires: new Date(0)});
  res.end()
  console.log('logout')
  //need to delete more cookies
  //also need to send back that app state should update
})
///
app.get('/login', function(req, res) {
  console.log("/login")
  user = req.query.login
  pw = req.query.pw
  let que = "SELECT * FROM users where username='" + user + "' AND userpw='" + pw + "';"
  pool.query(que)
  .then(res1 => {
    if (res1.rows.length>0) {
      let tmpId = utils.makeid()
      let que2 = "update users set currentcookie = '" + tmpId + "' where userid='" + res1.rows[0].userid + "';"
      //console.log("que: " + que2)
      pool.query(que2)
      delete res1.rows[0].currentcookie
      delete res1.rows[0].userpw
      delete res1.rows[0].lastloggedin
      res.cookie('state', JSON.stringify(res1.rows[0]))
      res.status(200).send(res1.rows[0])//redo this line
      console.log(res1.rows)
      //dont send the object, set the cookies and send state change!     
    }
    else {
      res.status(201).send('loginus is wrongus')
      
    }
  })
  .catch(e => console.error(e.stack))
})
////


app.listen(PORT);
