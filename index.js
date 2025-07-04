if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const methodOverride = require("method-override");
const Article = require("./models/article");

const app = express();

// إعداد الاتصال بقاعدة البيانات
const startServer = async () => {
  try {
    await mongoose.connect(process.env.mongo_uri);
    console.log("✅ MongoDB connected!");
    app.listen(3000, () => console.log("🚀 Server running on port 3000"));
  } catch (err) {
    console.error("❌ Connection error:", err);
  }
};
startServer();

// إعدادات EJS والمنتصف
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static("public"));

// الجلسات والمصادقة
app.use(session({
  secret: "ghadeer-super-secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// تمرير المستخدم للـ EJS
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// راوتات
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("visitors");
  } else {
    res.render("login");
  }
});

app.get("/article/new", ensureAuthenticated, (req, res) => {
  res.render("new-article");
});

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

app.get("/show", async (req, res) => {
  const articles = await Article.find();
  res.render("articles", { allArticles: articles });
});

app.get("/article/:id", async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).send("المقالة غير موجودة");
  res.render("article-details", { article });
});

app.delete("/article/:id", ensureAuthenticated, async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).send("غير موجود");
  if (article.author !== req.user.emails[0].value) {
    return res.status(403).send("ما تقدر تحذف مقال مو لك");
  }
  await Article.findByIdAndDelete(article._id);
  res.send("تم الحذف");
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => res.redirect("/")
);

app.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}