const fs = require('fs')
const csv = require('csv-parser')
const converter = require('json-2-csv');

const packageAccounts = [];
const packageSubscriptions = [];
const depositAccounts = [];
const accountBalances = [];
const depositTransactions = [];
const customers = [];
const acctCustomerRels = [];

module.exports = {
  preprocessOCV: function(filename,customerfile,acctcustomer){
  fs.createReadStream(filename)
   .pipe(csv())
   .on('data', function (row) {

     const customer = {           
     CONT_ID: row.CONT_ID,
     START_DT: row.START_DT,
     END_DT: row.END_DT,
     CLIENT_STATUS_TP_CD:row.CLIENT_STATUS_TP_CD,
     BIRTH_DT: row.BIRTH_DT,
     XEMPLOYEE_INDICATOR: row.XEMPLOYEE_INDICATOR
      }
      customers.push(customer)

      const acctCustomerRel = {        
      ACCT_ID: row.ACCT_ID,
      CONT_ID: row.CONT_ID,
      PARTY_RELATIONSHIP_ROLE: row.PARTY_RELATIONSHIP_ROLE
     }
      acctCustomerRels.push(acctCustomerRel)

   })
   .on('end', function () {
   
      converter.json2csv(customers, (err,csv) => {
          if (err) {
            throw err;
          }
          fs.writeFileSync(customerfile, csv)
      })
      converter.json2csv(acctCustomerRels, (err,csv) => {
          if (err) {
            throw err;
          }
          fs.writeFileSync(acctcustomer, csv)
      })
     
     
      })
 },

 preprocessX784092: function(filename,targetfile){
 fs.createReadStream(filename)
  .pipe(csv())
  .on('data', function (row) {
    
     const depositTransaction = {  
     X784092_HFR_ACCT_NUMBER: row.X784092_HFR_ACCT_NUMBER,
     X784095_CAP_TRAN_CODE: row.X784095_CAP_TRAN_CODE,
     X784095_TXN_AMOUNT: row.X784095_TXN_AMOUNT,
     X784095_TRAN_TYPE: row.X784095_TRAN_TYPE,
     X784095_TXN_EFF_DATE: row.X784095_TXN_EFF_DATE ,
     X784095_CTM_CHANNEL_CODE: row.X784095_CTM_CHANNEL_CODE,
     X784095_AUX_DOM: row.X784095_AUX_DOM,
     X784095_EX_AUX_DOM: row.X784095_EX_AUX_DOM,
     X784095_TRACE_ID: row.X784095_TRACE_ID,
     X784095_STMT_DESC: row.X784095_STMT_DESC   
     }
     depositTransactions.push(depositTransaction)
  })
  .on('end', function () {
  
     converter.json2csv(depositTransactions, (err,csv) => {
         if (err) {
           throw err;
         }
         fs.writeFileSync(targetfile, csv)
     })
           
     })
},

preprocessX784219: function (filename,depositaccount,packageaccount,packagesubscription,accountbalance){
fs.createReadStream(filename)
  .pipe(csv())
  .on('data', function (row) {
    
    
    const packageAccount = {           
     X784219_KEY: row.X784219_KEY,
     SUBSCRIPTION_ID: row.PACKAGE_SUBSCRIPTION_IDENTIFIER,
     CODE: row.PACKAGE_ACCOUNT_ACTION_CODE,
     DATE:row.PACKAGE_ACCOUNT_ACTION_DATE
     }
     packageAccounts.push(packageAccount)

     const packageSubscription = {        
     X784219_KEY: row.X784219_KEY,
     X784219_SV_CHG_CYCLE_CODE: row.X784219_SV_CHG_CYCLE_CODE,
     SUBSCRIPTION_IDENTIFIER: row.PACKAGE_SUBSCRIPTION_IDENTIFIER,
     SUBSCRIPTION_DATE:row.PACKAGE_SUBSCRIPTION_IDENTIFIER,
     PACKAGE_CODE:row.PACKAGE_SUBSCRIPTION_CODE,
     ACTION_CODE:row.PACKAGE_SUBSCRIPTION_ACTION_CODE
     }
     packageSubscriptions.push(packageSubscription)

     const depositAccount = {
     X784219_KEY: row.X784219_KEY,
     X784219_PRDCT_CODE: row.X784219_PRDCT_CODE,
     X784219_ACT_STATUS: row.X784219_ACT_STATUS,
     X784219_DATE_OPENED: row.X784219_DATE_OPENED,
     X784219_DATE_CLOSED: row.X784219_DATE_CLOSED,
     X784219_BSB: row.X784219_BSB,
     X784219_AU_ATO_ACCOUNT_TYPE: row.X784219_AU_ATO_ACCOUNT_TYPE,
     X784219_SV_CHG_CYCLE_CODE: row.X784219_SV_CHG_CYCLE_CODE,
     X784219_DATE_LAST_SUBPRDCT_CHG: row.X784219_DATE_LAST_SUBPRDCT_CHG
     }
     depositAccounts.push(depositAccount)

     const accountBalance = {
     X784219_KEY: row.X784219_KEY,
     X784219_PROCESS_DATE: row.X784219_PROCESS_DATE,
     X784219_CURRENT_BALANCE: row.X784219_CURRENT_BALANCE,
     X784219_PRIOR_AVG_BALANCE_CTD: row.X784219_PRIOR_AVG_BALANCE_CTD
     }
     accountBalances.push(accountBalance)

  })
  .on('end', function () {
  
     converter.json2csv(accountBalances, (err,csv) => {
         if (err) {
           throw err;
         }
         fs.writeFileSync(accountbalance, csv)
     })
     converter.json2csv(depositAccounts, (err,csv) => {
         if (err) {
           throw err;
         }
         fs.writeFileSync(depositaccount, csv)
     })
     converter.json2csv(packageAccounts, (err,csv) => {
         if (err) {
           throw err;
         }
         fs.writeFileSync(packageaccount, csv)
     })
     converter.json2csv(packageSubscriptions, (err,csv) => {
         if (err) {
           throw err;
         }
         fs.writeFileSync(packagesubscription, csv)
     })
    
     })
}
}




    
    
















