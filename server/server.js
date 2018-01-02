// ./mongod --dbpath ~/mongo-data
var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

// var newTodo = new Todo({
//   text: 'Cook dinner'
// });

// newTodo.save().then((doc) => {
//   console.log('Doc saved', doc);
// }, () => {
//   console.log('Unable to save');
// })

var app = express();

app.use(bodyParser.json()); //middleware
app.post('/todos', (req, res) => {
  //console.log(req.body);
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });


});




app.listen(3000, () => {
  console.log('started on port 3k.')
});

module.exports = {app};
