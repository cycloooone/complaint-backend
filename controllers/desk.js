import pool from '../database/postgres.js';
import {multi_collaborator_delete, task_delete, desk_delete} from '../controllers/delete_desk.js'
export async function addDesk(req, res){
    const {desk_name, user_id} = req.body;
    console.log(desk_name, user_id)
    try {
        const query = `
            INSERT INTO desk (desk_name) VALUES ($1)
            RETURNING desk_id
        `;
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
}
export async function addTask(req, res){
    const { task_name, start_date, end_date } = req.body;
    console.log(task_name, start_date, end_date)
    try {
        const query = `
            INSERT INTO task (task_name, status, desk_id, start_date, end_date) VALUES ($1, 'not started', 29, $2, $3)
        `;
        const data = await pool.query(query, [task_name, start_date, end_date]);

        res.send({statusCode: 200 })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create a task' });
    }
}

export async function getDesk(req, res){
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
}

export async function getTask(req, res){
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
}

export async function addColab(req, res){
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
    await desk_delete(desk_id)
    res.send({statusCode: 200 })
}