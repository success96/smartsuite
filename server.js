require('dotenv').config()

const express = require('express')
const cors = require("cors")
const status = require("http-status");
const morgan = require("morgan");

const app = express()

app.use(morgan("dev"));
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



app.get('/', async (req, res) => {
    res.json({ msg: "Welcome to Smartsuite Home" })
})

//app.use('/users', require('./routes/users.routes.js'))

app.all('*', async (req, res) => {
    res.status(status.NOT_FOUND).send(`Can't find ${req.originalUrl} on the server!!!`)
});

const port = process.env.PORT || 3000




app.listen(port, () => {
    console.log('listening at port '+ port)
});