var express = require('express');
var doT = require('express-dot');
var bodyParser = require('body-parser');
var app = express();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/doughouse';
var mailin = require('mailin');


app.use(bodyParser.urlencoded({extended: true}));

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname + '/images'));


app.get('/', function(req, res){
  res.sendFile('index.html', {"root": __dirname});
});


/**
* postReview
*/
function postReview(review){
  // connect to the doughouse database
  MongoClient.connect(url, function(err,db){
   if(err){
     console.log('unable to connect to the mongodb server.');
   } else {

       var reviewColl = db.collection('reviews');

       // insert data into the 'reviews' collection
       reviewColl.insert([review], function(err,result){
         if(err){
           console.log(err);
         } else {
           console.log('inserted doc with title: ' + review.title);
         }

       });
   }
  });
}

/**
* getReviews
*/
function getReviews(res, from, numReviews, searchQuery) {

  MongoClient.connect(url, function(err,db){
    if(err){
      console.log(err);
      res.end("error connecting to database");
    } else {
      var reviewColl = db.collection('reviews');

      var query = {};

      if(searchQuery){
        var regexp = new RegExp(searchQuery,'i');
        query= {title: regexp};
      }

      reviewColl.find(query).sort({_id: -1}).limit(parseInt(numReviews+1)).toArray(function (err, docs){
        if(err){
          console.log(err);
          res.end("error retrieving reviews");
        } else {
          // add timestamp before sending it to frontend
          docs.forEach(function(doc){
            doc["timestamp"] = mongodb.ObjectId(doc._id).getTimestamp();
          });

          var noMore = (docs.length < parseInt(numReviews)) ? true : false;

          res.send({reviews: docs.slice(parseInt(from),parseInt(numReviews)),noMore:noMore});
          res.end();

        } // else
      }); // find
    } // else
  }); // connect
}

/**
* addLike
*/
function addLike(res, titleIn){
  // connect to the doughouse database
  MongoClient.connect(url, function(err,db){
   if(err){
     console.log('unable to connect to the mongodb server.');
   } else {

       var reviewColl = db.collection('reviews');

       // insert data into the 'reviews' collection
       reviewColl.update({title:titleIn},{$inc:{likes:1}},{upsert:false,safe:true}, function(err,result){
         if(err){
           console.log(err);
           res.end("error adding like");
         } else {
           console.log('added like to doc with title: ' + titleIn);
           res.end();
         }

       });
   }
  });
}

/*
* start mail server
*/
mailin.start({
  port: 25,
  disableWebhook:true
});

/*
* post a review whenever we get an email (from a valid sender)
*/
/* Event emitted after a message was received and parsed. */
mailin.on('message', function (connection, data, content) {

  // grab list of all valid emails
  var ve = require('./validEmails');

  ve.emails.forEach(function(email){

    if(email == data.from[0].address){

      // then valid review sender
      var review = {title: data.subject, text: data.text, likes: 0};
      postReview(review);
      return;
    }
  });

});


/*
* setup routes
*/
app.post('/searchReviews', function(req,res){
  getReviews(res, req.body.from, req.body.numReviews, req.body.searchQuery);
});

app.post('/getReviews', function(req, res){
  getReviews(res, req.body.from, req.body.numReviews, null);
});

app.post('/addLike', function(req, res){
  addLike(res, req.body.title);
});

// Handle 404
app.use(function(req, res) {
  res.status(404);
  res.sendFile('404.html', {"root": __dirname});
});

/*
* start server on port 80
*/
app.listen(80, function(){
  console.log('server running at localhost:80');
});
