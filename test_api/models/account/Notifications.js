const mongoose = require('mongoose');

const Notifications = new mongoose.Schema({
    accountId: {type: String, required: true},
    name: {type: String},
    color: {type: String},

}, {timestamps: true});

module.exports = mongoose.model('Notifications', Notifications);
