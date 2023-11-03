<?php
	/*
		v0.0.7

		31/10/2023
		* simplified the way to set error messages/codes in the response
		* moved common stuff to server-explorer-common.php
		* create request class

		27/09/2023
		* fixed some http codes

		* functionality created
	*/

	// error_reporting(E_ERROR | E_PARSE);

	require_once "params.php";
	require_once "server-explorer-common.php";

	function is_dir_empty($dir) {
		$handle = opendir($dir);
		while (($entry = readdir($handle)) !== false) {
			if ($entry != "." && $entry != "..") {
				closedir($handle);
				return false;
			}
		}
		closedir($handle);
		return true;
	}

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
	
	$folder = $_POST["u"];
	$action = $_POST["a"];
	$payload = json_decode($_POST["p"]);

	if ($action === "delete") {
		$fileName = $payload->f;
		$from = $baseFolder . $folder . "/" . $fileName;
		$trashFolder = $baseTrashFolder . $folder;

		if (!is_dir($trashFolder)) {
			mkdir($trashFolder, 0777, true);
		}
		$time = date("Y-m-d_H-i-s_");
		$to = $trashFolder . "/" . $time . $fileName;

		if (is_dir($from) && !is_dir_empty($from))
		{
			$debugMessage = "directory: " . $from . " is not empty! ";
			setResponseError($response, "unable to delete file", "AF-D-02", $debugMessage);
			header("HTTP/1.1 400 Bad Request");
			echo_response();
			return;
		}

		if (!rename($from, $to)) {
			$debugMessage = "unable to move the file from: " . $from . " to " . $to;
			setResponseError($response, "unable to delete file", "AF-D-01", $debugMessage);
			header("HTTP/1.1 500 Internal Server Error");
			echo_response();
			return;
		}
		$response->status = "success";
		echo_response();
	}

	else if ($action === "new-folder") {
		$folderName = $payload->f;

		// check if the name contains invalid characters
		if ($folderName == "" || strpbrk($folderName, "\\/?%*:|\"<>.;")) {
			$debugMessage = "not a valid folder name: " . $folderName;
			setResponseError($response, "unable to create the folder", "AF-N-03", $debugMessage);
			header("HTTP/1.1 400 Bad Request");
			echo_response();
			return;
		}

		$folderToCreate = $baseFolder . $folder . "/" . $folderName;
		if (is_dir($folderToCreate)) {
			$debugMessage = "directory " . $folderToCreate . " already exists!";
			setResponseError($response, "unable to create the folder", "AF-N-02", $debugMessage);
			header("HTTP/1.1 500 Internal Server Error");
			echo_response();
			return;
		}
		if (!mkdir($folderToCreate, 0777, true)) {
			$debugMessage = "unable to create the directory: " . $folderToCreate;
			setResponseError($response, "unable to create the folder", "AF-N-01", $debugMessage);
			header("HTTP/1.1 500 Internal Server Error");
			echo_response();
			return;
		}
		$response->status = "success";
		echo_response();
	}
?>