const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
    },
    slug:{
        type:String,
        required:true,
        unique:true
    },
    timestamps:{
        type:Date,
        default:Date.now
    }
});

// create code for slug
categorySchema.pre('validate', function(next) { // save krne se phle slugify perform hoga
    // here pre is a mongoose middleware which runs before the data is save
    this.slug = slugify(this.name, { lower:true });
    next();
});

module.exports = mongoose.model('Category', categorySchema);