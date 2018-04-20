const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref:'User'},
  text: {type: String, required: true},
  timestamp: {type: Date, required: true, default: Date.now()}
});

module.exports = mongoose.model('Comment', CommentSchema);
