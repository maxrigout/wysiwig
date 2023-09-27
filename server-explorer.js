/* 
	v0.0.6

	27/09/2023
	* added sample button and text input to open the server explorer
	* added font and font size buttons to tiny mce editor


	02/09/2023
	* added file operations
	-	* delete file/folder
	-	* new folder
	* added error dialog
*/

// lien:
// 		pdf, mscz, midi, mdi
// images:
//		png, gif, jpeg
// media
//		

const dialog = document.querySelector("#explorerDialog");
const dialogRoot = dialog.querySelector("#dialog-root");
const dialogTitleBar = dialog.querySelector(".dialog-title-bar");
const dialogTitleBarPath = dialog.querySelector(".title-bar-path");
const dialogFileList = dialog.querySelector(".dialog-file-list");
const dialogFilePreview = dialog.querySelector(".dialog-file-preview");

const errorMessageDialog = document.querySelector("#errorMessageDialog");
const confirmDeleteDialog = document.querySelector("#comfirmDeleteDialog");
const newFolderDialog = document.querySelector("#newFolderDialog");

// the path we've navigated to
let pathList = [];
// the current selected element
let selectedElement = null;
// a file to select when opening the dialog
let fileToSelect = "";
// local cache of the fetched data
let fetchedData;
// insert type determined by which button was clicked
// either "insert link", "insert image" or "insert media"
let previousInsertType = "";
let insertType = "";

class Logger {
	static debug(...data) {
		console.debug(...data);
	}
	static info(...data) {
		console.info(...data);
	}
	static log(...data) {
		console.log(...data);
	}
	static warn(...data) {
		console.warn(...data);
	}
	static error(...data) {
		console.error(...data);
	}
}

class FileBrowserService {
	constructor(client) {
		this.client = client;
	}

	async retrieveFileList(path, fileType) {
		return this.client.getFileList(path, fileType);
	}

	async uploadFile(fileName, fileContent, serverLocation, onProgressCb) {
		return this.client.postUploadFile(fileName, fileContent, serverLocation, onProgressCb);
	}

	async #fileOperation(folderPath, action, payload) {
		return this.client.postFileOperation(folderPath, action, payload);
	}

	async deleteFile(folderPath, fileName) {
		return this.#fileOperation(folderPath, "delete", {f: fileName});
	}

	async createFolder(folderPath, folderName) {
		return this.#fileOperation(folderPath, "new-folder", {f: folderName});
	}
}

class HTTPClient {
	constructor(getListeUrl, fileUploadUrl, fileOperationUrl) {
		this.getListeUrl = getListeUrl;
		this.fileUploadUrl = fileUploadUrl;
		this.fileOperationUrl = fileOperationUrl;
	}

	async getFileList(path, fileType) {
		const myHeaders = new Headers();

		// for a JSON body...
		// const body = JSON.stringify({path: path}).toString();
		// myHeaders.set("Content-Type", "application/json");
	
		// for a form encoded body...
		const body = new URLSearchParams();
		body.append("u", path);
		body.append("type", fileType); // will either be file, media or image
	
		const myRequest = new Request(this.getListeUrl, {
			method: "POST",
			headers: myHeaders,
			body: body,
		});
	
		const response = await fetch(myRequest);
		const jsonData = await response.json();
		if (response.status != 200) {
			throw jsonData;
		}
		return jsonData;
	}

