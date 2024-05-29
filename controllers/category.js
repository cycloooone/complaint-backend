import pool from '../database/postgres.js';
export async function addCategory(req, res){
    const {name} = req.body;
    console.log('comes', name)
    let conn;
    try {
        const query = `
            INSERT INTO categories (name) VALUES ($1)
        `;
        conn = await pool.connect();
        await conn.query(query, [name]).catch(e => { throw `ошибка создания категорий : ${e.message}` });
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add a category' });
    }
}
export async function getCategory(req, res){
    let conn;
    const {name} = req.body;
    console.log('getCategory')
    try {
        const query = `
            select name, id from categories
        `;
        conn = await pool.connect();
        const data = await conn.query(query).catch(e => { throw `ошибка получений категорий : ${e.message}` });
        console.log('ok')
        console.log(data.rows)
        res.status(200).json(data.rows)
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get a categories' });
    }
}

export async function deleteCategory(req, res){
    let conn;
    let {name} = req.body
    console.log('deleteCategory')
    try {
        const query = `
            delete from categories where name = ${name}
        `;
        conn = await pool.connect();
        const data = await conn.query(query).catch(e => { throw `ошибка получений категорий : ${e.message}` });
        res.status(200).json(data.rows)
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete a category' });
    }
}