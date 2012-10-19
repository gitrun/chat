var express        = require("express"),
    stylus         = require("stylus"),
    nib            = require("nib"),
    passport       = require("passport"),
    GitHubStrategy = require("passport-github").Strategy;

passport.serializeUser(function(user, done){
  done(null, user);
});

passport.deserializeUser(function(obj, done){
  done(null, obj);
});  



passport.use(new GitHubStrategy({
    clientID: "267b48cbb0ac477693ba",
    clientSecret: "de6d2f2ab9527737e1a8a29410d483ab4a7e586c",
    callbackURL: "http://localhost:3000/auth/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function(){
      profile.accessToken = accessToken;
      profile.avatar = profile._json.avatar_url;
      return done(null, profile);
    });  
  }
));


var app = module.exports = express();    


// stylus compile function
var compile = function(str, path){

  var func = stylus(str)
    .define("url", stylus.url({ paths: [__dirname + "/public"] }))
    .set("filename", path)
    .set("warn", true)
    .set("compress", true)
    .use(nib());
  return func;
};

app.configure(function(){
  //stylus
  app.use(stylus.middleware({
    src    : __dirname + "/styls",  
    dest   : __dirname + "/public", 
    compile: compile   
  }));

  // views
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
  app.set("view options", {layout: false});

  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));


  app.use(passport.initialize());
  app.use(passport.session());

  app.use(app.router);


  app.use(express.static(__dirname + "/public"));  
});
  

renderIndexPage = function(req, res){
  params = { user: req.user || {}};
  res.render("index", params);
};

app.get("/", renderIndexPage);


app.get("/auth", passport.authenticate("github", {scope: "repo"}), function(req, res){});


app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/auth/callback", passport.authenticate("github", { failureRedirect: "/auth" }), function(req, res){
  res.redirect("/");
});



var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

app.post("/hook", function(req, res){
  var payload  = req.body;
  console.log("Hook was called", payload);
  io.sockets.emit("messages", { will: 'be received by everyone'});
  // we have payload.comment which has body and user. 
  res.send();
});


server.listen(3000);  