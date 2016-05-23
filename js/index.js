var hostUrl = 'http://localhost';
var maxReviewsToSend = 10;

function getReviews(fromIn, numReviewsIn, searchQueryIn, callback) {

  var endpoint;

  if(searchQueryIn){
    endpoint = "/searchReviews";
  } else {

    endpoint = "/getReviews";
  }


  $.post(hostUrl + endpoint, {from: fromIn, numReviews: numReviewsIn, searchQuery: searchQueryIn})
    .done(function(reviews){
      callback(reviews, searchQueryIn);
    });
}

function createReviewHtml(title,timestamp,text){

  var datestring = timestamp.substring(0,timestamp.indexOf('T'));

  return '\
    <div class="mdl-cell mdl-cell--3-col"></div>\
    <div class="review mdl-cell mdl-cell--6-col">\
      <div class="review-card mdl-card mdl-shadow--3dp">\
        <div class="mdl-card__title mdl-card--border">\
          <h4>'+title+'</h4>\
        </div>\
        <p class="review-date mdl-card__supporting-text">'+datestring+'</p>\
        <div class="mdl-card__supporting-text">'+text+'</div>\
      </div>\
    </div>\
    <div class="mdl-cell mdl-cell--3-col"></div>\
    ';
}



function getReviewsCallback(reviews, searchQueryIn){

  localStorage.setItem("numReviews",reviews.length+parseInt(localStorage.getItem("numReviews")));

  reviews.forEach(function (review){
    $('#reviews').append(createReviewHtml(review.title, review.timestamp,review.text));
  });
}

$(document).ready(function(){
  localStorage.setItem("numReviews",0);
  localStorage.setItem("searchQuery","");

  getReviews(0,maxReviewsToSend, "", getReviewsCallback);

  $('.loadMoreButton').click(function (){
    var numReviews = parseInt(localStorage.getItem("numReviews"));
    getReviews(numReviews,numReviews+10, localStorage.getItem("searchQuery"), getReviewsCallback);
  });

  $('#searchForm').submit( function(){

    var numReviews = parseInt(localStorage.getItem("numReviews"));
    var searchQuery = $('.searchBox').val();

    if(localStorage.getItem("searchQuery") != searchQuery){
      localStorage.setItem("searchQuery",searchQuery);
      localStorage.setItem("numReviews", 0);
      numReviews = 0;
      $('.review').remove();
    }

    getReviews(numReviews,numReviews+maxReviewsToSend, searchQuery, getReviewsCallback);
    return false;
  });


  $('.pageTitle').click(function(){
    window.location = hostUrl
  });

});
