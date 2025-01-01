const { text } = require("express");

// Switch to your quotesDB
use('quotesDB');

//example of inserting a document into the quotes collection
/*db.getCollection('quotes').insertOne({
    {
  "text": "The only way to do great work is to love what you do.",
  "author": "Steve Jobs",
  "type": 2
},

});*/

db.getCollection('quotes').insertOne([
    {
      "text": "Courage is like love, it must have hope for nourishment",
      "author": "Napoleon Bonaparte",
      "type": 2
    }
    
    ]);

// Update the document with the given _id
/*db.getCollection('quotes').updateOne(
    { "_id": ObjectId('677565e7d3febd37df9dc431') }, 
    { 
        $set: { 
            "text": "Wherever you go, go with all your heart",
            "author": "Confucius",
            "type": 3
        } 
    }
);*/

// Fetch all quotes
const allQuotes = db.getCollection('quotes').find().toArray();
console.log(allQuotes);

// Fetch a random quote
const randomQuote = db.getCollection('quotes').aggregate([{ $sample: { size: 1 } }]).toArray();
console.log(randomQuote);