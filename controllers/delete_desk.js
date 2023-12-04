import pool from '../database/postgres.js';
export async function task_delete(desk_id){
    let conn;
    try{
        let query = `delete from task
        where desk_id = ${desk_id};
        `
        conn = await pool.connect();
        await conn.query(query).catch(e => {throw `Ошибка : ${e.message}` })
    } catch(err){
        console.log(err)
    } finally{
        if(conn){
            await conn.release()
        }
    }
}
export async function multi_collaborator_delete(desk_id){
    let conn;
    try{
        let query = `delete from desk_collaborators
        where desk_id = ${desk_id};
        `
        conn = await pool.connect();
        await conn.query(query).catch(e => {throw `Ошибка : ${e.message}` })
    } catch(err){
        console.log(err)
    } finally{
        if(conn){
            await conn.release()
        }
    }
}

export async function desk_delete(desk_id){
    let conn;
    try{
        let query = `delete from desk
        where desk_id = ${desk_id};
        `
        conn = await pool.connect();
        await conn.query(query).catch(e => {throw `Ошибка : ${e.message}` })
    } catch(err){
        console.log(err)
    } finally{
        if(conn){
            await conn.release()
        }
    }
}
