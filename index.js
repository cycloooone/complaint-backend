import { getNews, addNews, deleteNews } from './controllers/news.js'
import { uploadFile, getFile } from './controllers/file.js'
import { addUser, checkUser, getUsers, getUser, updateUser, deleteUser } from './controllers/user.js'
import { addDesk, addTask, getDesk, getTask, addColab, getNotCollabs, getCollabs, deleteDesk} from './controllers/desk.js'
import express from 'express';
import cors from 'cors';
import minioClient from "./database/minio.js" 
const app = express();

// import multer from 'multer';  // I don't know what multer needed
import fileUpload from 'express-fileupload';

app.use(cors());
app.use(express.json());
app.use(fileUpload({
    createParentPath: true
}))
import pool from './database/postgres.js'

if(pool){
    console.log('PostgreSQL connected ')
}

app.get('/news', getNews)
app.delete('/news', deleteNews);
app.post('/add-news', addNews);

app.get('/file/:bucketName/:fileName', getFile);
app.post('/file/upload', uploadFile);

app.post('/register', addUser);
app.post('/login', checkUser);

app.get('/users', getUsers);
app.get('/users/:user_id', getUser)
app.put('/updateUserRole/:username', updateUser)
app.delete('/users/:user_id', deleteUser);
  
app.post('/desks', addDesk);

app.post('/tasks', addTask);
app.get('/desks/:user_id', getDesk);
app.get('/tasks/:desk_id', getTask);
app.delete('/desks/:desk_id', deleteDesk)

app.post('/colab', addColab);
app.get('/notcollaborators/:desk_id', getNotCollabs );
app.get('/collaborators/:desk_id', getCollabs);































app.listen(3000, () => {   
    console.log('Server running on port 3000');
});