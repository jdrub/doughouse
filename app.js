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

app.post('/getReviews', function(req, res){
  MongoClient.connect(url, function(err,db){
    if(err){
      console.log(err);
      res.end("database error");
    } else {
      var reviewColl = db.collection('reviews');

      reviewColl.find().sort({_id: -1}).limit(parseInt(req.body.numReviews)).toArray(function (err, docs){
        if(err){
          console.log(err);
          res.end("error retrieving reviews");
        } else {
          // res.writeHead(200, { 'Content-Type' : 'application/json' });
          res.send(docs);
          res.end();

        }
      });


    }
  });
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
            res.end('Successfully added review for "' + req.body.title + '""');
          }

        });
    }
  });

});

app.listen(8080, function(){
  console.log('server running at localhost:8080');
});
