'use strict'

const fs = require('fs')
const moment = require('moment')
const { Storage } = require('@google-cloud/storage')
const logger = require('@logger')
const AdmZip = require('adm-zip')
const path = require('path')
const openpgp = require('openpgp')

var passFlag
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
  arraySort: async function (OutputfileArray, j) {
    return OutputfileArray.sort(function (a, b) {
      return a[j] - b[j]
    })
  },
  deleteRow: function (arr, row) {
    arr = arr.slice(0) // make copy
    arr.splice(row - 1, 1)
    return arr
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
    if (arrayFile.length > 1) {
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
    } else {
      logger.log('info', 'Empty file with header')
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
  fwTocsv: function (IN_FILE, OUT_FILE) {
    const readline = require('readline')
    // fs       = require('fs');
    // const IN_FILE = 'in1.txt',
    // OUT_FILE = 'out.csv',
    const BUFFER_LINES = 200
    const RANGES = [
      [0, 10],
      [16, 20],
      [41, 23],
      [69, 29]
    ]
    // const RANGES = [[0, 6], [6, 20],[26, 2] ,[29, 3]];
    const instream = fs.createReadStream(IN_FILE)
    const outstream = fs.createWriteStream(OUT_FILE)
    const rl = readline.createInterface({ input: instream })
    let buffer = ''
    let bufferedLines = 0
    instream.on('error', e => {
      console.error(e.message)
    })
    outstream.on('error', e => {
      console.error(e.message)
    })
    rl.on('line', line => {
      const parts = []
      for (const range of RANGES)
        parts.push(line.substr(range[0], range[1]).trim())

      buffer += parts.join(',') + '\n'

      if (++bufferedLines === BUFFER_LINES) {
        outstream.write(buffer)
        bufferedLines = 0
        buffer = ''
      }
    })
    rl.on('close', () => {
      outstream.write(buffer)
      outstream.close()
    })
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
  mappingAccountBalance: function (
    colsOutput,
    OutputfileArray,
    InputfileArray
  ) {
    if (
      OutputfileArray.length !== 0 &&
      InputfileArray.length !== 0 &&
      colsOutput !== 0
    ) {
      for (var i = 1; i < OutputfileArray.length; i++) {
        if (
          OutputfileArray[i][0] === InputfileArray[i][0] &&
          OutputfileArray[i][1] ===
            moment(InputfileArray[i][1]).format('YYYYMMDD') &&
          ((InputfileArray[i][2] === '' && OutputfileArray[i][3] === '') ||
            (OutputfileArray[i][2] === InputfileArray[i][2] &&
            OutputfileArray[i][3] === InputfileArray[i][2] >= 0
              ? 'CR'
              : 'DR')) &&
          ((InputfileArray[i][3] === '' && OutputfileArray[i][4] === '') ||
            (OutputfileArray[i][4] === InputfileArray[i][3] &&
            OutputfileArray[i][5] === InputfileArray[i][3] >= 0
              ? 'CR'
              : 'DR'))
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
    } else {
      logger.log('info', 'empty file')
      return 0
    }
  },

  mappingPackageAccount: function (
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
        if (
          OutputfileArray[i][0] === InputfileArray[i][1] &&
          OutputfileArray[i][1] === InputfileArray[i][0] &&
          OutputfileArray[i][2] === InputfileArray[i][2] &&
          OutputfileArray[i][3] ===
            moment(InputfileArray[i][3]).format('YYYYMMDD')
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
    if (
      OutputfileArray.length !== 0 &&
      colsOutput !== 0 &&
      blankColArray.length !== 0
    ) {
      for (var i = 1; i < OutputfileArray.length; i++) {
        for (var j = 0; j < blankColArray.length; j++) {
          // blankColArray.forEach(function(j) {
          if (OutputfileArray[i][blankColArray[j]] === '') {
            ColFlag = 1
            // console.log('EMPTY');
          } else {
            ColFlag = 0
            // console.log('NOT EMPTY');
            logger.log(
              'error',
              'Column ' + blankColArray[j] + ' of row ' + i + ' is not blank'
            )
            j = i = -1
          }
        }
      }
    } else {
      logger.log('info', 'No unmapped columns')
      return 1
    }
    if (i === OutputfileArray.length && ColFlag === 1) {
      return 1
    } else return 0
  },
  mandatoryColCheck: function (colsOutput, ColArray, OutputfileArray) {
    if (
      OutputfileArray.length !== 0 &&
      colsOutput !== 0 &&
      ColArray.length !== 0
    ) {
      for (var i = 1; i < OutputfileArray.length; i++) {
        for (var j = 0; j < ColArray.length; j++) {
          // blankColArray.forEach(function(j) {
          if (OutputfileArray[i][ColArray[j]] !== '') {
            ColFlag = 1
            // console.log('EMPTY');
          } else {
            ColFlag = 0
            // console.log('NOT EMPTY');
            logger.log(
              'error',
              'Column ' + ColArray[j] + ' of row ' + i + ' is blank'
            )
            j = i = -1
          }
        }
      }
    } else {
      logger.log('info', 'No unmapped columns')
      return 1
    }
    if (i === OutputfileArray.length && ColFlag === 1) {
      return 1
    } else return 0
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
        if (
          OutputfileArray[i][0] === InputfileArray[i][0] &&
          OutputfileArray[i][1] ===
            (InputfileArray[i][1] === ''
              ? ''
              : moment(InputfileArray[i][1]).format('YYYYMMDD')) &&
          OutputfileArray[i][2] ===
            (InputfileArray[i][2] === ''
              ? ''
              : moment(InputfileArray[i][2]).format('YYYYMMDD')) &&
          OutputfileArray[i][3] === 'ACTIVE' &&
          OutputfileArray[i][4] ===
            (InputfileArray[i][4] === ''
              ? ''
              : moment(InputfileArray[i][4]).format('YYYYMMDD'))
        ) {
          passFlag = 1
        } else {
          passFlag = 0
          console.log(OutputfileArray[i])
          console.log(InputfileArray[i])
          logger.log('error', 'Mismatch in data found in row ' + i)
          break
        }
      }
      if (i === OutputfileArray.length && passFlag === 1) {
        return 1
      } else return 0
    }
  },

  mappingPackageSubscription: function (
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
        if (
          OutputfileArray[i][0] === InputfileArray[i][2] &&
          OutputfileArray[i][1] ===
            moment(InputfileArray[i][3]).format('YYYYMMDD') &&
          OutputfileArray[i][2] === InputfileArray[i][4] &&
          OutputfileArray[i][3] === InputfileArray[i][5] &&
          OutputfileArray[i][4] === InputfileArray[i][0] &&
          OutputfileArray[i][5] === 'CALENDAR'
        ) {
          passFlag = 1
        } else {
          passFlag = 0
          console.log(OutputfileArray[i])
          console.log(InputfileArray[i])
          logger.log('error', 'Mismatch in data found in row ' + i)
          break
        }
      }
      if (i === OutputfileArray.length && passFlag === 1) {
        return 1
      } else return 0
    }
  },
  mappingDepositTransaction: function (
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
        if (
          OutputfileArray[i][0] === InputfileArray[i][0] &&
          OutputfileArray[i][1] === InputfileArray[i][1] &&
          OutputfileArray[i][2] === InputfileArray[i][2] &&
          OutputfileArray[i][4] ===
            moment(InputfileArray[i][4]).format('YYYYMMDD') &&
          ((OutputfileArray[i][3] === 'CR' && InputfileArray[i][3] === 'C') || (OutputfileArray[i][3] === 'DR' && InputfileArray[i][3] === 'D')) &&
          OutputfileArray[i][5] === InputfileArray[i][5] &&
          OutputfileArray[i][6] === InputfileArray[i][6]+InputfileArray[i][7] &&
          OutputfileArray[i][7] === InputfileArray[i][8] &&
          OutputfileArray[i][8] === InputfileArray[i][9] &&
          OutputfileArray[i][9] === '' &&
          OutputfileArray[i][10] === '' &&
          OutputfileArray[i][11] === '' &&
          OutputfileArray[i][12] === '' &&
          OutputfileArray[i][13] === ''
        ) {
          passFlag = 1
        } else {
          passFlag = 0
          console.log(OutputfileArray[i])
          console.log(InputfileArray[i])
          logger.log('error', 'Mismatch in data found in row ' + i)
          break
        }
      }
      if (i === OutputfileArray.length && passFlag === 1) {
        return 1
      } else return 0
    }
  }
}

module.exports = methods
