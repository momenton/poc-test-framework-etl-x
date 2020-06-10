'use strict'
const utils = require('@utils')
const processfiles = require('@processfiles')
const path = require('path')
const moment = require('moment')
const today = `20200605`//moment().format('YYYYMMDD') // `20200521`
const testData = process.env.TEST_DATA

const dirName = testData + 'batchFiles' // path.resolve('data/dev/batchFiles')
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

// let inputfileArr = []
let inputfileArray = []
let outputfileArray = []

describe('ETL tests', () => {
  beforeAll( () => {
    jest.setTimeout(20000)
    processfiles.preprocessX784219(path.resolve(testData + 'X784219.csv'),path.resolve(testData + 'deposit_account.csv'),path.resolve(testData + 'package_account.csv'),path.resolve(testData + 'package_subscription.csv'),path.resolve(testData + 'account_balance.csv'))
    processfiles.preprocessX784092(path.resolve(testData + 'X784092.csv'),path.resolve(testData + 'deposit_transaction.csv'))
    processfiles.preprocessOCV(path.resolve(testData + 'ocv.csv'),path.resolve(testData + 'customer.csv'),path.resolve(testData + 'acc_cust_rel.csv'))
    
  })
  

  describe('Directory check for correctness', () => {
    beforeEach(() => {
      reporter
        .epic('ABT-5406 - ETL - Construct Batch Files for Zafin to Consume')
        .feature(
          'ABT-5405 - ETL: Workflow & Integration into Zafin & Rest of Bank'
        )
        .story('ABT-8685 - ETL - Include all MLP files in Zafin Input file')
    })

    let arrayOfFiles = []
    test('Directory check for correctness - 18 files', () => {
      reporter.description(
        'check to see if number of files for Zafin to read is 18'
      )
      expect(utils.getAllDirFiles(dirName, arrayOfFiles).length).toEqual(18)
    })
    test('Name of files should follow naming convention', () => {
      reporter.description(
        'check to see if all MLP files follow the naming convention'
      )
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
    beforeEach(() => {
      reporter
        .epic('ABT-5406 - ETL - Construct Batch Files for Zafin to Consume')
        .feature(
          'ABT-5405 - ETL: Workflow & Integration into Zafin & Rest of Bank'
        )
        .story('ABT-5414 - ETL - Customer Input Data - Zafin Batch File')
    })

    test('date format in output header should be YYYYMMDD', () => {
      reporter.description('to check if file has correct date format in header')
      var datecheck = utils.validDateFormat(outputfileArray[0][1])

      expect(datecheck).toBeTruthy()
    })

    test('Header of output file "#|YYYYMMDD|no of records ,"', () => {
      reporter.description('to check if header is in correct format')
      const headerOutput = outputfileArray[0].toString()
      const expHeader =
        '#,' + outputfileArray[0][1] + ',' + (outputfileArray.length - 1)
      expect(headerOutput).toEqual(expHeader)
    })

    test('Number of records in Input and output file should be equal', () => {
      reporter.description(
        'to check if number of records in input file and transformed file are same'
      )
      expect(outputfileArray.length).toBe(inputfileArray.length)
    })
    test('Number of columns in output file should be 10', () => {
      reporter.description(
        'to check if number of columns in transformed file is 10'
      )
      const columnCheck = utils.numberOfColumns(outputfileArray, 10)
      expect(columnCheck).toBeTruthy()
    })

    test('mapping of input file to output file should be correct', () => {
      reporter.description(
        'to check if mapping rules are followed correctly during transformation'
      )
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
      reporter.description(
        'to check if all the unmapped columns are blank in transformed file'
      )
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
      reporter.description(
        'to check if all the mandatory columns are populated in transformed file'
      )
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
      outputfileArray = await utils.arraySort(outputfileArray, 0)
      inputfileArray = await utils.arraySort(inputfileArray, 0)
    })
    beforeEach(() => {
      reporter
        .epic('ABT-5406 - ETL - Construct Batch Files for Zafin to Consume')
        .feature(
          'ABT-5405 - ETL: Workflow & Integration into Zafin & Rest of Bank'
        )
        .story(
          'ABT-5415 - ETL - Deposit Account Information - Zafin Batch File'
        )
    })

    test('date format in output header should be YYYYMMDD', () => {
      reporter.description('to check if file has correct date format in header')
      var datecheck = utils.validDateFormat(outputfileArray[0][1])

      expect(datecheck).toBeTruthy()
    })
    test('Header of output file "#|YYYYMMDD|no of records ,"', () => {
      reporter.description('to check if header is in correct format')
      const headerOutput = outputfileArray[0].toString()
      const expHeader =
        '#,' + outputfileArray[0][1] + ',' + (inputfileArray.length - 1)
      expect(headerOutput).toEqual(expHeader)
    })
    test('Number of records in Input and output file should be equal', () => {
      reporter.description(
        'to check if number of records in input file and transformed file are same'
      )
      const rowsInput = inputfileArray.length
      const rowsOutput = outputfileArray.length
      expect(rowsOutput).toBe(rowsInput)
    })
    test('Number of columns in output file should be eighteen', () => {
      reporter.description(
        'to check if number of columns in transformed file is 18'
      )
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
      reporter.description(
        'to check if mapping rules are followed correctly during transformation'
      )
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
      reporter.description(
        'to check if all the unmapped columns are blank in transformed file'
      )
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
      inputfileArray = await utils.arraySort(inputfileArray, 0)
      outputfileArray = await utils.arraySort(outputfileArray, 0)
    })
    beforeEach(() => {
      reporter
        .epic('ABT-5406 - ETL - Construct Batch Files for Zafin to Consume')
        .feature(
          'ABT-5405 - ETL: Workflow & Integration into Zafin & Rest of Bank'
        )
        .story(
          'ABT-5413 - ETL - Account to Customer Relationship Information - Zafin Batch File'
        )
    })

    test('date format in output header should be YYYYMMDD', () => {
      reporter.description('to check if file has correct date format in header')
      var datecheck = utils.validDateFormat(outputfileArray[0][1])
      expect(datecheck).toBeTruthy()
    })
    test('Header of output file "#|YYYYMMDD|no of records ,"', () => {
      reporter.description('to check if header is in correct format')
      const headerOutput = outputfileArray[0].toString()
      const noOfRecords =
        outputfileArray.length > 1 ? outputfileArray.length - 1 : 0
      const expHeader = '#,' + outputfileArray[0][1] + ',' + noOfRecords
      expect(headerOutput).toEqual(expHeader)
    })
    test('Number of records in Input and output file should be equal', () => {
      reporter.description(
        'to check if number of records in input file and transformed file are same'
      )
      const rowsInput = inputfileArray.length
      const rowsOutput = outputfileArray.length
      expect(rowsOutput).toBe(rowsInput)
    })
    test('Number of columns in output file should be three', () => {
      reporter.description(
        'to check if number of columns in transformed file is 3'
      )

      const columnCheck = utils.numberOfColumns(outputfileArray, 3)
      expect(columnCheck).toBeTruthy()
    })
    test('mapping of input file to output file should be correct:Party Relationship Role - SOL -> SOLE, COO -> NON_PRIMARY, COF -> NON_PRIMARY , PRI->PRIMARY ', () => {
      reporter.description(
        'to check if mapping rules are followed correctly during transformation'
      )
      const mappingCheck = utils.mappingAcctCustRel(
        3,
        outputfileArray,
        inputfileArray
      )
      expect(mappingCheck).toBeTruthy()
    })
    test('mandatory columns of the file should be populated', () => {
      reporter.description(
        'to check if all the mandatory columns are populated in transformed file'
      )
      const mappingCheck = utils.mandatoryColCheck(
        3,
        [0, 1, 2],
        outputfileArray
      )
      expect(mappingCheck).toBeTruthy()
    })
  })

  describe('File comparison tests of empty input file', () => {
    // prepare output.dat file for comparison
    beforeAll(async () => {
      const outputFileName = 'BRANCH_' + today + '.DAT'
      // utils.checkFile(csvfileOutput)
      const csvfileInput = path.resolve(testData + 'branch.csv')
      const csvfileOutput = path.resolve(testData + 'branch.csv')
      const srcOutputFile = utils
        .getFilePath(dirName, outputFileName)
        .toString()
      await utils.convertTocsv(srcOutputFile, csvfileOutput)
      inputfileArray = await utils.csvToArray(csvfileInput)
      outputfileArray = await utils.csvToArray(csvfileOutput)
      inputfileArray = await utils.arraySort(inputfileArray, 0)
      outputfileArray = await utils.arraySort(outputfileArray, 0)
    })
    beforeEach(() => {
      reporter
        .epic('ABT-5406 - ETL - Construct Batch Files for Zafin to Consume')
        .feature(
          'ABT-5405 - ETL: Workflow & Integration into Zafin & Rest of Bank'
        )
        .story('ABT-8684 - ETL - Test - Include tests for empty files')
    })

    test('date format in output header should be YYYYMMDD', () => {
      reporter.description('to check if file has correct date format in header')
      var datecheck = utils.validDateFormat(outputfileArray[0][1])
      expect(datecheck).toBeTruthy()
    })
    test('Header of output file "#|YYYYMMDD|no of records ,"', () => {
      reporter.description('to check if header is in correct format')
      const headerOutput = outputfileArray[0].toString()
      const noOfRecords =
        outputfileArray.length > 1 ? outputfileArray.length - 1 : 0
      const expHeader = '#,' + outputfileArray[0][1] + ',' + noOfRecords
      expect(headerOutput).toEqual(expHeader)
    })
    test('Number of records in Input and output file should be 0', () => {
      reporter.description(
        'to check if number of records in input file and transformed file are same'
      )
      const rowsInput = inputfileArray.length
      const rowsOutput = outputfileArray.length
      expect(rowsOutput).toBe(rowsInput)
    })
  })

  describe('File comparison tests of Account Balance information file', () => {
    beforeAll(async () => {
      const outputFileName = 'ACCOUNT_BALANCE_' + today + '.DAT'
      // const inputFile = path.resolve(testData + 'account_balance_fw.txt')
      const csvfileInput = path.resolve(testData + 'account_balance.csv')
      // await utils.fwTocsv(inputFile, csvfileInput)
      // await utils.getFile(csvfileInput, 1000)
      const csvfileOutput = path.resolve(testData + 'account_balanceOutput.csv')
      const srcOutputFile = utils
        .getFilePath(dirName, outputFileName)
        .toString()

      await utils.convertTocsv(srcOutputFile, csvfileOutput)

      outputfileArray = await utils.csvToArray(csvfileOutput)
      inputfileArray = await utils.csvToArray(csvfileInput)
      // inputfileArray = await utils.deleteRow(inputfileArr, inputfileArr.length)
      inputfileArray = await utils.arraySort(inputfileArray, 0)
      outputfileArray = await utils.arraySort(outputfileArray, 0)
    })
    beforeEach(() => {
      reporter
        .epic('ABT-5406 - ETL - Construct Batch Files for Zafin to Consume')
        .feature(
          'ABT-5405 - ETL: Workflow & Integration into Zafin & Rest of Bank'
        )
        .story(
          'ABT-5412 - ETL-Account Balance Detail Information - Zafin Batch File'
        )
    })
    test('date format in output header should be YYYYMMDD', () => {
      reporter.description('to check if file has correct date format in header')
      var datecheck = utils.validDateFormat(outputfileArray[0][1])
      expect(datecheck).toBeTruthy()
    })
    test('Header of output file "#|YYYYMMDD|no of records ,"', () => {
      reporter.description('to check if header is in correct format')
      const headerOutput = outputfileArray[0].toString()
      const noOfRecords =
        outputfileArray.length > 1 ? outputfileArray.length - 1 : 0
      const expHeader = '#,' + outputfileArray[0][1] + ',' + noOfRecords
      expect(headerOutput).toEqual(expHeader)
    })
    test('Number of records in Input and output file should be equal', () => {
      reporter.description(
        'to check if number of records in input file and transformed file are same'
      )
      const rowsInput = inputfileArray.length
      const rowsOutput = outputfileArray.length
      expect(rowsOutput).toBe(rowsInput)
    })
    test('Number of columns in output file should be 6', () => {
      reporter.description(
        'to check if number of columns in transformed file is 6'
      )
      const columnCheck = utils.numberOfColumns(outputfileArray, 6)
      expect(columnCheck).toBeTruthy()
    })

    test('mapping of input file to output file should be correct', () => {
      reporter.description(
        'to check if mapping rules are followed correctly during transformation'
      )
      const mappingCheck = utils.mappingAccountBalance(
        6,
        outputfileArray,
        inputfileArray
      )
      expect(mappingCheck).toBeTruthy()
    })
    test(`Unmapped columns of output file should be blank`, () => {
      reporter.description(
        'to check if all the unmapped columns are blank in transformed file'
      )
      const blankColCheck = utils.blankColCheck(6, [], outputfileArray)
      expect(blankColCheck).toBeTruthy()
    })
    test(`mandatory columns of the file should be populated`, () => {
      reporter.description(
        'to check if all the mandatory columns are populated in transformed file'
      )
      const mappingCheck = utils.mandatoryColCheck(
        6,
        [0, 1, 2, 3],
        outputfileArray
      )
      expect(mappingCheck).toBeTruthy()
    })
  })


describe('File comparison tests of Package subscription information file', () => {
  // prepare output.dat file for comparison
  beforeAll(async () => {
    const outputFileName = 'PACKAGE_SUBSCRIPTION_' + today + '.DAT'
    // utils.checkFile(csvfileOutput)
    const csvfileInput = path.resolve(testData + 'package_subscription.csv')
    const csvfileOutput = path.resolve(
      testData + 'package_subscriptionOutput.csv'
    )
    const srcOutputFile = utils.getFilePath(dirName, outputFileName).toString()
    await utils.convertTocsv(srcOutputFile, csvfileOutput)
    inputfileArray = await utils.csvToArray(csvfileInput)
    outputfileArray = await utils.csvToArray(csvfileOutput)
    inputfileArray = await utils.arraySort(inputfileArray, 0)
    outputfileArray = await utils.arraySort(outputfileArray, 4)
  })
  beforeEach(() => {
    reporter
      .epic('ABT-5406 - ETL - Construct Batch Files for Zafin to Consume')
      .feature(
        'ABT-5405 - ETL: Workflow & Integration into Zafin & Rest of Bank'
      )
      .story(
        'ABT-5418 - ETL - Package Subscription Information - Zafin Batch File'
      )
  })

  test('date format in output header should be YYYYMMDD', () => {
    var datecheck = utils.validDateFormat(outputfileArray[0][1])
    expect(datecheck).toBeTruthy()
  })
  test('Header of output file "#|YYYYMMDD|no of records ,"', () => {
    const headerOutput = outputfileArray[0].toString()
    const noOfRecords =
      outputfileArray.length > 1 ? outputfileArray.length - 1 : 0
    const expHeader = '#,' + outputfileArray[0][1] + ',' + noOfRecords
    expect(headerOutput).toEqual(expHeader)
  })
  test('Number of records in Input and output file should be equal', () => {
    const rowsInput = inputfileArray.length
    const rowsOutput = outputfileArray.length
    expect(rowsOutput).toBe(rowsInput)
  })
  test('Number of columns in output file should be 6', () => {
    const columnCheck = utils.numberOfColumns(outputfileArray, 6)
    expect(columnCheck).toBeTruthy()
  })

  test('mapping of input file to output file should be correct', () => {
    const mappingCheck = utils.mappingPackageSubscription(
      6,
      6,
      outputfileArray,
      inputfileArray
    )
    expect(mappingCheck).toBeTruthy()
  })
  test(`Unmapped columns of output file should be blank`, () => {
    const blankColCheck = utils.blankColCheck(6, [], outputfileArray)
    expect(blankColCheck).toBeTruthy()
  })
  test(`mandatory columns of the file should be populated`, () => {
    const mappingCheck = utils.mandatoryColCheck(6, [], outputfileArray)
    expect(mappingCheck).toBeTruthy()
  })
})

describe('File comparison tests of Package Account file', () => {
  // prepare output.dat file for comparison
  beforeAll(async () => {
    const outputFileName = 'PACKAGE_ACCOUNT_' + today + '.DAT'
    // utils.checkFile(csvfileOutput)
    const csvfileInput = path.resolve(testData + 'package_account.csv')
    const csvfileOutput = path.resolve(testData + 'package_accountOutput.csv')
    const srcOutputFile = utils.getFilePath(dirName, outputFileName).toString()
    await utils.convertTocsv(srcOutputFile, csvfileOutput)
    inputfileArray = await utils.csvToArray(csvfileInput)
    outputfileArray = await utils.csvToArray(csvfileOutput)
    inputfileArray = await utils.arraySort(inputfileArray, 1)
    outputfileArray = await utils.arraySort(outputfileArray, 0)
  })
  beforeEach(() => {
    reporter
      .epic('ABT-5406 - ETL - Construct Batch Files for Zafin to Consume')
      .feature(
        'ABT-5405 - ETL: Workflow & Integration into Zafin & Rest of Bank'
      )
      .story('ABT-5417 - ETL - Package Account Information - Zafin Batch File')
  })

  test('date format in output header should be YYYYMMDD', () => {
    var datecheck = utils.validDateFormat(outputfileArray[0][1])
    expect(datecheck).toBeTruthy()
  })
  test('Header of output file "#|YYYYMMDD|no of records ,"', () => {
    const headerOutput = outputfileArray[0].toString()
    const noOfRecords =
      outputfileArray.length > 1 ? outputfileArray.length - 1 : 0
    const expHeader = '#,' + outputfileArray[0][1] + ',' + noOfRecords
    expect(headerOutput).toEqual(expHeader)
  })
  test('Number of records in Input and output file should be equal', () => {
    const rowsInput = inputfileArray.length
    const rowsOutput = outputfileArray.length
    expect(rowsOutput).toBe(rowsInput)
  })
  test('Number of columns in output file should be 4', () => {
    const columnCheck = utils.numberOfColumns(outputfileArray, 4)
    expect(columnCheck).toBeTruthy()
  })

  test('mapping of input file to output file should be correct', () => {
    const mappingCheck = utils.mappingPackageAccount(
      4,
      4,
      outputfileArray,
      inputfileArray
    )
    expect(mappingCheck).toBeTruthy()
  })

  test(`Unmapped columns of output file should be blank`, () => {
    const blankColCheck = utils.blankColCheck(4, [], outputfileArray)
    expect(blankColCheck).toBeTruthy()
  })
  test(`mandatory columns of the file should be populated`, () => {
    const mappingCheck = utils.mandatoryColCheck(
      4,
      [0, 1, 2, 3],
      outputfileArray
    )
    expect(mappingCheck).toBeTruthy()
  })
})

describe('File comparison tests of Deposit Transaction file', () => {
  // prepare output.dat file for comparison
  beforeAll(async () => {
    const outputFileName = 'DEPOSIT_TXN_' + today + '.DAT'
    // utils.checkFile(csvfileOutput)
    const csvfileInput = path.resolve(testData + 'deposit_transaction.csv')
    const csvfileOutput = path.resolve(testData + 'deposit_transactionOutput.csv')
    const srcOutputFile = utils.getFilePath(dirName, outputFileName).toString()
    await utils.convertTocsv(srcOutputFile, csvfileOutput)
    inputfileArray = await utils.csvToArray(csvfileInput)
    outputfileArray = await utils.csvToArray(csvfileOutput)
    inputfileArray = await utils.arraySort(inputfileArray, 1)
    outputfileArray = await utils.arraySort(outputfileArray, 0)
  })
  beforeEach(() => {
    reporter
      .epic('ABT-5406 - ETL - Construct Batch Files for Zafin to Consume')
      .feature(
        'ABT-5405 - ETL: Workflow & Integration into Zafin & Rest of Bank'
      )
      .story('ABT-5416 - ETL - Deposit Transaction Information - Zafin Batch File')
  })

  test('date format in output header should be YYYYMMDD', () => {
    var datecheck = utils.validDateFormat(outputfileArray[0][1])
    expect(datecheck).toBeTruthy()
  })
  test('Header of output file "#|YYYYMMDD|no of records ,"', () => {
    const headerOutput = outputfileArray[0].toString()
    const noOfRecords =
      outputfileArray.length > 1 ? outputfileArray.length - 1 : 0
    const expHeader = '#,' + outputfileArray[0][1] + ',' + noOfRecords
    expect(headerOutput).toEqual(expHeader)
  })
  test('Number of records in Input and output file should be equal', () => {
    const rowsInput = inputfileArray.length
    const rowsOutput = outputfileArray.length
    expect(rowsOutput).toBe(rowsInput)
  })
  test('Number of columns in output file should be 14', () => {
    const columnCheck = utils.numberOfColumns(outputfileArray, 14)
    expect(columnCheck).toBeTruthy()
  })

  test('mapping of input file to output file should be correct', () => {
    const mappingCheck = utils.mappingDepositTransaction(
      14,
      10,
      outputfileArray,
      inputfileArray
    )
    expect(mappingCheck).toBeTruthy()
  })
 

  test(`Unmapped columns of output file should be blank`, () => {
    const blankColCheck = utils.blankColCheck(14, [9,10,11,12,13], outputfileArray)
    expect(blankColCheck).toBeTruthy()
  })
  test(`mandatory columns of the file should be populated`, () => {
    const mappingCheck = utils.mandatoryColCheck(
      14,
      [0, 1, 2, 3,4],
      outputfileArray
    )
    expect(mappingCheck).toBeTruthy()
  })
})

})
