const express = require('express')
const mustacheExpress = require('mustache-express')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const app = express()
const connectionString = "postgres://localhost:5432/studentdb"

const db = pgp(connectionString)
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: false }))
app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')

app.get('/register',(req,res)=>{
  res.render("register")
})


//register: storing name, and password and redirecting to blog page after signup
app.post('/register', function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err,   hash) {
    let username= req.body.username
      db.any('SELECT username FROM users')
      .then((users)=>{
      let existingUser=users.filter((user)=>user.username == username)
      //checking to see if username taken
      if(existingUser.length !=0 ){
        console.log(existingUser)
        res.render("register" ,{message:"Userneme Taken"})
      }else{
  

      db.one('INSERT INTO users(username,passwordhash) VALUES($1,$2) RETURNING userid',[username,hash])
      
  
   .then(function(data) {
    if (data) {
    res.redirect('/login');
    }
    })
    }
  })
 })
})
//checking login credentials and logging into blog page
app.post('/login',(req,res)=>{
  let username = req.body.loginName
  let password = req.body.loginPassword

  db.any('SELECT passwordhash, username from users')
  .then(function(users){
    console.log(users)
    let existingUser=users.filter((user)=>user.username == username)
  
    
   //assumed that there can only be unique user names so must set up a test for that in registration
   //thats why im useing [0] to get the first and only index of the array
     
    bcrypt.compare(password, existingUser[0].passwordhash, function (err, result) {
      if (result == true) {
        console.log("success")
          res.redirect('/blog');
      } else {
       res.render("login" ,{message:"incorrect password"});
       
      }
    })
  })

  
  

  
})

app.get('/login',(req,res)=>{
  res.render('login')
})
app.post("/addpost", (req,res)=>{
    let title = req.body.title
    let body = req.body.body

    db.one('INSERT INTO posts(blogtitle,blogdescription) VALUES($1,$2) RETURNING postid',[title,body])
    .then((data)=>{
        
    })
res.redirect("/blog")
})
app.get('/update-post/:postId',(req,res)=>{
  let postid = req.params.postId
  db.one('SELECT postid,blogtitle,blogdescription FROM posts WHERE postid = $1', [postid])
  .then((post)=>{console.log(post)
  res.render('update-blog',post)
  })

})

app.post("/update-post", (req,res)=>{
    let postid = parseInt(req.body.postId)
    let title= req.body.title
    let updatePost = req.body.body
    
    
    

    db.none('UPDATE posts SET blogtitle = $1, blogdescription= $2  WHERE postid = $3',[title,updatePost,postid])
    .then(()=>{
        
        res.redirect("/blog")
    })

})

app.get('/blog',(req,res)=>{
    db.any('SELECT postid,blogtitle,blogdescription FROM posts')
    .then ((blogs)=>{
       
        res.render('blog',{blogs:blogs})
       
    })
    
})

app.post('/delete-post', (req,res)=>{
    let postid = parseInt(req.body.postId)
   

    db.none('DELETE FROM posts WHERE postid = $1',[postid])
    .then(()=>{
        res.redirect('/blog')
    })
})


app.post('/add-comment', (req,res)=>{
  let postid = parseInt(req.body.postId)
  let comment = req.body.comment

  db.none('INSERT INTO comments(comment,postid) VALUES ($1,$2)', [comment,postid])
})

app.listen(3000,() => {
    console.log("At your service...")
  })