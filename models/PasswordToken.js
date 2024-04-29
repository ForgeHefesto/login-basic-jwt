var knex = require("../database/connection")
var User = require("./User")


class PasswordToken {
  async create(email) {
    try {
      var user = await User.findByEmail(email)

      var token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      if (user != undefined) {
        await knex.insert({
          user_id: user.id,
          used: 0,
          token: token
        }).table('passwordtoken')
        return {status: true, token: token}
   
      } else {
        return {status: false, err: "O e-mail passado nao existe no banco de dados"};
      }
      
    } catch (error) {
      console.log(error)
      return {status: false, err: error};
    }

  }

  async validate(token) {
    try {
      var result = await knex.select().where({token: token}).table('passwordtoken')
      if (result.length > 0) {
        var tk = result[0];
        if (tk.used) {
          return {status: false, message: "Token já utilizado"}
        }
        else {
          return {status: true,data: tk, message: "Token valido"}
        }
      } else {
        return {status: false, message: "Token invalido"}
      }
    } catch (error) {
      console.log(error)
      return {status: false, message: error};
    }
    
  }

  setUsed(token) {
    return knex.update({used: 1}).where({token: token}).table('passwordtoken')
  }

}

module.exports = new PasswordToken();