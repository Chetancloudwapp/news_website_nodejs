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
const loadCommonData = require('../middleware/loadCommonData');

router.use(loadCommonData); // iske help se hume har route mai manually middleware ko add nahi krna pdega iske below sabhi route pr middleware automatically implement hoga

// routes
router.get('/', siteController.index);
router.get('/category/:name', siteController.articleByCategories);
router.get('/single/:id', siteController.singleArticle);
router.get('/search', siteController.search);
router.get('/author/:id', siteController.author);
router.post('/single/:id', siteController.addComment);

module.exports = router;