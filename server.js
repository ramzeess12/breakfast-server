const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Подключение к базе данных или создание
const db = new sqlite3.Database('breakfast.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the breakfast database.');
    }
});

// Создание таблицы при старте, если не существует
db.run(`
CREATE TABLE IF NOT EXISTS feed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    liked INTEGER NOT NULL DEFAULT 0,
    date TEXT NOT NULL
)
`);


// Получение всей ленты
app.get('/api/feed', (req, res) => {
    db.all("SELECT * FROM feed ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Добавление нового блюда в ленту
app.post('/api/feed', (req, res) => {
    const { name, liked } = req.body;
    const date = new Date().toLocaleString();
    db.run("INSERT INTO feed (name, liked, date) VALUES (?, ?, ?)", [name, liked ? 1 : 0, date], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database insert error' });
        }
        res.json({ id: this.lastID, name, liked, date });
    });
});

// Обновление лайка для блюда
app.post('/api/feed/like', (req, res) => {
    const { id, liked } = req.body;
    db.run("UPDATE feed SET liked = ? WHERE id = ?", [liked ? 1 : 0, id], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database update error' });
        }
        res.json({ success: true });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
