function getReviews(numReviewsIn, callback) {

  $.post("http://localhost:8080/getReviews", {numReviews: numReviewsIn})
    .done(function(reviews){
      callback(reviews);
    });
}

function createReviewHtml(title, text){
  return '\
    <div class="review">\
      <h3 class="reviewTitle">'+title+'</h3>\
      <div class=reviewText>\
        <p>'+text+'</p><br>\
      </div>\
    </div>\
    ';
}

$(document).ready(function(){
  getReviews(10, function(reviews){

    reviews.forEach(function (review){
      console.log(createReviewHtml(review.title,review.text));
      $('#reviews').append(createReviewHtml(review.title,review.text));
    });
  });
});
