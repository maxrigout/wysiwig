const fileSelectedClass = "file-selected";
const folderIconPath = "icons/folder.png";
const parentFolderIconPath = "icons/parent_folder_icon.png";
const imageIconPath = "icons/image_icon.png";
const audioIconPath = "icons/audio_icon.png";
const pdfIconPath = "icons/pdf_icon.png";
const musescoreIconPath = "icons/musescore_icon.png";
const defaultFileIconPath = "icons/file_icon.png";

const defaultRootFolder = "Medias";
const baseUrl = "http://192.168.1.222:3000/getliste.php";

const fetchDocs = async (path) => {
	// return await fetchDocs_server(path);
	return await fetchDocs_hardCoded(path);
}