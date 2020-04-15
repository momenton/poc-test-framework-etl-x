'use strict'

const fs = require('fs')
const moment = require('moment')
const path = require('path')
const { Storage } = require('@google-cloud/storage')
const serviceKey = path.resolve('config/gs_momenton.json')
const storageConf = { keyFilename: serviceKey }
const storage = new Storage(storageConf)

let passFlag = 0
let ColFlag = 0
var rows
var rowRecord

var methods = {
  convertTocsv: function (srcFileName, trgFileName) {
    var array = fs
      .readFileSync(srcFileName, 'utf-8')
      .toString()
      .split('\n')
    const text = array // split lines
      .map(line => line.split('|').join(',')) // split spaces then join with ,
      .join('\n')

    fs.writeFileSync(trgFileName, text)
    console.log('output file is saved as csv!')

    // fs.writeFile(trgFileName, text, 'utf8',  function (err) {
    //  if (err) {
    //  console.log('Some error occured - file either not saved or corrupted file saved.');
    //  } else console.log('output file is saved as csv!');

    //  });
  },

  csvToArray: function (srcFileName) {
    const csvfile = fs.readFileSync(srcFileName, 'utf-8').toString()
    rows = csvfile.split('\n')
    console.log('csv is converted to array')
    return rows.map(function (row) {
      rowRecord = row.split(',')
      // console.log(rowRecord)
      return rowRecord
    })
  },

  validDateFormat: function (dateStr) {
    return moment(dateStr, 'YYYYMMDD').isValid()
  },
  arraySort: async function (OutputfileArray) {
    return OutputfileArray.sort(function (a, b) {
      return a[0] - b[0]
    })
  },

  mappingCustomer: function (
    rowsOutput,
    colsOutput,
    OutputfileArray,
    InputfileArray
  ) {
    if (rowsOutput !== 0 && colsOutput !== 0) {
      for (var i = 1; i < rowsOutput; i++) {
        if (
          OutputfileArray[i][0] === InputfileArray[i][0] &&
          OutputfileArray[i][2] === 'Active'
        ) {
          if (
            InputfileArray[i][1] === 'Active' ||
            InputfileArray[i][1] === 'Inactive' ||
            InputfileArray[i][1] === 'Prospect'
          ) {
            passFlag = 1
            // console.log('MATCH');
          } else {
            passFlag = 0
            // console.log('MISMATCH');
            console.log('Mismatch in data found.')
            break
          }
        } else {
          passFlag = 0
          // console.log('MISMATCH');
          console.log('Mismatch in data found.')
          break
        }
      }
      if (i === rowsOutput && passFlag === 1) {
        return 1
      } else return 0
    }
  },
  blankColCheck: function (rowsOutput, colsOutput, OutputfileArray) {
    if (rowsOutput !== 0 && colsOutput !== 0) {
      for (var i = 1; i < rowsOutput; i++) {
        for (var j = 0; j < colsOutput; j++) {
          if (j !== 0 && j !== 2) {
            if (OutputfileArray[i][j] === '') {
              ColFlag = 1
              // console.log('EMPTY');
            } else {
              ColFlag = 0
              // console.log('NOT EMPTY');
              console.log('Remaining cols are not empty.')
              j = i = -1
            }
          }
        }
      }
    }
    if (i === rowsOutput && ColFlag === 1) {
      return 1
    } else return 0
  },

  downloadFile: async function (bucketName, fileName, downlaodOptions) {
    console.log('called download')
    try {
      await storage
        .bucket(bucketName)
        .file(fileName)
        .download(downlaodOptions)
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = methods
//  (parseInt(OutputfileArray[i][0]).toString(8))
