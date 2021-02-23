var express = require('express');
const articleController = require('../controllers/article.controller');
const multerConfig = require('../middlewares/multer.config');
const articleValidator = require('../middlewares/validators/article.validator');
const { guard } = require('../middlewares/guard');
var router = express.Router();

/* GET home page. */
router.get('/', articleController.listArticle);

router.get('/article/:id',articleController.showArticle );

router.get('/add-article', guard, articleController.addArticle);

router.post('/add-article', multerConfig, guard, articleValidator,  articleController.addOneArticle);

router.get('/edit-article/:id',  guard, articleController.editArticle);

router.post('/edit-article/:id', multerConfig,  guard, articleController.editOneArticle);

router.get('/delete-article/:id', guard, articleController.deleteArticle);

module.exports = router;
