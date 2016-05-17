var express = require('express');
var doT = require('express-dot');
var bodyParser = require('body-parser');
var app = express();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/doughouse';


app.use(bodyParser.urlencoded({extended: true}));

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname + '/images'));


app.get('/', function(req, res){
  res.sendFile('index.html', {"root": __dirname});
});


function getReviews(res, from, numReviews, searchQuery) {

  console.log("getting reviews....");

  MongoClient.connect(url, function(err,db){
    if(err){
      console.log(err);
      res.end("error connecting to database");
    } else {
      var reviewColl = db.collection('reviews');

      var query = {};
      console.log("searchQuery: " + searchQuery);

      if(searchQuery){
        var regexp = new RegExp(searchQuery,'i');
        query= {title: regexp};
      }

      console.log("query: " + JSON.stringify(query));

      reviewColl.find(query).sort({_id: -1}).limit(parseInt(numReviews)).toArray(function (err, docs){
        if(err){
          console.log(err);
          res.end("error retrieving reviews");
        } else {

          console.log("from: " + from);
          console.log("numReviews: " + numReviews);
          // add timestamp before sending it to frontend
          docs.forEach(function(doc){
            doc["timestamp"] = mongodb.ObjectId(doc._id).getTimestamp();
          });

          if(docs.length < 10)
            console.log("docs: " + JSON.stringify(docs));
          console.log("sending: " + JSON.stringify(docs.slice(parseInt(from),parseInt(numReviews))));

          res.send(docs.slice(parseInt(from),parseInt(numReviews)));
          res.end();

        }
      });


    }
  });
}

app.post('/searchReviews', function(req,res){
  console.log("at/searchReviews...");
  getReviews(res, req.body.from, req.body.numReviews, req.body.searchQuery);
});

app.post('/getReviews', function(req, res){
  console.log("at/getReviews...");
  getReviews(res, req.body.from, req.body.numReviews, null);
});

app.get('/writeReview',function(req,res){
  res.sendFile('writeReview.html', {"root": __dirname});
});
// do the following on a post to /postReview
app.post('/postReview', function(req,res) {

  // connect to the doughouse database
  MongoClient.connect(url, function(err,db){
    if(err){
      console.log('unable to connect to the mongodb server.');
    } else {

        var reviewColl = db.collection('reviews');

        // insert data into the 'reviews' collection
        reviewColl.insert([req.body], function(err,result){
          if(err){
            console.log(err);
            res.end("database error");
          } else {
            console.log('inserted doc with title: ' + req.body.title);
            res.redirect('/');
          }

        });
    }
  });

});

app.listen(8080, function(){
  console.log('server running at localhost:8080');
});
