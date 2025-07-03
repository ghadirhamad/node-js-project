const express = require("express");

require('dotenv').config();
const mongoose =require("mongoose");

const app = express();

app.use(express.json());

const Article =require("./models/Article");

//يعني أن كلمة المرور التي وضعتها في URI الخاص بـ MongoDB تحتوي على رموز خاصة (مثل: @, :, /, ?, #, &...) ولم يتم "تهريبها" (escape) بشكل صحيح.
//how to escape
console.log(encodeURIComponent('#Misslalymark90'));

const startServer = async () => {
  try {
    await mongoose.connect(process.env.mongo_uri);
    console.log('MongoDB connected!');
    
    app.listen(3000, () => {
      console.log("I am listening on port 3000");
    });
  } catch (err) {
    console.error('Connection error:', err);
  }
};

startServer();


app.get("/hello", (req, res) => {
    res.send("hello")
});

app.get("/numbers", (req,res)=>{
    let numbers="";
    for(let i=0; i<=100; i++){
        numbers+=i + "-";
    }
    //res.sendFile(__dirname + "/views/numbers.ejs")
    res.render("numbers.ejs", {
        name : "Ghadeer",
        numbers : numbers
    })
});

//path parameter
app.get("/findSum/:number1/:number2", (req, res)=>{
    const num1 = req.params.number1
    const num2 = req.params.number2

    const total =  Number(num1) + Number(num2)
    let result =  `the sum is ${total}`;

    res.sendFile(__dirname + "/views/numbers.html");
});

//body & query parameter
app.get("/sayHello", (req,res)=>{
    console.log(req.body);
    res.json({
        name : req.body.name,
        age : req.query.age,
        language : "Arabic"
    });
    res.send(`hello ${req.body.name}, your age is: ${req.query.age}`)
    
})

//json response 
app.get("/sayhi", (req, res)=>{
    res.json({
        name : req.body.name,
        age : req.query.age,
        language : "Arabic"
    });
});

app.get("/hi", (req, res) => {
    res.send("you visited hi")
});

app.get("/test", (req, res) => {
    res.send("hyou visited test")
});

app.post("/sendComment", (req, res)=> {
    res.send("I am here in the post")
});
  
//======ARTICLE ENDPOINT========
app.post("/article",async (req,res)=>{
    const newArticle = new Article();

    const artTitle = req.body.articleTitle;
    const artBody = req.body.articleBody;
    newArticle.title = artTitle;
    newArticle.body = artBody;
    newArticle.numberOfLikes = 0;
    await newArticle.save(); //it take time because it is a async need to be await before send res
    
    res.json(newArticle);
});

app.get("/articles", async(req, res )=>{
    const articles = await Article.find();
    console.log("the article are ", articles);
    res.json(articles);
});

app.get("/article/:id", async(req, res)=>{
    try {
        const articleId = req.params.id;
        const article = await Article.findById(articleId);   
        res.json(article);     
    } catch (error) {
        res.send("Error ID not Found", error)
    }
});

app.delete("/article/:id", async(req, res)=>{
    try {
        const articleId = req.params.id;
        const article = await Article.findByIdAndDelete(articleId);   
        res.json(article);     
    } catch (error) {
        res.send("Error ID not Found", error)
    }
});

app.get("/show", async(req,res)=>{
    try {
        const articles =  await Article.find();
        res.render("articles.ejs", {
        allArticles : articles
        
    });
    } catch (error) {
        res.send("error", error);
    }
});


