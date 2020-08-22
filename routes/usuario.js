const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require("passport");

require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

router.get('/registro', (req,res)=>{
  res.render('usuarios/registro');
});

router.post('/registro', (req,res)=>{

  var erros = [];

  if(!req.body.nome){
    erros.push({text: "Nome inválido"});
  }

  if(!req.body.email){
    erros.push({text: "Email inválido"});
  }

  if(!req.body.senha){
    erros.push({text: "Senha inválida"});
  }

  if(!req.body.senha2){
    erros.push({text: "Senha inválida"});
  }

  if(req.body.senha != req.body.senha2){
    erros.push({text: "As senhas são diferentes, tente novamente!"});
  }

  if(erros.length > 0){
    res.render("usuarios/registro", {erros: erros});
  } else {
    Usuario.findOne({email: req.body.email}).then((usuario) => {
      if(usuario){

        req.flash("error_msg", "Já existe um usuário registrado com este e-mail.");
        res.redirect("/usuarios/registro");

      }else{

        const novoUsuario = new Usuario({
          nome: req.body.nome,
          email: req.body.email,
          senha: req.body.senha,
        });

        bcrypt.genSalt(10, (erro, salt) => {
          bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
            if(erro){
              req.flash("error_msg", "Houve um erro a senha do Usuario.");
              res.redirect("/");
            }
            novoUsuario.senha = hash;

            novoUsuario.save().then(()=>{
              req.flash("success_msg", "Usuario criado com sucesso!");
              res.redirect("/");
            }).catch(err => {
              req.flash("error_msg", "Houve um erro ao salvar a Usuario.");
              res.redirect("/usuarios/registro");
            })

          })
        });
      }
    }).catch(err => {
      req.flash("error_msg", "Houve um erro ao salvar a Usuario.");
      res.redirect("/usuarios/registro");
    })

  }
});

router.get('/login', (req, res)=>{
  res.render("usuarios/login");
})

router.post('/login', (req, res, next)=>{
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/usuarios/login",
    failureFlash: true,
  })(req, res, next);
})

router.get('/logout', (req, res, next)=>{

  req.logout();
  req.flash('success_msg', "Deslogado com sucesso!");
  res.redirect("/");
})



module.exports = router;
