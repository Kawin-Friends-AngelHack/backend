const express = require('express')
const bodyParser = require('body-parser')
const expressSanitizer = require('express-sanitizer')
const cors = require('cors')
const app = express()

const route = require('./router')

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressSanitizer())
app.use(express.static('vue/dist'))
route(app)


app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'))
