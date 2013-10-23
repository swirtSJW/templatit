<?php
/*
 * This page is the ajax router to return Templatit templates by ajax with get or post request for ?tmpl8=templatename
 * If the template exists, it returns the template output.  If it does not, it returns an html comment.
 */
include_once '../include.inc';
//If any of your templates that you are loading by ajax require any functions from included files,
// you will need to include them below.
require_once "../../inc-publicFunc.php";

//Check to see if there is a post or get request
if ((!empty($_REQUEST)) && ((isset($_REQUEST['tmpl8'])) )) {
   //Check for data being passed in.
    if ((!empty($_REQUEST)) && ((isset($_REQUEST['params'])) )) {
        //There is parameter(s) to be passed to the template
        //Parse the JSON
        $oParams = (json_decode($_REQUEST['params']));
        //Build the template object
        $oTemplate = newTemplateObject($_REQUEST['tmpl8'],'');
        //Pass it to the template
        $oTemplateObject->vars = $oParams;
        print(templatit($oTemplate));
    } else {
        //No params, so just get the template.
        print(tmpl8($_REQUEST['tmpl8']));
    }
} else {
    //return 404
  //header('HTTP/1.0 404 Not Found');
  $sHost  = $_SERVER['HTTP_HOST'];
  // Full path to 404 page or page they should be bounced to 
  $page_404_location = '';
  header("Location: http://$sHost/$page_404_location");
}
?>