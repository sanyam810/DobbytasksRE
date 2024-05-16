const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    url: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        required: true
    }
});

const Image = mongoose.model('Image', ImageSchema);

const FolderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentFolder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder'
    },
    subfolders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder'
    }],
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    }]
});

const Folder = mongoose.model('Folder', FolderSchema);

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password:{
        type: String,
        required: true
    },
    quote:{
        type: String,
    },
    images: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Image'
        }
    ],
    folders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder'
        }
    ],
},{collection:'userData'}
);

const User = mongoose.model('UserData', UserSchema);

module.exports = { User, Image, Folder };
