const fs = require('fs')
const https = require('https')
const morgan = require('morgan')
const express = require('express')
const bodyParser = require('body-parser')

const { AppsV1Api, CoreV1Api, CustomObjectsApi, KubeConfig, NetworkingV1Api, Watch } = require('@kubernetes/client-node')

const privateKey  = fs.readFileSync('ca/key.pem', 'utf8')
const certificate = fs.readFileSync('ca/ingress.pem', 'utf8')
const credentials = {key: privateKey, cert: certificate}

const app = express()

app.use(morgan('combined'))
app.use(bodyParser.json())

const httpsServer = https.createServer(credentials, app)
httpsServer.listen(8443, () => {
    console.log('Listening')
})