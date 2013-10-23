<?php
  /**
   * A simple templating system  for outputing html
   * @param $oTemplate is a template object  keyed by a template name
   * @return string of html
   * @author  Steve Wirt
   * @version 1-1
   */
   defineTemplatitPath();


  function templatit($oTemplate){
      //sanitize and structure
      $oTemplate->name =  (!empty($oTemplate->name)) ? $oTemplate->name: 'badTemplateName' ;
      $oTemplate->callback =  (!empty($oTemplate->callback)) ? $oTemplate->callback: '' ;
      $oTemplate->callback =  (function_exists($oTemplate->callback)) ? $oTemplate->callback: '' ;

      //include the file
      $sTPLfile = 'templates/'.$oTemplate->name . '.tpl.php';
      if (!empty($oTemplate->callback)) {
          ob_start($oTemplate->callback);
      } else {
          ob_start();
      }


      $bIncludeWorked = include($sTPLfile);
      //means the include was successful
      $sReturn =  ob_get_contents();
      ob_end_clean();

     if (empty($bIncludeWorked)) {
        //means the include failed
        $sReturn = "<!-- include of ".$oTemplate->name." failed --> \n";
      }

      $sReturn = (!empty($sReturn)) ? $sReturn : '' ;
      return $sReturn;
  } //end function templatit


/**
 * Pass it a template name and it builds a template object ready for vars
 *
 * @param $sTemplateName a string template name withiout tpl.php
 *
 * @param $sCallbackFunction string optonal callback function name
 * calls a function that accesspts a string and returns a string. (can be used to process html or wrap it.
 * @return A fully structured template object array lacking only vars.
 * @author  Steve Wirt
 */
function newTemplateObject($sTemplateName, $sCallbackFunction = '') {
    $oTemplateObject = new stdClass;
    $oTemplateObject->name = $sTemplateName;
    $oTemplateObject->callback = $sCallbackFunction;
    $oTemplateObject->vars = new stdClass;

    return $oTemplateObject;
}//end function newTemplateObject

/**
 * A shorthand version that builds a template with just a name
 *
 * @param $sTemplateName the name of the template to use
 *
 * @param mixed $mSomeVar to pass to the object as a var.  It will be available within the template
 *
 * @return string of html output by the tpl
 *
 * @author  Steve Wirt
 */
function tmpl8($sTemplateName = null, $mSomeVar = '') {
    if (!empty($sTemplateName) && is_string($sTemplateName)) {
        $oTemplateObject = newTemplateObject($sTemplateName);
        if (!empty($mSomeVar)) {
            $oTemplateObject->vars->templateVar1 = $mSomeVar;
        }

        return templatit($oTemplateObject);
    }
}


/**
 * Packages a template into a JS variable data on the page, and out puts the default target, and the tosscall.
 * @param string $sTemplateName That name of the template to prepare.
 * @param string $sStatesToToss   CSV of states that should be tossed.
 * @param string $sTargetID  optional target id that you would have to place on your page, otherwise it creates a default target.
 * @param boolean $bAjax If TRUE the text will use the ajax tosscall.
 * @return string HTML output.
 */
function templateToss($sTemplateName=NULL, $sStatesToToss=NULL, $sTargetID=NULL, $bAjax=FALSE ) {
    $sReturn = '';
    //load the template
    if (!empty($sTemplateName)) {
        //If not coming from ajax, load the template.
        $sHTML = (!$bAjax) ? tmpl8($sTemplateName): '';

        //Make a friendly template name without -
        $sJSfriendlyTemplateName = str_replace('-','_', $sTemplateName);
        //Make the default target if sTargetID is empty.
        if(empty($sTargetID)) {
            // Means there is no sTargetID so make the default
            $sTargetID = "tossTarget_$sTemplateName";
            $sReturn .= "<div id='$sTargetID'><!-- --></div>\n";
        }

        $sReturn .= "<script type='text/javascript' data-tpl='$sTemplateName'>\n";

        if (!empty($sHTML)) {
           //The template was returned, wrap it in JS
           $sBlock .= json_encode($sHTML);
           $sReturn .= "oTemplatit.templateTosser.tossable.$sJSfriendlyTemplateName = $sBlock;\n";
        }
        $sReturn .= "$(document).on('templatitInitialized', function() {\n";
        $sReturn .= "console.log('I initted');";
            // Write the tosscall
            if ($bAjax === TRUE) {
                //Should come in via ajax
                $sReturn .= "       tossTemplateAjax ('$sTemplateName', '{$sStatesToToss}' , '$sTargetID', false);\n";
            }
            else {
                //Tossed the normal way.
                
                 $sReturn .= "      tossTemplate('$sJSfriendlyTemplateName', '{$sStatesToToss}' , '$sTargetID');\n";
            }
         $sReturn .=  "});\n";
            
        $sReturn .= "</script>\n";
    }


    return $sReturn;
}

