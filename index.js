const { CustomObjectsApi, KubeConfig, Watch } = require('@kubernetes/client-node')

const group = 'k8s.hardill.me.uk'
const version = 'v1'
const plural = 'randoms'

const kubeConfig = new KubeConfig();
kubeConfig.loadFromDefault();
const watch = new Watch(kubeConfig)

async function watching () {
    const req = await watch.watch('/apis/k8s.hardill.me.uk/v1/namespaces/*/randoms',
        {},
        async (type, api, obj) => {
            switch (type) {
                case 'ADDED':
                case 'MODIFIED':
                case 'DELETED':
            }
            console.log(type)
            console.log(api)
        },
        (err) => {
            console.log(err)
        }
    )
}

watching()
