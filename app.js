var express = require('express');
var doT = require('express-dot');
var bodyParser = require('body-parser');
var app = express();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/doughouse';
var mailin = require('mailin');


mailin.start({
  port: 25,
  disableWebhook:true
});

/* Event emitted when a connection with the Mailin smtp server is initiated. */
mailin.on('startMessage', function (connection) {
  /* connection = {
       from: 'sender@somedomain.com',
       to: 'someaddress@yourdomain.com',
       id: 't84h5ugf',
       authentication: { username: null, authenticated: false, status: 'NORMAL' }
     }
 }; */
  console.log(connection);
});

/* Event emitted after a message was received and parsed. */
mailin.on('message', function (connection, data, content) {
  console.log(data);
  /* Do something useful with the parsed message here.
  * Use parsed message `data` directly or use raw message `content`. */

 // connect to the doughouse database
  MongoClient.connect(url, function(err,db){
    if(err){
      console.log('unable to connect to the mongodb server.');
    } else {

        var reviewColl = db.collection('reviews');

        // insert data into the 'reviews' collection
        reviewColl.insert([{title: data.subject, text: data.text}], function(err,result){
          if(err){
            console.log(err);
          } else {
            console.log('inserted doc with title: ' + data.subject + ' from email');
          }

        });
    }
  });


});



app.use(bodyParser.urlencoded({extended: true}));

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname + '/images'));


app.get('/', function(req, res){
  res.sendFile('index.html', {"root": __dirname});
});


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

      reviewColl.find(query).sort({_id: -1}).limit(parseInt(numReviews)).toArray(function (err, docs){
        if(err){
          console.log(err);
          res.end("error retrieving reviews");
        } else {
          // add timestamp before sending it to frontend
          docs.forEach(function(doc){
            doc["timestamp"] = mongodb.ObjectId(doc._id).getTimestamp();
          });

          res.send(docs.slice(parseInt(from),parseInt(numReviews)));
          res.end();

        }
      });


    }
  });
}

app.post('/searchReviews', function(req,res){
  
  getReviews(res, req.body.from, req.body.numReviews, req.body.searchQuery);

});

app.post('/getReviews', function(req, res){

  getReviews(res, req.body.from, req.body.numReviews, null);

});

app.post('/emailReview', function(req, res){
  console.log("recieved emailReview.. contents: " + req.body);
  res.end();
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

app.listen(80, function(){
  console.log('server running at localhost:80');
});
