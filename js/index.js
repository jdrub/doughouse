function getReviews(fromIn, numReviewsIn, callback) {

  $.post("http://localhost:8080/getReviews", {from: fromIn, numReviews: numReviewsIn})
    .done(function(reviews){
      callback(reviews);
    });
}

function createReviewHtml(title,timestamp,text){

  var datestring = timestamp.substring(0,timestamp.indexOf('T'));

  return '\
    <div class="review">\
      <h3 class="reviewTitle">'+title+'</h3>\
      <div class="reviewDate">'+datestring + '\
      </div>\
      <div class=reviewText>\
        <p>'+text+'</p><br>\
      </div>\
    </div>\
    ';
}

function getReviewsCallback(reviews){
  localStorage.setItem("numReviews",reviews.length+parseInt(localStorage.getItem("numReviews")));

  reviews.forEach(function (review){
    $('#reviews').append(createReviewHtml(review.title, review.timestamp,review.text));
  });
}

$(document).ready(function(){
  localStorage.setItem("numReviews",0);
  getReviews(0,10, getReviewsCallback);

  $('.loadMoreButton').click(function (){
    var numReviews = parseInt(localStorage.getItem("numReviews"));
    getReviews(numReviews,numReviews+10, getReviewsCallback);
  });
});
