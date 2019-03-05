const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const accountShema = new Schema({
	email: { type: String, required: true },
	name: { type: String },
	age: { type: Number },

	notifications: [{ type: Schema.Types.ObjectId, ref: 'Notification' }],

}, { timestamps: true });

module.exports = model('Account', accountShema);