	async postUploadFile(fileName, fileContent, serverLocation, onProgressCb) {
		return new Promise((resolve, reject) => {
			Logger.debug("uploading...");

			const xhr = new XMLHttpRequest();
			xhr.withCredentials = false;
			xhr.open('POST', this.fileUploadUrl);
		
			xhr.upload.onprogress = (e) => {
				onProgressCb(e.loaded / e.total * 100);
			};
		
			xhr.onload = () => {
				const response = JSON.parse(xhr.responseText);
		
				if (xhr.status != 200) {
					reject({message: 'HTTP Error: ' + xhr.status, remove: true, ...response});
					return;
				}
		
				resolve(response);
			};
		
			xhr.onerror = () => {
				reject('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
			};
		
			const formData = new FormData();
			formData.append("file", fileContent, fileName);
			formData.set("u", serverLocation);
		
			xhr.send(formData);
		});
	}

	async postFileOperation(folder, action, payload) {
		Logger.debug(folder, action, payload);
		const myHeaders = new Headers();
	
		const formData = new FormData();
		formData.set("u", folder);
		formData.set("a", action);
		if (payload !== null || payload !== undefined)
			formData.set("p", JSON.stringify(payload));
	
		const myRequest = new Request(this.fileOperationUrl, {
			method: "POST",
			headers: myHeaders,
			body: formData,
		});
	
		const response = await fetch(myRequest);
		const jsonData = await response.json();
		if (response.status != 200) {
			throw jsonData;
		}
		return jsonData;
	}
}

class HardCodedClient {
	#getRandomArbitrary(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	async getFileList(path, fileType) {
		let data = serverDir[path];
		const timeout = this.#getRandomArbitrary(100, 1000);
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				console.debug(`took ${timeout} ms`);
				if (data) {
					resolve({data: data, folder: url});
				}
				else {
					reject({error: "no data available"});
				}
			}, timeout)
		});
	}

	async postUploadFile(fileName, fileContent, serverLocation, onProgressCb) {
		return new Promise((resolve, reject) => {
			reject({});
		});
	}

	async postDeleteFile(folderPath, fileName) {
		return new Promise((resolve, reject) => {
			reject({});
		});
	}

	async postCreateFolder(folderPath, folderName) {
		return new Promise((resolve, reject) => {
			reject({});
		});
	}
}

class LocalFileBrowser {
	constructor(acceptedFileExtensions, acceptedImageExtensions, acceptedMediaExtensions) {
		this.acceptedExtensions = {
			file: acceptedFileExtensions,
			image: acceptedImageExtensions,
			media: acceptedMediaExtensions
		};

		this.fileTypes = Object.keys(this.acceptedExtensions);

		this.input = document.createElement('input');
		this.input.setAttribute('type', 'file');
	}

	onAccept(callback) {
		this.callback = callback;
		return this;
	}

	setType(type) {
		if (!this.fileTypes.includes(type)) {
			throw "invalid file type. Only [" + this.fileTypes.join(", ") + "] are allowed!";
		}
		this.input.setAttribute('accept', this.acceptedExtensions[type].map(e => "." + e).join(","));
		return this;
	}

	open() {
		this.input.onchange = (e) => {
			const file = e.target.files[0];
			const metadata = { fileName: file.name };
			this.callback(file, metadata);
		};
		this.input.click();
	}
}

const client = new HTTPClient(retrieveListUrl, uploadFileUrl, fileActionUrl);
const fileService = new FileBrowserService(client);
const localFileBrowser = new LocalFileBrowser(acceptedLinkFileExtensions, acceptedImageFileExtensions, acceptedMediaFileExtensions);

const showErrorDialog = (errorCode, errorMessage) => {
	const msg = errorMessageDialog.querySelector("#error-message");
	const code = errorMessageDialog.querySelector("#error-code");
	code.innerHTML = errorCode;
	msg.innerHTML = errorMessage;
	errorMessageDialog.showModal();
}

const getPath = () => {
	return pathList.join("/");
}

const isPreviewable = () => {
	return true;
}

const updatePreview = () => {
	if (!isPreviewable()) {
		filePreview.innerHTML = "";
		return;
	}
	const filePreview = dialogFilePreview.querySelector(".file-preview");
	if (selectedElement === null) {
		filePreview.style.visibility = "hidden";
		return;
	}
	if (selectedElement.data.type === "folder") {
		filePreview.style.visibility = "hidden";
		filePreview.innerHTML = "";
		return;
	} else if (selectedElement.data.type === "parentFolder") {
		filePreview.style.visibility = "hidden";
		filePreview.innerHTML = "";
		return;
	}
	filePreview.style.visibility = "visible";
	filePreview.innerHTML = `<img src="${selectedElement.data.url}">`;
}

const updateFolderPath = (path) => {
	dialogTitleBarPath.innerHTML = path;
}

