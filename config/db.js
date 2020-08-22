if(process.env.NODE_ENV == "production"){
  module.exports = {mongoURI: "mongodb+srv://henrique:WhgJe3Zh4UUfmbFg@henrique.vjf1z.gcp.mongodb.net/test"}
} else {
  module.exports = {mongoURI: "mongodb://localhost/henrique"}
}
