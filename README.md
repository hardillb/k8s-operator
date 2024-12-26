# Demo Node-RED K8s Operator

## Build/Run locally

Run the following:

```bash
git clone https://github.com/hardillb/k8s-operator.git
cd k8s-operator
./create-ca.sh
docker build . -t containers.hardill.me.uk/testing/node-red-operator:latest
kubectl apply -f deployment/deployment.yml
```

## Create Instance

Create a Node-RED instance called test, with the following YAML

```yaml
apiVersion: k8s.hardill.me.uk/v1
kind: Node-RED
metadata:
  name: test
spec:
  flow: |
    [
    ]
  service:
    enabled: true
  ingress:
    enabled: true
    hostname: 'test.example.com'
```

And deploy with

```
kubectl apply -y test.yml
```