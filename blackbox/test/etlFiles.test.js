'use strict'

const utils = require('@utils')
const path = require('path')
const moment = require('moment')
const today = moment().format('YYYYMMDD')

const downlaodOptionsfolder = {
  destination: path.resolve('data/encryptedFolder')
}

const downlaodOptionskey = {
  destination: path.resolve('data/key-private.asc')
}

const encryptedFolder = path.resolve('data/encryptedFolder')
const privateKeyfile = path.resolve('data/key-private.asc')
const decryptedFolder = path.resolve('data/decryptedZip.zip')
const passphrase = 'pass1234'
const dirName = path.resolve('data/batchFiles')
let inputfileArray = []
let outputfileArr = []
let outputfileArray = []

describe('ETL tests', () => {
  /*
  beforeAll(async () => {
    
    await utils.downloadFile(
      process.env.GS_KEY,
      process.env.GS_BUCKET_ENCRYPTED,
      'target/INPUT_20200513.asc',
      downlaodOptionsfolder
    )
    await utils.downloadFile(
      process.env.GS_KEY,
      process.env.GS_BUCKET_ENCRYPTED,
      'source/resources/key-private.asc',
      downlaodOptionskey
    )

    await utils.decryptFile(
      encryptedFolder,
      privateKeyfile,
      passphrase,
      decryptedFolder
    )
    await utils.unzipFolder(decryptedFolder, dirName)
    
  })
  */
  describe('File comparison tests of customer file', () => {
 
    beforeAll(async () => {
       
      const downlaodOptionsinput = {
        destination: path.resolve('data/customer.csv')
      }
      const inputFileName = 'source/customer.csv'
      const outputFileName = `CUSTOMER_20200513.dat`
      await utils.downloadFile(
        process.env.GS_KEY,
        process.env.GS_BUCKET_NAME_INPUT,
        inputFileName,
        downlaodOptionsinput
      )
      
      const csvfileInput = path.resolve('data/customer.csv')
      const csvfileOutput = path.resolve('data/customerOutput.csv')
      const srcOutputFile = utils
        .getFilePath(dirName, outputFileName)
        .toString()
      await utils.convertTocsv(srcOutputFile, csvfileOutput)
      inputfileArray = await utils.csvToArray(csvfileInput)
      outputfileArray = await utils.csvToArray(csvfileOutput)
      // outputfileArray = utils.deleteRow(outputfileArr, outputfileArr.length)
      outputfileArray = outputfileArray.sort(utils.sortAlphaNum)
      inputfileArray = inputfileArray.sort(utils.sortAlphaNum)

    })

    test('date format in output header should be YYYYMMDD', () => {
      var datecheck = utils.validDateFormat(outputfileArray[0][1])

      expect(datecheck).toBeTruthy()
    })

    test('Header of output file "#|YYYYMMDD|no of records ,"', () => {
      const headerOutput = outputfileArray[0].toString()
      const expHeader =
        '#,' + outputfileArray[0][1] + ',' + (inputfileArray.length - 1)
      expect(headerOutput).toEqual(expHeader)
    })

    test('Number of records in Input and output file should be equal', () => {
      expect(outputfileArray.length).toBe(inputfileArray.length)
    })
    test('Number of columns in output file should be 10', () => {
      const columnCheck = utils.numberOfColumns(outputfileArray, 10)
      expect(columnCheck).toBeTruthy()
    })

    test('mapping of input file to output file should be correct', () => {
      const mappingCheck = utils.mappingCustomer(
        10,
        6,
        outputfileArray,
        inputfileArray
      )
      expect(mappingCheck).toBeTruthy()
    })
    test('Unmapped columns of output file should be blank', () => {
      
      const blankColCheck = utils.blankColCheck(10,[6,7,8,9], outputfileArray)
      expect(blankColCheck).toBeTruthy()
    })
  })
  describe('File comparison tests of deposit_account file', () => {
    beforeAll(async () => {
      const downlaodOptionsinput = {
        destination: path.resolve('data/deposit_account.csv')
      }
      const inputFileName = 'source/deposit_account.csv'
      const outputFileName = 'DEPOSIT_ACCOUNT_20200513.dat'
      await utils.downloadFile(
        process.env.GS_KEY,
        process.env.GS_BUCKET_NAME_INPUT,
        inputFileName,
        downlaodOptionsinput
      )
      const csvfileInput = path.resolve('data/deposit_account.csv')
      const csvfileOutput = path.resolve('data/deposit_accountOutput.csv')
      const srcOutputFile = utils.getFilePath(dirName, outputFileName).toString()
      await utils.convertTocsv(srcOutputFile, csvfileOutput)
      inputfileArray = await utils.csvToArray(csvfileInput)
      outputfileArray = await utils.csvToArray(csvfileOutput)
      // outputfileArray = utils.deleteRow(outputfileArr, outputfileArr.length)
      outputfileArray = await utils.arraySort(outputfileArray)
      inputfileArray = await utils.arraySort(inputfileArray)
    })

    test('date format in output header should be YYYYMMDD', () => {
      var datecheck = utils.validDateFormat(outputfileArray[0][1])

      expect(datecheck).toBeTruthy()
    })
    test('Header of output file "#|YYYYMMDD|no of records ,"', () => {
      const headerOutput = outputfileArray[0].toString()
      const expHeader =
        '#,' + outputfileArray[0][1] + ',' + (inputfileArray.length - 1)
      expect(headerOutput).toEqual(expHeader)
    })
    test('Number of records in Input and output file should be equal', () => {
      const rowsInput = inputfileArray.length
      const rowsOutput = outputfileArray.length
      expect(rowsOutput).toBe(rowsInput)
    })
    test('Number of columns in output file should be eighteen', () => {
      const columnCheck = utils.numberOfColumns(outputfileArray, 18)
      expect(columnCheck).toBeTruthy()
    })
    test(`mapping of input file to output file should be correct:
    X784219_KEY	--> ACCOUNT IDENTIFIER_
    X784219_PRDCT_CODE	--> PRODUCT CODE_
    X784219_ACT_STATUS	--> STATUS_
    X784219_DATE_OPENED	--> OPENING DATE_
    X784219_DATE_CLOSED	--> CLOSING DATE_
    X784219_BSB	--> BRANCH IDENTIFIER_
    X784219_AU_ATO_ACCOUNT_TYPE	--> RETIREMENT ACCOUNT_
    X784219_SV_CHG_CYCLE_CODE	--> DAY OF THE MONTH_
    X784219_DATE_LAST_SUBPRDCT_CHG -->	LAST CONVERSION DATE_`, () => {
      const mappingCheck = utils.mappingDepositAct(
        18,
        outputfileArray,
        inputfileArray
      )
      expect(mappingCheck).toBeTruthy()
    })
    test(`Unmapped columns of output file should be blank:
    FIRST FINANCIAL ACTIVITY DATE_
    OVERDRAWN DATE_
    PAYROLL ACCOUNT_
    ACCOUNT COHORT_
    ACCOUNT CYCLE END DATE_
    GOOD STANDING_
    REGION CODE_
    PRODUCT CODE_`, () => {
      const blankColCheck = utils.blankColCheck(18, [4,5,9,10,13,14,16,17], outputfileArray)
      expect(blankColCheck).toBeTruthy()
    })
  })
  describe('File comparison tests of account-customer-relationship file', () => {
    // prepare output.dat file for comparison
    beforeAll(async () => {
      const downlaodOptionsinput = {
        destination: path.resolve('data/account_cust_rel.csv')
      }
      const inputFileName = 'source/account_customer_relationship.csv'
      const outputFileName = `ACCT_CUST_REL_20200513.dat`
      await utils.downloadFile(
        process.env.GS_KEY,
        process.env.GS_BUCKET_NAME_INPUT,
        inputFileName,
        downlaodOptionsinput
      )
      // utils.checkFile(csvfileOutput)
      const csvfileInput = path.resolve('data/account_cust_rel.csv')
      const csvfileOutput = path.resolve('data/acc_cust_relOutput.csv')
      const srcOutputFile = utils
        .getFilePath(dirName, outputFileName)
        .toString()
      console.log(srcOutputFile)
      await utils.convertTocsv(srcOutputFile, csvfileOutput)
      inputfileArray = await utils.csvToArray(csvfileInput)
      outputfileArray = await utils.csvToArray(csvfileOutput)
      inputfileArray = await utils.arraySort(inputfileArray)
      outputfileArray = await utils.arraySort(outputfileArray)
    })

    test('date format in output header should be YYYYMMDD', () => {
      var datecheck = utils.validDateFormat(outputfileArray[0][1])
      expect(datecheck).toBeTruthy()
    })
    test('Header of output file "#|YYYYMMDD|no of records ,"', () => {
      const headerOutput = outputfileArray[0].toString()
      const expHeader =
        '#,' + outputfileArray[0][1] + ',' + (inputfileArray.length - 1)
      expect(headerOutput).toEqual(expHeader)
    })
    test('Number of records in Input and output file should be equal', () => {
      const rowsInput = inputfileArray.length
      const rowsOutput = outputfileArray.length
      expect(rowsOutput).toBe(rowsInput)
    })
    test('Number of columns in output file should be three', () => {
      const columnCheck = utils.numberOfColumns(outputfileArray, 3)
      expect(columnCheck).toBeTruthy()
    })
    test('mapping of input file to output file should be correct:Party Relationship Role - SOL -> SOLE, COO -> NON_PRIMARY, COF -> NON_PRIMARY , PRI->PRIMARY ', () => {
      const mappingCheck = utils.mappingAcctCustRel(
        3,
        outputfileArray,
        inputfileArray
      )
      expect(mappingCheck).toBeTruthy()
    })
    test('mandatory columns of the file should be populated', () => {
      const mappingCheck = utils.mandatoryColCheck(
        3,
        [0,1,2],
        outputfileArray     
      )
      expect(mappingCheck).toBeTruthy()
    })

    
  })
})
