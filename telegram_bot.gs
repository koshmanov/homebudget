function getMe() {
    var url = telegramUrl + '/getMe';
    var response = UrlFetchApp.fetch(url);
    Logger.log(response.getContentText());
}

function setWebhook() {
    var url = telegramUrl + '/setWebhook?url=' + webAppUrl;
    var response = UrlFetchApp.fetch(url);
    Logger.log(response.getContentText());
}

function sendMessage(id, text) {
    var inline_keyboard = {
//    "ReplyKeyboardRemove": {
//      "remove_keyboard": true,
        "inline_keyboard": [
            [
                {"text": "working_lunch", "switch_inline_query_current_chat": "working_lunch "},
                {"text": "food", "switch_inline_query_current_chat": "food "},
                {"text": "taxi", "switch_inline_query_current_chat": "taxi "},
            ],
            [{"text": "shopping", "switch_inline_query_current_chat": "shopping "},
                {"text": "entertainment", "switch_inline_query_current_chat": "entertainment "},
                {"text": "makeup", "switch_inline_query_current_chat": "makeup "},
            ],
            [
                {"text": "medicine", "switch_inline_query_current_chat": "medicine "},
                {"text": "education", "switch_inline_query_current_chat": "education "},
                {"text": "gifts", "switch_inline_query_current_chat": "gifts "},
            ]
        ],
//    "ReplyKeyboardMarkup": {
//      "keyboard": [
//        [{"text": '1'}, {"text": '2'}, {"text": '3'}],
//        [{"text": '4'}, {"text": '5'}, {"text": '6'}],
//        [{"text": '7'}, {"text": '8'}, {"text": '9'}],
//        [{"text": '0'}]
//      ],
//      "resize_keyboard": true,
//      "one_time_keyboard": true
//    }
    };
    var url = telegramUrl + '/sendMessage'
        + '?chat_id=' + id
        + '&text=' + text
        + '&reply_markup=' + encodeURIComponent(JSON.stringify(inline_keyboard, null)) + '';
    Logger.log(url);
    var params = {
        "method": "get",
        "escaping": false,
        "muteHttpExceptions": false
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

    Ids.map(function (x) {
        if (x == data.message.from.id) {
            is_allow = true;

        }
    });
    if (!is_allow) {
        sendMessage(id, "Premission denied: 403; debug: allow - " + is_allow + " user_id: " + data.message.from.id);
        return;
    }

    var sheet = SpreadsheetApp.openById(ssId).getSheetByName('daily expenses');

    if (/^\//.test(text)) {
        var commandName = text.slice(1);
        if (commandName == "total") {
            var total = getTotalByMonth(sheet);
            sendMessage(id, name + ", for current (" + total.month + ") month, TOTAL is: " + total.total);
            return;
        }
    }
    var splited_message = text.split(" ");

    var type = splited_message[1];
    var value = splited_message[2];
    var comment = splited_message[3] ? splited_message.slice(3).join(" ") : "";

    var answer = "Hi " + name + ", thanks for the request: " + type + " - " + value + " " + comment;

    SpreadsheetApp.openById(ssId).getSheetByName('bot_logs').appendRow([new Date(), id, name, text, answer, JSON.stringify(e, null, 4)]);

    if (type && value) {
        var result = sheet.appendRow([new Date(), type, value, comment, name]);
        sendMessage(id, answer);
        sumByMonthByType(SpreadsheetApp.openById(ssId).getSheetByName('daily expenses'));
    }


//mail debugger
//  GmailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'message from bot', JSON.stringify(e,null,4));

}

