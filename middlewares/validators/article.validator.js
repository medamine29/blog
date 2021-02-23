const { Validator } = require('node-input-validator');


const articleValidator = (req, res, next)=>{
   
    if(req.file){
        req.body.image = req.file.filename;
    }
    const v = new Validator(req.body, {
        title: 'required',
        category: 'required',
        content: 'required',
        image: 'required'
    });

    v.check().then((matched) => {
        if (!matched) {
          // errors
          req.flash('errorFormArticle', v.errors);
          return res.redirect('/add-article');
        }
        next();
    });

}


module.exports = articleValidator;