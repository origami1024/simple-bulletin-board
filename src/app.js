
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
  console.log('register')
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
  console.log('NEW USER: ' + req.body.login)
  let que = `INSERT INTO users(userName, userMail, userPW, userAbout) 
  VALUES($1, $2, $3, $4);`
  //check all these values to not be empty and of certain length and with permitted characters
  let values = [req.body.login, req.body.mail, req.body.pw, req.body.about]
  pool.query(que, values).then(res1 => {
    res.send('ok')
  });
  //res.sendFile(path.join(__dirname, '/../dist/index.html'));
});

//make new ad, with img
app.post('/new.bat', upload.single('picInp'), function (req, res, next) {
  if (typeof req.cookies.state != "undefined") {
    let tmpCookie = JSON.parse(req.cookies.state)
    //query to check login details
    let verificationQue = "select userid from users where currentcookie='" + tmpCookie.cc + "' and usermail='" + tmpCookie.usermail + "';"
    console.log('new.bat: req.body.auName:', req.body.auName)
    pool.query(verificationQue).then(res2 =>{
      if (res2.rows.length>0) {
        let que = `INSERT INTO notices(author_id, title, text, contacts, hits, pic, categories, auname) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ad_id; `// //SELECT currval('notices_ad_id_seq');
        let values = [tmpCookie.userid, req.body.title, req.body.text, req.body.contacts, 0, req.file.buffer, req.body.categories.split(','), req.body.auName]
        pool.query(que,values).then(res1 => { //
          let queX = "update users set adslist=adslist || " + parseInt(res1.rows[0].ad_id) + " where userid=" + parseInt(tmpCookie.userid) + ";"
          pool.query(queX).then(resX=>{
            let tmpCookie = JSON.parse(req.cookies.state)
            tmpCookie.adslist.push(res1.rows[0].ad_id)
            tmpCookie.adsListX.push({ad_id: res1.rows[0].ad_id, hits: 0, title: req.body.title})
            res.cookie('state', JSON.stringify(tmpCookie))
            res.send({ad_id: res1.rows[0].ad_id})
          })
          
        });
      } else {
        res.send('cookie or other thingy not verified!')
      }
    })
    
  } else {
    res.send('problem with cookies, sry dud')
  }
});

//get image on id from db and serve it
app.get('/imgpls', function(req, res, next) {
  //console.log("imgId", req.query.imgId)
  pool.query('select pic from notices where ad_id=' + req.query.imgId + ' limit 1;',
    function(err, readResult) {
    //console.log(readResult.rowCount)
    if (readResult.rowCount>0){
      res.send(readResult.rows[0].pic)
    } else {
      res.send('no pic in db dude, lol')
    }
  });
})
//

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
  console.log('/logout')
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
      //we got id for pic, also title and hits 
      let que3 = "select ad_id, title, hits from notices where ad_id= ANY('{" + res1.rows[0].adslist + "}');"
      pool.query(que3)
      .then(res2 =>{
        //console.log('res2 == = = = =:' + res2.rows)
        res1.rows[0].adsListX = res2.rows
        res1.rows[0]['cc'] = tmpId
        res.cookie('state', JSON.stringify(res1.rows[0]))
        res.status(200).send(res1.rows[0])//redo this line
        //console.log(res1.rows)
        //dont send the object, set the cookies and send state change!    
      })
       
    }
    else {
      res.status(201).send('loginus is wrongus')
      
    }
  })
  .catch(e => console.error(e.stack))
})
////
///view profile of other

