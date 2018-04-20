const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  users: [{type: Schema.Types.ObjectId, ref:'User'}],
  comments: [{type: Schema.Types.ObjectId, ref:'Comment'}],
  admin: {type: Schema.Types.ObjectId, ref:'User', required: true},
  name: {type: String, required: true}
});

module.exports = mongoose.model('Chat', ChatSchema);
