/*global cUnity: false, console: false, $: false, moment: false, _: false, page: false, async: false, alert: false, Showdown: false, EpicEditor: false, Github: false */
$(function(){

  var chatContainer = $('.chat-body');

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

  
  function renderMessage(msg, user, date){
    var readableDate = moment(date).fromNow();
    var html = '<div class="mesages"><p class="msg-body">' + msg + '</p></div>';
    chatContainer.append(html);
  }


  function postMsg(){
    var msg = $('.msg-area').val();


    $('.msg-area').val('');
    $('.msg-area').focus();
    renderMessage(msg, gChat.user, new Date().toISOString());
    var msgData = {'body': msg};
    $.post('https://api.github.com/repos/marynaaleksandrova/gitchat/issues/1/comments?access_token=' + gChat.user.accessToken, JSON.stringify(msgData), function(data) {
      console.log('done!');
    });
  }

  $("#msg-send").on("click", postMsg);
  $('.msg-area').keypress(function(e) {
  
    if(e.keyCode == 13) {
      e.preventDefault();
      postMsg();
    }
  });
  

  var socket = io.connect('http://gitchat.jit.su');
  socket.on('messages', function (data) {
    console.log('message from server',data);
    renderMessage(data.comment.body, data.comment.user, data.comment.created_at);
  });
});