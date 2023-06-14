const fileSelectedClass = "file-selected";
const folderIconPath = "icons/folder.png";
const parentFolderIconPath = "icons/parent_folder_icon.png";
const imageIconPath = "";
const audioIconPath = "icons/audio_icon.png";
const pdfIconPath = "icons/pdf_icon.png";
const musescoreIconPath = "icons/musescore_icon.png";
const defaultFileIconPath = "icons/file_icon.png";

const defaultRootFolder = "medias";
// don't include the http or https to truncate both
const baseUrl = "";
const retrieveListUrl = "";
const externalPluginBaseUrl = "../";
const loaderHTML = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;

const fetchDocs = async (path) => {
	// return await fetchDocs_server(path);
	return await fetchDocs_hardCoded(path);
}