const mongoose = require('mongoose');

const categoryModel = require('../models/Category');
const newsModel = require('../models/News');
const userModel = require('../models/User');
const commentModel = require('../models/Comment');
const createError = require('../utils/error-message');
const { validationResult} = require('express-validator');
const striptags = require('striptags');
const moment = require('moment');

// index function
const index = async(req, res) => {
    const news = await newsModel.find()
                                .populate('category', {'name':1, 'slug':1})
                                .populate('author', 'fullname')
                                .sort({ createdAt:-1}); // show latest news at the top

    // retrieve those categories which have news                                
    const categoriesInUse = await newsModel.distinct('category');
    const categories = await categoryModel.find({'_id':{$in:categoriesInUse}});
    // return res.json(categories);

     // Add clean content to each item
    const newsData = news.map(item => {
        const obj = item.toObject(); // 👈 convert Mongoose doc to plain JS object because mongoose cannot reflect changes
        obj.contentPlain = striptags(obj.content).substring(0, 200) + '...';
        obj.createdAtFormatted = moment(obj.createdAt).format('D MMMM YYYY');
        return obj;
    });

    // return res.json(newsData);
    res.render('index', {newsData, categories});
}

// category-wise show article
const articleByCategories = async(req, res) => {
    const category = await categoryModel.findOne({ slug: req.params.name });

    if(!category){
        return res.status(404).send('Category not found');
    }
    
    const news = await newsModel.find({ category: category._id})
                                .populate('category', {'name':1, 'slug':1})
                                .populate('author', 'fullname')
                                .sort({ createdAt:-1}); // show latest news at the top

    // retrieve those categories which contains any news                                
    const categoriesInUse = await newsModel.distinct('category');
    const categories = await categoryModel.find({'_id':{$in:categoriesInUse}});
   
    // Add clean content to each item
    const newsData = news.map(item => {
        const obj = item.toObject(); // 👈 convert Mongoose doc to plain JS object because mongoose cannot reflect changes
        obj.contentPlain = striptags(obj.content).substring(0, 200) + '...';
        obj.createdAtFormatted = moment(obj.createdAt).format('D MMMM YYYY');
        return obj;
    });

    res.render('category', {newsData, categories, category});
}

// show articles
const singleArticle = async(req, res) => {
    const news = await newsModel.findById(req.params.id)
                                .populate('category', {'name':1, 'slug':1})
                                .populate('author', 'fullname')
                                .sort({ createdAt:-1}); // show latest news at the top
            

    // retrieve those categories which contains any news                                
    const categoriesInUse = await newsModel.distinct('category');
    const categories = await categoryModel.find({'_id':{$in:categoriesInUse}});
   
    const newsData = news.toObject(); // 👈 convert Mongoose doc to plain JS object because mongoose cannot reflect changes
    newsData.contentPlain = striptags(newsData.content).substring(0, 200) + '...';
    newsData.createdAtFormatted = moment(newsData.createdAt).format('D MMMM YYYY');

    res.render('single', {newsData, categories});
}

// search article
const search = async(req, res) => {
    const searchQuery = req.query.search;

    const news = await newsModel.find({
                                    $or :[
                                        { title: { $regex: searchQuery, $options:"i"}}, // where i is case-sensitive 'or' operator isly lagaya hai bcz hume title or content dono mai search krna hai
                                        { content: { $regex: searchQuery, $options:"i"}},
                                    ]
                                })
                                .populate('category', {'name':1, 'slug':1})
                                .populate('author', 'fullname')
                                .sort({ createdAt:-1}); // show latest news at the top

    // retrieve those categories which contains any news                                
    const categoriesInUse = await newsModel.distinct('category');
    const categories = await categoryModel.find({'_id':{$in:categoriesInUse}});
   
    // Add clean content to each item
    const newsData = news.map(item => {
        const obj = item.toObject(); // convert Mongoose doc to plain JS object because mongoose cannot reflect changes
        obj.contentPlain = striptags(obj.content).substring(0, 200) + '...';
        obj.createdAtFormatted = moment(obj.createdAt).format('D MMMM YYYY');
        return obj;
    });
    res.render('search', {newsData, categories, searchQuery});
}

// Author list
const author = async(req, res) => {
    const news = await newsModel.find({ author: req.params.id})
                                .populate('category', {'name':1, 'slug':1})
                                .populate('author', 'fullname')
                                .sort({ createdAt:-1}); // show latest news at the top

    // retrieve those categories which contains any news                                
    const categoriesInUse = await newsModel.distinct('category');
    const categories = await categoryModel.find({'_id':{$in:categoriesInUse}});
   
    // Add clean content to each item
    const newsData = news.map(item => {
        const obj = item.toObject(); // 👈 convert Mongoose doc to plain JS object because mongoose cannot reflect changes
        obj.contentPlain = striptags(obj.content).substring(0, 200) + '...';
        obj.createdAtFormatted = moment(obj.createdAt).format('D MMMM YYYY');
        return obj;
    });
    res.render('author', {newsData, categories});
}

const addComment = async(req, res) => {}

module.exports = {
    index,
    articleByCategories,
    singleArticle,
    search,
    author,
    addComment
}

/*

provider offline booking

1). id
provider_id
property_id
check_in
check_out
user_name
user_email
user_mobile_number
description
property_price
property_paid
property_remaining



*/