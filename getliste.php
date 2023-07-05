<?php

// https://www.tiny.cloud/docs/advanced/php-upload-handler/#examplepostacceptorphp

// error_reporting(E_ERROR | E_PARSE);

class Response {
	public array $debug;
	public string $error;
	public string $status;
	public array $data = array();
	public string $folder;
}

class FileModel {
	public string $type;
	public string $name;
	public string $url;
}

class File {
	public string $name;
	public string $extension;
	public bool $isFolder;
	public string $absolutePath;
	public string $relativePath;
}

  /***************************************************
   * Only these origins are allowed to upload images *
   ***************************************************/
  $accepted_origins = array("http://localhost:3000", "http://192.168.1.1", "http://example.com");

  $excludedSystemFolders = array(".", "..");
  $excludedSystemFiles = array(".DS_Store");

  $excludedFolders = array();
  $excludedFiles = array();

  function isExcluded(string $fileName): bool {
	global $excludedSystemFolders, $excludedSystemFiles, $excludedFolders, $excludedFiles;
	return in_array($fileName, $excludedSystemFolders)
	|| in_array($fileName, $excludedSystemFiles)
	|| in_array($fileName, $excludedFolders)
	|| in_array($fileName, $excludedFiles);
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

  $requestedFolder = $baseFolder . $_POST["u"];

  $files = scandir($requestedFolder);

  foreach ($files as $file) {
	if (isExcluded($file)) {
		continue;
	}
	$newEntry = new FileModel();
	if (is_dir($requestedFolder . "/" . $file)) {
		$newEntry->type = "folder";
		$newEntry->name = $file;
	} else {
		$ext = extractExtention($file);
		$newEntry->type = $ext;
		$newEntry->name = $file;
		$newEntry->url = $requestedFolder . "/" . $file;
	}
	array_push($response->data, $newEntry);
  }
  $response->folder = $requestedFolder;

  $response->debug = array_merge($response->debug, array('response' => $files));
  echo json_encode($response);

?>