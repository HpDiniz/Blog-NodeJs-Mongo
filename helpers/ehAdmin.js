module.exports = {

  ehAdmin: function (req, res, next){
    if(req.isAutenticated() && req.user.tipo == 1){
      return next();
    }
    req.flash("error_msg", "Você precisa ser um ADMIN");
    res.redirect("/");
  }


}
