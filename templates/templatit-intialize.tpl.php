<?= tto(__FILE__); ?>
<script>
    var oTemplatit = new Object;
    oTemplatit.isDocReady = false;
    oTemplatit.brackets = new Object;
        //Add and define minimum cutoffs for brackets here.
        //Must be in order from smallest to largest.
        oTemplatit.brackets.mobile = 0;
        oTemplatit.brackets.tablet = 750;
        oTemplatit.brackets.wide = 955;



    oTemplatit.path = '<?= TEMPLATIT_PATH; ?>';
    oTemplatit.aSubBrackets = new Object;
    oTemplatit.screensize = new Object;
        oTemplatit.screensize['initialized'] = 'FALSE';
    oTemplatit.templateTosser = new Object;
        oTemplatit.templateTosser.tossCalls = new Object;
        oTemplatit.templateTosser.tossable = new Object;

</script>

<script async type="text/javascript" src="<?= TEMPLATIT_PATH; ?>/templatit.js?"></script>


<?= ttc(__FILE__); ?>