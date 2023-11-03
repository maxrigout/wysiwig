<?php
	/*
		v0.0.7

		31/10/2023
		* added 2 new constants for the bandeau folder and for the banner folder
	*/

	/***************************************************
	 * Only these origins are allowed to upload files *
	***************************************************/
	$accepted_origins = array("http://localhost:3000", "http://127.0.0.1:3000", "http://0.0.0.0:3000");

	$acceptedImageFileExtensions = array("gif", "jpg", "jpeg" , "png", "bmp");
	$acceptedMediaFileExtensions = array("mp4", "m4v");
	$acceptedLinkFileExtensions = array("pdf", "mscz", "midi", "mdi", "mp3");

	$allAcceptedFileExtensions = array_merge($acceptedImageFileExtensions, $acceptedMediaFileExtensions, $acceptedLinkFileExtensions);
	$includedExtensions = array("image" => $acceptedImageFileExtensions, "file" => $acceptedLinkFileExtensions, "media" => $acceptedMediaFileExtensions);

	$excludedSystemFolderNames = array(".", "..");
	$excludedSystemFileNames = array(".DS_Store");

	$excludedFolders = array("Bandeau");
	$excludedFiles = array();

	/*************************************************************************
	* Set this flag to false to prevent returning debug info to the client! *
	*************************************************************************/
	$debug_enabled = true;

	/*********************************************
	* Change this line to set the upload folder *
	*********************************************/
	$baseFolder = "media/";
	$bandeauFolderPath = "media/Bandeau";
	$bannerFolderPath = "media/Banner";

	/*********************************************
	* Change this line to set the trash folder *
	*********************************************/
	$baseTrashFolder = "media-del/";
?>