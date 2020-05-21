'use strict'

const fs = require('fs')
const moment = require('moment')
const { Storage } = require('@google-cloud/storage')
const logger = require('@logger')
const AdmZip = require('adm-zip')
const path = require('path')
const openpgp = require('openpgp')

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
  },
  unzipFolder: function (zipFolder, extractFolder) {
    const zip = new AdmZip(zipFolder)
    zip.extractAllTo(extractFolder, false, true)
  },
  getFilePath: function (dirpath, filename) {
    const results = []
    let subpath = ''
    fs.readdirSync(dirpath).forEach(function (file) {
      subpath = dirpath + '/' + file
      if (
        fs.statSync(subpath).isFile() &&
        path.basename(subpath) === filename
      ) {
        results.push(subpath)
      }
    })
    return results
  },
  getAllDirFiles: function (dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
      // if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      // arrayOfFiles = getAllDirFiles(dirPath + '/' + file, arrayOfFiles)
      // } else {
      arrayOfFiles.push(file)
      // }
    })

    return arrayOfFiles
  },
  mappingAcctCustRel: function (colsOutput, OutputfileArray, InputfileArray) {
    if (
      OutputfileArray.length !== 0 &&
      InputfileArray.length !== 0 &&
      colsOutput !== 0
    ) {
      for (var i = 1; i < OutputfileArray.length; i++) {
        if (
          OutputfileArray[i][0] === InputfileArray[i][0] &&
          OutputfileArray[i][1] === InputfileArray[i][1]
        ) {
          if (
            (InputfileArray[i][2] === 'PRI' &&
              OutputfileArray[i][2] === 'PRIMARY') ||
            (InputfileArray[i][2] === 'SOL' &&
              OutputfileArray[i][2] === 'SOLE') ||
            (InputfileArray[i][2] === 'COO' &&
              OutputfileArray[i][2] === 'NON_PRIMARY') ||
            (InputfileArray[i][2] === 'COF' &&
              OutputfileArray[i][2] === 'NON_PRIMARY')
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

  mappingCustomer: function (
    colsOutput,
    colsInput,
    OutputfileArray,
    InputfileArray
  ) {
    if (
      OutputfileArray.length !== 0 &&
      InputfileArray.length !== 0 &&
      colsOutput !== 0 &&
      colsInput !== 0
    ) {
      for (var i = 1; i < OutputfileArray.length; i++) {
        for (var j = 0; j < colsInput; j++) {
          if (
            OutputfileArray[i][j] === InputfileArray[i][j] ||
            j === 3 ||
            j === 5
          ) {
            if (
              OutputfileArray[i][3] === 'ACTIVE' &&
              ((InputfileArray[i][5] === '' && OutputfileArray[i][5] === '') ||
                (InputfileArray[i][5] === 'N' &&
                  OutputfileArray[i][5] === '') ||
                (InputfileArray[i][5] === 'Y' &&
                  OutputfileArray[i][5] === 'Active'))
            ) {
              passFlag = 1
            } else {
              passFlag = 0
              // console.log('MISMATCH');
              logger.log('error', 'Mismatch in data found in row ' + i)
              j = -1
              i = -1
            }
          } else {
            passFlag = 0
            // console.log('MISMATCH');
            logger.log('error', 'Mismatch in data found in row ' + i)
            break
          }
        }
      }
      if (i === OutputfileArray.length && passFlag === 1) {
        return 1
      } else return 0
    }
  },
  mappingDepositAct: function (colsOutput, OutputfileArray, InputfileArray) {
    if (
      OutputfileArray.length !== 0 &&
      InputfileArray.length !== 0 &&
      colsOutput !== 0
    ) {
      for (var i = 1; i < OutputfileArray.length; i++) {
        if (
          OutputfileArray[i][0] === InputfileArray[i][0] &&
          OutputfileArray[i][1] === InputfileArray[i][1] &&
          OutputfileArray[i][2] === 'ACTIVE' &&
          OutputfileArray[i][3] ===
            moment(InputfileArray[i][3]).format('YYYYMMDD') &&
          OutputfileArray[i][6] ===
            moment(InputfileArray[i][4]).format('YYYYMMDD') &&
          OutputfileArray[i][7] === InputfileArray[i][5] &&
          OutputfileArray[i][8] === InputfileArray[i][6] &&
          OutputfileArray[i][15] ===
            moment(InputfileArray[i][8]).format('YYYYMMDD') &&
          ((InputfileArray[i][7] === '' &&
            OutputfileArray[i][11] === 'CALENDAR' &&
            OutputfileArray[i][12] === '') ||
            (InputfileArray[i][7] === 'EM' &&
              OutputfileArray[i][11] === 'CALENDAR' &&
              OutputfileArray[i][12] === '') ||
            (InputfileArray[i][7] === '00' &&
              OutputfileArray[i][11] === 'CALENDAR' &&
              OutputfileArray[i][12] === '') ||
            (InputfileArray[i][7] === 'IM' &&
              OutputfileArray[i][11] === 'FIXED_DAY' &&
              Date(OutputfileArray[i][12]) ===
                String(moment(InputfileArray[i][3]).date())) ||
            (InputfileArray[i][7] <= 31 &&
              InputfileArray[i][7] >= 1 &&
              OutputfileArray[i][11] === 'FIXED_DAY' &&
              OutputfileArray[i][12] === InputfileArray[i][7]))
        ) {
          passFlag = 1
        } else {
          passFlag = 0
          logger.log('error', 'Mismatch in data found in row ' + i)
          break
        }
      }
      if (i === OutputfileArray.length && passFlag === 1) {
        return 1
      } else return 0
    }
  },

  sortAlphaNum: function (a, b) {
    const reA = /[^a-zA-Z]/g
    const reN = /[^0-9]/g
    const aA = a[0].replace(reA, '')
    const bA = b[0].replace(reA, '')
    if (aA === bA) {
      const aN = parseInt(a[0].replace(reN, ''), 10)
      const bN = parseInt(b[0].replace(reN, ''), 10)
      return aN === bN ? 0 : aN > bN ? 1 : -1
    } else {
      return aA > bA ? 1 : -1
    }
  },
  decryptFile: async function (
    encryptedFolder,
    privateKeyfile,
    passphrase,
    decryptedFolder
  ) {
    const encryptedMessage = fs.readFileSync(encryptedFolder)
    const privateKeyArmored = fs.readFileSync(privateKeyfile)

    // read private key
    const {
      keys: [privateKey]
    } = await openpgp.key.readArmored([privateKeyArmored])
    // unlock private key
    await privateKey.decrypt(passphrase)

    const { data: decrypted } = await openpgp.decrypt({
      message: await openpgp.message.read(encryptedMessage),
      format: 'binary', // parse armored message
      privateKeys: [privateKey] // keys for decryption
    })

    // write out decrypted message
    fs.writeFileSync(decryptedFolder, decrypted)
  },
  blankColCheck: function (colsOutput, blankColArray, OutputfileArray) {
    if (OutputfileArray.length !== 0 && colsOutput !== 0) {
      for (var i = 1; i < OutputfileArray.length; i++) {
        for (var j = 0; j < blankColArray.length; j++) {
          // blankColArray.forEach(function(j) {
          if (OutputfileArray[i][blankColArray[j]] === '') {
            ColFlag = 1
            // console.log('EMPTY');
          } else {
            ColFlag = 0
            // console.log('NOT EMPTY');
            console.log(
              'error',
              'Column ' + blankColArray[j] + ' of row ' + i + ' is not blank'
            )
            j = i = -1
          }
        }
      }
    }
    if (i === OutputfileArray.length && ColFlag === 1) {
      return 1
    } else return 0
  },
  mandatoryColCheck: function (colsOutput, ColArray, OutputfileArray) {
    if (OutputfileArray.length !== 0 && colsOutput !== 0) {
      for (var i = 1; i < OutputfileArray.length; i++) {
        for (var j = 0; j < ColArray.length; j++) {
          // blankColArray.forEach(function(j) {
          if (OutputfileArray[i][ColArray[j]] !== '') {
            ColFlag = 1
            // console.log('EMPTY');
          } else {
            ColFlag = 0
            // console.log('NOT EMPTY');
            console.log(
              'error',
              'Column ' + ColArray[j] + ' of row ' + i + ' is blank'
            )
            j = i = -1
          }
        }
      }
    }
    if (i === OutputfileArray.length && ColFlag === 1) {
      return 1
    } else return 0
  }
}

module.exports = methods
