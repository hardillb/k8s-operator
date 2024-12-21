const podTemplate = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
        // name: "k8s-client-test",
        labels: {
            // name: "k8s-client-test",
            // nodered: 'true'
            // app: "k8s-client-test",
        }
    },
    spec: {
        securityContext: {
            runAsUser: 1000,
            runAsGroup: 1000,
            fsGroup: 1000
        },
        containers: [
            {
                resources: {
                    request: {
                        // 10th of a core
                        cpu: '100m',
                        memory: '128Mi'
                    },
                    limits: {
                        cpu: '125m',
                        memory: '192Mi'
                    }
                },
                name: 'node-red',
                // image: "docker-pi.local:5000/bronze-node-red",
                image: 'nodered/node-red:latest',
                imagePullPolicy: 'Always',
                env: [
                    // {name: "APP_NAME", value: "test"},
                    { name: 'TZ', value: 'Europe/London' }
                ],
                ports: [
                    { name: 'web', containerPort: 1880, protocol: 'TCP' }
                ],
                securityContext: {
                    allowPrivilegeEscalation: false
                }
            }
        ]
        // nodeSelector: {
        //     role: 'projects'
        // }

    },
    enableServiceLinks: false
}

const serviceTemplate = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
    },
    spec: {
        type: 'ClusterIP',
        selector: {
        },
        ports: [
            { name: 'web', port: 1880, protocol: 'TCP' }
        ]
    }
}
const ingressTemplate = {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
        annotations: process.env.INGRESS_ANNOTATIONS ? JSON.parse(process.env.INGRESS_ANNOTATIONS) : {}
    },
    spec: {
        ingressClassName: process.env.INGRESS_CLASS_NAME ? process.env.INGRESS_CLASS_NAME : null,
        rules: [
            {
                http: {
                    paths: [
                        {
                            pathType: 'Prefix',
                            path: '/',
                            backend: {
                                service: {
                                    port: { number: 1880 }
                                }
                            }
                        }
                    ]
                }
            }
        ]
    }
}

module.exports = {
    podTemplate,
    serviceTemplate,
    ingressTemplate
}