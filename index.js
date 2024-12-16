const { AppsV1Api, CoreV1Api, CustomObjectsApi, KubeConfig, NetworkingV1Api, Watch } = require('@kubernetes/client-node')

const { podTemplate } = require('./lib/templates.js')

const group = 'k8s.hardill.me.uk'
const version = 'v1'
const plural = 'randoms'

const kubeConfig = new KubeConfig();
// kubeConfig.loadFromDefault();
kubeConfig.loadFromFile('/etc/rancher/k3s/k3s.yaml')
const watch = new Watch(kubeConfig)

const k8sApi = kubeConfig.makeApiClient(CoreV1Api)
const k8sAppApi = kubeConfig.makeApiClient(AppsV1Api)
const k8sNetApi = kubeConfig.makeApiClient(NetworkingV1Api)



async function watching () {
    const req = await watch.watch('/apis/k8s.hardill.me.uk/v1/namespaces//randoms',
        {
            // allowWatchBookmarks: true
        },
        async (type, api, obj) => {
            switch (type) {
                case 'ADDED':
                    // create pod
                    const localPod = JSON.parse(JSON.stringify(podTemplate))
                    localPod.metaData.name = `${api.metadata.name}-node-red`
                    console.log(JSON.stringify(localPod, null, 2))
                    k8sApi.createNamespacedPod(api.metadata.namespace, localPod)
                case 'MODIFIED':
                case 'DELETED':
                    // delete pod
            }
            console.log(type)
            // console.log(JSON.stringify(api, null, 2))
        },
        (err) => {
            console.log(err)
        }
    )
}

watching()
