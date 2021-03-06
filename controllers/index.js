const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Note = require('../models/Note');
const cheerio = require('cheerio');
const axios = require('axios');

router.get("/", (req, res) => {
    Article.find({}).limit(20).sort({ scrapedAt : -1 } )
        // ..and populate all of the notes associated with it
        .populate("notes")
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.render("index", { Article: dbArticle });
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

router.get("/starred", (req, res) => {
    // Grab every document in the Articles collection
    Article.find({ starred: true }).sort({ scrapedAt : -1 } )
        // ..and populate all of the notes associated with it
        .populate("notes")
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.render("index", { Article: dbArticle });
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// A GET route for scraping the website
router.get("/scrape", (req, res) => {
    // First, we grab the body of the html with axios
    axios.get("https://old.reddit.com/r/worldnews/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $(".link .title").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            result.scrapedAt = Date.now();

            // Create a new Article using the `result` object built from scraping
            Article.create(result)
                .then(function (dbArticle) {
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });
        res.redirect("/");
    });
});

// Route for getting all Articles from the db
router.get("/articles", (req, res) => {
    // Grab every document in the Articles collection
    Article.find({})
        // ..and populate all of the notes associated with it
        .populate("notes")
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for getting starred Articles from the db
router.get("/articles/starred", (req, res) => {
    // Grab every document in the Articles collection
    Article.find({ starred: true })
        // ..and populate all of the notes associated with it
        .populate("notes")
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", (req, res) => {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our ..
    Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("notes")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for adding a new Article-associated Note
router.post("/articles/:id", (req, res) => {
    // Create a new note and pass the req.body to the entry
    Note.create(req.body)
        .then(function (dbNote) {
            return Article.findOneAndUpdate({ _id: req.params.id }, { $push:  {'notes': dbNote }}, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for starring an Article
router.post("/star/:id", (req, res) => {
    Article.findOneAndUpdate({ _id: req.params.id }, {'starred': req.body.starred }, { new: true })
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
});

// Route for grabbing a specific Note by id, populate it with it's note
router.get("/notes/:id", (req, res) => {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our ..
    Note.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .then(function (dbNote) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbNote);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.delete("/notes/:id", (req, res) => {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our ..
    Note.deleteOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .then(function (dbNote) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbNote);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

module.exports = router;