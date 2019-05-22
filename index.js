const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId
const app = express()
const port = 3000

const url = 'mongodb://localhost:27017'
const dbname = 'pengRats';
const Client = new MongoClient(url)

var jsonParser = bodyParser.json()

//get all uncompleted todos
app.get('/todos', function (req, res) {
    Client.connect(function (err) {
        let db = Client.db(dbname)
        getAllTodos(db, function (documents) {
            res.json(documents)
        })
    })
})

//add a new todo
app.post('/todos', jsonParser, function (req, res) {
    Client.connect(function (err) {
       console.log('connected correctly to the db')
        let db = Client.db(dbname)
        let newTodo = req.body.todo

        addTodo(db, newTodo, function (result) {
            if(result.insertedCount === 1){
                res.json({success: true, msg: 'inserted todo into db', data: []})
            } else {
                res.json({success: false, msg: 'nope, didnt work', data: []})
            }
        })
    })
})

//complete a todo
app.put('/todos/:id', function (req, res) {
    Client.connect(function (err) {
        console.log('connected correctly to the db')
        let db = Client.db(dbname)
        let id = ObjectId(req.params.id)
        console.log(id)
        completeTodo(db, id, function (result) {
            if(result.modifiedCount){
                res.json({success: true, msg: 'edited db', data: []})
            } else {
                res.json({success: false, msg: 'nope, didnt work', data: []})
            }
        })

    })
})

app.delete('/todos/:id', function (req, res) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, client) {
        console.log('connected correctly to the db')
        let db = client.db(dbname)
        let id = ObjectId(req.params.id)
        deleteTodo(db, id, function (result) {
            if(result.deletedCount){
                res.json({success: true, msg: 'deleted doc from db', data: []})
            } else {
                res.json({success: false, msg: 'nope, didnt work', data: []})
            }
        })
    })
})

var deleteTodo = function(db, id, callback) {
    var collection = db.collection('todos');
    collection.deleteOne({ "_id" : id }, function(err, result) {
        callback(result)
    });
}

var completeTodo = function(db, id, callback) {
    var collection = db.collection('todos');
    collection.updateOne({ "_id" : id }
        , { $set: { "completed" : true } }, function(err, result) {
            callback(result)
        });
}

var getAllTodos = function (db, callback) {
    var collection = db.collection('todos')
    collection.find({"completed": {$exists: false}}).toArray(function (err, documents) {
        callback(documents)
    })
}

var addTodo = function(db, newTodo, callback) { // mongodb insert data query
    var collection = db.collection('todos')
    collection.insertOne({"todo" : newTodo}, function(err, result) {
        callback(result)
    })
}

app.listen(port, ()=> console.log('todo app running'))