const selectElement = (e, i) => {
	const delButton = dialogRoot.querySelector("#title-bar-button-sup");
	const okButton = dialogRoot.querySelector("#btn-ok");
	if (selectedElement !== null) {
		if (selectedElement.index === i) {
			Logger.debug(`element already selected`);
		}
		selectedElement.node.classList.remove(fileSelectedClass);
	}
	Logger.debug(`select element ${i}`);
	selectedElement = { 
		node: e,
		index: i,
		data: null,
	};
	if (i === -1) {
		selectedElement.data = { type: "parentFolder" };
	} else if (i >= 0 && i < fetchedData.length) {
		selectedElement.data = fetchedData[i];
	}
	delButton.disabled = selectedElement.data.type === "parentFolder";
	okButton.disabled = selectedElement.data.type === "parentFolder";
	selectedElement.node.classList.add(fileSelectedClass);
	updatePreview();
}

const selectElementFromName = (fileName) => {
	Logger.debug("selecting file", fileName);
	const index = fetchedData.findIndex(e => e.name === fileName);
	if (index === -1) {
		return;
	}
	const node = document.querySelector(`#${elementIdPrefix + index}`);
	Logger.log(node);
	selectElement(node, index);
}

const scrollSelectedElementIntoView = () => {
	selectedElement.node.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
}

const deselectElement = () => {
	selectedElement = null;
	const delButton = dialogRoot.querySelector("#title-bar-button-sup");
	const okButton = dialogRoot.querySelector("#btn-ok");
	delButton.disabled = true;
	okButton.disabled = true;
}

const navigateToFolder = (folder) => {
	Logger.info(`navigating to folder`, folder);
	deselectElement();
	dialogFileList.innerHTML = "";
	pathList.push(folder.data.name);
	renderExplorerDialog();
}

const navigateUp = () => {
	Logger.info("navigating up");
	deselectElement();
	dialogFileList.innerHTML = "";
	pathList.pop();
	renderExplorerDialog();
}

// https://www.w3schools.com/howto/howto_css_image_gallery.asp
const getFileNameAndIcon = (file, index) => {
	let iconPath = defaultFileIconPath;
	switch (file.type) {
		case "image":
		case "jpeg":
		case "jpg":
		case "png":
		case "gif":
		case "bmp":
			iconPath = imageIconPath;
			break;
		case "audio":
		case "mp3":
			iconPath = audioIconPath;
			break;
		case "pdf":
			iconPath = pdfIconPath;
			break;
		case "musescore":
			iconPath = musescoreIconPath;
			break;
		case "mp4":
		case "m4v":
			iconPath = videoIconPath;
			break;
		default:
	}
	return { name: file.name, iconPath: iconPath };
}

const getFolderNameAndIcon = (folder) => {
	return {name: folder.name, iconPath: folderIconPath};
}

const getElementNameAndIcon = (element) => {
	if (element.type === "folder") {
		return getFolderNameAndIcon(element);
	}
	return getFileNameAndIcon(element);
}

const renderSingleElement = (name, index, iconPath) => {
	return `<div class="${elementContainerClass}" id="${elementIdPrefix + index}" onclick="selectElement(this, ${index});">
		${iconPath !== null && iconPath !== "" ? `<img src="${iconPath}">` : ""}
		${name}
	</div>`;
}

const renderParentFolder = () => {
	return renderSingleElement(parentFolderName, -1, parentFolderIconPath);
}

const closeDialog = () => {
	Logger.debug("closing dialog");
	dialog.close();
}

const closeDialogForSuccess = (cb) => {
	Logger.debug("closing for success")
	cb(selectedElement.data.url, {title: selectedElement.data.name});
	closeDialog();
}

const renderContent = (data) => {
	const renderedContent = data.map((element, index) => {
			const { name, iconPath } = getElementNameAndIcon(element);
			return renderSingleElement(name, index, iconPath);
		}).join("");
	// Note: we can actually remove the parent div
	if (pathList.length === 0) {
		return `<div class="${fileListClass}">${renderedContent}</div>`;
	}
	const renderedParentFolder = renderParentFolder();
	return `<div class="${fileListClass}">${renderedParentFolder}${renderedContent}</div>`;
}

