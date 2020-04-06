const fs = require('fs');
const parser = require('csv-parser')
const reorder = require('csv-reorder');
const moment = require('moment');


var methods = {
    convertTocsv: async function (srcFileName, trgFileName) {
        var array = await fs.readFileSync(srcFileName, 'utf-8').toString().split("\n");
        let text = array                               // split lines
            .map(line => line.split('|').join(','))  // split spaces then join with ,
            .join('\n');
        //let header_output = array[0].toString();

        await fs.writeFile(trgFileName, text, 'utf8',  function (err) {
            if (err) {
                console.log('Some error occured - file either not saved or corrupted file saved.');
            } else console.log('output file is saved as csv!');

        });
    },


    csvToArray: async function (srcFileName) {
        let csvfile = fs.readFileSync(srcFileName, 'utf-8').toString();
        rows = csvfile.split("\n");
        console.log('csv is converted to array');
        return rows.map(function (row) {
            row_record = row.split(",");
            return row_record;

        });
    },

    validDateFormat: function (dateStr) {
        return moment(dateStr, "YYYYMMDD").isValid();
    },
    arraySort: async function (Outputfile_array) {
        return Outputfile_array.sort(function (a, b) {
            return a[0] - b[0];
        });
    },

    mapping_customer: function(rows_output,cols_output,Outputfile_array,Inputfile_array){
    if (rows_output !== 0 && cols_output !== 0 ){
        for (var i = 1; i < rows_output; i++){

            if ((Outputfile_array[i][0]==Inputfile_array[i][0]) && (Outputfile_array[i][2]=='Active')) {
                if(Inputfile_array[i][1] == 'Active' || Inputfile_array[i][1] == 'InActive' || Inputfile_array[i][1] == 'Prospective'){
                    passFlag = 1;
                    //console.log('MATCH');
                }else {passFlag = 0;
                    //console.log('MISMATCH');
                    console.log('Mismatch in data found.')
                    break;
            }}

        }
        if(i===rows_output){
            return 1;
        }else return 0;

    }
},
    blankColCheck : function (rows_output,cols_output,Outputfile_array){
    if (rows_output !== 0 && cols_output !== 0 ){
        outerloop:
            for (var i = 1; i < rows_output; i++){
                for (var j = 0;j<cols_output;j++){
                    if(j!==0 && j !==2){

                        if(Outputfile_array[i][j]==="")
                        {
                            ColFlag = 1;
                            //console.log('EMPTY');
                        }else {ColFlag = 0;
                            //console.log('NOT EMPTY');
                            //console.log('Remaining cols are not empty.')
                            break outerloop;
                        }
                    }

                }

            }


    }
    if(i===rows_output){
        return 1;
    }else return 0

}


};

module.exports = methods;


