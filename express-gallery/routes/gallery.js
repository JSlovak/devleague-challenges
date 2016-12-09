const express = require('express');
const db = require('./../models');
const Post = db.Post;
const router = express.Router();

/*
  * GALLERY ROUTES
*/
router
  .route('/')

  .get((req, res) => {
    // get all posts from our database
    Post.findAll({
      order : '"createdAt" DESC'
    })
      .then((posts) => {
        // grab a copy
        let listingCopy = posts.map((c) => {
          return c;
        });
        let listings2d = [];
        let masthead = listingCopy.splice(0, 1)[0];
        while (listingCopy.length) {
          // convert it to a 2D array for templating purposes
          listings2d.push(listingCopy.splice(0, 3));
        }

        // render our index template passing in the 2D array
        res.render('index', {
          listings : listings2d,
          user : req.user,
          masthead : masthead
        });
      });
  })

  .post(ensureAuthenticated, (req, res) => {
    // create it in our database
    Post.create({
      url : req.body.url,
      title : req.body.title,
      link : req.body.link,
      info : req.body.info
    }).then(function(newPost) {
      // then redirect to its individual page
      res.redirect('/gallery/' + newPost.id);
    });
  });

/*
  * FORM TO POST NEW PHOTO
*/
router.get('/new', ensureAuthenticated, function (req, res) {
  res.render('new', {
    user : req.user
  });
});

/*
  * INDIVIDUAL PAGES W/ SIDEBAR
*/
router.get('/:id', ensureExists, function (req, res) {
  // grab all of our posts for the sidebar
  Post.findAll({
    limit : 3,
    order : '"createdAt" DESC',
    where : {
      id : {
        $ne : req.params.id
      }
    }
  })
    .then(function(posts) {
      // then find our single post by id
      Post.findById(req.params.id)
        .then(function(post) {
          // render single template, passing in both promises
          res.render('single', {
            listings : posts,
            detail : post,
            id : req.params.id,
            user : req.user
          });
        });
    });
});

router
  .route('/:id/edit')

  // before each edit route, ensure the user is authenticated
  .all(ensureAuthenticated, ensureExists)

  .get(function (req, res) {
    // find by the id passed in through the url
    Post.findById(req.params.id)
      .then(function(post) {
        res.render('edit', {
          detail : post,
          id : req.params.id
        });
      });
  })

  // find by id
  .put(function(req, res) {
    Post.findById(req.params.id)
    .then(function(foundPost) {
      // then update
      foundPost.update({
        url : req.body.url,
        title : req.body.title,
        link : req.body.link,
        info : req.body.info })
      .then(function(newPost) {
        // then redirect to its detail page
        res.redirect('/gallery/' + newPost.id);
      });
    });
  })

  // delete user from database
  .delete(function(req, res) {
    Post.destroy({
      where : {
        id : req.params.id
      }
    })
    .then(function() {
      // then redirect to gallery
      res.redirect('/');
    })
  });

// make sure user is authenticated
function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) { return next(); }

  // if user attempted to access a route, store it to return them afterwards
  req.app.locals.attemptedUrl = '/gallery' + req.url;
  res.redirect('/login');
}

function ensureExists (req, res, next) {
  if (typeof parseInt(req.params.id) === 'number') {
    Post.findById(req.params.id)
      .then(function (post) {
        if (post) { return next() };
        res.redirect('/404');
      });
  } else {
    res.redirect('/404');
  }
}

module.exports = router;