const addDialogListeners = (cb) => {
	Logger.debug("adding dialog listeners");
	const addBtn = dialogRoot.querySelector("#title-bar-button-add");
	const closeBtn = dialogRoot.querySelector("#title-bar-button-cancel");
	const nfButton = dialogRoot.querySelector("#title-bar-button-new-folder");
	const delButton = dialogRoot.querySelector("#title-bar-button-sup");
	const okButton = dialogRoot.querySelector("#btn-ok");
	const cancelButton = dialogRoot.querySelector("#btn-cancel");
	const elementsContainer = dialogRoot.querySelector(".dialog-file-list");
	const uploadProgressDialog = document.querySelector("#uploadProgressDialog");

	uploadProgressDialog.querySelector("#progress-message").innerHTML = uploadMessage;

	addBtn.onclick = () => {
		const progressBar = uploadProgressDialog.querySelector("#upload-progress");
		localFileBrowser
			.setType(insertType)
			.onAccept((data, metadata) => {
				uploadProgressDialog.showModal();
				fileService.uploadFile(metadata.fileName, data, getPath(), (percent) => progressBar.value = percent)
					.then(result => {
						uploadProgressDialog.close();
						Logger.info("upload successful!");
						Logger.debug(result);
						fileToSelect = metadata.fileName;
						renderExplorerDialog();
					})
					.catch(error => {
						Logger.info("an error occurred while uploading the file")
						Logger.debug(error);
						uploadProgressDialog.close();
						showErrorDialog(error.errorCode, errorCodes[error.errorCode]);
					}
				)
			})
			.open();
		};
	closeBtn.onclick = closeDialog;
	cancelButton.onclick = closeDialog;
	
	delButton.onclick = () => {
		if (selectedElement === null)
			return;
		if (selectedElement.data.type === "parentFolder") {
			return;
		}

		// populate the text with the message from the config and the selected item
		confirmDeleteDialog.querySelector("#delete-file-message").innerHTML = deleteFileConfirmationMessage;
		confirmDeleteDialog.querySelector("#delete-file-name").innerHTML = selectedElement.data.name;
		// add listeners for the "oui" "non" buttons
		const ouiBtn = confirmDeleteDialog.querySelector("#btn-delete-oui");

		ouiBtn.onclick = () => {
			// call the delete api
			fileService.deleteFile(getPath(), selectedElement.data.name)
				.then(response => {
					confirmDeleteDialog.close();
					deselectElement();
					renderExplorerDialog();
				})
				.catch(error => {
					Logger.error(error);
					showErrorDialog(error.errorCode, errorCodes[error.errorCode]);
				})
		}

		confirmDeleteDialog.showModal();
	}

	nfButton.onclick = () => {
		const msg = newFolderDialog.querySelector("#new-folder-message");
		const name = newFolderDialog.querySelector("#new-folder-name");
		const submit = newFolderDialog.querySelector("#new-folder-submit");
		const cancel = newFolderDialog.querySelector("#new-folder-cancel");

		msg.innerHTML = newFolderMessage;

		submit.onclick = () => {
			Logger.log(name.value);
			fileService.createFolder(getPath(), name.value)
				.then(response => {
					name.value = "";
					newFolderDialog.close();
					deselectElement();
					renderExplorerDialog();
				})
				.catch(error => {
					Logger.error(error);
					name.value = "";
					showErrorDialog(error.errorCode, errorCodes[error.errorCode]);
				})
		}

		cancel.onclick = () => {
			newFolderDialog.close();
		}

		newFolderDialog.showModal();
	}

	okButton.onclick = () => {
		Logger.debug(selectedElement);
		if (selectedElement === null)
			return;
		if (selectedElement.data.type === "folder") {
			navigateToFolder(selectedElement)
		} else {
			closeDialogForSuccess(cb);
		}
	};

	elementsContainer.ondblclick = () => {
		Logger.debug("db click");
		if (selectedElement.data.type === "parentFolder") {
			navigateUp();
		} else if (selectedElement.data.type === "folder") {
			navigateToFolder(selectedElement);
		} else {
			closeDialogForSuccess(cb);
		}
	};
}

