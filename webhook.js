const fs = require('fs')
const https = require('https')
const morgan = require('morgan')
const express = require('express')
const bodyParser = require('body-parser')

const { AppsV1Api, CoreV1Api, CustomObjectsApi, KubeConfig, NetworkingV1Api, Watch } = require('@kubernetes/client-node')
const { podTemplate, serviceTemplate, ingressTemplate  } = require('./lib/templates.js')

const privateKey  = fs.readFileSync('ca/key.pem', 'utf8')
const certificate = fs.readFileSync('ca/node-red.pem', 'utf8')
const credentials = {key: privateKey, cert: certificate}

const kubeConfig = new KubeConfig();
kubeConfig.loadFromDefault();
// kubeConfig.loadFromFile('/etc/rancher/k3s/k3s.yaml')
const watch = new Watch(kubeConfig)

const k8sApi = kubeConfig.makeApiClient(CoreV1Api)
const k8sAppApi = kubeConfig.makeApiClient(AppsV1Api)
const k8sNetApi = kubeConfig.makeApiClient(NetworkingV1Api)

const app = express()

app.use(morgan('combined'))
app.use(bodyParser.json())

app.post('/create', async (request, response) => {
    // console.log(JSON.stringify(request.body,null, 2))
    const admissionReview = request.body
    const answer = {
        apiVersion: admissionReview.apiVersion,
        kind: admissionReview.kind,
        response: {
            uid: admissionReview.request.uid,
            allowed: true
        }
    }

    const type = admissionReview.request.operation

    console.log(type)

    switch (type) {
        case 'CREATE':
            try {
                const localPod = JSON.parse(JSON.stringify(podTemplate))
                localPod.metadata.name = `${admissionReview.request.name}-node-red`
                await k8sApi.createNamespacedPod(admissionReview.request.namespace, localPod)
                const object = admissionReview.request.object
                console.log(JSON.stringify(object,null, 2))
                if (object.spec?.service?.enabled) {
                    const localService = JSON.parse(JSON.stringify(serviceTemplate))
                    localService.metadata.name = `${admissionReview.request.name}-node-red-service`
                    localService.spec.selector.name = admissionReview.request.name
                    await k8sApi.createNamespacedService(admissionReview.request.namespace, localService)
                    if (object.spec?.ingress?.enabled) {
                        const localIngress = JSON.parse(JSON.stringify(ingressTemplate))
                        localIngress.metadata.name = `${admissionReview.request.name}-node-red-ingress`
                        localIngress.spec.rules[0].host = object.spec.ingress.hostname
                        localIngress.spec.rules[0].http.paths[0].backend.service.name = `${admissionReview.request.name}-node-red-service`
                        await k8sNetApi.createNamespacedIngress(admissionReview.request.namespace, localIngress)
                    }
                }
            } catch (err) {
                console.log(err)
            } 
            break;
        case 'DELETE':
            try {
                await k8sNetApi.deleteNamespacedIngress(`${admissionReview.request.name}-node-red-ingress`, admissionReview.request.namespace)
            } catch (err) {
                console.log(err)
            }
            try {
                await k8sApi.deleteNamespacedService(`${admissionReview.request.name}-node-red-service`, admissionReview.request.namespace)
            } catch (err) {
                console.log(err)
            }
            try {
                await k8sApi.deleteNamespacedPod(`${admissionReview.request.name}-node-red`, admissionReview.request.namespace)
            } catch (err) {
                console.log(err)
            }
            break;
    }


    response.send(answer)
})

const httpsServer = https.createServer(credentials, app)
httpsServer.listen(8443, () => {
    console.log('Listening')
})