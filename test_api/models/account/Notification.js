const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const notificationShema = new Schema({
    name: { type: String },
    color: { type: String },

    account: { type: Schema.Types.ObjectId, ref: 'Account' },

}, { timestamps: true });

module.exports = model('Notification', notificationShema);
