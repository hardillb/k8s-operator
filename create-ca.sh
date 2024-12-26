#!/bin/bash
cd ca
rm newcerts/* ca.key ca.crt index index.* key.pem req.pem
touch index

openssl genrsa -out ca.key 4096
openssl req -new -x509 -key ca.key -out ca.crt -subj "/C=GB/ST=Gloucestershire/O=Hardill Technologies Ltd./OU=K8s CA/CN=CA" 

openssl req -new -subj "/C=GB/CN=node-red" \
    -addext "subjectAltName = DNS.1:node-red, DNS.2:node-red.default, DNS.3:node-red.default.svc, DNS.4:node-red.default.svc.cluster.local"  \
    -addext "basicConstraints = CA:FALSE" \
    -addext "keyUsage = nonRepudiation, digitalSignature, keyEncipherment" \
    -addext "extendedKeyUsage = serverAuth" \
    -newkey rsa:4096 -keyout key.pem -out req.pem \
    -nodes

openssl ca -config ./sign.conf -in req.pem -out node-red.pem -batch

CABUNDLE=$(base64 -w 0 ca/ca.crt)
sed -i "s/CABUNDLE/$CABUNDLE/" deployment/deployment.yml