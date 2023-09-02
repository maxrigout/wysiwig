<?php
error_reporting(E_ERROR | E_PARSE);
	class Response {
		public array | null $debug;
		public string $error;
		public string $errorCode;
		public string $status;
	}

	require_once "params.php";

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
			$response->error = "unable to delete file";
			$response->status = "error";
			$response->errorCode = "AF-D-02";
			$response->debug = array_merge($response->debug, array("debug-message" => $debugMessage));
			header("HTTP/1.1 500 Internal Server Error");
			echo json_encode($response);
			return;
		}

		if (!rename($from, $to)) {
			$debugMessage = "unable to move the file from: " . $from . " to " . $to;
			$response->error = "unable to delete file";
			$response->status = "error";
			$response->errorCode = "AF-D-01";
			$response->debug = array_merge($response->debug, array("debug-message" => $debugMessage));
			header("HTTP/1.1 500 Internal Server Error");
			echo json_encode($response);
			return;
		}
		$response->status = "success";
		echo json_encode($response);
	}

	if ($action === "new-folder") {
		$folderName = $payload->f;
		$folderToCreate = $baseFolder . $folder . "/" . $folderName;
		if (is_dir($folderToCreate)) {
			$debugMessage = "directory " . $folderToCreate . " already exists!";
			$response->error = "unable to create the folder";
			$response->status = "error";
			$response->errorCode = "AF-N-02";
			$response->debug = array_merge($response->debug, array("debug-message" => $debugMessage));
			header("HTTP/1.1 500 Internal Server Error");
			header('Content-Type: application/json; charset=utf-8');
			echo json_encode($response);
			return;
		}
		if (!mkdir($folderToCreate, 0777, true)) {
			$debugMessage = "unable to create the directory: " . $folderToCreate;
			$response->error = "unable to create the folder";
			$response->status = "error";
			$response->errorCode = "AF-N-01";
			$response->debug = array_merge($response->debug, array("debug-message" => $debugMessage));
			header("HTTP/1.1 500 Internal Server Error");
			header('Content-Type: application/json; charset=utf-8');
			echo json_encode($response);
			return;
		}
		$response->status = "success";
		echo json_encode($response);
	}
?>