<?php

/*
	v0.0.5
*/

// https://www.tiny.cloud/docs/advanced/php-upload-handler/#examplepostacceptorphp

// error_reporting(E_ERROR | E_PARSE);

	class Response {
		public array | null $debug;
		public string $error;
		public string $status;
		public string $errorCode;
	}

	require_once "params.php";

	function echo_response() {
		global $debug_enabled, $response;
		header('Content-Type: application/json; charset=utf-8');
		if (!$debug_enabled) {
			$response->debug = null;
		}
		echo json_encode($response);
	}

	$response = new Response();
	$response->debug = array('_files' => $_FILES, '_server' => $_SERVER, '_post' => $_POST);

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
			$response->status = "error";
			$response->error = "cannot upload the file.";
			$response->errorCode = "PA-01";
			$response->debug = array_merge($response->debug, array("debug-message" => $debugMessage));
			header("HTTP/1.1 400 Bad Request");
			echo_response();
			return;
		}

		// Verify extension
		if (!in_array(strtolower(pathinfo($temp['name'], PATHINFO_EXTENSION)), $allAcceptedFileExtensions)) {
			$debugMessage = "extension needs to be one of the following: " . implode(", ", $allAcceptedFileExtensions);
			$response->status = "error";
			$response->error = "cannot upload the file.";
			$response->errorCode = "PA-02";
			$response->debug = array_merge($response->debug, array("debug-message" => $debugMessage));
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
			$response->status = "error";
			$response->error = "cannot upload the file.";
			$response->errorCode = "PA-03";
			$response->debug = array_merge($response->debug, array("debug-message" => $debugMessage));
			header("HTTP/1.1 500 Server Error");
			echo_response();
			return;
		}

		if (!move_uploaded_file($temp['tmp_name'], $filetowrite)) {
			$debugMessage = "unable to move the file... Attempted to write the file to:" . $absoluteFilePath;
			$response->status = "error";
			$response->error = "cannot upload the file.";
			$response->errorCode = "PA-04";
			$response->debug = array_merge($response->debug, array("debug-message" => $debugMessage));
			header("HTTP/1.1 500 Server Error");
		} else {
			$response->status = "success";
		}
		echo_response();

	} else {
		// Notify editor that the upload failed
		$debugMessage = "the upload has failed!";
		$response->status = "error";
		$response->error = "cannot upload the file.";
		$response->errorCode = "PA-05";
		$response->debug = array_merge($response->debug, array("debug-message" => $debugMessage));
		header("HTTP/1.1 500 Server Error");
		echo_response();
	}
?>
