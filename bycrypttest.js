const express = require('express')
const mustacheExpress = require('mustache-express')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const app = express()
const connectionString = "postgres://localhost:5432/stephencattanach"

const db = pgp(connectionString)

app.use(bodyParser.urlencoded({ extended: false }))
app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')
const myPlaintextPassword = 'bubba123'
const saltRounds = 10;

const someOtherPlaintextPassword = 'something else';

console.log(db)

app.get('/register',(req,res)=>{
    res.render("register")
})
//register: storing name, email and password and redirecting to home page after signup
app.post('/register', function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err,   hash) {
      let username= req.body.username

        db.one('INSERT INTO users(username,passwordhash) VALUES($1,$2) RETURNING postid',[username,hash])
        
    //res.redirect("/blog")    
   //db.User.create({
     //name: req.body.username,
    //email: req.body.emailsignup,
    // password: hash
     .then(function(data) {
      if (data) {
      res.render('login');
      }
    });
   });
});
  

  //login page: storing and comparing email and password,and redirecting to home page after login
  app.post('/login', function (req, res) {
    db.one({
         where: {
             name: req.body.loginName
                }
    }).then(function (user) {
        if (!user) {
           res.render('register');
        } else {
bcrypt.compare(req.body.loginPassword, user.password, function (err, result) {
       if (result == true) {
           res.render('blog');
       } else {
        res.send('Incorrect password');
        res.redirect('/login');
       }
     });
    }
 });
});


app.listen(3000,() => {
    console.log("At your service...")
  })