// TemplatIt JS ///////////////////////////////////////////////////////////
/**
 * @author Steve Wirt
 */

/**
 * A quick way to harvest and parse any url parameters
 */
 var urlParams = {};
(function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();

/**
 * A simple way to look for a url parameter and output some debug info to console
 * @param {string} sMessage
 */
;function consoleMe(sMessage) {
     if (urlParams["debug"] === 'template') {
        console.log (sMessage);
     }
};



;(function($) {
    $(document).ready(function(){
        $(document).trigger("templatitInitialized", {});
        // CHECK FOR screen size TO SET  BODY data and oTemplatit.settings.screensize.current/////
        templatitSetScreenSize();
       // Continue to update the screensize if window is adjusted
       $(window).resize(templatitSetScreenSize);
       runTossCalls();
    });
})(jQuery);


/**
 * Sets the current screen size based on window width and screen brackets
 */
;function templatitSetScreenSize (){
    var screenSizeNew = 'mobile';//sets minimum default in case all logic fails
    var aSubBrackets = new Array();
    var sSubBrackets = '';
    if (!!oTemplatit.brackets) {
        //Loop through bracket states to determine which applies currently (race condition, last one to fit the size wins)
        for( var key in oTemplatit.brackets ){
            if (jQuery(window).width() >= oTemplatit.brackets[key]) {
                screenSizeNew = key;
                aSubBrackets.push(key + '-up');
            }
        }
        //unset the last value of the array
       aSubBrackets.pop();
       //implode the array.
       sSubBrackets = aSubBrackets.join(' ');
    }//end check for bracket

    //check to see if this is the first init or a resize
    if (oTemplatit.screensize.initialized != "TRUE") {
        //This is the first time this has been run
        //Trigger preStateChange
        $(document).trigger("preStateChange", {
                oldstate: sOldScreenState,
                newstate: screenSizeNew
        });
        jQuery('body').attr('data-screensize', screenSizeNew +' '+ sSubBrackets);
        jQuery('html').attr('data-screensize', screenSizeNew +' '+ sSubBrackets);
        oTemplatit.screensize.current = screenSizeNew;
        oTemplatit.screensize.initialized = "TRUE";
        consoleMe('Initialized as: ' + screenSizeNew);

        runTossCalls();
        //Trigger postStateChange
        $(document).trigger('postStateChange' ,{
            oldstate: sOldScreenState,
            newstate:screenSizeNew
        });
    } else {
        //this is being run on resize
        if(oTemplatit.screensize.current !== screenSizeNew) {
            //Means there has been a change from one screen state to another
            var sOldScreenState = oTemplatit.screensize.current;
            //update data in both locations
            consoleMe('Changed to state: ' + screenSizeNew);
            //Trigger preStateChange
            $(document).trigger("preStateChange", {
                oldstate: sOldScreenState,
                newstate: screenSizeNew
            });
            //This sets data-screensize on the body tag AND html tag so it can be referenced by css.
            jQuery('body').attr('data-screensize', screenSizeNew +' '+ sSubBrackets);
            jQuery('html').attr('data-screensize', screenSizeNew +' '+ sSubBrackets);
            oTemplatit.screensize.current = screenSizeNew;
            oTemplatit.aSubBrackets = sSubBrackets;
            //re-run the toss function calls
            runTossCalls();
            //Trigger postStateChange
            $(document).trigger("postStateChange",{
                oldstate: sOldScreenState,
                newstate:screenSizeNew
            });
        }
    }
};



// Template Tosser JS /////////////////////////////////////////////////////////////

;function tossTemplate (sTemplateName, aStates, sTargetID, bDoNow) {
     var sSanitizedTemplateName = sTemplateName.replace(":","-");
     var sSanitizedTemplateName = sSanitizedTemplateName.replace(/_/g,"-");
     var bDoNow = bDoNow || false;
     var sTargetID = sTargetID || "target-" + sSanitizedTemplateName;
     var sTargetInnerClass =  'tossed_' + sTargetID;
     var sUniqueTemplateID = sSanitizedTemplateName + '-to-' + sTargetID;

    //See if it should toss it now or just store the callback.
    if (bDoNow == 'true') {
        //Means it should do it now.
        //Examine the states and see if it should toss the template.
        var presence = aStates.indexOf(oTemplatit.screensize.current);
        if (presence != -1) {
            //The current size is within aStates
            sMessage = 'Tossing ' + sTemplateName + ' into ' + sTargetID;
            consoleMe(sMessage);
            jQuery("#" + sTargetID).html('<div class="' + sTargetInnerClass + '">' + oTemplatit.templateTosser.tossable[sTemplateName] + '</div>');

        } else {
            //The current state is not in the toss request so eat the target contents
            sMessage = 'Eating ' + sTemplateName + ' from ' + sTargetID;
            consoleMe(sMessage);
            jQuery('#' + sTargetID + '  .' + sTargetInnerClass).remove();
        }//end check for presence
    } // end check for bDoNow
    //save a copy of this function call in oTemplatit.templateTosser.tossCalls
    oTemplatit.templateTosser.tossCalls[sUniqueTemplateID] = 'tossTemplate (\'' + sTemplateName + '\', \'' + aStates + '\', \'' + sTargetID + '\', \'true\');';
};


;function runTossCalls(){
    if (!!oTemplatit.templateTosser.tossCalls){
        //There are some tossCalls to re-run
        for( var dataIDkey in oTemplatit.templateTosser.tossCalls ){
            eval(oTemplatit.templateTosser.tossCalls[dataIDkey]);
        }
    }
}; 

;function tossTemplateAjax (sTemplateNameAJX, aStatesAJX, sTargetIDsAJX, bDoNowAJX) {

     var bDoNowAJX = bDoNowAJX || false;
     var sTemplateNameAJX = sTemplateNameAJX || '';
     var sTargetIDsAJX = sTargetIDsAJX || '';
     var aStatesAJX = aStatesAJX || '';
     var  sUniqueTemplateName = 'AJX-' + sTemplateNameAJX;
     var sUniqueCallBackName = 'AJX-' + sTemplateNameAJX + '-to-';
     var  sUniqueCallBackName = sUniqueCallBackName.replace(/_/g,"-")  + sTargetIDsAJX;

    //See if it should toss it now or just store the callback.
    if (bDoNowAJX == 'true') {
            //Examine the states and see if it should toss the template.
            var presence = aStatesAJX.indexOf(oTemplatit.screensize.current);
            if ((presence != -1) &&  (!!sTemplateNameAJX) && (!!sTargetIDsAJX)) {
                //The current size is within aStatesAJX and it contains all the necessary params
               sMessage = 'AJAX Tossing ' + sTemplateNameAJX+ ' into ' + sTargetIDsAJX;
               consoleMe(sMessage);
                //Check to see if the template has already been ajaxed into data.
                if (!!oTemplatit.templateTosser[sUniqueTemplateName]) {
                    //It exists so toss it from data
                    tossTemplate(sUniqueTemplateName, aStatesAJX, sTargetIDsAJX, 'true');
                } else {
                    //It does not exist so ajax load the the template and save into data for the next time.

                    //TODO FOrk needed here so ajax from a non templatit request could be processed (look for http)
                    jQuery.get(oTemplatit.path + '/ajax/?tmpl8=' + sTemplateNameAJX, null, function(data,status){
                      if (status == 'success'){
                          //Save template to data
                          oTemplatit.templateTosser.tossable[sUniqueTemplateName] = data;

                          sMessage = 'AJAX Load Success: Data now in oTemplatit.templateTosser.tossable.' + sUniqueTemplateName;
                          consoleMe(sMessage);
                          //Toss it
                          tossTemplate(sUniqueTemplateName, aStatesAJX, sTargetIDsAJX, 'true');
                      } else {
                          sMessage = 'AJAX Load FAILED: ' + sUniqueTemplateName;
                          consoleMe(sMessage);
                          //Save a copy of this function call in oTemplatit.templateTosser.tossCalls  for retry next resize
                          oTemplatit.templateTosser.tossCalls[sUniqueCallBackName] = 'tossTemplateAjax (\'' + sTemplateNameAJX + '\', \'' + aStatesAJX + '\', \'' + sTargetIDsAJX + '\', \'true\');';
                      }
                    });
                }
            } else {
                //This is not the right state so just make sure this function call gets saved for resize by
                //putting this function call in oTemplatit.templateTosser.tossCalls

                oTemplatit.templateTosser.tossCalls[sUniqueCallBackName] = 'tossTemplateAjax (\'' + sTemplateNameAJX + '\', \'' + aStatesAJX + '\', \'' + sTargetIDsAJX + '\', \'true\');';

            } //end check for data exists
    } else {
        //This is not bDoNowAJX so just save it into oTemplatit.templateTosser.tossCalls
        oTemplatit.templateTosser.tossCalls[sUniqueCallBackName] = 'tossTemplateAjax (\''  + sTemplateNameAJX + '\', \'' + aStatesAJX + '\', \'' + sTargetIDsAJX + '\', \'true\');';
    }// end check for bDoNowAJX
};