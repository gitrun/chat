var express = require("express"),
    stylus  = require("stylus");



var app = module.exports = express();    


app.configure(function(){

  // views
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
  app.set("view options", {layout: false});
  app.use(app.router);
  app.use(express.static(__dirname + "/public"));  
});
  

renderIndexPage = function(req, res){
  params = { user: req.user || {}};
  res.render("index", params);
};

app.get("/", renderIndexPage);

app.listen(3000);  