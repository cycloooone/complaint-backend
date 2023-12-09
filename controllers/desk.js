import pool from '../database/postgres.js';
import {multi_collaborator_delete, task_delete, desk_delete, column_delete} from '../controllers/delete_desk.js'
export async function addDesk(req, res){
    const {desk_name, user_id, image} = req.body;
    console.log(desk_name, user_id)
    try {
        const query = `
            INSERT INTO desk (desk_name, image) VALUES ($1, $2)
            RETURNING desk_id
        `;
        const data = await pool.query(query, [desk_name, image]);
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
}
export async function addTask(req, res){
    const { task_name, column_id } = req.body;
    try {
        const query = `
            INSERT INTO task (task_name, status, column_id) VALUES ($1, 'not started', $2)
        `;  
        const data = await pool.query(query, [task_name, column_id]);

        res.send({statusCode: 200})
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create a task' });
    }
}
export async function addColumn(req, res){
    const { column_name, desk_id } = req.body;
    try {
        const query = `
            INSERT INTO columns (column_name, desk_id) VALUES ($1, $2)
        `;  
        const data = await pool.query(query, [column_name, desk_id]);

        res.send({statusCode: 200 })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create a column' });
    }
}





export async function getDesk(req, res){
    const user_id = req.params.user_id;
    try {
        const query = `
        SELECT d.desk_id, d.desk_name, d.image
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
}

export async function getAllTask(req, res){
    const desk_id = req.params.desk_id;
    let conn;
    try {
        conn = await pool.connect();
        const query = `
        SELECT task.task_id, task.task_name, task.status, task.start_date, task.end_date, columns.column_id, columns.desk_id
        FROM task
        JOIN
        columns ON task.column_id = columns.column_id
        WHERE columns.desk_id = $1;

        `;
        const data = await conn.query(query, [desk_id]);
        res.status(200).json(data.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get task status' });
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}
export async function getColumn(req, res){
    const desk_id = req.params.desk_id;
    let conn;
    try {
        conn = await pool.connect();
        const query = `
        SELECT * FROM columns
        WHERE desk_id = $1;
        `;
        const data = await conn.query(query, [desk_id]);
        res.status(200).json(data.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get column status' });
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}
export async function getTasks(req, res){
    const column_id = req.params.column_id;
    let conn;
    try {
        conn = await pool.connect();
        const query = `
        SELECT * FROM task
        WHERE column_id = $1;

        `;
        const data = await conn.query(query, [column_id]);
        res.status(200).json(data.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get tasks from column' });
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}
export async function getOneTask(req, res){
    const task_id = req.params.task_id;
    let conn;
    try {
        conn = await pool.connect();
        const query = `
        SELECT * FROM task
        WHERE task_id = $1;

        `;
        const data = await conn.query(query, [task_id]);
        res.status(200).json(data.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get task information' });
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}



export async function addDeskColab(req, res){
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
}


export async function getNotCollabs(req, res){
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
}
export async function getCollabs(req, res){
    const desk_id = req.params.desk_id;
    try {
        const query = `
        SELECT u.user_id, u.username, u.image, u.name, u.surname
        FROM users u
        JOIN desk_collaborators dc ON u.user_id = dc.user_id
        WHERE dc.desk_id = ${desk_id};
        `;
        const data = await pool.query(query);
        res.status(200).json(data.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to retrieve users related to the desk' });
    }
}


export async function deleteDesk(req, res){
    let desk_id = req.params.desk_id;
    await multi_collaborator_delete(desk_id)
    await task_delete(desk_id)
    await column_delete(desk_id)
    await desk_delete(desk_id)
    res.send({statusCode: 200 })
}