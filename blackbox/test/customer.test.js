const fs = require('fs');
var utils = require('../lib/utils.js');

let srcOutputFile = './test-data/output.dat';
let csvfile_input = './test-data/input.csv';
let csvfile_output = './test-data/test_output.csv';
var Inputfile_array;
var Outputfile_array;


let rows_input = 0;
let rows_output = 0;
let cols_input = 0;
let cols_output = 0;



describe('File comparison tests of customer file',()=> {
    //prepare output.dat file for comparison
    beforeAll(async () => {
        await utils.convertTocsv(srcOutputFile, csvfile_output);
        Inputfile_array = await utils.csvToArray(csvfile_input);
        Outputfile_array = await utils.csvToArray(csvfile_output);
        Outputfile_array = await utils.arraySort(Outputfile_array);
    });

    test('date format in output header should be YYYYMMDD', () => {
        var datecheck = utils.validDateFormat(Outputfile_array[0][1]);

        console.log(datecheck);
        expect(datecheck).toBeTruthy();
    });
    test('Header of output file "#|YYYYMMDD|no of records ,"', () => {

        let header_output = Outputfile_array[0].toString()
        let exp_header = '#,' + Outputfile_array[0][1] + ',' + (Inputfile_array.length - 1);
        expect(header_output).toEqual(exp_header);

    });
    test('Number of records in Input and output file should be equal', () => {

        rows_input = Inputfile_array.length;
        rows_output = Outputfile_array.length;
        expect(rows_output).toBe(rows_input);

    });
    test('Number of columns in output file should be 10', () => {
        cols_output = Outputfile_array[1].length;
        expect(cols_output).toEqual(10);

    });
    test('mapping of input file to output file should be correct', () => {
        cols_input = Inputfile_array[1].length;
        let mapping_check = utils.mapping_customer(rows_output, cols_output, Outputfile_array, Inputfile_array);
        expect(mapping_check).toBeTruthy();
    });
    test('Unmapped columns of output file should be blank', () => {

        let blankCol_check = utils.blankColCheck(rows_output, cols_output, Outputfile_array);
        expect(blankCol_check).toBeTruthy();
    });

})