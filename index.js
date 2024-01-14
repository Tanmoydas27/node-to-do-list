const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { name } = require('ejs');
const _ = require('lodash');

mongoose.connect("mongodb+srv://admin-tanmoy:tanmoy1@example-cluster.w18peps.mongodb.net/todolistDB");
const database = mongoose.connection;
database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

// const date = require(__dirname+"/date.js");
const app = express();

app.set('view engine', "ejs");

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));


const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
  name:"Tanmoy"
});

const item2 = new Item ({
  name:"Arijit"
});
 
const item3 = new Item ({
  name:"Akash"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/",async function(req, res){
    
    const foundtems = await Item.find({});

    if(foundtems === 0)
    {
      Item.insertMany(defaultItems);
      res.redirect('/');
    }
    else
    {
      res.render("list", {ListTitle:"Today", newListItems:foundtems});
    }
  
});

app.get("/:customListName",async function(req, res){
  const customListName = _.capitalize(req.params.customListName);


  const foundLists =await List.findOne({name: customListName}).exec();

  if(foundLists)
  {
    res.render("list", {ListTitle:foundLists.name, newListItems:foundLists.items}); 
  }
  else{
    console.log("User does not existe");
    const list = new List ({
      name : customListName,
      items : defaultItems
    });
  
    list.save();

    res.redirect("/"+customListName);

  } 
})

app.post("/",async function(req, res){

  console.log(req.body);

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today")
  {
    item.save();
    res.redirect('/');
  }
  else
  {
    const foundList = await List.findOne({name: listName}).exec();
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  }
});

app.post("/delete",async function(req, res){
  
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);

  if(listName === "Today")
  {
    const response = await Item.findByIdAndDelete(checkedItemId).exec();
      console.log("Success");
      res.redirect('/');
  }
  else{
    const foundItemFromList =await  List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}},{multi:true});
    // console.log(foundItemFromList);
      if(foundItemFromList)
      {
        res.redirect("/"+listName);
      }
  }

  
})

app.get("/work", function(req,res){
  res.render("list", {ListTitle :"Work", newListItems:workItems});
});


app.get("/about", function(req, res){
  res.render("about");
});
const port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("server is running in port 3000");
});

