'use strict'

const utils = require('@utils')
const path = require('path')
const moment = require('moment')
const today = moment().format('YYYYMMDD') // `20200521`
const testData = process.env.TEST_DATA


const dirName = testData+'batchFiles'   // path.resolve('data/dev/batchFiles')
let mlpFiles = [
  'CUSTOMER_' + today + '.DAT',
  'DEPOSIT_ACCOUNT_' + today + '.DAT',
  'ACCT_CUST_REL_' + today + '.DAT',
  'ACCOUNT_BALANCE_' + today + '.DAT',
  'BRANCH_' + today + '.DAT',
  'CREDIT_CARD_ACCOUNT_' + today + '.DAT',
  'CREDIT_CARD_TXN_' + today + '.DAT',
  'CUSTOMER_MERGE_' + today + '.DAT',
  'CUSTOMER_SERVICE_' + today + '.DAT',
  'DEPOSIT_TXN_' + today + '.DAT',
  'LOAN_ACCOUNT_' + today + '.DAT',
  'LOAN_TXN_' + today + '.DAT',
  'OFFER_ENROLLMENT_' + today + '.DAT',
  'MANUAL_EXCEPTION_' + today + '.DAT',
  'MUTUAL_FUNDS_ACCOUNT_' + today + '.DAT',
  'PACKAGE_ACCOUNT_' + today + '.DAT',
  'PACKAGE_SUBSCRIPTION_' + today + '.DAT',
  'TIME_DEPOSIT_ACCOUNT_' + today + '.DAT'
]

// let outputfileArr = []
let inputfileArray = []
let outputfileArray = []

describe('ETL tests', () => {
  jest.setTimeout(20000)

  describe.only('Directory check for correctness', () => {
    let arrayOfFiles = []
    test('Directory check for correctness - 18 files', () => {
      expect(utils.getAllDirFiles(dirName, arrayOfFiles).length).toEqual(18)
    })
    test('Name of files should follow naming convention', () => {
      arrayOfFiles = arrayOfFiles.sort()
      mlpFiles = mlpFiles.sort()
      expect(
        JSON.stringify(arrayOfFiles) === JSON.stringify(mlpFiles)
      ).toBeTruthy()
    })
  })
  describe('File comparison tests of customer file', () => {
    beforeAll(async () => {
      const outputFileName = 'CUSTOMER_' + today + '.DAT'
      const csvfileInput = path.resolve('data/dev/customer.csv')
      const csvfileOutput = path.resolve('data/dev/customerOutput.csv')
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
        '#,' + outputfileArray[0][1] + ',' + (outputfileArray.length - 1)
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
    test(`Unmapped columns of output file should be blank:
          CUSTOMER SEGMENT CODE_
          CUSTOMER COHORT CATEGORY CODE_
          CUSTOMER COHORT CODE_
          BRANCH IDENTIFIER_`, () => {
      const blankColCheck = utils.blankColCheck(
        10,
        [6, 7, 8, 9],
        outputfileArray
      )
      expect(blankColCheck).toBeTruthy()
    })
    test(`mandatory columns of the file should be populated
          CUSTOMER IDENTIFIER_
          CUSTOMER STATUS_`, () => {
      const mappingCheck = utils.mandatoryColCheck(10, [0, 3], outputfileArray)
      expect(mappingCheck).toBeTruthy()
    })
  })
  describe('File comparison tests of deposit_account file', () => {
    beforeAll(async () => {
      const outputFileName = 'DEPOSIT_ACCOUNT_' + today + '.DAT'
      const csvfileInput = path.resolve('data/dev/deposit_account.csv')
      const csvfileOutput = path.resolve('data/dev/deposit_accountOutput.csv')
      const srcOutputFile = utils
        .getFilePath(dirName, outputFileName)
        .toString()
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
      const blankColCheck = utils.blankColCheck(
        18,
        [4, 5, 9, 10, 13, 14, 16, 17],
        outputfileArray
      )
      expect(blankColCheck).toBeTruthy()
    })
  })
  describe('File comparison tests of account-customer-relationship file', () => {
    // prepare output.dat file for comparison
    beforeAll(async () => {
      const outputFileName = 'ACCT_CUST_REL_' + today + '.DAT'
      // utils.checkFile(csvfileOutput)
      const csvfileInput = path.resolve('data/dev/account_cust_rel.csv')
      const csvfileOutput = path.resolve('data/dev/acc_cust_relOutput.csv')
      const srcOutputFile = utils
        .getFilePath(dirName, outputFileName)
        .toString()
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
        [0, 1, 2],
        outputfileArray
      )
      expect(mappingCheck).toBeTruthy()
    })
  })
})
