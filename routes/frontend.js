const express = require('express');
const router = express.Router();

// const {
//     index,
//     articleByCategories,
//     singleArticle,
//     search,
//     author,
//     addComment
// } = require('../controllers/siteController');

/* ----------- OR WE CAN ALSO WRITE THAT IN SHORT WAY ---------- */
const siteController = require('../controllers/siteController');

// routes
router.get('/', siteController.index);
router.get('/category/:name', siteController.articleByCategories);
router.get('/single/:id', siteController.singleArticle);
router.get('/search', siteController.search);
router.get('/author/:id', siteController.author);
router.post('/single/:id', siteController.addComment);

module.exports = router;