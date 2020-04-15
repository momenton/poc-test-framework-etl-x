'use strict'

var utils = require('../lib/utils.js')

const srcOutputFile = './data/output1.dat'
const csvfileInput = './data/input1.csv'
const csvfileOutput = './data/test_output1.csv'
var InputfileArray
var OutputfileArr
var OutputfileArray

let rowsInput = 0
let rowsOutput = 0

describe('File comparison tests of customer file', () => {
  // prepare output.dat file for comparison
  beforeAll(async () => {
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
  test('Number of columns in output file should be ten', () => {
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
