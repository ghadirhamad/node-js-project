// Load environment variables from .env file in non-production environments
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const methodOverride = require("method-override");
const Article = require("./models/Article");

const app = express();

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.mongo_uri);
    console.log("✅ MongoDB connected!");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Connection error:", err);
  }
};

startServer();

// Set EJS as the view engine
app.set("view engine", "ejs");

// Middleware for parsing request bodies and overriding HTTP methods
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Configure session middleware
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport and session support
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth 2.0 strategy for Passport
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://node-js-project-gael.onrender.com/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  // Pass the Google profile to the next middleware
  done(null, profile);
}));

// Serialize and deserialize user for session support
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Make the authenticated user available in all views
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Home route: show visitors page if authenticated, otherwise show login page
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("visitors");
  } else {
    res.render("login");
  }
});

// Render form to create a new article (authenticated users only)
app.get("/article/new", ensureAuthenticated, (req, res) => {
  res.render("new-article");
});

// Handle article creation (authenticated users only)
app.post("/article", ensureAuthenticated, async (req, res) => {
  const { articleTitle, articleBody } = req.body;
  const newArticle = new Article({
    title: articleTitle,
    body: articleBody,
    author: req.user.emails[0].value
  });
  await newArticle.save();
  res.redirect("/show");
});

// Show all articles
app.get("/show", async (req, res) => {
  const articles = await Article.find();
  res.render("articles", { allArticles: articles });
});

// Show details for a specific article by ID
app.get("/article/:id", async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).send("المقالة غير موجودة");
  res.render("article-details", { article });
});

// Delete an article (only by its author)
app.delete("/article/:id", ensureAuthenticated, async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).send("غير موجود");
  if (article.author !== req.user.emails[0].value) {
    return res.status(403).send("ما تقدر تحذف مقال مو لك");
  }
  await Article.findByIdAndDelete(article._id);
  res.send("تم الحذف");
});

// Start Google OAuth authentication
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Handle Google OAuth callback
app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => res.redirect("/")
);

// Logout route
app.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}