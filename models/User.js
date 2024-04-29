var knex = require('../database/connection');
var bcrypt = require('bcrypt');
const PasswordToken = require('./PasswordToken');

class User {
  async new(email,password,name) {
    try {
      var hash = await bcrypt.hash(password,10);
      await knex.insert({email,password: hash,name,role: 0}).table('users')

    } catch (error) {
      console.log(error);
      
    }
  }
  async findAll() {
    try {
      var result = await knex.select(["id","email","name","role","phone"]).table('users');
      return result;
    } catch (error) {
      return []
    }
  }

  async findById(id) {
    try {
      var result = await knex.select(["id","email","name","role","phone"]).from('users').where('id',id);
      if(result.length > 0){
        return result[0];
      } else return undefined;
      
    } catch (error) {
      return []
    }
  }

  async findByEmail(email) {
    try {
      var result = await knex.select(["id","email","password","name","role","phone"]).from('users').where('email',email);
      if(result.length > 0){
        return result[0];
      } else return undefined;
      
    } catch (error) {
      return []
    }
  }

  async updateUser(id,email,name,role){
    try {
      var user = await this.findById(id);
      if(user == undefined){
        return {status: false, err: "O Usuario nao existe!"};
      }
      else {
        var editUser = {}
        if(email!= undefined){
          if (email != user.email) {
            var result = await this.findEmail(email);
            console.log(result)
            if (result == false) {
              editUser.email = email;
            }
            else {
              return {status: false, err: "E-mail ja esta cadastrado"};
            }
          }
        }
        if(name!= undefined){
          editUser.name = name;
        }
        if(role!= undefined){
          editUser.role = role;
        }

        await knex.update(editUser).where({id: id}).table("users")
        return {status: true};

      }
    } catch (error) {
      return {status: false, err: "O e-mail ja esta cadastrado"}
    }
  }
  async deleteUser(id) {
    try {
      var user = await this.findById(id);
      if(user == undefined){
        return {status: false, err: "O Usuário nao existe!"};
      }
      else {
        await knex.delete().where({id: id}).table("users")
        return {status: true,message: `${user.name} has been deleted`};
      }
    } catch (error) {
      return error
    }
  
  }

  async findEmail(email) {
    try {
      var result = await knex.select('*').from('users').where('email',email);
      if(result.length > 0){
        return true;
      } else return false;

    } catch (error) {
      console.log(false)
      return false
    }
  }

  async changePassword(newPassword,id,token){
    try {
      var user = await this.findById(id);

      if(user == undefined){
        return {status: false, err: "O Usuario nao existe!"};
      }
      else {
        var hash = await bcrypt.hash(newPassword,10);
        await knex.update({password: hash}).where({id: id}).table("users")
        await PasswordToken.setUsed(token)
        return {status: true};
      }
    } catch (error) {
      return {status: false, err: "A nova senha deve ser diferente da anterior"}
    }
  }

}

module.exports = new User();