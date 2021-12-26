
function sendMessage(id, text, disable_notification) {
    if (disable_notification == null) {
        disable_notification = false;
    }

    inline_keyboard = createInlineKeyboard();

    var url = telegramUrl + '/sendMessage';

    var payload = {
        "chat_id": id,
        "text": text,
        "disable_notification": disable_notification,
        "parse_mode": 'html',
        "reply_markup": JSON.stringify(inline_keyboard,null).replace(/\\u/g, '\u')
    }

    var params = {
        "method": "post",
        "contentType" : "application/x-www-form-urlencoded",
        "escaping": false,
        "muteHttpExceptions":false,
        "payload": payload
    }

    var response = UrlFetchApp.fetch(url, params);
    Logger.log(response.getContentText());
}

function doPost(e) {
    var is_allow = false;
    var data = JSON.parse(e.postData.contents);
    var id = data.message.chat.id;
    var text = data.message.text;
    var name = data.message.from.first_name;

    var splited_message = text.split(" ");

    Ids.map(function(x){
        if(x == data.message.from.id){
            is_allow = true;
        }
    });

    if(!is_allow){
        sendMessage(id, "Premission denied: 403; debug: allow - " + is_allow + " user_id: " + data.message.from.id);
        return;
    }

    var sheet = SpreadsheetApp.openById(ssId).getSheetByName('daily expenses');

    if(/^\//.test(text)) {
        var commandName = data.message.chat.type=='group'?text.slice(1, text.indexOf("@")):text.slice(1);
        if( commandName == "total"){
            var month = parseInt(splited_message[1]) - 1;

            var total = getCategoryValueByMonth(sheet, 'TOTAL', month);
            var income = getCategoryValueByMonth(sheet, 'income', month);
            var currency = getCategoryValueByMonth(sheet, 'currency', month);

            var categories = getCategories(sheet);
            var categories_values = {};

            for (var i in categories) {
                value = getCategoryValueByMonth(sheet, categories[i][0], month)['value'];
                if ( value != null && value > 0) {
                    categories_values[i] = [categories[i][0], value];
                }
            }

            var col1_length=14, col2_length=7, length1=0, length2=0;

            var category_table = "<pre>";
            for (var i in categories_values) {
                length1 = categories_values[i][0].length
                length2 = categories_values[i][1].toString().length

                category_table += "\n| " + categories_values[i][0] + new Array(col1_length - length1).join(' ') + "| "

                    + categories_values[i][1] + new Array(col2_length - length2).join(' ') + " |"
            }
            category_table +="</pre>"

            currency.value = currency.value ? currency.value : 0;

            var message_text = " <b>Month:</b> " + total.month
                + "\n<b>TOTAL:</b> " + (total.value - currency.value)
                + " <b>| Income:</b> " + income.value
                + " <b>| Balance:</b> " + (income.value - total.value)
                + category_table;

            sendMessage(id,  message_text);
            return;
        }
        if ( commandName == "doc_url"){
            sendMessage(id, "<b> url: </b>" + doc_short_url);
            return;
        }
        if (commandName == "check_balance") {
            var val = checkExpenses(sheet)

            // prev_month_balance - разница между тем сколько было получено и потрачено в прошлом месяце
            // start_month_balance - количество денег на старт этого месяца
            message_text = "<b>diff: " + val.diff + "</b>\nprev month: " + val.prev_month_balance + "\ncurrent balance: " + val.current_month_balance;

            sendMessage(id, message_text);
            return;
        }
    }

    if (splited_message[0] != bot_name){
        return;
    }

    var type = splited_message[1];
    var value = splited_message[2];
    var comment = splited_message[3]?splited_message.slice(3).join(" "):"";

    var answer = "Hi " + name + ", thanks for the request: " + type + " - " + value + " " + comment;
    //answer = "\u2705";
    //answer = ".\u2714\ufe0f";
    answer = "√"
    SpreadsheetApp.openById(ssId).getSheetByName('bot_logs').appendRow([new Date(),id,name,text,answer, JSON.stringify(e, null, 4)]);

    if (type && value){
        processData(type,value,comment, name);

        sendMessage(id, answer, true);
        sumByMonthByType(SpreadsheetApp.openById(ssId).getSheetByName('daily expenses'));
    }


//mail debugger
//  GmailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'message from bot', JSON.stringify(e,null,4));

}

function processData (type, value, comment, name){
    var sheet = SpreadsheetApp.openById(ssId).getSheetByName('daily expenses');
    var result;

    if (type == 'income') {
        result = sheet.appendRow([new Date(),type,'',comment, name, value ]);
    }else{
        result = sheet.appendRow([new Date(),type,value,comment, name ]);
    }

    return result;
}

function createInlineKeyboard(){
    var types = getCategories(SpreadsheetApp.openById(ssId).getSheetByName('daily expenses'));

    var res = [],k=0,j=0;
    res[0] = [];

    for(var i in types){
        if(types[i][0] == ""){
            break;
        }

        res[j][k] = {
            "text": types[i][1] + " " + types[i][0],
            "switch_inline_query_current_chat": "" + types[i][0] + " "
        };

        k++;
        if(i != 0 && !((i+1)%3)){
            j++;
            res[j]=[];
            k=0;
        }
    }

    return {
        "inline_keyboard": res,
    };

}

