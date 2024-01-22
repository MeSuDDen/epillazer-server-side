const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

require('dotenv').config()

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(express.json())

// Импортируем и подключаем модули маршрутов
const emailRoutes = require('./routes/email')
const newsRoutes = require('./routes/news')
const contactRoutes = require('./routes/contacts')

app.use('/api', emailRoutes)
app.use('/api', newsRoutes)
app.use('/api', contactRoutes)

const PORT = process.env.PORT || 3030

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`)
})