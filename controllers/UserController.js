var User = require('../models/User');
var PasswordToken = require('../models/PasswordToken');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');


var secret = "jshakjshijdhoiajdoikj"


class UserController {
  async index(req, res) {
    var users = await User.findAll();
    res.status(200);
    res.json(users);

  }

  async findUser(req, res) {
    var { id } = req.params;
    var user = await User.findById(id);
    if (user === undefined) {
      res.status(404);
      res.json({ error: "User not found" });
      return;
      
    }
    else {
      res.status(200);
      res.json(user);
      return;
    }
  }

  async edit(req, res) {
    var { id,name,role,email } = req.body;
    try {
      var result = await User.updateUser(id,email,name,role);
      console.log(result)
      if (result != undefined && result.status != false) {
        res.status(200);
        res.json({ message: "User updated successfully" });
        return;
      }
      else {
        res.status(404);
        res.json({result, error: "User not found" });
        return;
      }
      
    } catch (error) {
      res.status(403);
      res.json({ error: error.message });
      return;
      
    }
  }
  async delete(req, res) {
    var { id } = req.params;
    try {
      var result = await User.deleteUser(id);
      if (result != undefined && result.status != false) {
        res.status(200);
        res.json({ message: "User deleted successfully" });
        return;
      }
      else {
        res.status(404);
        res.json({result, error: "User not found" });
        return;
      }
      
    } catch (error) {
      res.status(403);
      res.json({ error: error.message });
      return;
      
    }
  }

  async create(req, res) {
    var { name, email, password } = req.body;

    if (name == undefined) {
      res.status(403);
      res.json({ error: "Name is required" });
      return;
    }
    if (email == undefined) {
      res.status(403);
      res.json({ error: "Email is required" });
      return;

    }
    if (password == undefined) {
      res.status(403);
      res.json({ error: "Password is required" });
      return;
    }
    var findEmail = await User.findEmail(email)

    if (findEmail) {
      res.status(403);
      res.json({ error: "Email is already taken" });
      return;
    }


    await User.new(email,password,name)
    res.status(200);
    res.json({ message: "User created successfully" });
  }

  async recoverPassword(req, res) {
    var { email } = req.body;
    if (email == undefined) {
      res.status(403);
      res.json({ error: "Email is required" });
      return;
    }
    try {
      var result = await PasswordToken.create(email)
      if (result != undefined && result.status != false) {
        res.status(200);
        res.send(""+result.token);
      }
      else {
        res.status(404);
        res.json({result, error: "User not found" });
        return;
      }
    } catch (error) {
      res.status(403);
      res.json({ error: error });
      return;
      
    }
  }

  async changePassword(req, res) {
    var { token, password } = req.body;
    if (token == undefined) {
      res.status(403);
      res.json({ error: "Token is required" });
      return;
    }
    if (password == undefined) {
      res.status(403);
      res.json({ error: "Password is required" });
      return;
    }
    try {
      var result = await PasswordToken.validate(token)
      if (result.status) {
        await User.changePassword(password,result.data.user_id,result.data.token)
        res.status(200);
        res.json({ message: "Password changed successfully" });
        return;
        
      }
      else {
        throw result
      }

    } catch (error) {
      res.status(403);
      res.json(result);
      return;
      
    }
  }

  async login(req, res) {
    var { email, password } = req.body;

    var user = await User.findByEmail(email);

    if (user != undefined) {
      var result = await bcrypt.compare(password, user.password);
      if (result) {
        var token = jwt.sign({ email: user.email, role: user.role }, secret);
        res.status(200);
        res.json({ status: true, token: token });
      }
      else {
        res.status(406);
        res.json({status: false, message: "Email or password is incorrect"})
      }

    }
    else {
      res.status(403);
      res.json({status: false, message: "Email or password is incorrect"})
    }
  }
}

module.exports = new UserController();