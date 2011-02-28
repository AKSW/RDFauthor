<?php
header('Content-type: application/' . $_REQUEST['contentType']);
echo file_get_contents($_REQUEST['endpoint'] . '?query=' . urlencode($_REQUEST['query']));
?>
