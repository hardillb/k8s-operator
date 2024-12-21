const { AppsV1Api, CoreV1Api, CustomObjectsApi, KubeConfig, NetworkingV1Api, Watch } = require('@kubernetes/client-node')

const { podTemplate, serviceTemplate, ingressTemplate,  } = require('./lib/templates.js')

const group = 'k8s.hardill.me.uk'
const version = 'v1'
const plural = 'node-reds'

const kubeConfig = new KubeConfig();
// kubeConfig.loadFromDefault();
kubeConfig.loadFromFile('/etc/rancher/k3s/k3s.yaml')
const watch = new Watch(kubeConfig)

const k8sApi = kubeConfig.makeApiClient(CoreV1Api)
const k8sAppApi = kubeConfig.makeApiClient(AppsV1Api)
const k8sNetApi = kubeConfig.makeApiClient(NetworkingV1Api)



async function watching () {
    const req = await watch.watch(`/apis/${group}/v1/namespaces//${plural}`,
        {
            // allowWatchBookmarks: true
        },
        async (type, api, obj) => {
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
                        if (api.spec?.service?.enabled) {
                            const localService = JSON.parse(JSON.stringify(serviceTemplate))
                            localService.metadata.name = `${api.metadata.name}-node-red-service`
                            localService.spec.selector.name = api.metadata.name
                            k8sApi.createNamespacedService(api.metadata.namespace, localService)
                            if (api.spec?.ingress?.enabled) {
                                const localIngress = JSON.parse(JSON.stringify(ingressTemplate))
                                localIngress.metadata.name = `${api.metadata.name}-node-red-ingress`
                                localIngress.spec.rules[0].host = api.spec.ingress.hostname
                                localIngress.spec.rules[0].http.paths[0].backend.service.name = `${api.metadata.name}-node-red-service`
                                k8sNetApi.createNamespacedIngress(api.metadata.namespace, localIngress)
                            }
                        }
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
