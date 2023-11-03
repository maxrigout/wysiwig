/*
	v0.0.7

	31/10/2023
	* added accepted banner and bandeau extensions for file upload

	27/09/2023
	* added error message

	02/09/2023
	* added error messages
*/

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
const videoIconPath = "";
const defaultFileIconPath = "icons/file_icon.png";

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers
const acceptedImageFileExtensions = ["gif", "jpg", "jpeg" , "png", "bmp"];
const acceptedMediaFileExtensions = ["mp4", "m4v"];
const acceptedLinkFileExtensions = ["pdf", "mscz", "midi", "mdi", "mp3"];
const acceptedBandeauExtensions = acceptedImageFileExtensions;
const acceptedBannerExtensions = acceptedImageFileExtensions;

// the host identifying your site without the http or https
const host = "localhost:3000"
// part of the url to remove when editing a link/image url to navigate to the correct folder on the server
// don't include the http or https to truncate both
const basePath = "media";

// message displayed when attempting to delete a file
const deleteFileConfirmationMessage = "Etes-vous sur de vouloir supprimer ce fichier ?";
const newFolderMessage = "Nom du nouveau dossier";
const uploadMessage = "Upload en cours..."

// url used to fetch the server content
const retrieveListUrl = "getliste.php";
// url used to upload files
const uploadFileUrl = "postacceptor.php"
// url used to delete files/folders and create new folders
const fileActionUrl = "actionsfichier.php"
// url used to search for files
const fileSearchUrl = "recherchefichier.php"

// not used
const externalPluginBaseUrl = "../";

// html for the loader
const loaderHTML = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;

// messages to display when a specific error code is returned
const errorCodes = {
	"GL-01": "Impossible de récupérer le liste des fichier! (erreur serveur)",
	"GL-02": "Type de fichier non reconu",
	"PA-01": "Nom du fichier invalide!",
	"PA-02": "Extension non supportée!",
	"PA-03": "Le fichier existe déjà!",
	"PA-04": "Erreur serveur.",
	"PA-05": "L'upload a échoué.",
	"AF-D-01": "Impossible de supprimer ce fichier!",
	"AF-D-02": "Impossible de supprimer un dossier non vide!",
	"AF-N-01": "Impossible de créer le dossier! (erreur serveur)",
	"AF-N-02": "Le dossier existe déjà!",
	"AF-N-03": "Nom de dossier invalide!",
}
