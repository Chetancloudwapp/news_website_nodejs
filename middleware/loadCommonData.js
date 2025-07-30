const categoryModel = require('../models/Category');
const newsModel = require('../models/News');
const settingModel = require('../models/Setting');
const userModel = require('../models/User');
const commentModel = require('../models/Comment');

// LOAD COMMON DATA
const loadCommonData = async(req,res,next) => {
    try{
        // retrieve setting data for showing image and footer dynamically
        const settings = await settingModel.findOne();
    
        // retrieve top 5 latest news                                 
        const latestNews = await newsModel.find()
                                    .populate('category', {'name':1, 'slug':1})
                                    .populate('author', 'fullname')
                                    .sort({createdAt:-1})
                                    .limit(5);
    
        // retrieve those categories which have news                                
        const categoriesInUse = await newsModel.distinct('category');
        const categories = await categoryModel.find({'_id':{$in:categoriesInUse}});

        // hum sabhi data ko humare local variables mai save krskte hai jisse hume model ko baar baar call na karna pade and jaha bhi iska krna hoto iska call krke use krskte hai. 
        // agar same value ko hum baar baar call krte hai to vaha iska use krna chahiye qk iske help se hume controller mai baar baar varialbe pass krne ki need nahi hoti hai hume ise globally call krskte hai
        res.locals.settings   = settings
        res.locals.latestNews = latestNews
        res.locals.categories = categories

        next()
    }catch(error){
        next(error);
    }
}

module.exports = loadCommonData