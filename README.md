# poc-test-framework-etl-x
etl testing framework 

Prerequisite:
brew install node

node -v

v13.11.0

npm -v

6.13.7

Local execution of blackbox tests

git clone https://github.com/momenton/poc-test-framework-etl-x.git

switch to branch feature/customer-file 


cd <--the path where repo is cloned-->

cd blackbox

npm install

npm run test

npm run lint

To check prettier lint 

npm run format

for prettier format

Dev dependencies
Jest
   A library written to test HTTP calls in node.js. 

@google-cloud/storage
  A simple and easy to use test framework. It runs on Node.js and allows you to develop test cases for your program and execute them in serial with proper reporting

cross-env
  A BDD / TDD assertion library for node and the browser that can be paired with any javascript testing framework.

csv 
  Yarn is a new package manager that replaces the existing workflow for the npm client or other package managers while remaining compatible with the npm registry. It has the same feature set as existing workflows while operating faster, more securely, and more reliably

dotenv-flow
  Lodash makes JavaScript easier by taking the hassle out of working with arrays, numbers, objects, strings, etc.

husky 
  the JSON web token (JWT) is one method for allowing authentication, without actually storing any information about the user on the system itself.

prettier-standard
  This reporter is useful if we want to run Node.js backend tests using mocha and need a nicely formatted Jenkins reports of the test runs

path
  Version 4 UUID is meant for generating UUIDs from truly-random or pseudo-random numbers. UUID v4 are not giving us guaranteed unique numbers; they are somewhat practically unique.





Environment Set up


cd test_project_folder
Install NodeJs
brew install node@10
npm set strict-ssl false
Install Mocha, Chai, SuperTest, Express and Body-Parser
npm install -g mocha
npm install chai
npm install supertest
npm install express
npm install body-parser
Install yarn, lodash, jsonwebtoken and uuid/v4 




npm install -g yarn
npm i --save lodash
npm install jsonwebtoken
npm install uuid


Folder Structure
blackbox 
  In the project folder , create a folder - blackbox for ST and SIT. Create below folders in blackbox:

config 
  to save environment information.

lib 
  to store utility files.

test 
  to save ST and SIT test scripts

test-result 
  to store test results.

allure-result

data





Docker
Set up docker as per the process given in below document.

https://confluence.service.anz/pages/viewpage.action?spaceKey=OB&title=Squad+Dev+Readme#SquadDevReadme-Docker

Create entrypoint.sh to place your test runner command.

Sample:

#!/bin/bash
case $1 in
  "run")
    npm start
    ;;
  *)
    echo "usage: $0 [run]"
    exit 1
    ;;
esac




Create dockerfile that will be used on CI

Sample:

FROM ob-docker.artifactory.gcp.anz/node:7.8-slim
 
 
# app workdir
WORKDIR /app
 
COPY package.json ./
 
# allow a subsititue .npmrc file in ci
ARG npmrc=.npmrc
COPY $npmrc /root/.npmrc
COPY $npmrc ./.npmrc
 
RUN npm install mocha mocha-jenkins-reporter
RUN npm --allow-root --quiet install
 
# copy files after npm (to preserve docker layers)
COPY . ./
 
RUN useradd -ms /bin/bash entitlement && chown -R entitlement:entitlement /app
 
USER entitlement
 
# runtime configs
ENTRYPOINT ["./entrypoint.sh"]




Execution
Local execution of blackbox tests
Blackbox tests can be run from local nodeJS against the skeletonservice.

Install all required dependencies
cd blackbox
yarn
Make sure skeletonService and Postgress DB are up and running.

Run skeletonservice and DB
docker-compose run -d migrate
go run cmd/skeletonserver/main.go @cmd/skeletonserver/config/local_config.flags
Run tests
yarn test


