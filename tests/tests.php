<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" href="../tests/libraries/qunit.css" type="text/css" />
    <script type="text/javascript" src="../libraries/jquery.js"></script>
    <script type="text/javascript" src="../libraries/jquery.rdfquery.core.js"></script>
    <script type="text/javascript" src="libraries/qunit.js"></script>
    <?php
    
    $iterator = new DirectoryIterator(dirname(__FILE__));
    foreach ($iterator as $file) {
        if (!$file->isDot() && !$file->isDir()) {
            $fileName = $file->getFileName();
            
            if (substr($fileName, -8) === '.test.js') {
                $sourceFileName = substr($fileName, 0, -8)
                                . '.js';
                
                echo '<script type="text/javascript" src="../src/' . $sourceFileName . '"></script>' . PHP_EOL;
                echo '<script type="text/javascript" src="' . $fileName . '"></script>' . PHP_EOL;
            }
        }
    }
    ?>
  </head>
  <body>
    <h1 id="qunit-header">RDFauthor Unit Test</h1>
    <h2 id="qunit-banner"></h2>
    <h2 id="qunit-userAgent"></h2>
    <ol id="qunit-tests">
    </ol>
  </body>
</html>
