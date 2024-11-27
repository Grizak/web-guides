const mongoose = require('mongoose');

const sectionScema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
});

const guideSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    dateCreated: { 
        type: Date, 
        default: Date.now 
    },
    author: {
        type: String,
        required: true,
    },
    sections: [sectionScema],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
});

module.exports = mongoose.model('Guide', guideSchema);
