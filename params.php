<?php
$accepted_origins = array("http://localhost:3000", "http://127.0.0.1:3000", "http://0.0.0.0:3000");

$acceptedImageFileExtensions = array("gif", "jpg", "jpeg" , "png", "bmp");
$acceptedMediaFileExtensions = array("mp4", "m4v");
$acceptedLinkFileExtensions = array("pdf", "mscz", "midi", "mdi", "mp3");

$acceptedFileExtensions = array_merge($acceptedImageFileExtensions, $acceptedMediaFileExtensions, $acceptedLinkFileExtensions);
$acceptedExtensions = array("image" => $acceptedImageFileExtensions, "file" => $acceptedLinkFileExtensions, "media" => $acceptedMediaFileExtensions);

$debug_enabled = true;

$baseFolder = "media/";
$imageFolder = "media/";
?>