const express = require('express')
const mysql = require('mysql2')

const router = express.Router()

const pool = mysql.createPool({
	host: process.env.HOST,
	user: process.env.USER,
	password: process.env.PASS,
	database: process.env.DB,
	waitForConnections: true,
	connectionLimit: 10, // Установите количество соединений, которые вы хотите в пуле
	queueLimit: 0, // Нет лимита на количество запросов в очереди (0 - без ограничений)
})

pool.on('error', err => {
	console.error('Ошибка в пуле соединений:', err)
})

// Обработчик маршрута /api/latest-news
router.get('/latest-news', (req, res) => {
	const limit = req.query.limit || 10
	const sortBy = req.query.sortBy || 'date_published'

	const sql = `SELECT * FROM news ORDER BY ${sortBy} DESC LIMIT ${limit}`

	pool.query(sql, (err, result) => {
		if (err) {
			console.error('Ошибка выполнения запроса:', err)
			res.status(500).json({ error: 'Ошибка сервера', details: err })
		} else {
			res.json(result)
		}
	})
})

// Обработчик маршрута /api/all-news
router.get('/all-news', (req, res) => {
	const limit = parseInt(req.query.limit) || 3
	const offset = parseInt(req.query.offset) || 0
	const sortBy = req.query.sortBy || 'date_published'

	const allowedSortByValues = ['date_published']

	if (!allowedSortByValues.includes(sortBy)) {
		return res.status(400).send('Недопустимое значение sortBy')
	}

	const sql = `SELECT * FROM news ORDER BY ${sortBy} DESC LIMIT ${offset}, ${limit}`

	pool.query(sql, (err, result) => {
		if (err) {
			console.error('Ошибка выполнения запроса:', err)
			res.status(500).json({ error: 'Ошибка сервера', details: err })
		} else {
			res.json(result)
		}
	})
})

// Обработчик маршрута /api/news/:slug
router.get('/news/:slug', (req, res) => {
	const { slug } = req.params
	const sql = 'SELECT * FROM news WHERE link = ?'

	pool.query(sql, [slug], (err, result) => {
		if (err) {
			console.error('Ошибка выполнения запроса:', err)
			res.status(500).json({ error: 'Ошибка сервера', details: err })
		} else {
			if (result.length === 0) {
				res.status(404).send('Новость не найдена!')
			} else {
				res.json(result[0])
			}
		}
	})
})

module.exports = router
