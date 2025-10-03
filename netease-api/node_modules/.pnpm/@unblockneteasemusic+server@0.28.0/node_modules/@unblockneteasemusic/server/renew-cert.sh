#!/bin/bash

TYPE="${TYPE:-RSA}"

if [ "$TYPE" == "RSA" ]; then
	openssl genrsa -out server.key 2048
	openssl req -new -sha256 -key server.key -out server.csr -subj "/C=CN/L=Hangzhou/O=NetEase (Hangzhou) Network Co., Ltd/OU=IT Dept./CN=*.music.163.com"
	openssl x509 -req -extfile <(printf "extendedKeyUsage=serverAuth\nsubjectAltName=DNS:music.163.com,DNS:*.music.163.com") -sha256 -days 365 -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt
elif [ "$TYPE" == "ECC" ]; then
	openssl ecparam -genkey -name secp384r1 -out server.key
	openssl req -new -sha384 -key server.key -out server.csr -subj "/C=CN/L=Hangzhou/O=NetEase (Hangzhou) Network Co., Ltd/OU=IT Dept./CN=*.music.163.com"
	openssl x509 -req -extfile <(printf "extendedKeyUsage=serverAuth\nsubjectAltName=DNS:music.163.com,DNS:*.music.163.com") -sha384 -days 365 -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt
fi
