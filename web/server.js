const express = require('express')
    , app = express()

app.use(express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const server = app.listen(process.env.HTTP_PORT, () =>
  console.log(`Server listening on localhost:${server.address().port}`))
