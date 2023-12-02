import pool from '../database/postgres.js';
import minioClient  from '../database/minio.js';
export async function getNews(req, res){
    let conn;
    try {
        let query = `
        select * from news;
        `
        conn = await pool.connect();
        let data = await conn.query(query).catch(e => { throw `Ошибка : ${e.message}` });
        
        res.json(data)
          
    } catch (err) {
        console.log(err)
    } finally {
        if (conn) {
            await conn.release()
        } 
    }
}

export async function addNews(req, res){
    const { title, description, text, image, video, author } = req.body;
        let conn;
    console.log(author)
        
    try {
        let query2 = `
        insert into news
            (title, description, text, image, video, author)
        values 
            ($1, $2, $3, $4, $5, $6)
        `
        const values = [title, description, text, image, video, author];
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
}

export async function deleteNews(req, res){
    let { id, image, video } = req.body;
    console.log(req.body)
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
}
