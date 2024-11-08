import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import axios  from "axios";

const app = express();
const port = 3000;
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "book",
    password: "123juu168",
    port: 5000,
  });
db.connect();

let books = [];


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req,res)=>{
 try{
    const results = await db.query("SELECT * FROM book_info Order By bookRate DESC");
    books = results.rows;
    res.render("index.ejs",{
        books: books
    });
 } catch(err){
    console.log(err);
 }
});

app.get("/create",  (req,res)=>{
  res.render("create.ejs");
});

app.post("/submit", async (req,res)=>{
  const title = req.body.title;
  let rate = req.body.rate;
  const date = req.body.date;
  const cover = req.body.cover;
  const notes = req.body.notes;
  try{
    if(rate < 0){
        rate = 0;
    } else if(rate > 10){ // This if mean if user input below 1 or above 10 we will catch it 
        rate = 10;
    };
    const coverUrl =`https://covers.openlibrary.org/b/isbn/${cover}-M.jpg`;
    await db.query("INSERT INTO book_info(bookTitle,bookNote,bookRate,readDate,bookCover) VALUES($1,$2,$3,$4,$5);",
        [title,notes,rate,date,coverUrl]
    );
    res.redirect("/");
  } catch(err){
    console.log(err);
  }
});

app.post("/delete", async (req,res)=>{
    const id = req.body.bookId;
    try{
        await db.query("DELETE FROM book_info WHERE id = $1",[id]);
        res.redirect("/");
    }catch(err){
        console.log(err);
    }
});

app.post("/update", async (req,res)=>{
    const id = req.body.updatedBookId;
    const newNote = req.body.newNote;
    try{
        await db.query("UPDATE book_info SET bookNote = ($1) WHERE id = $2",[newNote,id]);
        res.redirect("/");
    } catch(err){
        console.log(err);
    }
});

app.listen(port,() =>{
    console.log(`Server is running on port ${port}`);
});