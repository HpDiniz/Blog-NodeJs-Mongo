const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require("passport");
//const{ehAdmin} = require("../helper/ehAdmin");

require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

require("../models/Categoria");
const Categoria = mongoose.model("categorias");

require("../models/Postagem");
const Postagem = mongoose.model("postagens");

router.get('/', (req,res)=>{
  res.render('admin/index');
});

router.get('/posts', (req,res)=>{
  res.send("Pagina de posts");
});

router.get('/categorias', (req,res)=>{
  Categoria.find().lean().sort({_creationDate: 'desc'}).then((categorias)=>{
    res.render("admin/categorias", {categorias: categorias});
  }).catch((err)=> {
    req.flash("error_msg", "Houve um erro ao listas as categorias");
    res.redirect("/admin");
  })

});

router.get('/categorias/add', (req,res)=>{
  res.render("admin/addcategorias");
});

router.post('/categorias/nova', (req,res)=>{

  var erros = [];

  if(!req.body.nome){
    erros.push({text: "Nome inválido"});
  }

  if(!req.body.slug){
    erros.push({text: "Slug inválido"});
  }

  if(erros.length > 0){
    res.render("admin/addcategorias", {erros: erros});
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug
    }

    new Categoria(novaCategoria).save().then(()=>{
      req.flash("success_msg", "Categoria criada com sucesso!");
      res.redirect("/admin/categorias");
    }).catch(err => {
      req.flash("error_msg", "Houve um erro ao salvar a categoria.");
      res.redirect("admin");
    })
  }
});

router.post('/usuarios/nova', (req,res)=>{
  const novoUsuario = {
    nome: req.body.nome,
    sobrenome: req.body.sobrenome,
    email: req.body.email
  }

  new Usuario(novoUsuario).save().then(()=>{
    console.log('Categoria salva com sucesso');
  }).catch(err => {
    console.log('Erro ao salvar categoria!');
  })
});

router.get("/categorias/edit/:id", (req,res)=>{
  Categoria.findOne({_id: req.params.id}).lean().then((categoria)=>{
    res.render("admin/editcategorias",{categoria: categoria});
  }).catch((err) => {
    req.flash("error_msg", "Esta categoria não existe");
    res.redirect("/admin/categorias");
  })
});

router.post("/categorias/edit", (req,res)=>{
  Categoria.findOne({_id: req.body.id}).then((categoria)=>{

    if(req.body.nome)
      categoria.nome = req.body.nome;

    if(req.body.slug)
      categoria.slug = req.body.slug;

    categoria.save().then(()=>{
      req.flash("success_msg", "Categoria editada com sucesso!");
      res.redirect("/admin/categorias");
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao editar a categoria");
      res.redirect("/admin/categorias");
    })

  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao editar a categoria");
    res.redirect("/admin/categorias");
  })
});


router.post("/categorias/delete", (req,res)=>{
  Categoria.remove({_id: req.body.id}).then(()=>{
      req.flash("success_msg", "Categoria deletada com sucesso!");
      res.redirect("/admin/categorias");
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao deletar a categoria");
    res.redirect("/admin/categorias");
  })
});

router.get('/postagens', (req,res)=>{
  Postagem.find().lean().populate("categoria").sort({_creationDate:"desc"}).then((postagens)=>{
    res.render("admin/postagens", {postagens: postagens});
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro ao listas as postagens");
    res.redirect("/admin");
  })
});

router.get('/postagens/add', (req,res)=>{

  Categoria.find().lean().then((categorias)=>{
    res.render("admin/addpostagens", {categorias: categorias});
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar o formulário");
    res.redirect("/admin");
  })
});

router.post('/postagens/nova', (req,res)=>{

  var erros = [];

  if(req.body.categoria == "0"){
    erros.push({text: "Categoria inválida, registre uma categoria"});
  }

  if(erros.length > 0){
    res.render("admin/addpostagens", {erros: erros});
  } else {
    const novaPostagem = {
      nome: req.body.titulo,
      descricao: req.body.descricao,
      titulo: req.body.titulo,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug
    }

    new Postagem(novaPostagem).save().then(()=>{
      req.flash("success_msg", "Postagem criada com sucesso!");
      res.redirect("/admin/postagens");
    }).catch(err => {
      console.log(err);
      req.flash("error_msg", err);
      res.redirect("/admin/postagens");
    })
  }
});

router.get("/postagens/edit/:id", (req,res)=>{
  Postagem.findOne({_id: req.params.id}).lean().then((postagens)=>{
    Categoria.find().lean().then((categorias)=>{
      res.render("admin/editpostagens",{postagens: postagens, categorias: categorias});
    }).catch((err) => {
      req.flash("error_msg", "Esta postagem não existe");
      res.redirect("/admin/postagens");
    });
  });
});

router.post("/postagens/edit", (req,res)=>{
  Postagem.findOne({_id: req.body.id}).then((postagem)=>{

    if(req.body.titulo)
      postagem.titulo = req.body.titulo;

    if(req.body.slug)
      postagem.slug = req.body.slug;

    if(req.body.descricao)
      postagem.descricao = req.body.descricao;

    if(req.body.categoria)
      postagem.categoria = req.body.categoria;

    if(req.body.conteudo)
      postagem.conteudo = req.body.conteudo;

    postagem.save().then(()=>{
      req.flash("success_msg", "Postagem editada com sucesso!");
      res.redirect("/admin/postagens");
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao editar a postagem");
      res.redirect("/admin/postagens");
    })

  }).catch((err) => {
    console.log(err);
    req.flash("error_msg", "Houve um erro ao editar a postagem");
    res.redirect("/admin/postagens");
  })
});

// Maneira não segura
router.get("/postagens/delete/:id", (req,res)=> {
  Postagem.remove({_id: req.params.id}).then(()=>{
    req.flash("success_msg", "Postagem deletada com sucesso!");
    res.redirect("/admin/postagens");
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro interno");
    res.redirect("/admin/postagens");
  })
});

module.exports = router;
