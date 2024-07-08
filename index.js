import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3003;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Permalist",
  password: "Shadows.24",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

async function getItems() {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    return result.rows;
  } catch (err) {
    console.log(err);
  }

}

app.get("/", async (req, res) => {
  try {
    items = await getItems();
  } catch (err) {
    console.log(err);
  }
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  console.log(item);
  if (item.length > 0) {
    try {
      await db.query("INSERT INTO items (title) VALUES($1)", [item]);
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log("Item value must be longer than 0");
  }
  console.log(req.body.newItem);
});

app.post("/edit", async (req, res) => {
  const itemID = req.body.updatedItemId;
  const itemTitle = req.body.updatedItemTitle;
  if (itemTitle.length > 0) {
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [itemTitle, itemID]);
    res.redirect("/");
  } else {
    console.log("Item value must be longer than 0");
    res.redirect("/");
  }
});

app.post("/delete", async (req, res) => {
  console.log(req.body.deleteItemId);
  try {
    await db.query("DELETE FROM items WHERE id = $1", [req.body.deleteItemId]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
