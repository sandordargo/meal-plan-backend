const MongoClient = require("mongodb").MongoClient;

const dbConnectionUrl = process.env.MONGO_URI;

var dbObject;
var dbCollection;

function initialize(
    dbName,
    dbCollectionName,
    successCallback,
    failureCallback
) {
    MongoClient.connect(dbConnectionUrl, function(err, dbInstance) {
        if (err) {
            console.log(`[MongoDB connection] ERROR: ${err}`);
            failureCallback(err); // this should be "caught" by the calling function
        } else {
            dbObject = dbInstance.db(dbName);
            dbCollection = dbObject.collection(dbCollectionName);
            console.log("[MongoDB connection] SUCCESS");

            successCallback(dbCollection);
        }
    });
}


function myData(difficulty, categoriesQ) {


    var matchingRecipes = recipes;
    console.log("difficulty: " + difficulty);
    matchingRecipes = difficulty ? matchingRecipes.filter(recipe => recipe['difficulty'] === difficulty) : matchingRecipes;

    console.log("categories:" +  categoriesQ);
    categoriesQ.forEach(function (category) {
        console.log("category:" +  category);
        matchingRecipes = matchingRecipes.filter(recipe => recipe['categories'].includes(category));

    });

    let query = {};
    if (typeof categoriesQ !== "undefined" && categoriesQ.length) {
        console.log('categoriesQ', categoriesQ);
        query.categories={$all : categoriesQ};
    }
    if (typeof difficulty !== "undefined" && difficulty !== "") {
        console.log('diff', difficulty);
        query.difficulty=difficulty;
    }

    console.log('query', query);
    // difficulty=easy&categories=magyar
    return new Promise(function(resolve, reject) {

        dbCollection.find(query).toArray((error, result) => {
            if (error) reject(error);
            console.log(result);
            resolve(result);
        });
    });


    // return matchingRecipes;
}

async function  getLatest() {
    return new Promise(function(resolve, reject) {

        dbCollection.find().limit(-1).sort({ $natural: -1 }).limit(5).toArray((error, result) => {
            if (error) reject(error);
            console.log(result);
            resolve(result);
        });
    });
}

async function  getCategories() {
    return new Promise(function(resolve, reject) {

        dbCollection.distinct("categories", {}, (error, result) => {
            if (error) reject(error);
            console.log(result);
            resolve(result);
        });
    });
}

async function  getRandomRecipe(difficulty, categoriesQ) {
    var matchingRecipes = recipes;
    console.log("difficulty: " + difficulty);
    matchingRecipes = difficulty ? matchingRecipes.filter(recipe => recipe['difficulty'] === difficulty) : matchingRecipes;

    console.log("categories:" +  categoriesQ);
    categoriesQ.forEach(function (category) {
        console.log("category:" +  category);
        matchingRecipes = matchingRecipes.filter(recipe => recipe['categories'].includes(category));

    });

    let query = {};
    if (typeof categoriesQ !== "undefined" && categoriesQ.length) {
        console.log('categoriesQ', categoriesQ);
        query.categories={$all : categoriesQ};
    }
    if (typeof difficulty !== "undefined" && difficulty !== "") {
        console.log('diff', difficulty);
        query.difficulty=difficulty;
    }

    console.log('query', query);

    let numberOfDocuments;
    await count(query).then(function (items) {
        console.info('The promise was fulfilled with items!', items);
        numberOfDocuments = items
    });


    const randomNumber = Math.floor(Math.random() * numberOfDocuments) + 1;
    console.log('numberOfDocuments ' + numberOfDocuments);
    console.log('randomNumber ' + randomNumber);
    return new Promise(function(resolve, reject) {

        dbCollection.find(query).limit(-1).skip(randomNumber-1).toArray((error, result) => {
            if (error) reject(error);
            console.log(result);
            resolve(result);
        });
    });
}

async function  getRandomRecurringRecipe(difficulty, categoriesQ) {
    const todayStr = new Date().toISOString().split('T')[0];
    let query = {};
    query = {"$or": [ {"period":{$exists: false}}, {"next_earliest":{ $lt: new Date(todayStr)}}]};

    if (typeof categoriesQ !== "undefined" && categoriesQ.length) {
        console.log('categoriesQ', categoriesQ);
        query.categories={$all : categoriesQ};
    }
    if (typeof difficulty !== "undefined" && difficulty !== "") {
        console.log('diff', difficulty);
        query.difficulty=difficulty;
    }

    console.log('query', query);

    let numberOfDocuments;
    await count(query).then(function (items) {
        console.info('The promise was fulfilled with items!', items);
        numberOfDocuments = items
    });


    const randomNumber = Math.floor(Math.random() * numberOfDocuments) + 1;
    console.log('numberOfDocuments ' + numberOfDocuments);
    console.log('randomNumber ' + randomNumber);
    return new Promise(function(resolve, reject) {

        dbCollection.find(query).limit(-1).skip(randomNumber-1).toArray((error, result) => {
            if (error) reject(error);
            console.log(result);
            resolve(result);
        });
    });
}

async function updateNextEarliest(name, period) {
    let date = new Date(); // Now
    date.setDate(date.getDate() + period); // Set now + 30 days as the new date
    const nextDateStr =  date.toISOString().split('T')[0];
    return new Promise(function(resolve, reject) {

        dbCollection.update({"name": name}, {$set: {"next_earliest": new Date(nextDateStr)}}, (error, result) => {
            if (error) reject(error);
            console.log(result);
            resolve(result);
        });
    });
}


function count(query) {

    return new Promise(function(resolve, reject) {
        dbCollection.countDocuments(query).then((result)=> {
            console.log("count res");
            console.log(result);
            resolve(result);
        });

    });

}

function add(data) {
    recipes.push(data);
    console.log(recipes);
}

recipes = [
    {
        "name": "Gombapaprikas",
        "categories": ["vega", "klasszik"],
        "url": "www.gombapaprikas.com",
        "difficulty": "easy"
    },
    {
        "name": "Cacciatore chicken",
        "categories": ["italian", "saucy"],
        "url": "www.cacciatore.it",
        "difficulty": "hard"
    },
];

module.exports = {
    initialize,
    myData,
    getCategories,
    getLatest,

    getRandomRecipe,
    getRandomRecurringRecipe,
    add,
    dbCollection,
    dbObject,
};



