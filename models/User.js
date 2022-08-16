const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false },
    created_at: { type: Date, default: new Date },
}, { validateBeforeSave: true })

module.exports = mongoose.model('users', schema);