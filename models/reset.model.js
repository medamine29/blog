const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const resetSchema = mongoose.Schema({
   username: {type: String, required: true},
   resetPasswordToken: {type: String, required: true},
   resetExpires : {type: Number, required: true},
   createdAt: {type: Date, default: Date.now()}
}); 

resetSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Reset', resetSchema);