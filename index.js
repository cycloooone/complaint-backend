const express = require('express');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Minio = require('minio');
const multer = require('multer')
const fileUpload = require('express-fileupload')
const fs = require('fs').promises
const {Client} = require('pg')
const client = new Client();
app.use(cors());
app.use(express.json());
app.use(fileUpload({
    createParentPath: true
}))
const { Pool } = require('pg');
const secretKey = 'jwt-secret-key';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'asset',
  password: 'asset228',
  port: 5432,
});
if(pool){
    console.log('PostgreSQL connected ')
}




  const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false, // Set to true if using SSL/TLS
    accessKey: '2DQDkgApMXu1NkPHjPB3',
    secretKey: '5pdkFqwHeS1vfyKMXGvPkMyXt6i9PEAVvJe6Uup4'

  });

  const storage = multer.memoryStorage();
  const upload = multer();



  app.get('/news', async (req, res) => {
    let conn;
    try {
        let query = `
        select * from news;
        `
        conn = await pool.connect();
        let data = await conn.query(query).catch(e => { throw `Ошибка : ${e.message}` });
        
        res.json(data)
          
    } catch (err) {
        throw err;
    } finally {
        if (conn) {
            await conn.release()
        } 
    }
  })
  // delete news
  app.delete('/news/:id/:image/:video', async (req, res) => {
    let { id, image, video } = req.params;
    let conn;
    await minioClient.removeObject('apc18-bucket', image);
    console.log(video)
    if(video != null) await minioClient.removeObject('apc18-bucket', video);
    try{
        let query = `delete from news
        where id = ${id};
        `
        conn = await pool.connect();
        await conn.query(query).catch(e => {throw `Ошибка : ${e.message}` })
        res.send({statusCode: 200 })
    } catch(err){
        throw err;
    } finally{
        if(conn){
            await conn.release()
        }
    }
    
  });



  
  // Route for file upload
  app.post('/file/upload', async (req, res) => {
    try {
      if (!req.files || (!req.files.image && !req.files.video)) {
        return res.status(400).json({
          status: false,
          message: 'No file uploaded or invalid file type.',
        });
      }
  
      // Handle image file
      if (req.files.image) {
        const image = req.files.image;
        const imageMetaData = {
          'Content-Type': 'image/jpeg', // Adjust the content type as needed
        };
  
        minioClient.putObject('apc18-bucket', image.name, image.data, image.size, imageMetaData, function (err) {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: false,
              message: 'Error uploading image file.',
            });
          }
          console.log('Uploaded image successfully.');
        });
      }
  
      // Handle video file
      if (req.files.video) {
        const video = req.files.video;
        const videoMetaData = {
          'Content-Type': 'video/mp4', // Adjust the content type as needed
        };
  
        minioClient.putObject('apc18-bucket', video.name, video.data, video.size, videoMetaData, function (err) {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: false,
              message: 'Error uploading video file.',
            });
          }
          console.log('Uploaded video successfully.');
        });
      }
  
      res.json({
        status: true,
        message: 'Files uploaded successfully.',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: 'Internal server error.',
      });
    }
  });
  
  


  app.post('/add-news',  async (req, res) => {
    const { title, description, text, image, video } = req.body;
        let conn;
        
    try {
        let query2 = `
        insert into news
            (title, description, text, image, video)
        values 
            ($1, $2, $3, $4, $5)
        `
        const values = [title, description, text, image, video];
        console.log(query2, values)
        conn = await pool.connect();
        await conn.query(query2, values).catch(e => { throw `ошибка создания новостя : ${e.message}` });
        res.status(204).send();

    } catch (err) {
        throw err;
    } finally {
        if (conn) {
            await conn.release()
        }
    }
  });


  app.get('/file/:bucketName/:fileName', (req, res) => {
    const bucketName = req.params.bucketName;
    const fileName = req.params.fileName;
  
    minioClient.getObject(bucketName, fileName, (err, stream) => {
      if (err) {
        return res.status(500).send('Internal server error');
      }
  
      let contentType = 'application/octet-stream';
  
      if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      } else if (fileName.endsWith('.png')) {
        contentType = 'image/png';
      } else if (fileName.endsWith('.pdf')) {
        contentType = 'application/pdf';
      } else if (fileName.endsWith('.mp4')) {
        contentType = 'video/mp4';
      }
  
      res.setHeader('Content-Type', contentType);
      stream.pipe(res);
    });
  });

  

