/*global console: false, $: false, moment: false, _: false, page: false, alert: false, Showdown: false, EpicEditor: false, Github: false */
$(function(){

  var chatContainer = $('.chat-body');
  $('.msg-area').focus();


  function makeHtml(md){
    var mdConverter = new Showdown.converter();
    return mdConverter.makeHtml(md);
  }

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
      var commentsUrl = 'https://api.github.com/repos/' + ctx.user + '/' + ctx.repo + '/issues/' + ctx.id + '/comments?per_page=1000';
      if(!_.isEmpty(gChat.user.username)){
        commentsUrl += '&access_token=' + gChat.user.accessToken;
      }
      chatContainer.spin();
      $.getJSON(commentsUrl, function(issueCommentsData){
        chatContainer.spin(false);
        var issueCommentsContainer = $('#issue-comments');

        var participants = [];
        var i = 0;

        for (; i < issueCommentsData.length; i++) {
          participants.push(issueCommentsData[i].user);
          var message = makeHtml(issueCommentsData[i].body);
          renderMessage(message, issueCommentsData[i].user, issueCommentsData[i].created_at);
        }
        if(!_.isEmpty(gChat.user.username)){
          participants.push(gChat.user);
        }
        participants = _.uniq(participants, false, function(user){ return parseInt(user.id, 10);});
        renderParticipants(participants);
      }).error(function(){
        alert("Chat room doesn't exist");
        chatContainer.spin(false);
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
      html += '<div class="msg-body">' + msg;
      html += '<span class="date">' + readableDate  + '</span><span class="by-label">by</span><a class="author" href="' + profileLink + '" target="_blank">' + username + '</a></div></div>';

      chatContainer.append(html);
    }


    function postMsg(){
      if(_.isEmpty(gChat.user.username)){
        $('#popup-cover').show();
        $('#popup').show();
        return;
      }
      if(window.webkitNotifications){
        window.webkitNotifications.requestPermission();
      }
      var msg = $('.msg-area').val();
      if(!msg || msg.length == 0){
        return;
      }

      $('.msg-area').val('');
      $('.msg-area').focus();
      var msgData = {'body': msg};
      var message = makeHtml(msg);
      renderMessage(message, gChat.user, new Date().toISOString());
      var scrollHeight = $(".chat-body")[0].scrollHeight;
      $(".chat-body").animate({scrollTop: scrollHeight}, 800);
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

    var socket = io.connect('/');
    var channel = ctx.user + '/' + ctx.repo  + '/' + ctx.id;
    socket.on(channel, function (data) {
      console.log('message from server',data);
      if(data.comment.user.login != gChat.user.username){
        var message = makeHtml(data.comment.body);
        renderMessage(message, data.comment.user, data.comment.created_at);
        var scrollHeight = $(".chat-body")[0].scrollHeight;
        $(".chat-body").animate({scrollTop: scrollHeight}, 800);
        // 0 is PERMISSION_ALLOWED
        if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
          var msg = data.comment.body.replace(/(<([^>]+)>)/ig,"");
          window.webkitNotifications.createNotification(
          '/images/logo-blue.png', 'New message from ' + data.comment.user.login, msg).show();
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