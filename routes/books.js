// Create a new router
const express = require("express")
const router = express.Router()
const { check, validationResult } = require('express-validator');

router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('../users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

router.get('/search-result',
    [
        check('keyword')
            .notEmpty()
            .withMessage("Please enter a a search term")
    ],
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('register.ejs', { errors: errors.array() });
        }
        else {
            let keyword = req.sanitize(req.query.keyword);
            let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
            let searchValue = '%' + keyword + '%';

            db.query(sqlquery, [searchValue], (err, result) => {
                if (err) {
                    next(err);
                } else {
                    res.render("searchresult.ejs", { searchTerm: keyword, foundBooks: result });
                }
            });
        }
});

router.get('/addbook',function(req, res, next){
    res.render("addbook.ejs")
});

router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("list.ejs", {availableBooks:result})
     });
});

router.get('/bargainbooks', function(req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("bargainbooks.ejs", {cheapBooks:result})
     });
});

// Export the router object so index.js can access it
module.exports = router
