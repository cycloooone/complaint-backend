import pool from '../database/postgres.js';
export async function user_delete(user_id){
    let conn;
    try{
        let query = `delete from users
        where user_id = ${user_id};
        `
        conn = await pool.connect();
        await conn.query(query).catch(e => {throw `Ошибка : ${e.message}` })
    } catch(err){
        throw err;
    } finally{
        if(conn){
            await conn.release()
        }
    }
}
export async function collaborator_delete(user_id){
    let conn;
    try{
        let query = `delete from desk_collaborators
        where user_id = ${user_id};
        `
        conn = await pool.connect();
        await conn.query(query).catch(e => {throw `Ошибка : ${e.message}` })
    } catch(err){
        throw err;
    } finally{
        if(conn){
            await conn.release()
        }
    }
}
