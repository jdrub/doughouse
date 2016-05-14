function getReviews(numReviewsIn, callback) {

  $.post("http://localhost:8080/getReviews", {numReviews: numReviewsIn})
    .done(function(reviews){
      callback(reviews);
    });
}

$(document).ready(function(){
  getReviews(10, function(reviews){
    console.log("returned: " + reviews);
    reviews.forEach(function (review){
      $('#reviews').append('<h3>'+review.title+'</h3><p>'+review.text+'</p><br>');
    });
  });
});
