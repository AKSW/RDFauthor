<?php

define('RDFAUTHOR_BASE', 'http://localhost/rdfauthor');

?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" href="../tests/libraries/qunit.css" type="text/css" />
    <script type="text/javascript">
        var TEST_CONTAINER_ID = 'test-container';
        var RDFAUTHOR_BASE = '<?php echo RDFAUTHOR_BASE ?>'
    </script>
    <script type="text/javascript" src="../libraries/jquery.js"></script>
    <script type="text/javascript" src="../libraries/jquery.rdfquery.core.js"></script>
    <script type="text/javascript" src="libraries/qunit.js"></script>
    <?php
    
    function load_module($moduleName) {
        $testPath = (string) $moduleName
                  . '.test.js';
        
        $sourcePath = '../src/'
                    . (string) $moduleName
                    . '.js';
        
        if (is_readable($sourcePath)) {
            // include source
            echo '<script type="text/javascript" src="' . $sourcePath . '"></script>' . PHP_EOL;
        }
        
        // include test
        echo '<script type="text/javascript" src="' . $testPath . '"></script>' . PHP_EOL;
    }
    
    if (isset($_GET['module'])) {
        // use module
        load_module($_GET['module']);
    } else {
        // search for all modules
        $iterator = new DirectoryIterator(dirname(__FILE__));
        foreach ($iterator as $file) {
            if (!$file->isDot() && !$file->isDir()) {
                $testPath = $file->getFileName();

                if (substr($testPath, -8) === '.test.js') {
                    load_module(substr($testPath, 0, -8));
                }
            }
        }
    }
    ?>
    <title>RDFauthor Unit Tests<?php if (isset($_GET['module'])) echo ' (Module: ' . (string) $_GET['module'] . ')'?></title>
  </head>
  <body>
    <h1 id="qunit-header">RDFauthor Unit Tests<?php if (isset($_GET['module'])) echo ' (Module: ' . (string) $_GET['module'] . ')'?></h1>
    <h2 id="qunit-banner"></h2>
    <h2 id="qunit-userAgent"></h2>
    <ol id="qunit-tests"></ol>
    
    <div id="test-container" style="display:none"></div>
    
    <div id="rdfa-container" 
         style="display:none" 
         xmlns:u="http://ns.aksw.org/update/" 
         xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
         xmlns:xsd="http://www.w3.org/2001/XMLSchema#">
        <div about="http://example.com/r1" u:from="http://example.com/g1">
            <span property="rdfs:label">Resource 1</span>
            <span rel="rdf:type" resource="http://example.com/c1">Class 1</span>
            <span property="rdfs:label" u:from="http://example.com/g2" datatype="xsd:string">Resource 1 (label 2)</span>
        </div>
    </div>
  </body>
</html>
