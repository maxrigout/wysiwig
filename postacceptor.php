<?php

/*
	v0.0.7

	31/10/2023
	* simplified the way to set error messages/codes in the response
	* moved common stuff to server-explorer-common.php

	27/09/2023
	* fixed some http codes
*/

// https://www.tiny.cloud/docs/advanced/php-upload-handler/#examplepostacceptorphp

// error_reporting(E_ERROR | E_PARSE);

	$phpFileUploadErrors = array(
		0 => 'There is no error, the file uploaded with success',
		1 => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
		2 => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form',
		3 => 'The uploaded file was only partially uploaded',
		4 => 'No file was uploaded',
		6 => 'Missing a temporary folder',
		7 => 'Failed to write file to disk.',
		8 => 'A PHP extension stopped the file upload.',
	);

	require_once "params.php";
	require_once "server-explorer-common.php";

	$response = createResponse();

	if (isset($_SERVER['HTTP_ORIGIN'])) {
		// same-origin requests won't set an origin. If the origin is set, it must be valid.
		if (in_array($_SERVER['HTTP_ORIGIN'], $accepted_origins)) {
			header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
		} else {
			header("HTTP/1.1 403 Origin Denied");
			echo_response();
			return;
		}
	}

	// Don't attempt to process the upload on an OPTIONS request
	if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
		header("Access-Control-Allow-Methods: POST, OPTIONS");
		return;
	}

	$temp = $_FILES["file"];

	if (is_uploaded_file($temp['tmp_name'])) {
		/*
			If your script needs to receive cookies, set images_upload_credentials : true in
			the configuration and enable the following two headers.
		*/
		// header('Access-Control-Allow-Credentials: true');
		// header('P3P: CP="There is no P3P policy."');

		// Sanitize input
		if (preg_match("/([^\w\s\d\-_~,;:\[\]\(\).])|([\.]{2,})/", $temp['name'])) {
			$debugMessage = "invalid file name! " . $temp['name'];
			setResponseError($response, "cannot upload the file.", "PA-01", $debugMessage);
			header("HTTP/1.1 400 Bad Request");
			echo_response();
			return;
		}

		// Verify extension
		if (!in_array(strtolower(pathinfo($temp['name'], PATHINFO_EXTENSION)), $allAcceptedFileExtensions)) {
			$debugMessage = "extension needs to be one of the following: " . implode(", ", $allAcceptedFileExtensions);
			setResponseError($response, "cannot upload the file.", "PA-02", $debugMessage);
			header("HTTP/1.1 400 Bad Request");
			echo_response();
			return;
		}

		$selectedFolder = $_POST["u"];
		$filetowrite = $baseFolder . $selectedFolder;
		if ($selectedFolder !== "") {
			$filetowrite = $filetowrite . "/";
		}

		$filetowrite = $filetowrite . $temp['name'];
		$absoluteFilePath = realpath($filetowrite);
		$response->debug = array_merge($response->debug, array('fileWritten' => $absoluteFilePath));

		// verify the file doesn't already exist
		if (file_exists($filetowrite)) {
			$debugMessage = "file already exists." . $filetowrite;
			setResponseError($response, "cannot upload the file.", "PA-03", $debugMessage);
			header("HTTP/1.1 500 Server Error");
			echo_response();
			return;
		}

		if (!move_uploaded_file($temp['tmp_name'], $filetowrite)) {
			$debugMessage = "unable to move the file... Attempted to write the file to:" . $absoluteFilePath;
			setResponseError($response, "cannot upload the file.", "PA-04", $debugMessage);
			header("HTTP/1.1 500 Server Error");
		} else {
			$response->status = "success";
		}
		echo_response();

	} else if ($_FILES["file"]["error"] > 0) {
		// Notify editor that the upload failed
		$debugMessage = "the upload has failed! Error: " . $phpFileUploadErrors[$_FILES["file"]["error"]];
		setResponseError($response, "cannot upload the file.", "PA-05", $debugMessage);
		header("HTTP/1.1 500 Server Error");
		echo_response();
	}
?>
