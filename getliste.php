<?php

// error_reporting(E_ERROR | E_PARSE);

class Response {
	public array | null $debug;
	public string $error;
	public string $errorCode;
	public string $status;
	public array $data = array();
}

class File {
	public string | null $type;
	public string $name;
	public string | null $url;
}

class ScannedFile {
	public string $name;
	public string | null $extension;
	public bool $isFolder;
	public string $absolutePath;
	public string $relativePath;
}

require_once "params.php";

function isExtIncluded(string | null $extension): bool {
	if ($extension === null) {
		return true;
	}
	global $includedExtensions, $filesType;
	return in_array($extension, $includedExtensions[$filesType]) || sizeof($includedExtensions[$filesType]) === 0;
}

function isFileExcluded(ScannedFile $file): bool {
	global $excludedSystemFileNames, $excludedFiles;
	return in_array($file->name, $excludedSystemFileNames)
	|| in_array($file->name, $excludedFiles)
	|| !isExtIncluded($file->extension);
}

function isFolderExcluded(ScannedFile $folder): bool {
	global $excludedSystemFolderNames, $excludedFolders;
	return in_array($folder->name, $excludedSystemFolderNames)
	|| in_array($folder->name, $excludedFolders);
}

function isExcluded(ScannedFile $file): bool {
	if ($file->isFolder) {
		return isFolderExcluded($file);
	}
	return isFileExcluded($file);
}

function extractExtention(string $fileName): string | null {
	$pos = strrpos($fileName, '.');
	if ($pos === false) {
		return null;
	}
	return substr($fileName, $pos + 1);
}

function scanDirectory(string $directory): array | null {
	$result = scandir($directory);

	global $response;
	$response->debug = array_merge($response->debug , array('scanned_files' => $result));

	if ($result === false) {
		return null;
	}
	$scannedFiles = array();
	foreach ($result as $sf) {
		$file = new ScannedFile();
		$file->name = $sf;
		$file->relativePath = $directory . "/" . $sf;
		$file->absolutePath = realpath($file->relativePath) . "/" . $sf;
		$file->isFolder = is_dir($file->relativePath);
		if ($file->isFolder) {
			$file->extension = null;
		} else {
			$file->extension = extractExtention($sf);
		}
		array_push($scannedFiles, $file);
	}
	return $scannedFiles;
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


/*
 *  We first check for if the origin is accepted
 */
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

// TODO: sanitize input

$requestedFolder = $baseFolder . $_POST["u"];

/*
 * On supprime le dernier '/' s'il y en a un
 */
if ($requestedFolder[strlen($requestedFolder) - 1] == '/') {
	$requestedFolder = substr($requestedFolder, 0, strlen($requestedFolder) - 1);
}

$filesType = $_POST["type"];

$scannedFiles = scanDirectory($requestedFolder);

if ($scannedFiles === null) {
	$debugMessage = "unable to scan directory: " . $requestedFolder;
	$response->status = "error";
	$response->error = "unable to get the files!";
	$response->errorCode = "GL-01";
	$response->debug = array_merge($response->debug, array("debug-message" => $debugMessage));
	header("HTTP/1.1 500 Internal Server Error");
	echo_response();
	return;
}

$files = array();

foreach ($scannedFiles as $file) {
	if (isExcluded($file)) {
		continue;
	}

	$newEntry = new File();

	if ($file->isFolder) {
		$newEntry->type = "folder";
		$newEntry->name = $file->name;
		$newEntry->url = null;
	} else {
		$newEntry->type = $file->extension;
		$newEntry->name = $file->name;
		$newEntry->url = $file->relativePath;
	}
	array_push($files, $newEntry);
}

// need to remove the leading . and .. and /
$finalIndex = 0;
while ($requestedFolder[$finalIndex] === "." || $requestedFolder[$finalIndex] === "/") {
	$finalIndex++;
}
$folder = substr($requestedFolder, $finalIndex);

$response->data = array_merge(array('folder' => $folder), array('files' => $files));
$response->status = "success";
$response->debug = array_merge($response->debug, array('file_objects' => $scannedFiles));

echo_response();

?>