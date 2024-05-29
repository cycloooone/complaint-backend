import pool from '../database/postgres.js';
export async function addObject(req, res){
    const {name, category_id, description} = req.body;
    let conn;
    console.log(req.body)
    try {
        const query = `
            INSERT INTO objects (name, category_id, description) VALUES ($1, $2, $3)
        `;
        console.log(query)
        conn = await pool.connect();
        await conn.query(query, [name, category_id, description]).catch(e => { throw `ошибка создания блюда : ${e.message}` });
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to insert dishes' });
    }
}
export async function getObject(req, res){
    let conn;
    const category_id = req.params.category_id;
    console.log(category_id)
    try {
        const query = `
            select * from objects where category_id = ${category_id}
        `;
        conn = await pool.connect();
        const data = await conn.query(query).catch(e => { throw `ошибка получений блюд : ${e.message}` });
        res.status(200).json(data.rows)
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get dish' });
    }
}