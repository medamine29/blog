const nodemailer = require('nodemailer');


const sendRestMail = (req, res, next)=>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user: "aliexprasshop@gmail.com",
            pass: process.env.PASSWORD
        }
    });
    
    var message = "<br>Message: "+req.body.message;

    var mailOptions ={
        form: "aliexprasshop@gmail.com",
        to: req.body.email,
        subject: "Reset your password",
        html: message
    };

    transporter.sendMail(mailOptions, (err,infos)=>{
        if(err){
            console.log(err);
            req.flash('err',err.message);
            return res.redirect('/users/forgot-password');
        }else{
            console.log(infos);
            req.flash('success','Great, a reset email has been sent to the address :'+req.body.email
            +'. Please check your mailbox and click on the reset link');
            return res.redirect('/users/forgot-password');
        }
    })
}

module.exports = sendRestMail;