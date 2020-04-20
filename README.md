

All items in this section are to be run outside corporate network

Install Home Brew

Open a terminal window and run the following command:

/usr/bin/ruby -e 
"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

Install Dependencies

 Run the following commands:

brew install node

 node -v

 v13.11.0

 npm -v

 6.13.7


Local execution of blackbox tests

Clone the repo in local machine

  git clone https://github.com/momenton/poc-test-framework-etl-x.git

  switch to the latest branch – test-framework

  git checkout test-framework

  from the path where repo is cloned, go to blackbox directory

  cd < the path where repo is cloned>

  cd blackbox

  Install all the dependencies used 

  npm install 


To run the tests

 Get the service account key for the google cloud storage where the files are located.

It is a .json file . Save it in config folder with name – ‘gs_key.json’.

npm run test

To check prettier standard format

npm run check 


Execution of blackbox tests from ANZ network

Create a file .npmrc in /Users/<LanId> with below contents
	
registry=https://artifactory.service.anz/artifactory/api/npm/skynet-npm

strict-ssl=false

https-proxy=http://localhost:3128

proxy=http://localhost:3128

rest of the steps are same as that of local execution.


