'use strict'

const fs = require('fs')
const moment = require('moment')
const { Storage } = require('@google-cloud/storage')
const logger = require('@logger')

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
    logger.log('info', 'output file is saved as csv!')
  },

  csvToArray: function (srcFileName) {
    const csvfile = fs.readFileSync(srcFileName, 'utf-8').toString()
    rows = csvfile.split('\n')
    logger.log('info', 'csv is converted to array')
    return rows.map(function (row) {
      rowRecord = row.split(',')
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

  mappingCustomer: function (colsOutput, OutputfileArray, InputfileArray) {
    if (
      OutputfileArray.length !== 0 &&
      InputfileArray.length !== 0 &&
      colsOutput !== 0
    ) {
      for (var i = 1; i < OutputfileArray.length; i++) {
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
          } else {
            passFlag = 0
            // console.log('MISMATCH');
            logger.log('error', 'Mismatch in data found in row ' + i)
            break
          }
        } else {
          passFlag = 0
          // console.log('MISMATCH');
          logger.log('error', 'Mismatch in data found in row ' + i)
          break
        }
      }
      if (i === OutputfileArray.length && passFlag === 1) {
        return 1
      } else return 0
    }
  },
  blankColCheck: function (colsOutput, OutputfileArray) {
    if (OutputfileArray.length !== 0 && colsOutput !== 0) {
      for (var i = 2; i < OutputfileArray.length; i++) {
        for (var j = 0; j < colsOutput; j++) {
          if (j !== 0 && j !== 2) {
            if (OutputfileArray[i][j] === '') {
              ColFlag = 1
              // console.log('EMPTY');
            } else {
              ColFlag = 0
              // console.log('NOT EMPTY');
              logger.log('error', 'Remaining cols are not empty.')
              j = i = -1
            }
          }
        }
      }
    }
    if (i === OutputfileArray.length && ColFlag === 1) {
      return 1
    } else return 0
  },

  downloadFile: async function (
    serviceKey,
    bucketName,
    fileName,
    downlaodOptions
  ) {
    const storageConf = { keyFilename: serviceKey }
    const storage = new Storage(storageConf)
    try {
      await storage
        .bucket(bucketName)
        .file(fileName)
        .download(downlaodOptions)
    } catch (err) {
      logger.log('error', 'file not downloaded')
      console.log(err)
    }
  },
  getFile: async function (path, timeout) {
    return new Promise((resolve, reject) => {
      timeout = setInterval(function () {
        const file = path
        const fileExists = fs.existsSync(file)
        if (fileExists) {
          // console.log('file exists')
          clearInterval(timeout)
          return resolve(path)
        }
      }, timeout)
    })
  },
  checkFile: function (path) {
    try {
      fs.accessSync(path, fs.constants.F_OK)

      logger.log('info', 'The file exists.')
    } catch (err) {
      console.error(err)
    }
  },
  deleteRow: function (arr, row) {
    arr = arr.slice(0) // make copy
    arr.splice(row - 1, 1)
    return arr
  },
  numberOfColumns: function (arrayFile, expColumn) {
    if (arrayFile.length !== 0) {
      for (var i = 1; i < arrayFile.length; i++) {
        if (arrayFile[i].length === expColumn) {
        } else {
          logger.log(
            'error',
            'row  ' + i + ' does not have ' + expColumn + ' columns'
          )
          break
        }
      }
    }
    if (i === arrayFile.length) {
      return 1
    } else return 0
  }
}

module.exports = methods
