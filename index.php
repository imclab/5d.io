<?php
		header('Content-type: text/plain');
		$url = $_GET["url"];
		$query = "http://netrenderer.com/?url=" . urlencode($url);
        $ch = curl_init($query);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $output = curl_exec($ch);
        curl_close($ch);
		if (ereg ("\"(http://renderer.geotek.de/image.php[^\"]*)", $output, $regs)) {
		    echo "$regs[1]";
		} else {
		    echo "";
		}
?>