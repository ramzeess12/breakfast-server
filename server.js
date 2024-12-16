// Импорт необходимых модулей
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

// Инициализация приложения Express
const app = express();
const port = process.env.PORT || 3000; // Порт сервера

// Middleware для обработки JSON и CORS
app.use(express.json());
app.use(cors());

// Подключение к базе данных SQLite
const db = new sqlite3.Database('breakfast.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('✅ Connected to the breakfast database.');
        // Создание таблицы при первом запуске сервера
        db.run(`
            CREATE TABLE IF NOT EXISTS feed (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                liked INTEGER NOT NULL DEFAULT 0,
                date TEXT NOT NULL
            )
        `);
    }
});

// Маршрут для корневого URL "/"
app.get('/', (req, res) => {
    res.send('Добро пожаловать на сервер завтраков! 🎉');
});

// Маршрут для получения всех сохранённых завтраков
app.get('/api/feed', (req, res) => {
    db.all("SELECT * FROM feed ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Маршрут для добавления нового завтрака в базу данных
app.post('/api/feed', (req, res) => {
    const { name, liked } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const date = new Date().toLocaleString(); // Текущая дата и время
    db.run("INSERT INTO feed (name, liked, date) VALUES (?, ?, ?)", [name, liked ? 1 : 0, date], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to insert data' });
        }
        res.json({ id: this.lastID, name, liked, date });
    });
});

// Маршрут для обновления статуса "лайка" у завтрака
app.post('/api/feed/like', (req, res) => {
    const { id, liked } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    db.run("UPDATE feed SET liked = ? WHERE id = ?", [liked ? 1 : 0, id], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to update like status' });
        }
        res.json({ success: true });
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});
