import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from './db';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
// });

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const authToken = (req: any, res: any, next: any) => {
    console.log(`${req.headers['authorization']}`);
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.body.user = user;
        next();
    });
};

app.post('/auth/register', async(req, res) => {
    console.log("hi");
    console.log(`${req.body.password}`);
    const username = req.body.username;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`${hashedPassword}`);
    try {
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.log(`${err}`);
        res.status(500).json({error: 'This username already exists'});
    }
});

app.post('/auth/login', async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        res.status(400).json({error: 'Username or password is incorrect'});
    }
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        console.log(`${user}`);
        if (!user) res.status(400).json({error: 'This user was not found'});
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) res.status(400).json({error: 'Invalid password entered'});
        const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '1h'});
        res.json({token});
    } catch (err) {
        console.log("hi1");
        console.error('Login error:', err);
        res.status(500).json({error: 'An error occurred on the server'});
    }
});

app.get('/tasks', authToken, async(req, res) => {
    console.log("hiii");
    const result = await pool.query('SELECT * FROM tasks WHERE userId = $1', [req.body.user.id]);
    console.log(`${req.body.username}`);
    res.json(result.rows);
});

app.post('/tasks', authToken, async (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    console.log(`${title}`);
    const result = await pool.query('INSERT INTO tasks (title, description, userId) VALUES ($1, $2, $3) RETURNING *', [title, description, req.body.user.id]);
    res.status(201).json(result.rows[0]);
});

app.put('/tasks/:id', authToken, async (req, res) => {
    const id = req.body.params;
    const title = req.body.title;
    console.log(`${title}`);
    const description = req.body.description;
    const isComplete = req.body.isComplete;
    const result = await pool.query('UPDATE tasks SET title = $1, description = $2, isComplete = $3 WHERE id = $4 AND userId = $5 RETURNING *', [title, description, isComplete, id, req.body.userId]);
    res.json(result.rows[0]);
});

app.delete('/tasks/:id', authToken, async(req, res) => {
    const {id} = req.params;
    await pool.query('DELETE FROM tasks WHERE id = $1 and userId = $2', [id, req.body.user.id]);
    res.sendStatus(204);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

