const https = require("https")

const ablyApiKey = process.env.ABLY_API_KEY

let temperatures = []
let humidities = []

exports.handler = async (event, context) => {
  event.Records.forEach((record) => {
    // Kinesis data is base64 encoded so decode here
    const payload = Buffer.from(record.kinesis.data, "base64").toString("ascii")
    const data = JSON.parse(payload)
    temperatures.push(data.temperature)
    humidities.push(data.humidity)
  })

  const averages = {
    avg_temperature: temperatures.reduce(add, 0) / temperatures.length,
    avg_humidity: humidities.reduce(add, 0) / humidities.length,
    num_readings: temperatures.length,
  }

  await postMessage("processed-sensor-data", JSON.stringify(averages))
  console.log(averages)
}

async function postMessage(channel, message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: "averages",
      data: message,
    })

    const options = {
      host: "rest.ably.io",
      port: 443,
      path: `/channels/${channel}/messages`,
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(ablyApiKey).toString("base64")}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    }

    let req = https.request(options)
    req.write(data)
    req.end(null, null, () => {
      // Request has been sent
      resolve(req)
    })
  })
}

function add(accumulator, a) {
  return accumulator + a
}
