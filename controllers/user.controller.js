const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const passport = require('passport');
const randomToken = require('random-token');
const Reset = require('../models/reset.model');

module.exports = {
    login: (req, res, next)=>{
        
        const user = new User({
            username : req.body.username,
            password : req.body.password
        })

        req.login(user, (err)=>{
            if(err){
                req.flash('error', err.message);
                return res.redirect('/users/login');
            }

            passport.authenticate("local", 
            {failureRedirect: '/users/login', 
            failureFlash: 'Invalid username or password.'
            })(req, res, (err, user)=>{
                if(err ){
                    req.flash('error', err.message);
                    return res.redirect('/users/login');
                }
                req.flash('success', 'Cool, your are now connected !');
                return res.redirect('/users/dashboard');
            })
        })
    },
    signup: (req, res, next)=>{
        const newUser = User({
            username : req.body.username,
            firstname : req.body.firstname,
            lastname : req.body.lastname,
            email : req.body.email
        })

        User.register(newUser, req.body.password, (err, user)=>{
            if(err){
                req.flash('error', err.message);
                return res.redirect('/users/signup');
            }
            // Authentication
            passport.authenticate("local")(req, res, (err, newUser)=>{
                if(err){
                    req.flash('error', err.message);
                    return res.redirect('/users/signup');
                }
                req.flash('success', 'Cool, your are now connected !');
                return res.redirect('/users/dashboard');
            })
            
        })

    },
    resetPassword: (req, res, next)=>{
        User.findOne({username : req.body.username}, (err, user)=>{
            if(err){
                req.flash('error', err.message);
                return res.redirect('/users/forgot-password');
            }
            if(!user){
                req.flash('error', 'Username not found !');
                return res.redirect('/users/forgot-password');
            }
            // création de token
            const token = randomToken(32);
            const reset = new Reset({
                username: req.body.username,
                resetPasswordToken: token,
                resetExpires: Date.now() + 3600000
            })
            reset.save((err, reset)=>{
                if(err){
                    req.flash('error', err.message);
                    return res.redirect('/users/forgot-password');
                }
                // email de réinitialisation

                req.body.email = user.email;
                const link = req.protocol+"://"+req.get('host')+"/users/reset-password/"+token;
                req.body.message = `<h3>Hello ${user.username}</h3> Click this <a href="${link}">link to reset your password</a>.`
                next();
            })
        })
    },
    resetPasswordForm: (req, res, next)=>{
        const token = req.params.token;
        Reset.findOne({resetPasswordToken: token, resetExpires: {$gt: Date.now()}}, (err, reset)=>{
            if(err){
                req.flash('error', err.message);
                return res.redirect('/users/forgot-password');
            }
            if(!reset){
                req.flash('error', 'Your token is invalid. Please enter your email and ask again !');
                return res.redirect('/users/forgot-password');
            }
            req.flash('success', 'Please reset your password !');
            return res.render('reset-password');
        })
    },
    postResetPassword: (req, res, next)=>{
        const token = req.params.token;
        const password = req.body.password;
        Reset.findOne({resetPasswordToken: token, resetExpires: {$gt: Date.now()}}, (err, reset)=>{
            if(err){
                req.flash('error', err.message);
                return res.redirect('/users/forgot-password');
            }
            if(!reset){
                req.flash('error', 'Your token is invalid. Please enter your email and ask again !');
                return res.redirect('/users/forgot-password');
            }
            User.findOne({username: reset.username}, (err, user)=>{
                if(err){
                    req.flash('error', err.message);
                    return res.redirect('/users/forgot-password');
                }
                if(!user){
                    req.flash('error', 'User not found. Please enter your email and ask again !');
                    return res.redirect('/users/forgot-password');
                }
                user.setPassword(password, (err)=>{
                    if(err){
                        req.flash('error', 'You can\'t change password. Please enter your email and ask again !');
                        return res.redirect('/users/forgot-password');
                    }

                    user.save();

                    Reset.deleteMany({username: user.username}, (err, message)=>{
                        if(err){
                            console.log(err);
                        }
                        console.log(message);
                    })
                })
            })
            req.flash('success', 'Your password has been updated. You can now login !');
            return res.redirect('/users/login');
        })
    },
    saveProfile: (req, res, next)=>{
        if(!req.user ){
            req.flash('warning', 'Please login to modify your profile !');
            return res.redirect('/users/login');
        }
        if(req.user._id != req.body.userId){
            req.flash('error', 'You do not have the right to modify this profile !');
            return res.redirect('/users/dashboard');
        }

        User.findOne({_id: req.body.userId}, (err, user)=>{
            if(err){
                console.log(err);
            }
            const oldUsername = user.username;

            user.firstname = req.body.firstname ? req.body.firstname : user.firstname;
            user.lastname = req.body.lastname ? req.body.lastname : user.lastname;
            user.username = req.body.username ? req.body.username : user.username;
            user.email = req.body.email ? req.body.email : user.email;

            user.save((err, user)=>{
                if(err){
                    req.flash('error', 'An error has occurred. Please try again !');
                    return res.redirect('/users/dashboard');
                }
                if(oldUsername != user.username){
                    req.flash('success', 'Your unername has been changed successfully and you have been logged out. Please reconnect using your new username : '+req.body.username);
                    return res.redirect('/users/login');
                }
                req.flash('success', 'your profile has been updated !');
                return res.redirect('/users/dashboard');
            })
        })
    }
}