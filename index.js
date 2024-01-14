const cors = require('cors')
const express = require('express')
const mysql = require('mysql2')
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')

require('dotenv').config()

const PORT = process.env.PORT || 3030
const HOST = process.env.HOST
const USER = process.env.USER
const PASS = process.env.PASS
const DB = process.env.DB

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(express.json())
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	)
	next()
})

const connection = mysql.createConnection({
	host: HOST,
	user: USER,
	password: PASS,
	database: DB,
})

connection.connect(err => {
	if (err) {
		console.error('Ошибка подключения к базе данных: ' + err.stack)
		return
	}

	console.log('Подключение к базе данных успешно установлено.')
})

app.post('/api/send-email', (req, res) => {
	const { name, phone } = req.body

	// Настройки для отправки почты через SMTP (пример для Gmail)
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'rusokoro2002@gmail.com',
			pass: 'ypur ojln ksci xzfv',
		},
		secure: false,
		tls: {
			rejectUnauthorized: false,
		},
	})

	// Опции письма
	const mailOptions = {
		from: 'rusokoro2002@gmail.com',
		to: 'rusokoro2002@gmail.com',
		subject: 'Новая заявка от клиента',
		text: `Имя: ${name}\nТелефон: ${phone}`,
	}

	// Отправка письма
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error('Ошибка отправки письма:', error)
			res.status(500).json({ error: 'Произошла ошибка при отправке письма' })
		} else {
			console.log('Письмо успешно отправлено:', info.response)
			res.json({ success: true })
		}
	})
})

// Пример данных о товаре
app.get('/api/news', (req, res) => {
	const sql = 'SELECT * FROM news'
	connection.query(sql, (err, result) => {
		if (err) {
			console.error('Ошибка выполнения запроса:', err)
			res.status(500).send('Ошибка сервера')
		} else {
			res.json(result)
		}
	})
})

app.get('/api/news/:slug', (req, res) => {
	const { slug } = req.params
	const sql = 'SELECT * FROM news WHERE link = ?'

	connection.query(sql, [slug], (err, result) => {
		if (err) {
			console.error('Ошибка выполнения запроса:', err)
			res.status(500).send('Ошибка сервера')
		} else {
			if (result.length === 0) {
				// Если новость с указанным slug не найдена, вернуть 404
				res.status(404).send('Новость не найдена!')
			} else {
				res.json(result[0]) // Возвращаем первую найденную новость (предполагается, что slug уникален)
			}
		}
	})
})

app.listen(PORT, (req, res) => {
	console.log(`Server started on http://localhost:${PORT}`)
})
