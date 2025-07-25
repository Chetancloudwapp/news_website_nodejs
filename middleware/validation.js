const { body } = require('express-validator');

// Login form validation
const loginValidation = [
    body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .matches(/^\S+$/)
    .withMessage('Username must not contain spaces')
    .isLength({ min:5, max:12})
    .withMessage('Username must be atleast 5 to 10 characters long'),

    body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min:5, max:12})
    .withMessage('Password must be 5 to 12 characters long')
]

// USER VALIDATION
const UserValidation = [
    body('fullname')
        .trim()
        .notEmpty()
        .withMessage('Fullname is required')
        .isLength({ min:5, max:25})
        .withMessage('Fullname must be 5 to 25 characters long'),

    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .matches(/^\S+$/)
        .withMessage('Username must not contain spaces')
        .isLength({ min:5, max:12})
        .withMessage('Username must be atleast 5 to 10 characters long'),

    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min:5, max:12})
        .withMessage('Password must be 5 to 12 characters long'),

    body('role')
        .trim()
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['author','admin'])
        .withMessage('Role must be author or admin')
]

// USER UPDATE VALIDATION
const UserUpdateValidation = [
    body('fullname')
        .trim()
        .notEmpty()
        .withMessage('Fullname is required')
        .isLength({ min:5, max:25})
        .withMessage('Fullname must be 5 to 25 characters long'),


    body('password')
        .optional({ checkFalsy: true}) // optional field
        .isLength({ min:5, max:12})
        .withMessage('Password must be 5 to 12 characters long'),

    body('role')
        .trim()
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['author','admin'])
        .withMessage('Role must be author or admin')

]

// CATEGORY VALIDATION
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min:3})
        .withMessage('Category name must be 5 to 25 characters long'),

    body('description')
        .isLength({ min:3})
        // .isLength({ min:3, max:12})
        .withMessage('Description must not be less than 3 characters'),
]

// ARTICLE VALIDATION
const articleValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min:7, max:50})
        .withMessage('Title must be 10 to 50 characters long'),

    body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min:50, max:1500})
        .withMessage('content must be 50 to 1500 characters long'),

    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required'),

    // body('image')
    //     .custom((value, {req}) => {
    //         if(!req.file) {
    //             throw new Error('Image is required');
    //         }

    //         const allowedExtentions = ['.jpg', '.jpeg', '.png'];
    //         const fileExtension = path.extname(req.file.originalname).toLowerCase();
    //         if(!allowedExtentions.includes(fileExtension)) {
    //             throw new Error('Invalid image format. Only jpg, jpeg and png are allowed');
    //         }
    //         return true;
    //     })
        
]

module.exports = {
    loginValidation,
    UserValidation,
    UserUpdateValidation,
    categoryValidation,
    articleValidation
};