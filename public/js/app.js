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


  function renderHeader(ctx, next){
    if(_.isEmpty(gChat.user.username)){
      $('html').addClass('unlogined');
    } else{
      $('html').addClass('logined');
      $('ul.top-menu .user img').attr('src', gChat.user.avatar);
      $('ul.top-menu .user span').text(gChat.user.username);
    }
    next();
  }

  function renderHomePage(){

  }
  function renderChatPage(ctx){
    var height = $(window).height() - 95;
    $('#chat .chat-body').height(height);

    function renderParticipants(participants){
      var el = $('.chat-mates');
      var i = 0;
      for(;i < participants.length; i++){
        var user = participants[i];
        var username = user.username || user.login;
        var avatar = user.avatar || user.avatar_url;
        var html = '<li><img class="avatar" src="' + avatar + '"><span class="minimize-hide">' + username + '</span></li>';
        el.append(html);
      }

    }

    function renderHistory(){
      var commentsUrl = 'https://api.github.com/repos/' + ctx.user + '/' + ctx.repo + '/issues/' + ctx.id + '/comments';
      if(!_.isEmpty(gChat.user.username)){
        commentsUrl += '?access_token=' + gChat.user.accessToken;
      }
      $.getJSON(commentsUrl, function(issueCommentsData){
        var issueCommentsContainer = $('#issue-comments');
        
        var participants = [];
        var i = 0;
        
        for (; i < issueCommentsData.length; i++) {
          participants.push(issueCommentsData[i].user);
          renderMessage(issueCommentsData[i].body, issueCommentsData[i].user, issueCommentsData[i].created_at);
        }
        if(!_.isEmpty(gChat.user.username)){
          participants.push(gChat.user);
        }
        participants = _.uniq(participants, false, function(user){ return parseInt(user.id, 10);});
        renderParticipants(participants);
      });
    }

    function renderMessage(msg, user, date){
      var readableDate = moment(date).fromNow();
      var username = user.username || user.login;
      var avatar = user.avatar || user.avatar_url;
      var profileLink = 'http://github.com/' + username;
      var html = '<div class="msg">';
      html += '<div class="sender">';
      html += '<img class="avatar" src="' + avatar + '"></div>';
      html += '<div class="msg-body"><p>' + msg + '</p>';
      html += '<span class="date">' + readableDate  + '</span><span class="by-label">by</span><a class="author" href="' + profileLink + '" target="_blank">' + username + '</a></div></div>';

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
      var scrollHeight = $(".chat-body")[0].scrollHeight;
      $(".chat-body").animate({scrollTop: scrollHeight}, 800);
      var msgData = {'body': msg};
      var commentsUrl = 'https://api.github.com/repos/' + ctx.user + '/' + ctx.repo + '/issues/' + ctx.id + '/comments?access_token=' + gChat.user.accessToken;
      $.post(commentsUrl, JSON.stringify(msgData), function(data) {
        console.log('done!');
      });
    }

    $('.login-btn').on('click', function(e){
      e.preventDefault();
      var pathName = document.location.pathname;
      localStorage.setItem('lastUrl', pathName);
      page("/auth");
    });

    $('#msg-send').on("click", postMsg);
    $('.msg-area').keypress(function(e) {
    
      if(e.keyCode == 13) {
        e.preventDefault();
        postMsg();
      }
    });
    
    $('.toggle-panel-btn').on('click', function(){
      var chatPage = $("#chat-page");
      if(chatPage.hasClass('menu-maximized')){
        chatPage.removeClass('menu-maximized').addClass("menu-minimized");
      } else {
        chatPage.removeClass('menu-minimized').addClass("menu-maximized");
      }

    });
    renderHistory();
    
    var socket = io.connect('http://gitchat.jit.su');
    var channel = ctx.user + '/' + ctx.repo  + '/' + ctx.id;
    socket.on(channel, function (data) {
      console.log('message from server',data);
      if(data.comment.user.login != gChat.user.username){
        renderMessage(data.comment.body, data.comment.user, data.comment.created_at);
        // 0 is PERMISSION_ALLOWED
        if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
          window.webkitNotifications.createNotification(
          '/images/logo-blue.png', 'New message from ' + data.comment.user.login, data.comment.body).show();
        }
      }
    });

  }


  

  

  // ROUTER

  page('', renderHeader, function(){
    var lastUrl = localStorage.getItem('lastUrl');
    if(lastUrl){
      localStorage.removeItem('lastUrl'); 
      document.location.pathname = lastUrl;
    } else {
      showPage('intro-page', 'Intro', renderHomePage);
    }
  });

 
  page('/room/:user/:repo/:id', renderHeader, function(ctx){
    showPage('chat-page', "Chat Room", function(){
      renderChatPage(ctx.params);
    });
  });


  page.start({ click: false });
});