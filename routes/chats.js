var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Chat = require('../models/Chat');
var Comment = require('../models/Comment');
var auth = require('../middlewares/auth');

var findChatById = function(req, res, next) {
    Chat.findById(req.params.id).populate({
     path: 'comments',
     populate: {
       path: 'user',
       model: 'User',
       select: 'name surname'
     }
  }).exec(function(err, chat){
        if (err) return res.status(500).json({message: err});
        if (!chat) return res.status(404).json({message: 'Chat not found'});
        req.chat = chat;
        next();
    })
}

var isAdminOfChat = function(req, res, next) {
    if(String(req.user._id) !== String(req.chat.admin)) {
        return res.status(401).json({message: 'This method is just for chat admin!'})
    }
    next();
}

var isParticipantsOfChat = function(req, res, next) {
    for (var i=0; i<req.chat.users.length; i++) {
        if (String(req.chat.users[i]) === (String(req.user._id))) {
           return next();
        }
    }
    return res.status(401).json({message: 'You are not in this chat!'})
}

router.post('/', auth.verify,  function(req, res){
    var chat = new Chat();
    chat.admin = req.user._id;
    chat.name = req.body.name;
    chat.users.push(req.user._id);
    chat.save(function(err, chatSaved) {
        if (err) return res.status(500).json({message: err});
        req.user.chats.push(chatSaved._id);
        req.user.save(function(err, userSaved) {
            res.status(201).json(chatSaved)
        })
    });
});
router.put('/:id/add', auth.verify, findChatById, isAdminOfChat, function(req, res) {
    for (var i=0; i<req.chat.users.length; i++) {
        if (String(req.chat.users[i]) === (String(req.body.userId))) {
           return res.status(409).json({message: 'User is just present in this chat!'})
        }
    }
    req.chat.users.push(req.body.userId);
    req.chat.save(function(err, chatSaved) {
        if (err) return res.status(500).json({message: err});
        User.findById(req.body.userId, function(err, userFinded){
            userFinded.chats.push(chatSaved._id);
            userFinded.save(function(err, userSaved){
                res.status(201).json({message: 'user added'});
            })
        })
    });
})

router.get('/:id', auth.verify, findChatById, isParticipantsOfChat, function(req, res, next) {
    res.json(req.chat.comments);
})

router.post('/:id/send', auth.verify, findChatById, isParticipantsOfChat, function(req, res) {
      var comment = new Comment();
      comment.user = req.user._id;
      comment.text = req.body.text;
      comment.save(function(err, commentSaved){
          if (err) return res.status(500).json({message: err})
          req.chat.comments.push(commentSaved._id);
          req.chat.save(function(err, chatSaved) {
              if (err) return res.status(500).json({message: err})
              res.status(201).json(commentSaved);
          })
      })
});

router.get('/', auth.verify, function(req, res){
    User.findById(req.user._id).populate({
     path: 'chats',
     populate: {
       path: 'admin',
       model: 'User',
       select: 'name surname'
     }
  }).exec(function(err, user){
        if (err) return res.status(500).json({message: err})
        res.json(user.chats);
    })
})



module.exports = router;
