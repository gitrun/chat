'use strict';
var express        = require('express'),
    stylus         = require('stylus'),
    nib            = require('nib'),
    nconf          = require('nconf'),
    passport       = require('passport'),
    bodyParser     = require('body-parser'),
    cookieParser   = require('cookie-parser'),
    session        = require('express-session'),
    GitHubStrategy = require('passport-github').Strategy;


var app = module.exports = express();


nconf
  .argv()
  .env()
  .file({file: __dirname + '/configs/' + app.settings.env + '.config.json'})
  .defaults({'NODE_ENV': 'development'});


passport.serializeUser(function(user, done){
  done(null, user);
});

passport.deserializeUser(function(obj, done){
  done(null, obj);
});



passport.use(new GitHubStrategy({
    clientID: nconf.get('GITHUB_CLIENT_ID'),
    clientSecret: nconf.get('GITHUB_CLIENT_SECRET'),
    callbackURL: nconf.get('GITHUB_CALLBACK_URL')
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function(){
      profile.accessToken = accessToken;
      profile.avatar = profile._json.avatar_url;
      return done(null, profile);
    });
  }
));

// stylus compile function
var compile = function(str, path){

  var func = stylus(str)
    .define('url', stylus.url({ paths: [__dirname + '/public'] }))
    .set('filename', path)
    .set('warn', true)
    .set('compress', true)
    .use(nib());
  return func;
};

//stylus
app.use(stylus.middleware({
  src    : __dirname + '/styls',
  dest   : __dirname + '/public',
  compile: compile
}));

// views
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {layout: false});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
  secret: 'CHANGE_THIS_IN_PROD',
  cookie: {}
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

var renderIndexPage = function(req, res){
  var params = { user: req.user || {}};
  res.render('index', params);
};

app.get('/', renderIndexPage);

app.get('/room/:user/:repo/:id', renderIndexPage);


app.get('/auth', passport.authenticate('github', {scope: 'repo'}), function(req, res){});


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/auth/callback', passport.authenticate('github', { failureRedirect: '/auth' }), function(req, res){
  res.redirect('/');
});


var http = require('http').Server(app);
var io = require('socket.io')(http);

app.post('/hook', function(req, res){
  var payload  = req.body;
  console.log('Hook was called', payload);
  var url = payload.issue.html_url.split('/');
  var channel = url[3] + '/' + url[4] + '/' + url[6];
  console.log('channel name', channel);
  // we have payload.comment which has body and user.
  io.sockets.emit(channel, payload);
  res.send();
});

if (!module.parent) {
  var port = process.env.PORT || 3000;
  http.listen(port, function(){
    console.log('Express started on port ' + port);
  });
}