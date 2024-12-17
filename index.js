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
            console.log(type)
            // console.log(JSON.stringify(api, null, 2))
            switch (type) {
                case 'ADDED':
                    // need to check if already exists
                    try {
                        await k8sApi.readNamespacedPodStatus(`${api.metadata.name}-node-red`, api.metadata.namespace)
                        return
                    } catch (err) {
                        // create pod
                        const localPod = JSON.parse(JSON.stringify(podTemplate))
                        localPod.metadata.name = `${api.metadata.name}-node-red`
                        console.log(JSON.stringify(localPod, null, 2))
                        k8sApi.createNamespacedPod(api.metadata.namespace, localPod)
                    }
                    break;
                case 'MODIFIED':
                    console.log(JSON.stringify(api, null, 2))
                    break;
                case 'DELETED':
                    // delete pod
                    k8sApi.deleteNamespacedPod(`${api.metadata.name}-node-red`, api.metadata.namespace)
                    break;
            }
        },
        (err) => {
            console.log(err)
        }
    )
}

watching()