//let userinfo = 
app.get('/adinfo', function(req, res) {
  console.log('client wants to see ad: ' + req.query.ad_id)
  if (typeof req.query.ad_id != "undefined") {
    pool.query('SELECT ad_id, author_id, title, text, contacts, created_on, hits, categories, auname FROM notices WHERE ad_id=' + parseInt(req.query.ad_id) + ';')
    .then(res1 => {
      //send the template
      //res1.rows
      let tmpCategories = ''
      if (Array.isArray(res1.rows[0].categories)){
        res1.rows[0].categories.forEach(xxx=>{
            tmpCategories += `<span class="badge bg-info my-0">${xxx}</span> `
        })        
      }
      res.send(`<html>
      <head>
        <title>Ad info</title>
        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
        <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js" integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k" crossorigin="anonymous"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/jquery-tagsinput/1.3.6/jquery.tagsinput.min.css" rel="stylesheet">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-tagsinput/1.3.6/jquery.tagsinput.min.js"></script>
        <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
      </head>
      <body>
      <div class="py-3 rounded bg-dark">
        <div class="container border">
          <div class="container position-relative p-0 p-sm-3">
            <h5 class="oldModalTitle text-white">${res1.rows[0].title}</h5>
          </div>
          <div class="container pt-1 pt-sm-3 pb-0 mb-0">
            <img class="oldModalPic" src="imgpls?imgId=${res1.rows[0].ad_id}" alt="${res1.rows[0].title}">
          </div>
          <div class="container pt-1 pt-sm-3 pb-0 mb-0">
            <div class="oldModalText mb-0 pl-2 text-white bg-secondary">${res1.rows[0].text}</div>
          </div>
          <div class="container mb-0 d-flex flex-column mt-1 mt-sm-3">
            <div class="oldModalContacts mb-0 pl-2 order-2 order-sm-1 text-white">${res1.rows[0].contacts}</div>
          </div>
          <div class="container mb-0 d-flex flex-column mt-1 mt-sm-3">
            <div class="oldModalCategories mb-0 pl-2 order-2 order-sm-1 text-white">categories:
              ${tmpCategories}
            </div>
          </div>
          <div class="container mb-0 d-flex flex-column mt-1 mt-sm-3">
            <span class="mb-0 text-white">author: 
              <a class="oldModalAuthor" href="user?id=${res1.rows[0].author_id}" target="_blank">${res1.rows[0].auname}</a>
            </span>
            <span class="mb-0 text-white">hits:
              <span class="oldModalHits mb-0 pl-2 text-light font-weight-bold">${res1.rows[0].hits}
              </span>
            </span>
            <span class="mb-0 text-white">date of creation:</span>
            <div class="oldModalDate mb-0 pl-2 text-white">${res1.rows[0].created_on}
            </div>
          </div>
        </div>
      </div>
      </body>
      </html>`)
    })
    .catch(e => console.error(e.stack))
  }
})
app.get('/user', function(req, res) {
  console.log('client wants to see profile: ' + req.query.id)
  if (isNaN(req.query.id) == false) {
    let que = "SELECT username, userabout, created_at, adslist FROM users where userid='" + req.query.id + "';"
    pool.query(que)
    .then(res1 => {
      if (res1.rows.length>0) {
        //res1.rows[0].adslist
        let que2 = "select ad_id, title, hits from notices where ad_id= ANY('{" + res1.rows[0].adslist + "}');"
        pool.query(que2)
        .then(res2 =>{
          let tmpAdListText = ''
          res2.rows.forEach(ad=>{
            tmpAdListText += `<a href="adinfo?ad_id=${ad.ad_id}" target="_blank" class="text-white" style="position: relative; text-decoration: none">
            <img src="imgpls?imgId=${ad.ad_id}" style="width:75px; height:75px; border:1px solid white;">
            <span style="position:absolute; left:0; top:28px; font-size:10px" class="small bg-secondary">${ad.title.substring(0,15)}</span>
            <span class="small bg-secondary rounded border" style="position:absolute; left:0; bottom:36px; font-size:10px"><i class="fa fa-eye"></i> ${ad.hits}</span>
            </a>`
            //how do u open this link? i mean, in new window about ad?
          })
          res.send(`<!DOCTYPE html>
            <html>
            <head>
            <title>User Information</title>
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
            <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
            <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js" integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k" crossorigin="anonymous"></script>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/jquery-tagsinput/1.3.6/jquery.tagsinput.min.css" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-tagsinput/1.3.6/jquery.tagsinput.min.js"></script>
            <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
            </head>
            <body>
            <section class="d-flex border" id="userInfoView">
              <div class="border p-3 text-white bg-dark rounded mx-auto w-50 mt-3">
                <span class="small">user: </span>
                <h4 class="pl-2">${res1.rows[0].username}</h4>
                <span class="small mt-3">user about: </span>
                <div class="bg-secondary pl-2">${res1.rows[0].userabout}</div>
                <br>
                <span class="small">created at: </span>
                <div class="pl-2">${res1.rows[0].created_at}</div>
                <br>
                <span class="small">created ads: </span>
                <div>${tmpAdListText}</div>
              </div>
            </section>
            </body>
            </html>`)
        })
        
      }
      else {
        res.send('User does not exist')
      }
    })
  } else {
    res.send('user id is wrong')
  }
  //res.sendFile(path.join(__dirname, '/../dist/reg.html'));
});
///

