<?php

// https://www.tiny.cloud/docs/advanced/php-upload-handler/#examplepostacceptorphp

// error_reporting(E_ERROR | E_PARSE);

class Response {
	public array | null $debug;
	public string $error;
	public string $status;
	public array $data = array();
	public string $folder;
}

class FileResponse {
	public string | null $type;
	public string $name;
	public string | null $url;
}

class File {
	public string $name;
	public string | null $extension;
	public bool $isFolder;
	public string $absolutePath;
	public string $relativePath;
}

/***************************************************
* Only these origins are allowed to upload images *
***************************************************/
$accepted_origins = array("http://localhost:3000", "http://192.168.1.1", "http://example.com");

$acceptedImageFileExtensions = array("gif", "jpg", "jpeg" , "png");
$acceptedMediaFileExtensions = array();
$acceptedLinkFileExtensions = array("pdf", "mscz", "midi", "mdi");

$acceptedExtensions = array("image" => $acceptedImageFileExtensions, "file" => $acceptedLinkFileExtensions, "media" => $acceptedMediaFileExtensions);

$excludedSystemFolderNames = array(".", "..");
$excludedSystemFileNames = array(".DS_Store");

$excludedFolders = array();
$excludedFiles = array();

function isExtAccepted(string | null $extension): bool {
	if ($extension === null) {
		return true;
	}
	global $acceptedExtensions, $filesType;
	return in_array($extension, $acceptedExtensions[$filesType]) || sizeof($acceptedExtensions[$filesType]) === 0;
}

function isFileExcluded(File $file): bool {
	global $excludedSystemFileNames, $excludedFiles;
	return in_array($file->name, $excludedSystemFileNames)
	|| in_array($file->name, $excludedFiles)
	|| !isExtAccepted($file->extension);
}

function isFolderExcluded(File $folder): bool {
	global $excludedSystemFolderNames, $excludedFolders;
	return in_array($folder->name, $excludedSystemFolderNames)
	|| in_array($folder->name, $excludedFolders);
}

function isExcluded(File $file): bool {
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

/*************************************************************************
* Set this flag to false to prevent returning debug info to the client! *
*************************************************************************/
$debug_enabled = true;

$response = new Response();
if ($debug_enabled) {
	$response->debug = array('files' => $_FILES, 'server' => $_SERVER, 'post' => $_POST);
}

/*********************************************
* Change this line to set the upload folder *
*********************************************/
$baseFolder = "img/";

if (isset($_SERVER['HTTP_ORIGIN'])) {
	// same-origin requests won't set an origin. If the origin is set, it must be valid.
	if (in_array($_SERVER['HTTP_ORIGIN'], $accepted_origins)) {
		header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
	} else {
		header("HTTP/1.1 403 Origin Denied");
		echo json_encode($response);
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
if ($requestedFolder[strlen($requestedFolder)-1] == '/') {
	$requestedFolder = substr($requestedFolder, 0, strlen($requestedFolder)-1);
}
$filesType = $_POST["type"];

$scannedFiles = scandir($requestedFolder);

if ($scannedFiles === false) {
	header("HTTP/1.1 500 Internal Server Error");
	echo json_encode($response);
	return;
}

$fileModels = array();

foreach ($scannedFiles as $sf) {
	$file = new File();
	$file->name = $sf;
	$file->relativePath = $requestedFolder . "/" . $sf;
	$file->absolutePath = realpath($file->relativePath);
	if (is_dir($file->relativePath)) {
		$file->isFolder = true;
		$file->extension = null;
	} else {
		$file->extension = extractExtention($sf);
		$file->isFolder = false;
	}
	array_push($fileModels, $file);


	if (isExcluded($file)) {
		continue;
	}

	$newEntry = new FileResponse();

	if ($file->isFolder) {
		$newEntry->type = "folder";
		$newEntry->name = $file->name;
		$newEntry->url = null;
	} else {
		$newEntry->type = $file->extension;
		$newEntry->name = $file->name;
		$newEntry->url = $file->relativePath;
	}
	array_push($response->data, $newEntry);
}
$response->folder = $requestedFolder;

if ($debug_enabled) {
	$response->debug = array_merge($response->debug, array('scanned_files' => $scannedFiles), array('file_objects' => $fileModels));
}

echo json_encode($response);

?>