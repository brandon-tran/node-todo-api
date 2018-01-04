// ./mongod --dbpath ~/mongo-data
var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var {ObjectID} = require('mongodb');
const port = process.env.PORT || 3000;

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

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id).then((todo) => {
    if (todo) {
      res.send({todo});
    } else {
      res.status(404).send()
    }
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    if (todo) {
      res.status(200).send(todo);
    } else {
      res.status(404).send();
    }
  }).catch((e) => {
    res.status(400).send();
  });
});


app.listen(port, () => {
  console.log(`Started on PORT ${port}`)
});

module.exports = {app};
