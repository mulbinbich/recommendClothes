const mongoose = require('mongoose');

const commentsSchema = mongoose.Schema({
    postId: {
        type: Number,
        required: true,
        unique: true,
    },
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    commentId: {
        type: Number,
        required: true,
        unique: true,
    },
    userName: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    // like: {
    //     type: Number,
    // },
});

module.exports = mongoose.model('Comments', commentsSchema);