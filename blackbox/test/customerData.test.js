'use strict'

const utils = require('@utils')
const path = require('path')

const downlaodOptionsinput = {
  destination: path.resolve('data/input.csv')
}
const downlaodOptionsoutput = {
  destination: path.resolve('data/output.dat')
}

const inputFileName = 'customer_data/customer.csv'
const outputFileName = 'customer_data/CUSTOMER.DAT'
const srcOutputFile = path.resolve('data/output.dat')
const csvfileInput = path.resolve('data/input.csv')
const csvfileOutput = path.resolve('data/test_output.csv')
let outputfileArr = []
let inputfileArray = []
let outputfileArray = []

describe('File comparison tests of customer file', () => {
  // prepare output.dat file for comparison
  beforeAll(async done => {
    jest.setTimeout(20000)
    await utils.downloadFile(
      process.env.GS_KEY,
      process.env.GS_BUCKET_NAME,
      inputFileName,
      downlaodOptionsinput
    )
    await utils.downloadFile(
      process.env.GS_KEY,
      process.env.GS_BUCKET_NAME,
      outputFileName,
      downlaodOptionsoutput
    )

    await utils.convertTocsv(srcOutputFile, csvfileOutput)
    inputfileArray = await utils.csvToArray(csvfileInput)
    outputfileArr = await utils.csvToArray(csvfileOutput)
    outputfileArray = utils.deleteRow(outputfileArr, outputfileArr.length)
    outputfileArray = await utils.arraySort(outputfileArray)
    done()
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
      outputfileArray,
      inputfileArray
    )
    expect(mappingCheck).toBeTruthy()
  })
  test('Unmapped columns of output file should be blank', () => {
    const blankColCheck = utils.blankColCheck(10, outputfileArray)
    expect(blankColCheck).toBeTruthy()
  })
})