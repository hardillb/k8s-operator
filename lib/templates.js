const podTemplate = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
        // name: "k8s-client-test",
        labels: {
            // name: "k8s-client-test",
            nodered: 'true'
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

module.exports = {
    podTemplate
}