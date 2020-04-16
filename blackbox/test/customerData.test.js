'use strict'

var utils = require('../lib/utils.js')

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

var InputfileArray
var OutputfileArr
var OutputfileArray
// var serviceKey
// var bucketName

describe('File comparison tests of customer file', () => {
  // prepare output.dat file for comparison
  beforeAll(async done => {
    await utils.downloadFile(
      serviceKey,
      bucketName,
      inputFileName,
      downlaodOptionsinput
    )
    await utils.downloadFile(
      serviceKey,
      bucketName,
      outputFileName,
      downlaodOptionsoutput
    )
    // await utils.getFile(csvfileInput,1000)
    // await utils.getFile(srcOutputFile,1000)
    await utils.convertTocsv(srcOutputFile, csvfileOutput)
    InputfileArray = await utils.csvToArray(csvfileInput)
    OutputfileArr = await utils.csvToArray(csvfileOutput)
    OutputfileArray = utils.deleteRow(OutputfileArr, OutputfileArr.length)
    OutputfileArray = await utils.arraySort(OutputfileArray)
    done()
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
    // console.log(OutputfileArray);
    // console.log(InputfileArray);
    expect(OutputfileArray.length).toBe(InputfileArray.length)
  })
  test('Number of columns in output file should be 10', () => {
    const columnCheck = utils.numberOfColumns(OutputfileArray, 10)
    expect(columnCheck).toBeTruthy()
  })

  test('mapping of input file to output file should be correct', () => {
    const mappingCheck = utils.mappingCustomer(
      10,
      OutputfileArray,
      InputfileArray
    )
    expect(mappingCheck).toBeTruthy()
  })
  test('Unmapped columns of output file should be blank', () => {
    const blankColCheck = utils.blankColCheck(10, OutputfileArray)
    expect(blankColCheck).toBeTruthy()
  })
})
