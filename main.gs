function onEdit(e){

    var range = e.range;
    var row = range.getRow();
    if (range.getColumn() == 1){
        return;
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];

    var range_glob = sheet.getRange(row , 1);

    sumByMonthByType();

    if (range_glob.getValue() == "") {
        range_glob.setValue(new Date());
    }
}

function sumByMonthByType (sheet){
    var ss = SpreadsheetApp.getActiveSpreadsheet()?SpreadsheetApp.getActiveSpreadsheet():sheet;
    var sheet = ss.getSheets()[0];
    var date_range = sheet.getRange("A2:A");
    var value_range = sheet.getRange("C2:C");
    var type_range = sheet.getRange("B2:B");
    var income_range = sheet.getRange("F2:F");


    var current_date = new Date();

    var tmp_val;
    var tmp_val_date;
    var result_sum=0;
    var first_match = false;
    var types = [];

    var row = Object();

    var date_range_val = date_range.getValues();
    var type_range_val = type_range.getValues();
    var value_range_val = value_range.getValues();
    var income_range_val = income_range.getValues();

    for(var i in date_range_val){

        tmp_val = date_range_val[i];
        tmp_val_date = new Date(tmp_val);

        if (tmp_val_date.getYear() == current_date.getYear() && tmp_val_date.getMonth() == current_date.getMonth()){
            if (first_match == false){
                first_match = i;
            }
            if(type_range_val[i].toString().toLowerCase() == ''){
                continue;
            }
            types[type_range_val[i]] += Number(value_range_val[i]);

            result_sum += Number(value_range_val[i]);

            if(typeof row[type_range_val[i].toString().toLowerCase()] == 'undefined' ) {
                row[type_range_val[i].toString().toLowerCase()] = 0;
            }
            if(type_range_val[i].toString().toLowerCase() == 'income'){
                row[type_range_val[i].toString().toLowerCase()] += Number(income_range_val[i]);
                continue;
            }
            row[type_range_val[i].toString().toLowerCase()] += Number(value_range_val[i]);

        }
    }

    types.push(row);

    types.sort(function (a, b) {
        return a.value - b.value;
    });
    Logger.log("74 row: --");
    Logger.log(row);

    var type_values = sheet.getRange(2, 11,20);


    var type_values_val = type_values.getValues();
    var outputRows = [];

    var tmp_val, j=0, total_sum=0;
    for (var i in type_values_val) {
        tmp_val = type_values_val[i][0];

        if( tmp_val == '' || typeof tmp_val == 'undefined' || typeof row[tmp_val] == 'undefined' || row[tmp_val].length === 0 )
            continue;

        outputRows[j] = [tmp_val, row[tmp_val]];
        if(tmp_val != 'income' && tmp_val != 'apartment'){
            total_sum += row[tmp_val];
        }
        j++;
    }

    Logger.log("102 OutputRows: --");
    Logger.log(outputRows);

    var result_range = sheet.getRange(parseInt(first_match) + 3, 7, outputRows.length, 2);//because range starts from A2


    result_range.setValues(outputRows);


    var total_res = sheet.getRange(parseInt(first_match) + 2, 7, 1, 2);

    total_res.setValues([['TOTAL', total_sum]]);


    Logger.log("119 total_res: --");
    Logger.log(first_match);

    sheet.getRange(parseInt(first_match) + 2, 1, 1, sheet.getLastColumn()-1).setBackgroundColor("#c9daf8");

    sheet.getRange(parseInt(first_match) + 3, 1, 1, 1).setValue(new Date(current_date.getFullYear(), current_date.getMonth(), 1));

    var full_res = sheet.getRange(parseInt(first_match) + 2, 7, outputRows.length+1, 2);
    sheet.getRange(parseInt(first_match) + 2, 7, outputRows.length+1, 2).setBorder(true, true, true, true, true, true, null, SpreadsheetApp.BorderStyle.SOLID);

}


function onOpen() {
    Logger.log(SpreadsheetApp.getActiveSpreadsheet().getLastColumn());
    hideRows();
}

function hideRows(){
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];

    var date_range = sheet.getRange("A2:A"), tmp_val, tmp_val_date;
    var current_date = new Date();
    var j = 0;

    sheet.showColumns(1, ss.getLastColumn());

    sheet.hideColumns(9,ss.getLastColumn()-8);

    sheet.hideColumns(5, 1);


    var date_range_values = date_range.getValues()
    for(var i in date_range_values){
        j++;
        tmp_val = date_range_values[i];
        tmp_val_date = new Date(tmp_val);

        if (tmp_val_date.getYear() == current_date.getYear() && tmp_val_date.getMonth() == current_date.getMonth()){
            sheet.hideRows(2, j-1);
            return;
        }
    }
}

