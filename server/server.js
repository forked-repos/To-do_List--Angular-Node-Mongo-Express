var express = require('express');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
// Add headers
app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

var usersCollection, todosCollection;
MongoClient.connect('mongodb://localhost:27017/todos', function(err, db) {
    usersCollection = db.collection('users');
    todosCollection = db.collection('todoItems');
});

app.get('/users', function(req, res) {
    usersCollection.find().toArray(function(err, items) {
        res.json(items);
    });
});

/* CREATE USER / REGISTRATION */

app.post('/users/new', function(req, res) {
    var username = req.body.username,
        pwd = req.body.p;
    usersCollection.find({
        username: username
    }).toArray(function(err, items) {
        if (err) {
            res.status(500).send({
                error: err
            });
        } else {
            var userExists = items.length > 0;
            if (!userExists) {
                usersCollection.insert({
                    username: username,
                    pwd: pwd
                }, function(err, result) {
                    res.json(result);
                });
            } else {
                res.status(500).send({
                    error: 'User exists'
                });
            }
        }
    });
});


/* LOGIN USER */

app.post('/users/login', function(req, res) {
    console.log('loggin in: ', res.body);
    var username = req.body.username,
        pwd = req.body.p;
    usersCollection.findOne({
        username: username
    }, function(err, userObj) {
        if (err) {
            res.status(500).send({
                error: 'error occurred'
            });
        } else {
            if (userObj) {
                if (userObj.pwd === pwd)
                    res.send('login successful');
                else
                    res.status(403).send({
                        error: 'Wrong user/password'
                    });
            } else {
                res.status(404).send({
                    error: 'User not found'
                });
            }
        }
    });
});

/* TO-DO LIST */
app.post('/todos/new', function(req, res) {
    todosCollection.insert(req.body, function(err, result) {
        res.json(result.ops[0]);
    });
});

app.post('/todos/update', function(req, res) {
    var todo = req.body;
    todosCollection.update({
        _id: mongo.ObjectID(todo._id)
    }, {
        $set: {
            checked: todo.checked
        }
    }, function(err, result) {
        console.log(result);
        if (err) {
            res.status(500).send({
                error: 'error updated'
            });
        } else
            res.json(result);
    });
});

app.get('/todos', function(req, res) {
    todosCollection.find({
        user: req.query.user
    }).toArray(function(err, items) {
        res.json(items);
    });
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
