import pool from '../database/postgres.js';
export async function task_delete(desk_id){
    let conn;
    try{
        let query = 
        `DELETE FROM task
        WHERE column_id IN (SELECT column_id FROM columns WHERE desk_id = ${desk_id});
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
export async function column_delete(desk_id){
    let conn;
    try{
        let query = `delete from columns
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
export async function task_collaborator_delete(desk_id){
    let conn;
    try{
        let query = `DELETE FROM task_collaborators
        WHERE task_id IN (
            SELECT task_id
            FROM task
            WHERE column_id IN (
                SELECT column_id
                FROM columns
                WHERE desk_id = ${desk_id}
            )
        );
        
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
