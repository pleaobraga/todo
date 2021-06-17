const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function hasUser(username) {
  return users.find(u => u.username === username)
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = hasUser(username)

  if(!user){
    return response.status(400).json({ error: "The user does not exist"})
  }

  request.user = user

  next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  if(hasUser(username)){
    return response.status(400).json({ error: "The user exist"})
  }

  const id = uuidv4()
  
  const user = {
    id,
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const { user } = request

  const id = uuidv4()

  const todo = {
    id,
    title,
    done: false,
    deadline,
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request
  const { title, deadline } = request.body

  const todo = user.todos.find(t => t.id === id)

  if(!todo) {
    return response.status(404).json({ error: "The todo does not exist"})
  }

  todo.title = title
  todo.deadline = deadline

  return response.status(200).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find(t => t.id === id)

  if(!todo) {
    return response.status(404).json({ error: "The todo does not exist"})
  }

  todo.done = true

  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find(t => t.id === id)

  if(!todo) {
    return response.status(404).json({ error: "The todo does not exist"})
  }

  user.todos.splice(todo, 1)


  return response.status(204).send()
});

module.exports = app;