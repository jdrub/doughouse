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
    .done(function(result){
      callback(result.reviews, result.noMore, searchQueryIn);
    });
}

function likeButtonHtml(title){
  if($.cookie(title))
    return disabledLikeButtonHtml(title);
  else
    return enabledLikeButtonHtml(title);
}

function enabledLikeButtonHtml(title){
  return '\
    <button class="like-button mdl-button mdl-js-button mdl-button--icon" id="'+title+'">\
      <i class="material-icons indigo500">thumb_up</i>\
    </button>'
}

function disabledLikeButtonHtml(title){
  return '\
    <button disabled class="like-button mdl-button mdl-js-button mdl-button--icon" id="'+title+'">\
      <i class="material-icons indigo100">thumb_up</i>\
    </button>'
}


function createReviewHtml(title,timestamp,text,likes){

  var datestring = timestamp.substring(0,timestamp.indexOf('T'));

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
            '+likeButtonHtml(title)+'\
            <p class="mdl-card__supporting-text like-display">'+likes+'</p>\
          </div>\
        </div>\
      </div>\
      <div class="mdl-cell mdl-cell--2-col"></div>\
    </div>\
    ';
}



function getReviewsCallback(reviews, noMore, searchQueryIn){

  localStorage.setItem("numReviews",reviews.length+parseInt(localStorage.getItem("numReviews")));

  reviews.forEach(function (review){
    $('#reviews').append(createReviewHtml(review.title, review.timestamp,review.text, review.likes));
  });

  console.log("noMore: " + noMore);
  if(noMore){
    $('.loadMoreButton').hide();
  } else {
    $('.loadMoreButton').show();
  }
}

$(document).ready(function(){
  localStorage.setItem("numReviews",0);
  localStorage.setItem("searchQuery","");

  getReviews(0,maxReviewsToSend, "", getReviewsCallback);

  $('.loadMoreButton').click(function (){
    var numReviews = parseInt(localStorage.getItem("numReviews"));
    getReviews(numReviews,numReviews+10, localStorage.getItem("searchQuery"), getReviewsCallback);
  });

  $('#reviews').on('click', '.like-button', function () {
    var title = $(this).attr('id');

    $.post(hostUrl + '/addLike', {title: title});

    // set cookie
    $.cookie(title, true);

    var likeElem = $(this).next();
    var numLikes = likeElem.text();

    if(parseInt(numLikes))
      likeElem.text(parseInt(numLikes)+1);
    else
      likeElem.text(1);

    // disable and color button
    $(this).prop("disabled", true);
    var likeIcon = $($(this).children()[0]);
    likeIcon.removeClass("indigo500");
    likeIcon.addClass("indigo100");

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
