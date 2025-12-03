// routes/api.js

const express = require("express");
const router = express.Router();

router.get("/books", function (req, res, next) {
    // Optional filters
    const search   = req.query.search;       // /api/books?search=world
    const minprice = req.query.minprice;     // /api/books?minprice=5
    const maxprice = req.query.max_price;    // /api/books?max_price=10
    const sort     = req.query.sort;         // /api/books?sort=name or sort=price

    let sqlquery = "SELECT * FROM books";
    let params = [];
    let conditions = [];

    // Search filter (by book name)
    if (search && search.trim() !== "") {
        conditions.push("name LIKE ?");
        params.push("%" + search + "%");
    }

    // Price range filters
    if (minprice) {
        conditions.push("price >= ?");
        params.push(parseFloat(minprice));
    }

    if (maxprice) {
        conditions.push("price <= ?");
        params.push(parseFloat(maxprice));
    }

    // WHERE clause if needed
    if (conditions.length > 0) {
        sqlquery += " WHERE " + conditions.join(" AND ");
    }

    // ✅ Sort option
    if (sort === "name") {
        sqlquery += " ORDER BY name ASC";
    } else if (sort === "price") {
        sqlquery += " ORDER BY price ASC";
    }

    db.query(sqlquery, params, (err, result) => {
        if (err) {
            res.json(err);
            return next(err);
        } else {
            res.json(result);
        }
    });
});



// Export router so index.js can use it
module.exports = router;
