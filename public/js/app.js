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

  
  function renderHistory(){
    var commentsUrl = 'https://api.github.com/repos/marynaaleksandrova/gitchat/issues/1/comments?access_token=' + gChat.user.accessToken;
    $.getJSON(commentsUrl, function(issueCommentsData){
      var issueCommentsContainer = $('#issue-comments');

      var i = 0;
      for (; i < issueCommentsData.length; i++) {
        renderMessage(issueCommentsData[i].body, issueCommentsData[i].user, issueCommentsData[i].created_at);
      }
    });
  }

  function renderMessage(msg, user, date){
    var readableDate = moment(date).fromNow();
    var username = user.username || user.login;
    var avatar = user.avatar || user.avatar_url;
    var html = '<div class="msg">';
    html += '<div class="sender">';
    html += '<img class="avatar" src="' + avatar + '"></div>';
    html += '<div class="msg-body"><p>' + msg + '</p>';
    html += '<span class="date">' + readableDate  + '</span><span class="by-label">by</span><span class="author">' + username + '</span></div></div>';

    chatContainer.append(html);
  }

        
  function postMsg(){
    if(window.webkitNotifications){
      window.webkitNotifications.requestPermission();
    }
    var msg = $('.msg-area').val();


    $('.msg-area').val('');
    $('.msg-area').focus();
    renderMessage(msg, gChat.user, new Date().toISOString());
    var msgData = {'body': msg};
    var commentsUrl = 'https://api.github.com/repos/marynaaleksandrova/gitchat/issues/1/comments?access_token=' + gChat.user.accessToken;
    $.post(commentsUrl, JSON.stringify(msgData), function(data) {
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
  

  function renderHeader(){
    if(_.isEmpty(gChat.user.username)){
      $('html').addClass('unlogined');
    } else{
      $('html').addClass('logined');
      $('div.user img').attr('src', gChat.user.avatar);
      $('div.user span').text(gChat.user.username);
    }
  }


  renderHeader();
  renderHistory();

  var socket = io.connect('http://gitchat.jit.su');
  socket.on('messages', function (data) {
    console.log('message from server',data);
    if(data.comment.user.username != gChat.user.username){
      renderMessage(data.comment.body, data.comment.user, data.comment.created_at);
      // 0 is PERMISSION_ALLOWED
      if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
        // function defined in step 2
        window.webkitNotifications.createNotification(
        '', 'New message from ' + data.comment.user.username, data.comment.body).show();
      }
    }
  });
});