# Local Dashboard Development

This setup runs the dashboard frontend and backend on the developer machine while
the backend continues to consume MQTT and MongoDB from the services selected in
its own `.env` file.

The backend is an MQTT client. It does not provide an MQTT broker. The data path
is:

```text
ESP32 panel -> MQTT broker -> local backend -> MongoDB and Socket.IO -> local frontend
local frontend -> local backend -> MQTT broker -> ESP32 panel
```

## Prerequisites

- Node.js and npm
- A MongoDB database containing the dashboard data and users
- An MQTT broker reachable from the development machine
- Credentials for the dashboard login

You can use the existing AWS Mosquitto broker and MongoDB for a first end-to-end
check. Do not commit either `.env` file.

## Configure the backend

From PowerShell:

```powershell
cd Dashboard\Muthoot-Backend-main
Copy-Item .env.example .env
```

Edit `.env` and set the actual values for:

- `MQTT_ADDRESS`: broker URL, for example `mqtt://broker-host:1883`
- `MQTT_TOPIC`: the telemetry topic, normally `sensor`
- `MONGODB_URI`: the dashboard MongoDB connection string
- `SOCKET_PORT`: keep `5002` unless that port is already in use
- `JWT_SALT`: a local-only value; do not reuse a production secret

The current MQTT client creates its connection with `MQTT_ADDRESS`. The
`MQTT_USER` and `MQTT_PASSWORD` variables are documented for the deployment
configuration, but the current client does not pass them to `mqtt.connect`; add
that separately before testing a broker that requires authentication.

Install and start the backend:

```powershell
npm.cmd install
npm.cmd run dev
```

The expected startup message is:

```text
Socket.io server is running on port 5002
```

Keep this terminal open and watch for MQTT and MongoDB connection errors.

## Configure the frontend

Open a second PowerShell terminal:

```powershell
cd Dashboard\Muthoot_Dashboard-master
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

The frontend uses:

- `API_URL` for REST requests
- `SOCKET_URL` for live Socket.IO updates

The local defaults are both `http://localhost:5002`. Open the URL printed by
Nuxt, normally `http://localhost:3000`.

## End-to-end smoke test

1. Confirm the backend has connected to MQTT and MongoDB.
2. Open the frontend at `http://localhost:3000`.
3. Log in with an existing dashboard user.
4. Open the device status page.
5. Publish one valid panel JSON payload to the `sensor` topic.
6. Confirm the backend logs the message, MongoDB receives the updated device
   state, and the status table changes without a browser refresh.
7. Use a mode, bypass, reset-alarm, or reverse-alarm control in the dashboard.
8. Subscribe to the target device topic, which is the panel MAC ID, and confirm
   that the backend publishes the expected command JSON.

For a v4 payload, include `ZONE_1` through `ZONE_16` and the corresponding
`Z1_bp` through `Z16_bp` fields. The current dashboard compatibility work for
16-zone normalization and display should be validated separately from this
environment setup.

## Troubleshooting

- `ECONNREFUSED` on port `5002`: the backend is not running, or `SOCKET_PORT`
  differs from the frontend URLs.
- Browser requests still go to production: verify `Dashboard/Muthoot_Dashboard-master/.env`
  contains `API_URL=http://localhost:5002`, then restart Nuxt.
- No live updates: verify `SOCKET_URL=http://localhost:5002`, then check the
  browser console and backend Socket.IO logs.
- No MQTT messages: verify the broker address, topic, network access, and that
  another MQTT client can publish/subscribe using the same broker.
- MongoDB errors: verify `MONGODB_URI`, database access, and that the expected
  collections and user records exist.

## Production safety

Use separate local and production `.env` files. Never commit `.env`, broker
passwords, MongoDB credentials, JWT salts, or cloud access tokens. Stop the local
backend before switching its `.env` back to production values.
