<?php

	/*
		v0.0.7

		31/10/2023
		* simplified the way to set error messages/codes in the response
		* moved common stuff to server-explorer-common.php
		* create request class

		27/09/2023
		* added case for when the file type isn't supported
	*/

	// error_reporting(E_ERROR | E_PARSE);

	require_once "params.php";
	require_once "server-explorer-common.php";

	class Request {
		public string $type;
		public string $folder;

		public function __construct($POST) {
			// TODO: sanitize input
			global $baseFolder;
			$this->type = $POST["type"];;
			$this->folder = $baseFolder . $POST["u"];
		}
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

	$response = createResponse();
	$request = new Request($_POST);

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

	$displayParentFolder = true;
	$returnFolders = true;

	$requestedFolder = $request->folder;
	$filesType = $request->type;

	$location = $_POST["u"];

	if ($filesType === "bandeau") {
		$displayParentFolder = false;
		$returnFolders = false;
		$requestedFolder = $bandeauFolderPath;
		$filesType = "image";
		$location = "Bandeau";
	}

	else if ($filesType === "banner") {
		$displayParentFolder = false;
		$returnFolders = false;
		$requestedFolder = $bannerFolderPath;
		$filesType = "image";
		$location = "Banner";
	}

	/*
	* On supprime le dernier '/' s'il y en a un
	*/
	if ($requestedFolder[strlen($requestedFolder) - 1] == '/') {
		$requestedFolder = substr($requestedFolder, 0, strlen($requestedFolder) - 1);
	}

	$extKnown = in_array($filesType, array_keys($includedExtensions));

	if (!$extKnown) {
		$debugMessage = "unable to scan directory: " . $requestedFolder;
		setResponseError($response, "unknown file type: " . $filesType, "GL-02", $debugMessage);
		header("HTTP/1.1 400 Bad Request");
		echo_response();
		return;
	}

	$scannedFiles = scanDirectory($requestedFolder);

	if ($scannedFiles === null) {
		$debugMessage = "unable to scan directory: " . $requestedFolder;
		setResponseError($response, "unable to get the files!", "GL-01", $debugMessage);
		header("HTTP/1.1 500 Internal Server Error");
		echo_response();
		return;
	}

	$files = array();

	foreach ($scannedFiles as $file) {
		if (isExcluded($file)) {
			continue;
		}

		if ($file->isFolder && !$returnFolders) {
			continue;
		}

		$newEntry = new File();

		if ($file->isFolder) {
			$newEntry->type = "folder";
			$newEntry->name = $file->name;
			// TODO: populate url so that the client can use it to navigate
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
	$folderToDisplay = substr($requestedFolder, $finalIndex);
	

	if ($requestedFolder . '/' !== $baseFolder && $displayParentFolder) {
		// create the parent folder
		$parentFolder = new File();
		$parentFolder->type = "parentFolder";
		// TODO: populate url so that the client can use it to navigate
		$parentFolder->url = null;
		$files = array_merge([$parentFolder], $files);
		logToResponse("requestedFolder: " . $requestedFolder);
	}

	$response->data = array_merge(array('folder' => $folderToDisplay), array('files' => $files), array('location' => $location));
	$response->status = "success";
	$response->debug = array_merge($response->debug, array('file_objects' => $scannedFiles));

	echo_response();

?>