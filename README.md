##**The homebudget app**

#####The google spreadsheet application with telegram bot integration.

###*Instalation*

 1. Create copy google spreadsheet document from [template](https://goo.gl/48ymYK)
 2. In the created document go to *"Tools"* -> *"Script editor..."*
 3. At the script editor page go to the navigation panel, *"Publish"* -> *"Deploy as web app"*,
 at the popup window, change *"Who has access to the app:"* - *"anyone, even anonymous"*
 and then - publish, Google will asks some permissions, after confirmation you will 
 see response with *"web app url filed"*, copy and set variable **webAppUrl** in the *config.gs*.
 4. Set **ssId** variable, your spreadsheet document id
 
 5. Then go to the telegram and create bot, type in search field *"botfather"*
 6. In botfather chat type /createbot
    - choose bot name
    - bot username
    - copy token, and set **token** variable in the config file
    
 7. Now go to install.gs file and run *"setWebhook"* function
 8. Then repeat step 3, you need to update G application.
 
 9. Then you can try to send some test message in telegram bot, 
 but you will see "permission denied" and your telegram id, copy this id and past in *config.gs* 
 file in array **Ids**
 10. Then repeat step 3 again.
 
 11. In telegram bot chat: choose category type amount and comment(optional), and you can see the data in your document.
 12. In telegram bot chat: type */total* for get total by current month.
 13. That's all!
 
 ###*Screenshots*
 
 ![telegram bot](https://drive.google.com/open?id=0B1CaSjYNRdI6RUtjOGpVa2pJVXM)


