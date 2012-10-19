/*global cUnity: false, console: false, $: false, moment: false, _: false, page: false, async: false, alert: false, Showdown: false, EpicEditor: false, Github: false */
$(function(){
  $('.msg-area').focus();
  
  function showPage(pageName, pageTitle, fn){
    $('.page.visible').removeClass('visible').addClass('invisible');

    $('#' + pageName).removeClass('invisible').addClass('visible');
    document.title = pageTitle;
    $('html').attr("data-page-name", pageName);
    if(fn){
      fn();
    }
  }

  function postMsg(){
    var msg = $('.msg-area').val();

    $('.chat-body').append('<p class="msg-body">' + msg + '</p>');
    $('.msg-area').val('');
    $('.msg-area').focus();

    $.post('https://api.github.com/repos/marynaaleksandrova/gitchat/issues/1/comments', JSON.stringify('issueData'), function(data) {

    });
  }

  $("#msg-send").on("click", postMsg);
  $('.msg-area').keypress(function(e) {
  
    if(e.keyCode == 13) {
      e.preventDefault();
      postMsg();
    }
  });
  
});