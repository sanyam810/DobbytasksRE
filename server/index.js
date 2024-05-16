require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { User, Image, Folder } = require('./models/user.model');

app.use(cors());
app.use(express.json());

const connectionString = process.env.MONGODB_URI;

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.get('/', (req, res) => {
    res.json("Server is up and running")
})


app.post('/api/register',async (req,res)=>{
    console.log(req.body)
    try{
        const hashedPassword = await bcrypt.hash(req.body.password,10)
        const user = await User.create({
            name:req.body.name,
            email:req.body.email,
            password:hashedPassword
        })
        res.json({status:'ok'})
    }
    catch(err){
        res.json({status:'error',error:'Duplicate email '})
    }
})

app.post('/api/login',async (req,res)=>{
    const user = await User.findOne({
        email:req.body.email,
    })

    if(!user) return res.json({status:'error',error:'ivalid email'})

    const isPasswordValid = await bcrypt.compare(req.body.password,user.password)

    if(isPasswordValid){
        const token = jwt.sign({
            name:user.name,
            email:user.email,
        },'dobbytask')

        return res.json({status:'ok',user:token})
    }else{
        return res.json({status:'error',user:false})
    }
})


app.get('/api/folders', async (req, res) => {
    const token = req.headers['x-access-token'];
    try {
        const decoded = jwt.verify(token, 'dobbytask');
        const email = decoded.email;

        const user = await User.findOne({ email }).populate('folders');

        if (!user) {
            return res.status(404).json({ status: 'error', error: 'User not found' });
        }
        
        return res.json({ status: 'ok', folders: user.folders });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 'error', error: 'Failed to fetch folders' });
    }
});

app.get('/api/images/:folderId', async (req, res) => {
    const token = req.headers['x-access-token'];
    const { folderId } = req.params;
    
    try {
        const decoded = jwt.verify(token, 'dobbytask');
        const email = decoded.email;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ status: 'error', error: 'User not found' });
        }

        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ status: 'error', error: 'Folder not found' });
        }

        if (folder.owner.toString() !== user._id.toString()) {
            return res.status(403).json({ status: 'error', error: 'Unauthorized access to folder' });
        }

        const images = await Image.find({ folder: folder._id });
        return res.json({ status: 'ok', images });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 'error', error: 'Failed to fetch images' });
    }
});


app.post('/api/folders', async (req, res) => {
    const token = req.headers['x-access-token'];
    const { name, parentFolderId } = req.body;

    try {
        const decoded = jwt.verify(token, 'dobbytask');
        const email = decoded.email;

        const user = await User.findOne({ email });

        
        const folder = new Folder({
            name,
            owner: user._id,
            parentFolder: parentFolderId
        });

        await folder.save();

        if (parentFolderId) {
            const parentFolder = await Folder.findById(parentFolderId);
            if (parentFolder) {
                parentFolder.subfolders.push(folder._id);
                await parentFolder.save();
            }
        }

        user.folders.push(folder._id);
        await user.save();

        return res.json({ status: 'ok', folder });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 'error', error: 'Failed to create folder' });
    }
});

app.post('/api/uploadImage',async(req,res)=>{
    const {imageUrl,folderName,imageName } = req.body;

    try{
        const token = req.headers['x-access-token'];
        const decoded = jwt.verify(token,'dobbytask');
        const user = await User.findOne({email:decoded.email});

        const folder = await Folder.findOne({ name: folderName, owner: user._id });

        if (!folder) {
            return res.status(404).json({ status: 'error', error: 'Folder not found' });
        }

        console.log(folder._id)

        const image = new Image({
            name: imageName,
            url: imageUrl,
            owner: user._id,
            folder: folder._id
        });

        await image.save();

        folder.images.push(image._id);
        await folder.save();
        return res.json({ status: 'ok', message: 'Image uploaded successfully' });
    }catch (error) {
        console.error('Error uploading image:', error);
        return res.status(500).json({ status: 'error', error: 'Failed to upload image' });
    }
})

app.get('/api/imagesAll', async (req, res) => {
    const token = req.headers['x-access-token'];
    try {
        const decoded = jwt.verify(token, 'dobbytask');
        const email = decoded.email;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ status: 'error', error: 'User not found' });
        }

        const folders = await Folder.find({ owner: user._id });
        const folderIds = folders.map(folder => folder._id);
        const userImages = await Image.find({ folder: { $in: folderIds } });

        if (!userImages || userImages.length === 0) {
            return res.json({ status: 'ok', images: [] });
        }
    
        return res.json({ status: 'ok', images: userImages });
    } catch (error) {
        console.error('Error fetching user images:', error);
        return res.status(500).json({ status: 'error', error: 'Failed to fetch user images' });
    }
});




app.listen(3001, () => console.log('Server is running on port 3001'))