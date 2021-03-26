const { MongoClient } = require("mongodb");
 
// Replace the following with your Atlas connection string   
                                                                                                                                     
const url = "mongodb+srv://Andrew:Andrew@cluster0.yxjbg.mongodb.net/uninutbotdb?retryWrites=true&w=majority";
const client = new MongoClient(url);

async function run() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db("uninutbotdb");
        const collection = db.collection("users");
        collection.find().toArray(function(err, results){
            console.log(results);
        });

    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await client.close();
    }
}

run().catch(console.dir);