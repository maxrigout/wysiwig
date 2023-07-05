// v0.0.2
// 02/07/2023

const fileListClass = "file-list";
const fileSelectedClass = "file-selected";
const elementContainerClass = "element_container";

const elementIdPrefix = "element_";

// name to display when rendering the parent folder
const parentFolderName = "Dossier parent";

// leave empty if you don't want icons. Otherwise provide the path to the image you'd like to use
const folderIconPath = "icons/folder.png";
const parentFolderIconPath = "icons/parent_folder_icon.png";
const imageIconPath = "icons/image_icon.png";
const audioIconPath = "icons/audio_icon.png";
const pdfIconPath = "icons/pdf_icon.png";
const musescoreIconPath = "icons/musescore_icon.png";
const defaultFileIconPath = "icons/file_icon.png";

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers
const acceptedImageFileExtensions = ["gif", "jpg", "png"];
const acceptedLinkFileExtensions = ["pdf", "mscz", "midi", "mdi"];
const acceptedMediaFileExtensions = ["*"];

// base folder to display in the path
const defaultRootFolder = "media";

// part of the url to remove when editing a link/image url to navigate to the correct folder on the server
// don't include the http or https to truncate both
const baseUrl = "media";

// url used to fetch the server content
const retrieveListUrl = "getliste.php";
// url used to upload files
const uploadFileUrl = "postacceptor.php"

// not used
const externalPluginBaseUrl = "../";

// html for the loader
const loaderHTML = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;

const fetchDocs = async (path) => {
	return await fetchDocs_server(path);
	// return await fetchDocs_hardCoded(path);
}
