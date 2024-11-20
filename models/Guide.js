const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Guide', guideSchema);
