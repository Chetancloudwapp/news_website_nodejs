const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { validationResult} = require('express-validator');
const userModel = require('../models/User');
const categoryModel = require('../models/Category');
const newsModel = require('../models/News');
const settingModel = require('../models/Setting');
const createError = require('../utils/error-message');
const fs = require('fs');

// .env ko use krne ke liye
dotenv.config();

// controller function
const loginPage = async (req, res) => { 
    res.render('admin/login', {
        layout:false, // agar layout nahi chahiye to iss tarah se likh skte hai
        errors:0 // first time jab user aayga to errors 0 set honge
    });
}

// login function
const adminLogin = async (req, res, next) => { 
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        // return res.status(400).json({ errors: errors.array()});
        return res.render('admin/login', {
            layout:false,
            errors: errors.array() // send all errors to the view page
        });
    }

    const {username, password} = req.body
    try{
        const user = await userModel.findOne({ username});
        if(!user){
            // return res.status(401).send('Invalid username or password');
            return next(createError('Invalid username or password', 401));
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            // return res.status(401).send('Invalid username or password');
            return next(createError('Invalid username or password', 401));
        }

        const jwtData = {id:user._id, fullname: user.fullname, role: user.role}
        const token = jwt.sign(jwtData, process.env.JWT_SECRET, { expiresIn: '1h'});
        res.cookie('token', token, { 
            httponly: true,
            maxAge: 60 * 60 * 1000
        });

        res.redirect('/admin/dashboard');

    }catch(error){
        // console.error(error);
        // res.status(500).send("Internal server error");
        next(error);
    }

}

// logout
const logout = async (req, res) => { 
    res.clearCookie('token')
    res.redirect('/admin/')
}

// DASHBOARD PAGE
const dashboard = async(req, res, next) => {
    try{
        let articleCount;

        if(req.role == 'author') {
            articleCount = await newsModel.countDocuments({ author: req.id});
        }else{
            articleCount = await newsModel.countDocuments(); // countDocument is a mongoose method which is used to retrieve the count of document in a collections
        }

        const categoryCount = await categoryModel.countDocuments();
        const userCount = await userModel.countDocuments();

        res.render('admin/dashboard', {
            role: req.role,
            fullname:req.fullname,
            articleCount,
            categoryCount,
            userCount
        });
    }catch(error) {
        // console.log(error);
        // res.status(500).send('Internal server error');
        next(error);
    }

}

// SETTINGS PAGE
const settings = async(req, res, next) => {
    try{
        const settings = await settingModel.findOne();
        res.render('admin/settings', {role: req.role, settings});
    }catch(error) {
        // console.log(error);
        // res.status(500).send('Internal server error');
    }
}

// STORE SETTINGS
const saveSettings = async(req, res, next) => {
    const { website_title, footer_description} = req.body;
    const website_logo = req.file ? req.file.filename : null;

    try{
        // const settings = await settingModel.findOneAndUpdate(
        //     {},
        //     {website_title, website_logo, footer_description},
        //     { new:true, upsert:true}
        // );

        // delete image before update new image
        let setting = await settingModel.findOne();
        if(!setting) {
            setting = new settingModel();
        }

        setting.website_title = website_title;
        setting.footer_description = footer_description;

        if(website_logo){
            if(setting.website_logo) {
                const logoPath = `./public/uploads/${setting.website_logo}`;
                if(fs.existsSync(logoPath)) {
                    fs.unlinkSync(logoPath);
                }
            }

            setting.website_logo = website_logo;
        }


        await setting.save();
        res.redirect('/admin/settings');

    }catch(error) {
        // console.log(error);
        // res.status(500).send('Internal server error');
        next(error);
    }
 
}

// user index
const allUser = async (req, res) => {
    const users = await userModel.find();
    res.render('admin/users', {users, role:req.role});
}

// add user page
const addUserPage = async (req, res) => {
    res.render('admin/users/create', {role: req.role, errors:0});
}

// store user
const addUser = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.render('admin/users/create', {
            role: req.role,
            errors: errors.array()
        })
    }
    await userModel.create(req.body);
    res.redirect('/admin/users');
}

// edit user page
const updateUserPage = async (req, res, next) => {
    const id = req.params.id
    try{
        const user = await userModel.findById(id);
        if(!user){
            return next(createError('User not found', 404));
        }
        res.render('admin/users/update', {user, role:req.role, errors:0});
    }catch(error){
        // console.log(error);
        // res.status(500).send('Internal server error');
        next(error);
    }
}

// update user page
const updateUser = async (req, res, next) => {
    const id = req.params.id
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.render('admin/users/update', {
            user:req.body,
            role: req.role,
            errors: errors.array()
        })
    }
    const {fullname, password, role} = req.body
    try{
        const user = await userModel.findById(id);
        if(!user){
            return next(createError('User not found', 404));
        }

        user.fullname = fullname || user.fullname
        if(password){
            user.password = password
        }

        user.role = role || user.role
        await user.save()

        res.redirect('/admin/users')
    }catch(error){
        // console.log(error);
        // res.status(500).send('Internal server error!');
        next(error);
    }
 }

// delete user
const deleteUser = async (req, res, next) => {
    const id = req.params.id
    try{
        // const user = await userModel.findByIdAndDelete(id) // with the help of mongoose command
        const user = await userModel.findById(id)
        if(!user){
            return next(createError('User not found', 404));
        }

        const article = await newsModel.findOne({ author: id});
        if(article) {
            return res.status(400).json({success:false, message:'User is associated with an article you cannot delete them'});
        }

        await user.deleteOne();
        res.json({success:true});
        // await user.remove() // manually delete method 
    }catch(error){
        // console.log(error);
        // res.status(500).send("Internal server error");
        next(error);
    }
 }


module.exports = {
    loginPage,
    adminLogin,
    logout,
    dashboard,
    settings,
    allUser,
    addUserPage,
    addUser,
    updateUserPage,
    updateUser,
    deleteUser,
    saveSettings
}