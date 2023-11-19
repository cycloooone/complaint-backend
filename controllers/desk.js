import pool from '../database/postgres.js';
export async function addDesk(req, res){
    const {desk_name, user_id} = req.body;
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
}
export async function addTask(req, res){
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


export async function getCollabs(req, res){
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