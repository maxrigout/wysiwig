<?php

	/*
		v0.0.1

		31/10/2023
		* functionality created
		* moved common stuff to server-explorer-common.php
		* create request class
	*/

	class Request {
		public string $filesType;
		public string $query;

		public function __construct($POST) {
			$this->filesType = $POST["t"];
			$this->query = $POST["q"];
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

	require_once "params.php";
	require_once "server-explorer-common.php";

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

	function searchDirectoryRec(string $directory, string $query): array {
		$filesArray = array();
		searchDirectoryRecHelper($directory, $query, $filesArray);
		logToResponse($filesArray);
		return $filesArray;
	}

	function searchDirectoryRecHelper(string $directory, string $query, array &$filesArray) : void {
		$scanResult = scandir($directory);
		if ($scanResult === false) {
			logToResponse("scanResult returned false");
			return;
		}
		$filesFoundArray = array();
		foreach ($scanResult as $fileName) {

			if ($fileName === "." || $fileName === "..") {
				continue;
			}

			$scannedFile = new ScannedFile();
			$scannedFile->name = $fileName;
			$scannedFile->relativePath = $directory . "/" . $fileName;
			$scannedFile->absolutePath = realpath($scannedFile->relativePath) . "/" . $fileName;
			$scannedFile->isFolder = is_dir($scannedFile->relativePath);
			$scannedFile->extension = extractExtention($fileName);

			if (is_dir($scannedFile->relativePath) && !isFolderExcluded($scannedFile) ) {
				searchDirectoryRecHelper($scannedFile->relativePath, $query, $filesArray);
			} else if (!isExcluded($scannedFile) && str_contains($scannedFile->name, $query)) {
				$file = new File();
				$file->name = $scannedFile->relativePath;
				$file->url = $scannedFile->relativePath;
				$file->type = $scannedFile->extension;
				array_push($filesFoundArray, $file);
			}
		}
		logToResponse("finished scanning dir");
		logToResponse($filesFoundArray);
		$filesArray = array_merge($filesArray, $filesFoundArray);
	}

	$response = createResponse();

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

	// TODO: allow to 
	$requestedFolder = $baseFolder;

	/*
	* On supprime le dernier '/' s'il y en a un
	*/
	if ($requestedFolder[strlen($requestedFolder) - 1] == '/') {
		$requestedFolder = substr($requestedFolder, 0, strlen($requestedFolder) - 1);
	}

	$request = new Request($_POST);
	$filesType = $request->filesType;

	$extKnown = in_array($request->filesType, array_keys($includedExtensions));

	if (!$extKnown) {
		$debugMessage = "unable to scan directory: " . $requestedFolder;
		setResponseError($response, "unknown file type: " . $request->filesType, "GL-02", $debugMessage);
		header("HTTP/1.1 400 Bad Request");
		echo_response();
		return;
	}

	$searchResults = searchDirectoryRec($requestedFolder, $request->query);

	// need to remove the leading . and .. and /
	$finalIndex = 0;
	while ($requestedFolder[$finalIndex] === "." || $requestedFolder[$finalIndex] === "/") {
		$finalIndex++;
	}
	$folder = substr($requestedFolder, $finalIndex);

	$response->data = array_merge(array('folder' => $folder), array('results' => $searchResults));
	$response->status = "success";
	$response->debug = array_merge($response->debug, array('file_objects' => $searchResults));

	echo_response();

?>