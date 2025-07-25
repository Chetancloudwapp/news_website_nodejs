const express = require('express');
const router = express.Router();

const articleController = require('../controllers/articleController');
const categoryController = require('../controllers/categoryController');
const commentController = require('../controllers/commentController');
const userController = require('../controllers/userController');
const isLoggedIn = require('../middleware/isLoggedIn');
const isAdmin = require('../middleware/isAdmin');
const upload = require('../middleware/multer');
const inValid = require('../middleware/validation');

// Login routes
router.get('/', userController.loginPage);
router.post('/index', inValid.loginValidation, userController.adminLogin);
router.get('/logout', userController.logout);
router.get('/dashboard', isLoggedIn, userController.dashboard);
router.get('/settings', isLoggedIn, isAdmin, userController.settings);
router.post('/save-settings', isLoggedIn, isAdmin,upload.single('website_logo'), userController.saveSettings);

// User Crud routes
router.get('/users', isLoggedIn, isAdmin, userController.allUser);
router.get('/add-user',  isLoggedIn, isAdmin, userController.addUserPage);
router.post('/add-user', isLoggedIn, isAdmin, inValid.UserValidation,  userController.addUser);
router.get('/update-user/:id', isLoggedIn, isAdmin,  userController.updateUserPage);
router.post('/update-user/:id',  isLoggedIn, isAdmin, inValid.UserUpdateValidation, userController.updateUser);
router.delete('/delete-user/:id', isLoggedIn, isAdmin,  userController.deleteUser);

// Category Crud routes
router.get('/category', isLoggedIn, isAdmin, categoryController.allCategory);
router.get('/add-category', isLoggedIn, isAdmin, categoryController.addCategoryPage);
router.post('/add-category', isLoggedIn, isAdmin, inValid.categoryValidation, categoryController.addCategory);
router.get('/update-category/:id', isLoggedIn, isAdmin, categoryController.updateCategoryPage);
router.post('/update-category/:id', isLoggedIn, isAdmin, inValid.categoryValidation, categoryController.updateCategory);
router.delete('/delete-category/:id', isLoggedIn,isAdmin,  categoryController.deleteCategory);

// Article Crud routes
router.get('/article', isLoggedIn, articleController.allArticle);
router.get('/add-article', isLoggedIn, articleController.addArticlePage);
router.post('/add-article', isLoggedIn, upload.single('image'), inValid.articleValidation, articleController.addArticle);
router.get('/update-article/:id', isLoggedIn, articleController.updateArticlePage);
router.post('/update-article/:id', isLoggedIn, upload.single('image'), inValid.articleValidation, articleController.updateArticle);
router.delete('/delete-article/:id', isLoggedIn, articleController.deleteArticle);

// Comment routes
router.get('/comments', isLoggedIn, commentController.allComments);

// Error Handling Middleware (404 Middleware)
// Yhh middleware tab kaam karega jab koi route humare server pr nahi hai
router.use(isLoggedIn, (req, res, next) => {
    res.status(404).render('admin/404', {
        message:'Page not found!',
        role: req.role
    });
});

// 500 internal server error handling
// yhh 404 tab kaam karega jab humara page not found hota hai
router.use(isLoggedIn, (err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    let view;
    switch(status) {
        case 401:
            view = 'admin/401';
            break;
        case 404:
            view = 'admin/404';
            break;
        case 500:
            view = 'admin/500';
            break;
        default:
            view = 'admin/500'
    }
    // const view = status === 404 ? 'admin/404' : 'admin/500';
    res.status(status).render(view, {
        message:err.message || 'Internal Server Error', // here err.message is a sub-method
        role: req.role
    });
});

module.exports = router;