# Demo Node-RED K8s Operator

## Build/Run locally

Run the following:

```
git clone https://github.com/hardillb/k8s-operator.git
cd k8s-operator
./create-ca.sh
docker build . -t containers.hardill.me.uk/testing/node-red-operator:latest
kubectl apply -f deployment/deployment.yml
```

