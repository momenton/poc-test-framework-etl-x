'use strict'
const utils = require('@utils')

const srcOutputFile = './data/temp/output1.dat'
const csvfileInput = './data/temp/input1.csv'
const csvfileOutput = './data/temp/test_output1.csv'
let inputfileArray = []
let outputfileArr = []
let outputfileArray = []

let rowsInput = 0
let rowsOutput = 0

describe('File comparison tests of customer file', () => {
  // prepare output.dat file for comparison
  beforeAll(async () => {
    utils.checkFile(csvfileOutput)
    await utils.convertTocsv(srcOutputFile, csvfileOutput)
    inputfileArray = await utils.csvToArray(csvfileInput)
    outputfileArr = await utils.csvToArray(csvfileOutput)
    outputfileArray = utils.deleteRow(outputfileArr, outputfileArr.length)
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
    rowsInput = inputfileArray.length
    rowsOutput = outputfileArray.length
    expect(rowsOutput).toBe(rowsInput)
  })
  test('Number of columns in output file should be ten', () => {
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
