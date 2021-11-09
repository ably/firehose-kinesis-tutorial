function generateSensorData() {
  fetch("/generate")
}

const ably = new Ably.Realtime({ authUrl: "/auth" })
const channel = ably.channels.get("processed-sensor-data")
channel.subscribe((msg) => {
  console.log(msg.data)
  const data = JSON.parse(msg.data)
  document.getElementById(
    "count"
  ).innerHTML = `<strong>Number of readings: </strong>${data.num_readings}`
  document.getElementById(
    "averages"
  ).innerHTML = `<strong>Average temperature (°C):</strong> ${data.avg_temperature.toFixed(
    2
  )}<br/><strong>Average humidity (%):</strong> ${data.avg_humidity.toFixed(
    1
  )}<br/>`
})
