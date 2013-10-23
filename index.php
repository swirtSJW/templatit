<?php
//This page is not important, but needs to exist to control page rquests.

 //return 404
  $sHost  = $_SERVER['HTTP_HOST'];
  // Full path to 404 page or page they should be bounced to
  $page_404_location = '';
  header("Location: http://$sHost/$page_404_location");