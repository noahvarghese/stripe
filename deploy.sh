#!/bin/bash
export TWILIO_ACCOUNT_SID=$(cat ./.twilio_env | grep ACCOUNT_SID | cut -d '=' -f 2)

export TWILIO_AUTH_TOKEN=$(cat ./.twilio_env | grep AUTH_TOKEN | cut -d '=' -f 2)

cd twilio && twilio serverless:deploy