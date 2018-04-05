

function sendMessage(id, text) {

    inline_keyboard = createInlineKeyboard();

    var url = telegramUrl + '/sendMessage';

    var payload = {
        "chat_id": id,
        "text": text,
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
    var name = data.message.chat.first_name;

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
        var commandName = text.slice(1);
        if( commandName == "total"){
            var total = getTotalByMonth(sheet);
            var income = getIncomeByMonth(sheet);
            sendMessage(id, " <b>Month:</b> " + total.month + " <b>| TOTAL</b>: " + total.total + " <b>| Income</b>: " + income.total + " <b>| Balance</b>: " + (income.total - total.total) );
            return;
        }
        if ( commandName == "doc_url"){
            sendMessage(id, "<b> url: </b>" + doc_short_url);
            return;
        }
    }
    var splited_message = text.split(" ");

    var type = splited_message[1];
    var value = splited_message[2];
    var comment = splited_message[3]?splited_message.slice(3).join(" "):"";

    var answer = "Hi " + name + ", thanks for the request: " + type + " - " + value + " " + comment;

    SpreadsheetApp.openById(ssId).getSheetByName('bot_logs').appendRow([new Date(),id,name,text,answer, JSON.stringify(e, null, 4)]);

    if (type && value){
        processData(type,value,comment, name);

        sendMessage(id, answer);
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

