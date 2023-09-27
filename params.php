<?php
/*
	v0.0.6
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

$excludedFolders = array();
$excludedFiles = array();

/*************************************************************************
* Set this flag to false to prevent returning debug info to the client! *
*************************************************************************/
$debug_enabled = false;

/*********************************************
* Change this line to set the upload folder *
*********************************************/
$baseFolder = "media/";

/*********************************************
* Change this line to set the trash folder *
*********************************************/
$baseTrashFolder = "media-del/";
?>