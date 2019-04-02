const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const pgp = require('pg-promise')()
const path = require('path')
const session = require('express-session')
const Post = require('./post')
const Comment = require('./comment')
// need to make these classes above to accomodate this 
const PORT = 3000
const CONNECTION_STRING = "postgres://localhost:5432/blogdb"
const db = pgp(CONNECTION_STRING)

let posts = []

db.any('SELECT p.postid,p.title,p.body,c.title as "commentTitle", c.commentid FROM posts p JOIN comments c ON p.postid = c.postid').then((result) => {

  console.log(result)

    result.forEach((item) => {

        if(posts.length == 0) {
          let post = new Post(item.title,item.body,item.postid)
          let comment = new Comment(item.commentTitle,item.commentid)
          //post.comments.push(comment) THIS WILL WORK TOO
          post.addComment(comment)
          posts.push(post)
        } else {
          // find the post in the posts array with the postid
          let existingPost = posts.find((post) => post.postId == item.postid)
          if(existingPost) {
            // add the comment to the existing post
            let comment = new Comment(item.commentTitle,item.commentid)
            existingPost.addComment(comment)
          } else {
            let post = new Post(item.title,item.body,item.postid)
            let comment = new Comment(item.commentTitle,item.commentid)
            //post.comments.push(comment) THIS WILL WORK TOO
            post.addComment(comment)
            posts.push(post)
          }

        }

    })

    console.log(posts)


})




app.listen(PORT,() => {
  console.log(`Server has started on ${PORT}`)
})
Collapse



