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
  var likes = 2;

  if(likes == 0)
    likes = "";

  return '\
    <div class="review mdl-grid">\
      <div class="mdl-cell mdl-cell--2-col"></div>\
      <div class="mdl-cell mdl-cell--8-col">\
        <div class="review-card mdl-card mdl-shadow--2dp">\
          <div class="mdl-card__title mdl-card--border">\
            <h4>'+title+'</h4>\
          </div>\
          <p class="review-date mdl-card__supporting-text">'+datestring+'</p>\
          <div class="mdl-card__text">'+text+'</div>\
          <div class="mdl-card__action-bar">\
            <button class="mdl-button mdl-js-button mdl-button--icon">\
              <i class="material-icons indigo500">thumb_up</i>\
            </button>\
            <p class="mdl-card__supporting-text likes">'+likes+'</p>\
          </div>\
        </div>\
      </div>\
      <div class="mdl-cell mdl-cell--2-col"></div>\
    </div>\
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

  $(document).keyup(function (e) {
      if ($(".searchBox").is(":focus") && (e.keyCode == 13)) {
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
      }
  });


  $('.pageTitle').click(function(){
    window.location = hostUrl
  });

});