const renderExplorerDialogContent = (data) => {
	Logger.debug(data);
	fetchedData = data;
	// TODO: potentially sort the data
	// data.sort((e1, e2) => e1.name.localeCompare(e2.name));
	dialogFileList.innerHTML = renderContent(data);
	if (selectedElement !== null) {
		const selectedNode = dialogFileList.querySelector(`#${elementIdPrefix}${selectedElement.index}`);
		selectElement(selectedNode, selectedElement.index);
	}
	updatePreview();
}

const renderExplorerDialog = () => {
	const path = getPath();
	Logger.info(`loading ${path}`);
	dialogFileList.innerHTML = loaderHTML;
	fileService.retrieveFileList(path, insertType)
		.then(response => {
			updateFolderPath(response.data.folder);
			renderExplorerDialogContent(response.data.files);

			// we need to select the previously selected file and scroll the element into view
			if (fileToSelect !== "") {
				Logger.debug("selecting file", fileToSelect);
				selectElementFromName(fileToSelect);
				scrollSelectedElementIntoView();

				// reset the fileToSelect to empty string so that we don't try to reselect
				// the file when we navigate to a different folder
				fileToSelect = "";
			}
		})
		.catch(error => {
			Logger.error(error);
			// we still want to render a folder to give the user the ability
			// to go up in the directory tree.
			showErrorDialog(error.errorCode, errorCodes[error.errorCode])
			pathList = [];
			renderExplorerDialogContent([]);
			// since an error occured, we don't want to select the file
			fileToSelect = "";
		});
}

const setInsertType = (type) => {
	previousInsertType = insertType;
	insertType = type;
}

const extractFileInfo = (originalFilePath) => {
	const i = originalFilePath.lastIndexOf('/');
	// truncate the file name (anything after the last '/')
	let filePath = originalFilePath.substring(0, i);

	// truncate the base url if it exists
	const j = filePath.indexOf(basePath);
	if (j !== -1) {
		filePath = filePath.substring(j + basePath.length);
	} else {
		// TODO: should we still continue?
	}

	// remove the leading '/' is there's one
	const k = filePath.indexOf('/');
	if (k === 0) {
		filePath = filePath.substring(1);
	}

	pathList = filePath.split("/");

	// save the currently selected file
	fileToSelect = originalFilePath.substring(i + 1);

	Logger.debug("previously selected file:", fileToSelect)
	Logger.debug(pathList);
}

const shouldSelectPreviousFile = (srcUrl) => {
	// if it's empty we don't need to select a file
	if (srcUrl === "") {
		return false;
	}
	if (srcUrl.indexOf("http://") !== -1 || srcUrl.indexOf("https://") !== -1) {
		// we should select the file if it's the same host
		return srcUrl.indexOf(host) !== -1;
	}
	return true;
}

const filePickerHandler = (cb, value, meta) => {
	Logger.debug(value);
	Logger.debug(meta);
	/*
	cb(selectedElement.data.url, {title: selectedElement.data.name});
	meta:
		lien:
			fieldname: "url"
			filetype: "file"
			original: {
				value: ""
			}
		image:
			fieldname: "src"
			filetype: "image"
		media:
			fieldname: "source"
			filetype: "media"
	*/
	if (shouldSelectPreviousFile(value)) {
		extractFileInfo(value);
	}
	setInsertType(meta.filetype);

	// we need to invalidate the selectedElement because we won't be getting the same results from the server
	if (previousInsertType !== insertType) {
		selectedElement = null;
	}

	addDialogListeners(cb);

	dialog.showModal();
	renderExplorerDialog();
};

tinymce.init({
    selector: 'textarea#myTextArea',
	height: "700px",
    plugins: [
      'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
      'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime',
      'media', 'table', 'emoticons', 'template', 'help', 'save',
    ],
    toolbar: 'undo redo | styles | fontfamily fontsize | bold italic underline | forecolor backcolor emoticons | alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | table | link image media  | fullscreen preview | code ' +
      '',
    menubar: false,
	statusbar: false,
	language: "fr_FR",

	file_picker_types: 'image,file,media',
	file_picker_callback: filePickerHandler,
});


document.querySelector("button#myButton").onclick = (e) => {
	filePickerHandler((url, meta) => {
		document.querySelector("input#myTextInput").value = url;
	}, "", { filetype: "unknown" });
};