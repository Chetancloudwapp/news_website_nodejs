const mongoose = require('mongoose');

const categoryModel = require('../models/Category');
const newsModel = require('../models/News');
const userModel = require('../models/User');
const commentModel = require('../models/Comment');
const settingModel = require('../models/Setting');
const createError = require('../utils/error-message');
const { validationResult} = require('express-validator');
const striptags = require('striptags');
const moment = require('moment');
const paginate = require('../utils/paginate');

// index function
const index = async(req, res) => {
    // const news = await newsModel.find()
    //                             .populate('category', {'name':1, 'slug':1})
    //                             .populate('author', 'fullname')
    //                             .sort({ createdAt:-1}); // show latest news at the top

    // NOW WE CAN USE THE SAME QUERY WITH THE HELP OF PAGINATION
    const paginatedNews = await paginate(newsModel, {}, req.query, {
                            populate:[
                                { path: 'category', select: 'name slug'}, // jo bhi field hume chahiye use hum comma deke pass krskte hai
                                { path: 'author', select: 'fullname'},
                            ],
                            sort:'-createdAt'
                        });

    // Info :- In parameter-1 here newsModel is our model name
    // parameter-2 find method mai humne koi bhi query pass nahi ki hai isly blank
    // In options we can pass this populate query and sorting order

    // Add clean content to each item
    const newsData = paginatedNews.data.map(item => {
        const obj = item.toObject(); // 👈 convert Mongoose doc to plain JS object because mongoose cannot reflect changes
        obj.contentPlain = striptags(obj.content).substring(0, 200) + '...';
        obj.createdAtFormatted = moment(obj.createdAt).format('D MMMM YYYY');
        return obj;
    });


    const news = {
        ...paginatedNews,
        data: newsData
    };

    // return res.json(news);
    res.render('index', {news, query:req.query});
}

// category-wise show article
const articleByCategories = async(req, res) => {
    const category = await categoryModel.findOne({ slug: req.params.name });

    if(!category){
        return res.status(404).send('Category not found');
    }
    
    // const news = await newsModel.find({ category: category._id})
    //                 .populate('category', {'name':1, 'slug':1})
    //                 .populate('author', 'fullname')
    //                 .sort({ createdAt:-1}); // show latest news at the top
   
    // // Add clean content to each item
    // const newsData = news.map(item => {
    //     const obj = item.toObject(); // 👈 convert Mongoose doc to plain JS object because mongoose cannot reflect changes
    //     obj.contentPlain = striptags(obj.content).substring(0, 200) + '...';
    //     obj.createdAtFormatted = moment(obj.createdAt).format('D MMMM YYYY');
    //     return obj;
    // });

    const paginatedNews = await paginate(newsModel, {category: category._id}, req.query, {
                            populate:[
                                { path: 'category', select: 'name slug'}, // jo bhi field hume chahiye use hum comma deke pass krskte hai
                                { path: 'author', select: 'fullname'},
                            ],
                            sort:'-createdAt'
                        });

    // Add clean content to each item
    const newsData = paginatedNews.data.map(item => {
        const obj = item.toObject(); // 👈 convert Mongoose doc to plain JS object because mongoose cannot reflect changes
        obj.contentPlain = striptags(obj.content).substring(0, 200) + '...';
        obj.createdAtFormatted = moment(obj.createdAt).format('D MMMM YYYY');
        return obj;
    });


    const news = {
        ...paginatedNews,
        data: newsData
    };

    res.render('category', {news, category, query:req.query});
}

// show articles
const singleArticle = async(req, res) => {
    const news = await newsModel.findById(req.params.id)
                                .populate('category', {'name':1, 'slug':1})
                                .populate('author', 'fullname')
                                .sort({ createdAt:-1}); // show latest news at the top
   
    const newsData = news.toObject(); // 👈 convert Mongoose doc to plain JS object because mongoose cannot reflect changes
    newsData.contentPlain = striptags(newsData.content).substring(0, 200) + '...';
    newsData.createdAtFormatted = moment(newsData.createdAt).format('D MMMM YYYY');

    // GET ALL COMMENTS DATA FOR THIS ARTICLE
    const comments = await commentModel.find({ article: req.params.id, status:'approved'})
                                       .sort('-createdAt');

    res.render('single', {newsData, comments});
}

// search article
const search = async(req, res) => {
    const searchQuery = req.query.search;

    // const news = await newsModel.find({
    //                                 $or :[
    //                                     { title: { $regex: searchQuery, $options:"i"}}, // where i is case-sensitive 'or' operator isly lagaya hai bcz hume title or content dono mai search krna hai
    //                                     { content: { $regex: searchQuery, $options:"i"}},
    //                                 ]
    //                             })
    //                             .populate('category', {'name':1, 'slug':1})
    //                             .populate('author', 'fullname')
    //                             .sort({ createdAt:-1}); // show latest news at the top

    const paginatedNews = await paginate(newsModel, { $or :[
                                        { title   : { $regex: searchQuery, $options:"i"}}, // where i is case-sensitive 'or' operator isly lagaya hai bcz hume title or content dono mai search krna hai
                                        { content : { $regex: searchQuery, $options:"i"}},
                                    ]}, req.query, {
                            populate:[
                                { path: 'category', select: 'name slug'}, // jo bhi field hume chahiye use hum comma deke pass krskte hai
                                { path: 'author', select: 'fullname'},
                            ],
                            sort:'-createdAt'
                        });
   
    // Add clean content to each item
    const newsData = paginatedNews.data.map(item => {
        const obj = item.toObject(); // convert Mongoose doc to plain JS object because mongoose cannot reflect changes
        obj.contentPlain = striptags(obj.content).substring(0, 200) + '...';
        obj.createdAtFormatted = moment(obj.createdAt).format('D MMMM YYYY');
        return obj;
    });

    const news = {
        ...paginatedNews,
        data: newsData
    };

    res.render('search', {news, searchQuery, query:req.query});
}

// Author list
const author = async(req, res) => {

    // retrieve author name
    const author = await userModel.findOne({ _id:req.params.id});
    if(!author) {
        return res.status(404).send('Author not found!');
    }

    const paginatedNews = await paginate(newsModel, {author: req.params.id}, req.query, {
                            populate:[
                                { path: 'category', select: 'name slug'}, // jo bhi field hume chahiye use hum comma deke pass krskte hai
                                { path: 'author', select: 'fullname'},
                            ],
                            sort:'-createdAt'
                        });

    // Add clean content to each item
    const newsData = paginatedNews.data.map(item => {
        const obj = item.toObject(); // 👈 convert Mongoose doc to plain JS object because mongoose cannot reflect changes
        obj.contentPlain = striptags(obj.content).substring(0, 200) + '...';
        obj.createdAtFormatted = moment(obj.createdAt).format('D MMMM YYYY');
        return obj;
    });


    const news = {
        ...paginatedNews,
        data: newsData
    };


    res.render('author', {news, author, query:req.query});
}

// add comment
const addComment = async(req, res) => {
    try{
        // return res.json("Hello from comment");
        const { name, email, content } = req.body;
        const comment = new commentModel({ name, email, content, article: req.params.id});
        await comment.save();
    
        res.redirect(`/single/${req.params.id}`);
    }catch(error) {
        res.status(500).send('Error adding comment');
    }
}

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