///contacts update
app.post('/cUpd', function(req, res) {
  let tmpCookie = JSON.parse(req.cookies.state)
  let que = `UPDATE users SET contacts=\'${JSON.stringify(req.body)}\' where currentcookie='${tmpCookie.cc}' and userid='${tmpCookie.userid}';`
  pool.query(que)
  .then(res1=>{
    tmpCookie.contacts = req.body
    res.cookie('state', JSON.stringify(tmpCookie)).send('ok')
  })
})

//delete ad
app.post('/delAd', function(req, res){
  //check cookie and if he created that ad
  if (typeof req.cookies.state != "undefined") {
    //check the provided cookie in users and corresponded ad in the list of ads
    let tmpCookie = JSON.parse(req.cookies.state)
    let verificationQue = "select userid from users where currentcookie='" + tmpCookie.cc + "' and '" + req.body.ad_id + "'=ANY(adslist);"
    pool.query(verificationQue)
    .then(res1=>{
      if (res1.rows.length>0){
        let noticesDeletionQue = "delete from notices where ad_id='" + req.body.ad_id + "'; "
        let usersDeletionQue = `update users set adslist = array_remove(adslist, '${parseInt(req.body.ad_id)}') where userid=${res1.rows[0].userid};`
        pool.query(noticesDeletionQue)
        .then(res2=>{
          pool.query(usersDeletionQue)
          .then(res3=>{})
          let tmpCookie = JSON.parse(req.cookies.state)
          let index = tmpCookie.adslist.indexOf(res1.rows[0].ad_id);
          if (index > -1) {
            tmpCookie.adslist.splice(index, 1);
          }
          tmpCookie.adsListX = tmpCookie.adsListX.filter(function(elem){
            return elem.ad_id != req.body.ad_id
          })
          res.cookie('state', JSON.stringify(tmpCookie))
          res.status(200).send('ok')
          //change cookies too
        })
      }
    })
  }
})

//change pw
app.post('/pwChange', function(req, res) {
  console.log('pw change ' + req.body.hash1 + ' ' + req.body.hash2)
  if (typeof req.cookies.state != "undefined") {
    let tmpCookie = JSON.parse(req.cookies.state)
    let verificationQue = "select userid from users where currentcookie='" + tmpCookie.cc + "' and userpw='" + req.body.hash1 + "';"
    console.log(verificationQue)
    pool.query(verificationQue)
    .then(res1 => {
      if (res1.rows.length>0){
        let que1 = `update users set userpw='${req.body.hash2}' where userid='${res1.rows[0].userid}';`
        pool.query(que1)
        .then(res2=>{
          res.status(200).send('ok')
        })
      } else {
        console.log('wrong passworduz')
        res.status(200).send('fail')
      }
    })
  }
})

//change user about
app.post('/abCh', function(req, res) {
  console.log('user about change: ' + req.body.about)
  if (typeof req.cookies.state != "undefined") {
    let tmpCookie = JSON.parse(req.cookies.state)
    let verificationQue = "select userid from users where currentcookie='" + tmpCookie.cc + "' and userid='" + tmpCookie.userid + "';"
    pool.query(verificationQue)
    .then(res1 => {
      if (res1.rows.length>0){
        //console.log('good so far')
        let que1 = `update users set userabout='${req.body.about}' where userid='${res1.rows[0].userid}';`
        //do cookie too at sending
        pool.query(que1)
        .then(res2=>{
          tmpCookie.userabout = req.body.about
          res.cookie('state', JSON.stringify(tmpCookie))
          res.status(200).send('ok')
        })
      }
    })
  }
})


app.listen(PORT);
