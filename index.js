import dotenv from 'dotenv';
dotenv.config();
import { addUser, checkUser, getUsers, getUser, updateUser, deleteUser } from './controllers/user.js'
import bodyParser from 'body-parser';
import {addCategory, getCategory} from './controllers/category.js'
import {createComplaint, getAllComplaint, deleteComplaint, statusComplaint} from './controllers/complaint.js'
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


import pool from './database/postgres.js'
import { addObject, getObject } from './controllers/dish.js'
if(pool){
    console.log('PostgreSQL connected ')
}


app.post('/register', addUser);
app.post('/login', checkUser);

app.get('/users', getUsers);
app.get('/users/:user_id', getUser);
app.delete('/users/:user_id', deleteUser);
app.put('/updateUserRole', updateUser);
  
app.post('/addCategory', addCategory);
app.get('/getCategory', getCategory);

app.post('/addObject', addObject);
app.get('/getObject/:category_id', getObject);

app.post('/complaint', createComplaint);
app.get('/complaint', getAllComplaint);
app.delete('/complaint/:id', deleteComplaint);
app.put('/complaint', statusComplaint)

app.listen(3000, () => {   
    console.log('Server running on port 3000');
});