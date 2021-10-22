// server.js

require("dotenv").config()

const express = require("express")
const rn = require("random-number")
const Ably = require("ably")
const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY })

const app = express()

const channel = ably.channels.get("raw-sensor-data")

// make all the files in 'public' available
app.use(express.static("public"))

// load the home page, index.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html")
})

app.get("/auth", (request, response) => {
  response.json({ apiKey: process.env.ABLY_API_KEY })
})

app.get("/generate", (request, response) => {
  for (i = 0; i < process.env.NUM_SENSORS; i++) {
    let data = {
      temperature: rn({ min: -10, max: 50, integer: false }), // min, max, integer?
      humidity: rn({ min: 10, max: 99, integer: true }), // min, max, integer?
    }

    console.log(data)

    channel.publish("reading", JSON.stringify(data))
  }
  response.sendStatus(200)
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + process.env.PORT)
})
