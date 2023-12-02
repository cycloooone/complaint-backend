import pool from '../database/postgres.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {user_delete, collaborator_delete} from './delete_user.js'
const secretKey = 'jwt-secret-key';
export async function addUser(req, res){
    const { username, password, role_name, number, mail, department, name, surname, image  } = req.body;
    console.log(number)
        let conn;
    try {
        const hashedPassword  = await bcrypt.hash(password, 10);
        const query2 = `
            INSERT INTO users
            (username, password, role_name, number, mail, department, name, surname, image)
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `;
            const values = [
                username, hashedPassword, role_name, number, mail, department, name, surname, image
            ];
        conn = await pool.connect();
        await conn.query(query2, values).catch(e => { throw `ошибка создания пользователя : ${e.message}` });
        res.status(204).send();

    } catch (err) {
        throw err;
    } finally {
        if (conn) {
            await conn.release()
        }
    }
}
export async function checkUser(req, res){
    const { username, password } = req.body;
    console.log(username, password)
    console.log(username, password)
        let conn;
    try {
        let query = `
        select password, role_name, user_id, number, mail, department, image, name, surname from users
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
        let {number, mail, department, role_name, user_id, image, name, surname} = data.rows[0];
        const accessToken = await jwt.sign({username: username, role_name: role_name, user_id: user_id}, secretKey)
        console.log(role_name, username, accessToken)
        res.send({
            statusCode: 200,
            data: {
              access_token: accessToken,
              username: username,
              name: name,
              surname: surname,
              role_name: role_name,
              user_id: user_id,
              number: number,
              mail: mail,
              department: department,
              image: image,
            }
          });
          
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (conn) {
            await conn.release()
        } 
    }
}

export async function getUsers(req, res){
    let conn;
    try {
        let query = `
        select user_id, username, name, surname, role_name, number, mail, image, department from users
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
}

export async function getUser(req, res){
    let conn;
    let {user_id} = req.params;
    console.log(user_id)
    try {
        let query = `
        select username, name, surname, role_name, number, mail, department, image from users
        where user_id = ${user_id}
        `
        conn = await pool.connect();
        let data = await conn.query(query).catch(e => { throw `Ошибка : ${e.message}` });
        res.json(data.rows)
          
    } catch (err) {
        throw err;
    } finally {
        if (conn) {
            await conn.release()
        } 
    }
}
export async function updateUser(req, res){
    let { username, role_name, number, mail, department, name, surname } = req.body;
    let conn;
    try{
        let query = `update users
        set role_name = '${role_name}',
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
}

export async function deleteUser(req, res){
    let user_id = req.params.user_id;
    await collaborator_delete(user_id)
    await user_delete(user_id)
    res.send({statusCode: 200 })
}