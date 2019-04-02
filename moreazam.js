let posts = []

db.any('SELECT p.postid,p.title,p.body,c.title as "commentTitle", c.commentid FROM posts p JOIN comments c ON p.postid = c.postid WHERE p.postid = 6').then((result) => {

    console.log(result)

    let post = new Post(result[0].title,result[0].body,result[0].postid)
    post.comments = result.map((comment => {
      return { commentTitle: comment.commentTitle, commentId: comment.commentid }
    }))

    console.log(post)


})
