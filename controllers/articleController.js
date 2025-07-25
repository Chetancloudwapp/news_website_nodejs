const categoryModel = require('../models/Category');
const newsModel = require('../models/News');
const userModel = require('../models/User');
const fs = require('fs');
const path = require('path');
const createError = require('../utils/error-message');
const { validationResult} = require('express-validator');

// controller functions
const allArticle = async (req, res, next) => {
    try{
        let articles;
        if(req.role === 'admin') {
            articles = await newsModel.find().populate('category', 'name').populate('author', 'fullname'); // here populate is used like as relation in this case category name is shown with the help of populate instead of id
        }else{
            articles = await newsModel.find({ author: req.id})
                                            .populate('category','name')
                                            .populate('author', 'fullname');
        }
        res.render('admin/articles', {role: req.role, articles});
    }catch(error) {
        // console.log(error);
        // res.status(500).send('Server Error');
        next(error);
    }
}

// add article page
const addArticlePage = async (req, res) => {
    const categories = await categoryModel.find();
    res.render('admin/articles/create', {categories, role: req.role, errors:0});
}

// store article
const addArticle = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const categories = await categoryModel.find();
        return res.render('admin/articles/create', {
            categories,
            role: req.role,
            errors:errors.array()
        })
    }
    try{
        const {title, content, category} = req.body;
        const article = new newsModel({
            title,
            content,
            category,
            author: req.id,
            image: req.file.filename
        });
    
        await article.save();
        res.redirect('/admin/article');
    }catch(error) {
        // console.log(error);
        // res.status(500).send('Article not found');
        next(error);
    }
}

const updateArticlePage = async (req, res, next) => {
    const id = req.params.id;
    try{
        const article = await newsModel.findById(id).populate('category','name').populate('author','fullname');

        if(!article){
            // return res.status(404).send('Article not found!');

            // Now we want to show our error message in template
            // const error = new Error('Article not found!');
            // error.status = 404;
            // return next(error);

            // By function call
            return next(createError('Article not found', 404));
        }

        if(req.role == 'author'){
            if(req.id != article.author._id) {
                // return res.status(401).send('Unauthorized!');
                return next(createError('Unauthorized', 401));
            }
        }
        const categories = await categoryModel.find();
        res.render('admin/articles/update', {role: req.role, article, categories, errors:0});
    }catch(error) {
        // console.log(error);
        // res.status(500).send('Article not found');
        next(error);

    }
}

// update article
const updateArticle = async (req, res, next) => {
    const id = req.params.id;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const categories = await categoryModel.find();
        return res.render('admin/articles/update', {
            article:req.body,
            categories,
            role: req.role,
            errors:errors.array()
        })
    }
    try{
        const { title, content, category} = req.body;
        const article = await newsModel.findById(id);
        if(!article){
            return next(createError('Article not found', 404));
        }

        if(req.role =='author') {
            if(req.id != article.author._id) {
                // return res.status(401).send('Unauthorized!');
                return next(createError('Unauthorized', 401));
            }
        }

        article.title = title;
        article.content = content;
        article.category = category;

        if(req.file){
            const imagePath = path.join(__dirname, '../public/uploads', article.image); // retrieve path where image is stored
            fs.unlinkSync(imagePath); // unlink the image
            article.image = req.file.filename;
        }

        await article.save();
        res.redirect('/admin/article');
    }catch(error){
        // console.log(error);
        // res.status(500).send('Internal server error');
        next(error);
    }
}

// delete category
const deleteArticle = async (req, res, next) => {
    const id = req.params.id;
    try{
        const article = await newsModel.findById(id);
        if(!article){
            return next(createError('Article not found', 404));
        }

        // admin can delete any article but the author delete only his own article
        if(req.role =='author') {
            if(req.id != article.author._id) {
                // return res.status(401).send('Unauthorized!');
                return next(createError('Unauthorized', 401));
            }
        }

        // DELETE AUTHOR IMAGE
        const imagePath = path.join(__dirname, '../public/uploads', article.image); // retrieve path where image is stored
        fs.unlinkSync(imagePath); // unlink the image

        await article.deleteOne();
        res.json({success:true});
    }catch(error){
        next(error);
    }
}


module.exports = {
    allArticle,
    addArticlePage,
    addArticle,
    updateArticlePage,
    updateArticle,
    deleteArticle
}