const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://mukul018:Yulu123@cluster0.npnrfev.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Eat 🍴"
});

const item2 = new Item({
    name: "Sleep 😴"
});

const item3 = new Item({
    name: "Code 🧑‍💻"
});

const item4 = new Item({
    name: "Repeat 🔁"
});

const defaultItems = [item1, item2, item3, item4];

const listSchema = {
    name: String, 
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

    Item.find({}, function(err, foundItems){

        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Item saved");
                }
            });
            res.redirect("/");
        }else{
            res.render("list", { listTitle: "Today", newListItems : foundItems });
        }
    });
});

app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    } 
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName == "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("Successfully deleted item");
                res.redirect("/");
            } 
        });
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                //create new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });  
                list.save();
                res.redirect("/" + customListName);
            }else{
                //show existing list
                res.render("list", { listTitle: foundList.name, newListItems : foundList.items });
            }
        }
    }); 
});

app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const item = new Item({
        name: itemName
    });
});
  
app.listen(3000, function(){
    console.log("server is running");
});
