var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
var User = require('../models/User');
var secret = 'xxx';

router.post('/signup', function(req, res) {
    var user = new User();
    user.name = req.body.name;
    user.surname = req.body.surname;
    user.password = bcrypt.hashSync(req.body.password, 10);
    user.email = req.body.email;
    user.save(function(err, userCreated) {
        if (err) return res.status(400).json(err);
        res.status(201).json(userCreated);
    })
})
router.post('/login', function(req, res) {
    User.findOne({email: req.body.email}, function(err, user){
        if (user === null) {
            return res.status(404).json({message: 'User not found'})
        } else if (bcrypt.compareSync(req.body.password, user.password)) {
            var token = jwt.encode(user._id, secret);
            return res.json({token: token});
        } else {
            return res.status(401).json({message: 'password not valid'});
        }

    })

})

var auth = function(req, res, next) {
    if (req.query.token === undefined) return res.status(401).json({message:'Unothorized'})
    var id = jwt.decode(req.query.token, secret);
    User.findById(id, function(err, user) {
        if (err) return res.status(500).json({message: err});
        req.user = user;
        next();
    })
}

var mid2 = function(req, res, next) {
    res.json(req.user);
    next();
}
var sendEmail = function() {
    console.log("send email");
}

router.get('/me', auth, mid2, sendEmail);

router.get('/name', auth, function(req, res) {
    res.json(req.user.name);
})

router.get('/users/:name', function(req, res) {
  User.find({name: req.params.name}, 'name email', function (err, users) {
      res.json(users);
  });
})

var middleware1 = function(req, res, next) {
    console.log("middleware1");
    var x = 0;
    req.x = x;
    next();
}
var middleware2 = function(req, res, next) {
    console.log("middleware2");
    console.log("x:", req.x);
    req.x+=1;
    res.json({message: 'Esco nel 2'});
}
var middleware3 = function(req, res, next) {
    console.log("middleware3");
    console.log("x:", req.x);
    req.x+=2;
    res.json({message:'Ciao', x: req.x});
}

router.get('/testm', middleware1, middleware2, middleware3);




module.exports = router;
