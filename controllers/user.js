import pool from '../database/postgres.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {user_delete, collaborator_delete} from './delete_user.js'
const secretKey = 'jwt-secret-key';
export async function addUser(req, res){
    let { username, password, role_name, name, surname } = req.body;
    console.log(username, password, role_name, name, surname)
        let conn;
    try {
        console.log('ok')
        const hashedPassword  = await bcrypt.hash(password, 10);
        role_name == null ? role_name = 'user' : role_name = role_name
        const query2 = `
            INSERT INTO users
            (username, password, role_name, name, surname)
            VALUES 
            ($1, $2, $3, $4, $5)
            `;
            const values = [
                username, hashedPassword, role_name, name, surname
            ];
        conn = await pool.connect();
        await conn.query(query2, values).catch(e => { throw `ошибка создания пользователя : ${e.message}` });
        res.status(204).send();

    } catch (err) {
        throw err;
    } finally {
        console.log('success')
        if (conn) {
            await conn.release()
        }
    }
}
export async function checkUser(req, res){
    const { username, password } = req.body;
    console.log(username, password)
        let conn;
    try {
        let query = `
        select password, role_name, name, surname from users
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
        let {role_name, name, surname} = data.rows[0];
        const accessToken = await jwt.sign({username: username, role_name: role_name}, secretKey)
        console.log(role_name, username, accessToken)
        res.send({
            statusCode: 200,
            data: {
              access_token: accessToken,
              username: username,
              name: name,
              surname: surname,
              role_name: role_name,
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
        select id, username, name, surname, role_name from users
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
    let { username, role_name } = req.body;
    console.log(username, role_name)
    let conn;
    try{
        let query = `update users
        set role_name = '${role_name}'
        where username = '${username}';
        `
        console.log(query)
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
    await user_delete(user_id)
    res.send({statusCode: 200 })
}