function getTotalByMonth(sheet) {
    sheet = SpreadsheetApp.openById(ssId).getSheetByName('daily expenses');

    var s=sheet;
    var date = new Date();
    var current_month = date.getMonth();
    var current_year = date.getYear();

    var tmp_date, res;
    var v = s.getRange("A2:H").getValues().map(function (x) {
        tmp_date = new Date(x[0]);
        if (tmp_date.getYear() == current_year && tmp_date.getMonth()==current_month && x[6] == "TOTAL" ) {
            res = x[7];
        }
        return x[7];
    });

    // Logger.log(res);
    return {"month": current_month+1, "total": res}
}

function getCategories(sheet) {
    //sheet = SpreadsheetApp.openById(ssId).getSheetByName('daily expenses');
    var s = sheet, res=[], i=0;

    s.getRange("K2:L100").getValues().map(function (x, k) {
        if (x[0] != '' ) {

            res[i] = x;
        }else{
            return res;
        }
        i++;
    });
    //Logger.log(res);
    return res;
}

function getIncomeByMonth(sheet) {
    //var sheet = SpreadsheetApp.openById(ssId).getSheetByName('daily expenses');

    var s=sheet;
    var date = new Date();
    var current_month = date.getMonth();
    var current_year = date.getYear();

    var tmp_date, res;

    var v = s.getRange("A:H").getValues().map(function (x) {
        tmp_date = new Date(x[0]);
        if (tmp_date.getYear() == current_year && tmp_date.getMonth()==current_month && x[6] == "income" ) {
            res = x[7];
        }
        return x[7];
    });

    return {"month": current_month+1, "total": res}
}


function getCategoryValueByMonth(sheet, category, month) {
    //category = "food";
    //month = 2;
    //var sheet = SpreadsheetApp.openById(ssId).getSheetByName('daily expenses');

    var s=sheet;
    var date = new Date();
    var current_month = month ? month : date.getMonth();
    var current_year = date.getYear();
    var right_month=false;
    var prev_category = '';

    var tmp_date, res=0;

    var v = s.getRange("A:H").getValues().map(function (x) {
        if (x[6] == null){
            return;
        }

        tmp_date = new Date(x[0]);
        //if ( !right_month ) {
        if ( tmp_date.getYear() == current_year && tmp_date.getMonth()==current_month ) {
            right_month = true;
            prev_category = x[6];
        } else {
            return;
        }
        //}

        if (x[6] == category && right_month) {

            res = x[7];
        }
        return x[7];
    });
    Logger.log(res.toFixed(0));
    Logger.log(current_month);
    return {"month": current_month+1, "value": res.toFixed(0)}
}

function checkExpenses(sheet) {
    //var sheet = SpreadsheetApp.openById(ssId).getSheetByName('daily expenses');

    var date = new Date();
    var prev_month = date.getMonth()-1;

    var current_month = date.getMonth();
    var current_year = date.getYear();
    var start_month_balance = 0
    var prev_apartment = 0
    var prev_income = 0

    var v = sheet.getRange("A:H").getValues().map(function (x) {
        if (x[6] == null){
            return;
        }
        tmp_date = new Date(x[0]);

        if (tmp_date.getYear() == current_year && tmp_date.getMonth()==prev_month) {
            if (x[6] == 'TOTAL') {
                prev_total = x[7];
            }
            if (x[6] == 'income') {
                prev_income = x[7];
            }
            if (x[6] == 'apartment') {
                prev_apartment = x[7];
            }
        }
        if (tmp_date.getYear() == current_year && tmp_date.getMonth()==current_month) {
            if (x[3].indexOf('остаток') >= 0) {
                start_month_balance += x[5];
            }
        }
        return x[7];
    });

    balance = prev_income - (prev_total + prev_apartment)
    //Logger.log("difference " + balance + " " + start_month_balance)
    // prev_month_balance - разница между тем сколько было получено и потрачено в прошлом месяце
    // start_month_balance - количество денег на старт этого месяца
    return {"prev_month_balance": balance.toFixed(0), "current_month_balance": start_month_balance.toFixed(0), "diff": balance.toFixed(0) - start_month_balance.toFixed(0)}
}
  
  
  