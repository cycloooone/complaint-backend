import pool from '../database/postgres.js';
import nodemailer from 'nodemailer';
export async function createComplaint(req, res) {
    console.log('createComplaint');
    const { category_name, object_name, description, client_fullname, client_email, client_contact } = req.body;
    const create_date = new Date(); 
    const values = [category_name, object_name, description, client_fullname, client_email, client_contact, create_date];
    let conn;
    try {
        const query = `
            INSERT INTO complaint (category_name, object_name, description, client_fullname, client_email, client_contact, create_date) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        conn = await pool.connect();
        await conn.query(query, values).catch(e => { throw `ошибка создания жалобы : ${e.message}` });
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add a complaint' });
    }
    finally {
        sendConfirmationEmail(client_fullname, client_email);
    }
}

export async function deleteComplaint(req, res){
    let conn;
   
    const complaint_id = req.params.id
    console.log('delete', complaint_id)
    console.log('start get complaints')
    const {name} = req.body;
    try {
        const query = `
            delete FROM complaint
            WHERE
            id = ${complaint_id}

        `;
        conn = await pool.connect();
        const data = await conn.query(query).catch(e => { throw `ошибка удаление жалобы : ${e.message}` });
        res.status(200).json(data.rows)
        console.log('end get complaints')
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get a complaints' });
    }
}

export async function getAllComplaint(req, res){
    let conn;
    console.log('start get complaints')
    const {name} = req.body;
    try {
        const query = `
            SELECT 
                *
            FROM 
                complaint

        `;
        conn = await pool.connect();
        const data = await conn.query(query).catch(e => { throw `ошибка получений жалоб : ${e.message}` });
        res.status(200).json(data.rows)
        console.log('end get complaints')
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get a complaints' });
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


function sendConfirmationEmail(name, email) {
    console.log(email,name)
    const transporter = nodemailer.createTransport({
      service: 'Mail.ru',
      auth: {
        type: 'login',
        user: 'akzat1907@mail.ru',
        pass: 'vPhWSWLcv8UjEzT4RuKn'
      }
    });
    const mailOptions = {
      from: 'akzat1907@mail.ru',
      to: email,
      subject: 'Подтверждение: Жалоба получена',
      text: `Dear ${name},\n\nСпасибо за отправку жалобы. Мы получили его и решим его как можно скорее..\n\nС наилучшими пожеланиями,\nSimple Fast Food`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error occurred:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  }