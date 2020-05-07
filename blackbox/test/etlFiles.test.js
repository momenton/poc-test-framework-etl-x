'use strict'

const utils = require('@utils')
const path = require('path')

const downlaodOptionsfolder = {
  destination: path.resolve('data/encryptedFolder')
}
/*
const downlaodOptionskey = {
  destination: path.resolve('data/encryptedKey')
}
*/
const encryptedFolder = path.resolve('data/encryptedFolder')
const privateKeyfile = path.resolve('data/key-private.asc')
const decryptedFolder = path.resolve('data/decryptedZip.zip')
const passphrase = 'pass1234'
const dirName = path.resolve('data/batchFiles')
let inputfileArray = []
let outputfileArr = []
let outputfileArray = []

describe('ETL tests', () => {
  beforeAll(async () => {
    await utils.downloadFile(
      process.env.GS_KEY,
      process.env.GS_BUCKET_ENCRYPTED,
      'INPUT_20200421.ZIP.ASC',
      downlaodOptionsfolder
    )

    await utils.decryptFile(
      encryptedFolder,
      privateKeyfile,
      passphrase,
      decryptedFolder
    )
    await utils.unzipFolder(decryptedFolder, dirName)
  })
  describe('File comparison tests of customer file', () => {
    beforeAll(async () => {
      const downlaodOptionsinput = {
        destination: path.resolve('data/customer.csv')
      }
      const inputFileName = 'customer_ocv.csv'
      const outputFileName = 'CUSTOMER.DAT'
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
      outputfileArr = await utils.csvToArray(csvfileOutput)
      outputfileArray = utils.deleteRow(outputfileArr, outputfileArr.length)
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
      const mappingCheck = utils.mappingCustomerNew(
        10,
        6,
        outputfileArray,
        inputfileArray
      )
      expect(mappingCheck).toBeTruthy()
    })
    test('Unmapped columns of output file should be blank', () => {
      const blankColCheck = utils.blankColCheckNew(6, 10, outputfileArray)
      expect(blankColCheck).toBeTruthy()
    })
  })
  describe('File comparison tests of deposit_account file', () => {
    beforeAll(async () => {
      // const outputFileName = 'DEPOSIT_ACCOUNT.DAT'
      const csvfileInput = './data/temp/deposit_account.csv'
      const csvfileOutput = './data/temp/deposit_accountOutput.csv'
      // const srcOutputFile = utils.getFilePath(dirName, outputFileName).toString()
      // await utils.convertTocsv(srcOutputFile, csvfileOutput)
      inputfileArray = await utils.csvToArray(csvfileInput)
      outputfileArr = await utils.csvToArray(csvfileOutput)
      // outputfileArray = utils.deleteRow(outputfileArr, outputfileArr.length)
      outputfileArray = await utils.arraySort(outputfileArr)
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
    test('Number of columns in output file should be fourteen', () => {
      const columnCheck = utils.numberOfColumns(outputfileArray, 14)
      expect(columnCheck).toBeTruthy()
    })
  })
  describe('File comparison tests of account-customer-relationship file', () => {
    // prepare output.dat file for comparison
    beforeAll(async () => {
      // utils.checkFile(csvfileOutput)
      // const outputFileName = 'ACCT_CUST_REL.DAT'
      const csvfileInput = './data/temp/account_cust_rel.csv'
      const csvfileOutput = './data/temp/acc_cust_relOutput.csv'
      // const srcOutputFile = utils.getFilePath(dirName, outputFileName).toString()
      // await utils.convertTocsv(srcOutputFile, csvfileOutput)
      inputfileArray = await utils.csvToArray(csvfileInput)
      outputfileArr = await utils.csvToArray(csvfileOutput)
      // outputfileArray = utils.deleteRow(outputfileArr, outputfileArr.length)
      outputfileArray = await utils.arraySort(outputfileArr)
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
    test('mapping of input file to output file should be correct', () => {
      const mappingCheck = utils.mappingAcctCustRel(
        3,
        outputfileArray,
        inputfileArray
      )
      expect(mappingCheck).toBeTruthy()
    })
  })
})
