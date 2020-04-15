'use strict'

var utils = require('../lib/utils.js')
const path = require('path')

const downlaodOptionsinput = {
  destination: path.resolve('data/input.csv')
}

const downlaodOptionsoutput = {
  destination: path.resolve('data/output.dat')
}

const bucketName = 'zafin-read-location'
const inputFileName = 'customer_data/customer.csv'
const outputFileName = 'customer_data/op1586908049.699028-00000-of-00001'
const srcOutputFile = path.resolve('data/output.dat')
const csvfileInput = path.resolve('data/input.csv')
const csvfileOutput = path.resolve('data/test_output.csv')

var InputfileArray
var OutputfileArr
var OutputfileArray

let rowsInput = 0
let rowsOutput = 0
let colsOutput = 0

describe('File comparison tests of customer file', () => {
  // prepare output.dat file for comparison
  beforeAll(async () => {
    await utils.downloadFile(bucketName, inputFileName, downlaodOptionsinput)
    await utils.downloadFile(bucketName, outputFileName, downlaodOptionsoutput)
    await utils.getFile(csvfileInput, 1000)
    await utils.getFile(srcOutputFile, 1000)
    await utils.convertTocsv(srcOutputFile, csvfileOutput)
    InputfileArray = await utils.csvToArray(csvfileInput)
    OutputfileArr = await utils.csvToArray(csvfileOutput)
    OutputfileArray = utils.deleteRow(OutputfileArr, OutputfileArr.length)
    OutputfileArray = await utils.arraySort(OutputfileArray)
  })

  test('date format in output header should be YYYYMMDD', () => {
    var datecheck = utils.validDateFormat(OutputfileArray[0][1])
    expect(datecheck).toBeTruthy()
  })

  test('Header of output file "#|YYYYMMDD|no of records ,"', () => {
    const headerOutput = OutputfileArray[0].toString()
    const expHeader =
      '#,' + OutputfileArray[0][1] + ',' + (InputfileArray.length - 1)
    expect(headerOutput).toEqual(expHeader)
  })

  test('Number of records in Input and output file should be equal', () => {
    rowsInput = InputfileArray.length
    rowsOutput = OutputfileArray.length
    expect(rowsOutput).toBe(rowsInput)
  })
  test('Number of columns in output file should be 10', () => {
    colsOutput = OutputfileArray[2].length
    expect(colsOutput).toEqual(10)
  })

  test('mapping of input file to output file should be correct', () => {
    const mappingCheck = utils.mappingCustomer(
      rowsOutput,
      colsOutput,
      OutputfileArray,
      InputfileArray
    )
    expect(mappingCheck).toBeTruthy()
  })
  test('Unmapped columns of output file should be blank', () => {
    const blankColCheck = utils.blankColCheck(
      rowsOutput,
      colsOutput,
      OutputfileArray
    )
    expect(blankColCheck).toBeTruthy()
  })
})