/**
 * Outputs a template tracer  opening comment if user is admin
 *
 * @param $sFile string representing the file ' __FILE__' that is calling the function
 *
 * @param $sOptionalMessage string representing anything you want included in the template tracer output
 *
 * @return  string of html comments to output
 * @author  Steve Wirt
 */
function tto($sFile = 'tto() called incorrectly.  Must be tto(__FILE__)', $OptionalMessage='') {
    if (!empty($_GET) && !empty($_GET["debug"]) && ($_GET["debug"] == 'template' ))  {
      if ((is_array($OptionalMessage)) || (is_object($OptionalMessage))) {
        //Means it is a array or object, so convert it to a pretty string
        $OptionalMessage = print_r($OptionalMessage, TRUE);
      }
      $sOptionalMessage = (!empty($OptionalMessage))  ? "<!-- Message: $OptionalMessage -->\n" : '';
      return("\n<!-- <TEMPLATE> $sFile -->\n $sOptionalMessage \n");
    }
}


/**
 * Outputs a template tracer  closing comment if user is admin
 *
 * @param $sFile string representing the file ' __FILE__' that is calling the function
 *
 * @param $sOptionalMessage string representing anything you want included in the template tracer output
 *
 * @return string of html comments to output
 * @author  Steve Wirt
 */
function ttc($sFile = 'ttc() called incorrectly.  Must be ttc(__FILE__)', $OptionalMessage='') {

    if (!empty($_GET) && !empty($_GET["debug"]) && ($_GET["debug"] == 'template' )) {
      if ((is_array($OptionalMessage)) || (is_object($OptionalMessage))) {
        //Means it is a array or opject, so convert it to a pretty string
        $OptionalMessage = print_r($OptionalMessage, TRUE);
      }
      $sOptionalMessage = (!empty($OptionalMessage))  ? "<!-- Message: $OptionalMessage -->\n" : '';
      return( "\n<!-- </TEMPLATE> $sFile -->\n $sOptionalMessage \n");
    }
}


/**
 * This function defines the value of root relative path to templatit.
 * @return string path of the templatit directory
 * @author  Steve Wirt
 */
function defineTemplatitPath() {
    // Split both strings
    $aA =  explode('/', $_SERVER["DOCUMENT_ROOT"]);
    $aB = explode('/',__DIR__);
    $iB = 0;
    $aParsed = array ();
    $parseFlag = 1;

    //loop through $aA and look for sync
    foreach ($aA as $key=>$sDirectory) {
        //skip empty values
        if (empty($aB[$iB])) {
            $iB++;
        }
        //TRUE switch, first on to evaluate to true wins
        $debug .= '<p>comparing '.$sDirectory.' to '.$aB[$iB].' </p>';
        switch (TRUE) {
            case (empty($sDirectory)):
                break;

            case ((!empty($aB[$iB])) && ($sDirectory == $aB[$iB])):
                //we have a sync
                $parseFlag = 2;
                $aB[$iB] = '';
                $iB++;
                break;

            case ((!empty($aB[$iB])) && ($sDirectory == $aB[$iB]) && ($parseFlag == 2)):
                //no match
                $iB++;
                break;
           
            case ((!empty($aB[$iB])) && ($sDirectory != $aB[$iB]) && ($parseFlag == 2)):
                //no match
                $aParsed[] = $sDirectory;
                $iB++;
                break;
        }


    }
    $aB = array_filter($aB);
    $sPath = implode('/', $aB);
    /**
     * Root relative path to templatit
     */
    define('TEMPLATIT_PATH', '/' . $sPath);
}