app.post('/register',  async (req, res) => {
    const { username, password, role_name, phone_number, mail, department  } = req.body;
        let conn;
    try {
        const hashedPassword  = await bcrypt.hash(password, 10);
        let query2 = `
        insert into users
            (username, password, role_name, number, mail, department)
        values 
            ('${username}', '${hashedPassword}', '${role_name}','${phone_number}','${mail}', '${department}' )
        `
        conn = await pool.connect();
        await conn.query(query2).catch(e => { throw `ошибка создания пользователя : ${e.message}` });
        res.status(204).send();

    } catch (err) {
        throw err;
    } finally {
        if (conn) {
            await conn.release()
        }
    }
  });
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
        let conn;
    try {
        let query = `
        select password, role_name, user_id, number, mail, department from users
        where username = '${username}'
        `
        conn = await pool.connect();
        let data = await conn.query(query).catch(e => { throw `ошибка создания пользователя : ${e.message}` });
        let comparePassword = await bcrypt.compare(password, data.rows[0].password);
        if (!comparePassword) {
            return res.status(403).json({message: 'Некорректный пароль'})
        }
        else{
            console.log('correct')
        }
        let role_name = data.rows[0].role_name;
        let user_id = data.rows[0].user_id;
        const accessToken = await jwt.sign({username: username, role_name: role_name, user_id: user_id}, secretKey)
        console.log(role_name, username, accessToken)
        res.send({
            statusCode: 200,
            data: {
              access_token: accessToken,
              username: username,
              role_name: role_name,
              user_id: user_id,
              number: number,
              mail: mail,
              department: department
            }
          });
          
    } catch (err) {
        throw err;
    } finally {
        if (conn) {
            await conn.release()
        } 
    }
  });

  app.get('/users', async (req, res) => {
    let conn;
    try {
        let query = `
        select username, role_name, number, mail, department from users
        `
        conn = await pool.connect();
        let data = await conn.query(query).catch(e => { throw `Ошибка : ${e.message}` });
        console.log(data)
        res.json(data)
          
    } catch (err) {
        throw err;
    } finally {
        if (conn) {
            await conn.release()
        } 
    }
  });
  app.put('/updateUserRole/:username', async (req, res) => {
    let { username } = req.params;
    let { role_name, phone_number, mail, department } = req.body;
    let conn;
    try{
        let query = `update users
        set role_name = '${role_name}',
            number= '${phone_number}',
            mail= '${mail}',
            department= '${department}'
        where username = '${username}';
        `
        conn = await pool.connect();
        await conn.query(query).catch(e => {throw `Ошибка : ${e.message}` })
        res.send({statusCode: 200 })
    } catch(err){
        throw err;
    } finally{
        if(conn){
            await conn.release()
        }
    }
    
    
  })
  // delete
  app.delete('/users/:username', async (req, res) => {
    let { username } = req.params;
    let conn;
    try{
        let query = `delete from users
        where username = '${username}';
        `
        conn = await pool.connect();
        await conn.query(query).catch(e => {throw `Ошибка : ${e.message}` })
        res.send({statusCode: 200 })
    } catch(err){
        throw err;
    } finally{
        if(conn){
            await conn.release()
        }
    }
    
  });
  
 




  //                                        desk logic




  // Create a Desk
  app.post('/desks/:desk_name/:user_id', async (req, res) => {
    const desk_name = req.params.desk_name;
    const user_id = req.params.user_id;
    console.log('it goes here fuck man',desk_name, user_id)
    try {
        const query = `
            INSERT INTO desk (desk_name) VALUES ($1)
            RETURNING desk_id
        `;
        console.log(query)
        const data = await pool.query(query, [desk_name]);
        const deskId = data.rows[0].desk_id;
        const collaboratorsQuery = `
        INSERT INTO desk_collaborators (desk_id, user_id) VALUES ($1, $2)
        `;
        await pool.query(collaboratorsQuery, [deskId, user_id]);
        res.status(201).json({ desk_id: data.rows[0].desk_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create a desk' });
    }
});

// Create a Task for a Desk
app.post('/tasks', async (req, res) => {
    const { task_name, desk_id } = req.body;
    try {
        const query = `
            INSERT INTO task (task_name, status, desk_id) VALUES ($1, 1, $2)
        `;
        const data = await pool.query(query, [task_name, desk_id]);

        res.send({statusCode: 200 })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create a task' });
    }
});


// get desks for user_id

app.get('/desks/:user_id', async (req, res) => {
    const user_id = req.params.user_id;
    try {
        const query = `
        SELECT d.desk_id, d.desk_name
        FROM desk d
        JOIN desk_collaborators dc ON d.desk_id = dc.desk_id
        WHERE dc.user_id = ${user_id};
        `;
        const data = await pool.query(query);
        res.status(200).json(data.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to retrieve collaborators for the desk' });
    }
});


// get tasks for desk_id
app.get('/tasks/:desk_id', async (req, res) => {
    const desk_id = req.params.desk_id;
    let conn;
    try {
        conn = await pool.connect();
        const query = `
        SELECT * FROM task
        WHERE desk_id = $1
        `;
        const data = await conn.query(query, [desk_id]);
        res.status(200).json(data.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update task status' });
    } finally {
        if (conn) {
            await conn.release();
        }
    }
});

// adding collaborators to desk_id

app.post('/colab', async (req, res) => {
    console.log(req.body)
    let {desk_id, userIDs} = req.body;
    let conn;
    try {
        conn = await pool.connect();
        let query = 'INSERT INTO desk_collaborators (desk_id, user_id) VALUES ';
        for (let i = 0; i < userIDs.length; i++) {
            query += `(${desk_id}, ${userIDs[i]})${i < userIDs.length - 1 ? ',' : ''}`;
        }
        const data = await conn.query(query);
        res.status(204).send();
        // const data = await conn.query(query, [desk_id]);
        // res.status(200).json(data.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update task status' });
    } finally {
        if (conn) {
            await conn.release();
        }
    }
});

// get users not related to desk_id

app.get('/collaborators/:desk_id', async (req, res) => {
    const desk_id = req.params.desk_id;
    try {
        const query = `
        SELECT u.user_id, u.username
        FROM users u
        LEFT JOIN desk_collaborators dc ON u.user_id = dc.user_id AND dc.desk_id = ${desk_id}
        WHERE dc.desk_id IS NULL;
        `;
        const data = await pool.query(query);
        res.status(200).json(data.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to retrieve users not related to the desk' });
    }
});



























app.listen(3000, () => {   
    console.log('Server running on port 3000');
});