const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: "First test todo"
}, {
  _id: new ObjectID(),
  text: "Second test todo",
  completed: true,
  completedAt: 666
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});


describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = "Make a test";

    request(app)
    .post('/todos')
    .send({text})
    .expect(200)
    .expect((res) => {
      expect(res.body.text).toBe(text);
    })
    .end((err, res) => {
      if (err) {
        return done(err);
      }
      Todo.find({text}).then((todos) => { //fetch all todos
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      }).catch((e) => done(e));
    });
  });

  it('should not add invalid todo', (done) => {
    request(app) // assumtions about todo
    .post('/todos')
    .send({})
    .expect(400)
    .end((err, res) => {
      if (err) {
        return done(err);
      }
      // assumptions about database
      Todo.find().then((todos) => {
        expect(todos.length).toBe(2);
        done();
      }).catch((e) => done(e));
    });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
    .get('/todos')
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(2);
    })
    .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should get a todo doc', (done) => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    })
    .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
    .get(`/todos/${(new ObjectID()).toHexString()}`)
    .expect(404)
    .end(done);
  });

  it('should return 404 for non valid ID', (done) => {
    request(app)
    .get('/todos/123')
    .expect(404)
    .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should delete a todo doc', (done) => {
    var hexID = todos[0]._id.toHexString();

    request(app)
    .delete(`/todos/${hexID}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo._id).toBe(hexID);
    })
    .end((err, res) => {
      if (err) {
        return done(err);
      }
      Todo.findById(hexID).then((todo) => {
        expect(todo).toNotExist();
        done();
      }).catch((e) => {
        done(e);
      });
    });
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
    .delete(`/todos/${(new ObjectID()).toHexString()}`)
    .expect(404)
    .end(done);
  });

  it('should return 404 if ID invalid', (done) => {
    request(app)
    .delete('/todos/123')
    .expect(404)
    .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update todo', (done) => {
    var hexID = todos[0]._id.toHexString();
    var text = 'Changed text 1';

    request(app)
    .patch(`/todos/${hexID}`)
    .send({
      text,
      completed: true
    })
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(text);
      expect(res.body.todo.completed).toBe(true);
      expect(res.body.todo.completedAt).toBeA("number");
    })
    .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var hexID = todos[1]._id.toHexString();
    var text = 'Changed text 2';

    request(app)
    .patch(`/todos/${hexID}`)
    .send({
      text,
      completed: false
    })
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(text);
      expect(res.body.todo.completed).toBe(false);
      expect(res.body.todo.completedAt).toNotExist();
    })
    .end(done);
  });


});

// it('', (done) => {
//
// });
