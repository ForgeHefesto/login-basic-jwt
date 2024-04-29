var jwt = require("jsonwebtoken");
var secret = "jshakjshijdhoiajdoikj"


module.exports = function (req, res, next) {
  const authToken = req.headers['authorization']
  console.log(authToken)

  if (authToken != undefined) {
    const bearer = authToken.split(' ');
    const bearerToken = bearer[1];
    try {
      
      var decoded = jwt.verify(bearerToken, secret)
      if (decoded.role == 1) {
        req.role = decoded.role
        next()
      }
      else {
        res.status(401).send({
          message: 'Unauthorized'
        })
      }
      
    } catch (error) {
      res.status(401).send({
        message: 'Unauthorized'
      })
      
    }
  }
  else {
    res.status(401).send({
      message: 'Unauthorized'
    })
  }
}