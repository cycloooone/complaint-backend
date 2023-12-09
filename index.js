import { getNews, addNews, deleteNews } from './controllers/news.js'
import { uploadFile, getFile } from './controllers/file.js'
import { addUser, checkUser, getUsers, getUser, updateUser, deleteUser } from './controllers/user.js'
import { addDesk, addTask, addColumn, getDesk, getAllTask, getTasks, getColumn, addDeskColab, getNotCollabs, getCollabs, deleteDesk, getOneTask} from './controllers/desk.js'
import express from 'express';
import cors from 'cors';
const app = express();
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
app.post('/add-news', addNews);
app.delete('/news', deleteNews);

app.get('/file/:bucketName/:fileName', getFile);
app.post('/file/upload', uploadFile);



app.post('/register', addUser);
app.post('/login', checkUser);

app.get('/users', getUsers);
app.get('/users/:user_id', getUser)
app.delete('/users/:user_id', deleteUser);
app.put('/updateUserRole/:username', updateUser)
  
app.get('/desks/:user_id', getDesk);
app.get('/tasksAll/:desk_id', getAllTask);
app.get('/tasks/:column_id', getTasks);
app.get('/task/:task_id', getOneTask)
app.get('/columns/:desk_id', getColumn)
app.post('/desks', addDesk);
app.post('/tasks', addTask);
app.post('/columns', addColumn);
app.delete('/desks/:desk_id', deleteDesk)

app.get('/notcollaborators/:desk_id', getNotCollabs );
app.get('/collaborators/:desk_id', getCollabs);
app.post('/colab', addDeskColab);


app.listen(3000, () => {   
    console.log('Server running on port 3000');
});