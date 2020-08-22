const mongoose = require('mongoose');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const admin = require('./routes/admin');
const usuarios = require('./routes/usuario');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require("passport");
require("./config/auth")(passport);
const db = require("./config/db");

require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");

app.use(express.static(path.join(__dirname,"public")));

app.use(session({
  secret: "mk12hf0213mak12",
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = (req.user || null);
  next();
});

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars');

app.use('/admin', admin)
app.use('/usuarios', usuarios)


app.get('/', (req, res) => {
  Postagem.find().lean().populate("categoria").sort({_creationDate:"desc"}).then((postagens)=>{
    res.render("index", {postagens: postagens});
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro ao carregar as postagens");
    res.redirect("/404");
  })
})

app.get("/postagem/:slug", (req, res) =>{
  Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
    if(postagem){
      res.render("postagem/index", {postagem: postagem});
    } else {
      req.flash("error_msg", "Esta postagem não existe");
      res.redirect("/");
    }
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro interno");
  })
})

app.get("/categorias", (req, res) =>{
  Categoria.find().lean().then((categorias) => {
    res.render("categorias/index", {categorias: categorias});
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro interno ao listar as categorias");
    res.redirect("/");
  });
});

app.get("/categorias/:slug", (req, res) =>{
  Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
    if(categoria){

      Postagem.find({categoria: categoria._id}).lean().then((postagens) => {

        res.render("categorias/postagens", {postagens: postagens, categoria: categoria});

      }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os posts!");
        res.redirect("/");
      });

    } else {
      req.flash("error_msg", "Esta categoria não existe");
      res.redirect("/");
    }
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria");
    res.redirect("/");
  })
})


app.get("/404", (req, res) =>{
  res.send('Erro 404');
})

app.listen(PORT, function(){
  console.log("Server running in http://localhost:8080");
});

mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then( () => {
  console.log("MongoDB conectado com Sucesso!");
}).catch( err => {
  console.log("Houve um erro ao se conectar ao mongoDB: " + err)
});

/*
const UserSchema = mongoose.Schema({
  nome: {
    type: String,
    require: true
  },
  sobrenome: {
    type: String,
  },
  email: {
    type: String,
    require: true
  },
  tipo: {
    type: String,
    require: true
  }
});

mongoose.model('users', UserSchema);

const user = mongoose.model('users');
new user({
  nome: "Jonas",
  sobrenome: "Lemos",
  email: "jonas.lemos@gmail.com",
  tipo: "admin"
}).save().then(() => {
  console.log("Usuário cadastrado com sucesso");
}).catch((err)=>{
  console.log("Falha ao criar usuário");
})
 */
