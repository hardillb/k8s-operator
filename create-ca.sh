#!/bin/bash
cd ca
rm newcerts/* ca.key ca.crt index index.* key.pem req.pem
touch index

openssl genrsa -out ca.key 4096
openssl req -new -x509 -key ca.key -out ca.crt -subj "/C=GB/ST=Gloucestershire/O=Hardill Technologies Ltd./OU=K8s CA/CN=CA" 

openssl req -new -subj "/C=GB/CN=ingress-mutator" \
    -addext "subjectAltName = DNS.1:ingress-mutator, DNS.2:ingress-mutator.default, DNS.3:ingress-mustator.default.svc, DNS.4:ingress-mutator.default.svc.cluster.local"  \
    -addext "basicConstraints = CA:FALSE" \
    -addext "keyUsage = nonRepudiation, digitalSignature, keyEncipherment" \
    -addext "extendedKeyUsage = serverAuth" \
    -newkey rsa:4096 -keyout key.pem -out req.pem \
    -nodes

openssl ca -config ./sign.conf -in req.pem -out ingress.pem -batch