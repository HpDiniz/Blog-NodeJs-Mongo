const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Usuario = new Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  senha: {
    type: String,
    required: true
  },
  tipo: {
    type: Number,
    required: true,
    default: 0
  },
  _creationDate: {
    type: Date,
    default: Date.now()
  },
  _lastUpdateDate: {
    type: Date,
    default: Date.now()
  }
});

mongoose.model('usuarios', Usuario);
