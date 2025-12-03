// Create a new router
const express = require("express")
const router = express.Router()
const { check, validationResult } = require('express-validator');
const request = require("request");



const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        // login route is under /users
        return res.redirect('/users/login');
    } else {
        next();
    }
};

// Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
});

router.get('/about',function(req, res, next){
    res.render('about.ejs')
});

// ===== Weather page =====
router.get("/weather", function (req, res, next) {
    let apiKey = "5f2edf135953a46409d8f89720fda141";

    // ✅ Task 14: get city from query, default to London
    let city = req.query.city || "London";

    let url =
        `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

        request(url, function (err, response, body) {
            if (err) {
                // network error
                return res.render("weather.ejs", {
                    weatherMessage: "",
                    weather: null,
                    city: city,
                    errorMsg: "Unable to contact weather service."
                });
            }
    
            // ✅ your Task-17 snippet, adapted to render the page
            let weather;
    
            try {
                weather = JSON.parse(body);
            } catch (e) {
                // JSON couldn’t be parsed
                return res.render("weather.ejs", {
                    weatherMessage: "",
                    weather: null,
                    city: city,
                    errorMsg: "No data found"
                });
            }
    
            if (weather !== undefined && weather.main !== undefined) {
                var wmsg = 'It is ' + weather.main.temp +
                    ' degrees in ' + weather.name +
                    '! <br> The humidity now is: ' +
                    weather.main.humidity;
    
                // instead of res.send(wmsg), show it on your EJS page
                res.render("weather.ejs", {
                    weatherMessage: wmsg,
                    weather: weather,
                    city: city,
                    errorMsg: ""
                });
            } else {
                // no usable data from API
                res.render("weather.ejs", {
                    weatherMessage: "",
                    weather: null,
                    city: city,
                    errorMsg: "No data found"
                });
            }
        });
    });


router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            // if something goes wrong, just go back to home
            return res.redirect('./')
        }
        res.send('you are now logged out. <a href="./">Home</a>')
    })
})

router.post('/bookadded',  
    [
        check('name')
            .notEmpty()
            .withMessage('Book name is required.')
            .isLength({ max: 100 })
            .withMessage('Book name must be less than 100 characters.'),
        check('price')
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number.')
  ],
  function (req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('addbook.ejs', { errors: errors.array() });
    }
    else { 

        const name = req.sanitize(req.body.name);
        const price = req.sanitize(req.body.price);

        // saving data in database
        let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
        // execute sql query
        let newrecord = [name, price]
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                next(err)
            }
            else
                res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price)
        });
    }
});

// Export the router object so index.js can access it
module.exports = router