/* 
	v0.0.7

	31/10/2023
	* added ability to search
	* parent folder gets rendered at the server's request
	* added new file "types" bandeau and banner
	* new folder button and search functionality hides when the selected file type is either bandeau or banner

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

const InitServerExplorer = () => {
	const ui = `
<dialog id="explorerDialog">
	<div id="dialog-root">
		<div class="dialog-title-bar">
			<div class="title-bar-path prevent-select vertical-center align-left">
			</div>
			<div class="align-right"></div>
			<button id="btn-search" class="vertical-center">
				<svg width="24" height="24" viewBox="0 0 24 24" ><path d="M15.907 17.319a8 8 0 1 1 1.412-1.412c.013.011.026.023.038.036l4.35 4.35a1 1 0 0 1-1.414 1.414l-4.35-4.35a1.016 1.016 0 0 1-.036-.038zM11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path></svg>
			</button>
			<input placeholder="Search" id="title-bar-search" type="text">
			<button class="last-button" id="title-bar-button-cancel">
				<svg width="24" height="24" viewBox="0 0 24 24"><path d="M17.251 8.157L13.421 12l3.83 3.843a.996.996 0 0 1-1.408 1.408L12 13.421l-3.843 3.83a.996.996 0 0 1-1.408-1.408L10.579 12l-3.83-3.843A.996.996 0 0 1 8.157 6.75L12 10.579l3.843-3.83a.996.996 0 0 1 1.408 1.408z" fill-rule="evenodd"></path></svg>
			</button>
		</div>
		<div class="dialog-content">
			<div class="dialog-file-list"></div>
			<div class="dialog-file-preview">
				<div class="vertical-center file-preview"></div>
			</div>
		</div>
		<div class="dialog-action-buttons">
			<button id="btn-ok" disabled>Valider</button>
			<button id="btn-cancel">Annuler</button>
			<!-- <button id="test" onclick="uploadProgressDialog.showModal()">test</button> -->
			<button class="align-right" id="title-bar-button-add">
				<svg width="24" height="24" viewBox="0 0 24 24"><path d="M13 11h6a1 1 0 0 1 0 2h-6v6a1 1 0 0 1-2 0v-6H5a1 1 0 0 1 0-2h6V5a1 1 0 0 1 2 0v6z"></path></svg>
			</button>
			<button id="title-bar-button-new-folder">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 13H15M12 10V16M12.0627 6.06274L11.9373 5.93726C11.5914 5.59135 11.4184 5.4184 11.2166 5.29472C11.0376 5.18506 10.8425 5.10425 10.6385 5.05526C10.4083 5 10.1637 5 9.67452 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V10.2C21 9.0799 21 8.51984 20.782 8.09202C20.5903 7.71569 20.2843 7.40973 19.908 7.21799C19.4802 7 18.9201 7 17.8 7H14.3255C13.8363 7 13.5917 7 13.3615 6.94474C13.1575 6.89575 12.9624 6.81494 12.7834 6.70528C12.5816 6.5816 12.4086 6.40865 12.0627 6.06274Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</button>
			<button id="btn-gotofile" style="display:none;">
				-->
			</button>
			<button class="last-button" id="title-bar-button-sup" disabled>
				<!-- <svg height="24" width="21" viewBox="0 0 875 1000"><path d="M0 281.296l0 -68.355q1.953 -37.107 29.295 -62.496t64.449 -25.389l93.744 0l0 -31.248q0 -39.06 27.342 -66.402t66.402 -27.342l312.48 0q39.06 0 66.402 27.342t27.342 66.402l0 31.248l93.744 0q37.107 0 64.449 25.389t29.295 62.496l0 68.355q0 25.389 -18.553 43.943t-43.943 18.553l0 531.216q0 52.731 -36.13 88.862t-88.862 36.13l-499.968 0q-52.731 0 -88.862 -36.13t-36.13 -88.862l0 -531.216q-25.389 0 -43.943 -18.553t-18.553 -43.943zm62.496 0l749.952 0l0 -62.496q0 -13.671 -8.789 -22.46t-22.46 -8.789l-687.456 0q-13.671 0 -22.46 8.789t-8.789 22.46l0 62.496zm62.496 593.712q0 25.389 18.553 43.943t43.943 18.553l499.968 0q25.389 0 43.943 -18.553t18.553 -43.943l0 -531.216l-624.96 0l0 531.216zm62.496 -31.248l0 -406.224q0 -13.671 8.789 -22.46t22.46 -8.789l62.496 0q13.671 0 22.46 8.789t8.789 22.46l0 406.224q0 13.671 -8.789 22.46t-22.46 8.789l-62.496 0q-13.671 0 -22.46 -8.789t-8.789 -22.46zm31.248 0l62.496 0l0 -406.224l-62.496 0l0 406.224zm31.248 -718.704l374.976 0l0 -31.248q0 -13.671 -8.789 -22.46t-22.46 -8.789l-312.48 0q-13.671 0 -22.46 8.789t-8.789 22.46l0 31.248zm124.992 718.704l0 -406.224q0 -13.671 8.789 -22.46t22.46 -8.789l62.496 0q13.671 0 22.46 8.789t8.789 22.46l0 406.224q0 13.671 -8.789 22.46t-22.46 8.789l-62.496 0q-13.671 0 -22.46 -8.789t-8.789 -22.46zm31.248 0l62.496 0l0 -406.224l-62.496 0l0 406.224zm156.24 0l0 -406.224q0 -13.671 8.789 -22.46t22.46 -8.789l62.496 0q13.671 0 22.46 8.789t8.789 22.46l0 406.224q0 13.671 -8.789 22.46t-22.46 8.789l-62.496 0q-13.671 0 -22.46 -8.789t-8.789 -22.46zm31.248 0l62.496 0l0 -406.224l-62.496 0l0 406.224z"/></svg> -->
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" ><path d="M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6M14 10V17M10 10V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</button>
		</div>
	</div>
</dialog>

<dialog id="errorMessageDialog">
	<div id="error-message">message</div>
	<div id="error-code">code</div>
	<form method="dialog">
		<button>Ok</button>
	</form>
</dialog>

<dialog id="comfirmDeleteDialog">
	<div id="delete-file-message">message</div>
	<div id="delete-file-name">file name</div>
	<form method="dialog">
		<button id="btn-delete-oui">Oui</button>
		<button id="btn-delete-non">Non</button>
	</form>
</dialog>

<dialog id="newFolderDialog">
	<div id="new-folder-message">message</div>
	<div>
		<input id="new-folder-name" type="text">
	</div>
	<div>
		<button id="new-folder-submit">Valider</button>
		<button id="new-folder-cancel">Annuler</button>
	</div>
</dialog>

<dialog id="uploadProgressDialog">
	<div>
		<label id= "progress-message" for="upload">Downloading progress:</label>
	</div>
	<progress id="upload-progress" value="32" max="100"> 32% </progress> 
</dialog>`

	document.querySelector("#server-explorer-root").innerHTML = ui;
}

InitServerExplorer();

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
let isSearch = false;

// class responsible for mimicking a server. It should have the same interface as the HTTPClient
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

	async postSearchFile(searchQuery, fileType) {
		return new Promise((resolve, reject) => {
			reject({});
		});
	}
}

// class responsible for communicating with the server
class HTTPClient {
	constructor(getListeUrl, fileUploadUrl, fileOperationUrl, fileSearchUrl) {
		this.getListeUrl = getListeUrl;
		this.fileUploadUrl = fileUploadUrl;
		this.fileOperationUrl = fileOperationUrl;
		this.fileSearchUrl = fileSearchUrl;
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
			console.debug("uploading...");

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
		console.debug(folder, action, payload);
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

	async postSearchFile(searchQuery, fileType) {
		console.debug(searchQuery, fileType);
		const myHeaders = new Headers();
	
		const formData = new FormData();
		formData.set("q", searchQuery);
		formData.set("t", fileType);
	
		const myRequest = new Request(this.fileSearchUrl, {
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

// the service is 
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

	async searchFile(searchQuery, fileType) {
		return this.client.postSearchFile(searchQuery, fileType);
	}
}

// class responsible for selecting a file to upload to the server
class LocalFileBrowser {
	constructor(acceptedFileExtensions, acceptedImageExtensions, acceptedMediaExtensions, acceptedBandeauExtensions, acceptedBannerExtensions) {
		this.acceptedExtensions = {
			file: acceptedFileExtensions,
			image: acceptedImageExtensions,
			media: acceptedMediaExtensions,
			bandeau: acceptedBandeauExtensions,
			banner: acceptedBannerExtensions,
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

const client = new HTTPClient(retrieveListUrl, uploadFileUrl, fileActionUrl, fileSearchUrl);
const fileService = new FileBrowserService(client);
const localFileBrowser = new LocalFileBrowser(acceptedLinkFileExtensions, acceptedImageFileExtensions, acceptedMediaFileExtensions, acceptedBandeauExtensions, acceptedBannerExtensions);

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

const updateTitlePath = (path) => {
	dialogTitleBarPath.innerHTML = path;
}

const selectElement = (element, index) => {
	const delButton = dialogRoot.querySelector("#title-bar-button-sup");
	const okButton = dialogRoot.querySelector("#btn-ok");
	if (selectedElement !== null) {
		if (selectedElement.index === index) {
			console.debug(`element already selected`);
		}
		selectedElement.node.classList.remove(fileSelectedClass);
	}
	console.debug(`select element ${index}`);
	selectedElement = { 
		node: element,
		index: index,
		data: null,
	};
	if (index === -1) {
		selectedElement.data = { type: "parentFolder" };
	} else if (index >= 0 && index < fetchedData.length) {
		selectedElement.data = fetchedData[index];
	}
	delButton.disabled = (selectedElement.data.type === "parentFolder") || isSearch;
	okButton.disabled = (selectedElement.data.type === "parentFolder");
	selectedElement.node.classList.add(fileSelectedClass);
	updatePreview();
}

const selectElementFromName = (fileName) => {
	console.debug("selecting file", fileName);
	const index = fetchedData.findIndex(e => e.name === fileName);
	if (index === -1) {
		return;
	}
	const node = document.querySelector(`#${elementIdPrefix + index}`);
	console.log(node);
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
	console.info(`navigating to folder`, folder);
	deselectElement();
	dialogFileList.innerHTML = "";
	pathList.push(folder.data.name);
	renderExplorerDialog();
}

const navigateUp = () => {
	console.info("navigating up");
	deselectElement();
	dialogFileList.innerHTML = "";
	pathList.pop();
	renderExplorerDialog();
}

const closeDialog = () => {
	console.debug("closing dialog");
	dialog.close();
}

const closeDialogForSuccess = (cb) => {
	console.debug("closing for success")
	cb(selectedElement.data.url, {title: selectedElement.data.name});
	closeDialog();
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

const getElementNameAndIcon = (element) => {
	if (element.type === "folder") {
		return {name: element.name, iconPath: folderIconPath};
	} else if (element.type === "parentFolder") {
		return {name: parentFolderName, iconPath: parentFolderIconPath};
	}
	return getFileNameAndIcon(element);
}

const renderSingleElement = (name, index, iconPath) => {
	return `<div class="${elementContainerClass}" id="${elementIdPrefix + index}" onclick="selectElement(this, ${index});">
		${iconPath !== null && iconPath !== "" ? `<img src="${iconPath}">` : ""}
		${name}
	</div>`;
}

const renderContent = (data) => {
	const renderedContent = data.map((element, index) => {
			const { name, iconPath } = getElementNameAndIcon(element);
			return renderSingleElement(name, index, iconPath);
		}).join("");
	return `<div class="${fileListClass}">${renderedContent}</div>`;
}

const addDialogListeners = (cb) => {
	console.debug("adding dialog listeners");
	const addBtn = dialogRoot.querySelector("#title-bar-button-add");
	const closeBtn = dialogRoot.querySelector("#title-bar-button-cancel");
	const nfButton = dialogRoot.querySelector("#title-bar-button-new-folder");
	const delButton = dialogRoot.querySelector("#title-bar-button-sup");
	const okButton = dialogRoot.querySelector("#btn-ok");
	const cancelButton = dialogRoot.querySelector("#btn-cancel");
	const elementsContainer = dialogRoot.querySelector(".dialog-file-list");
	const uploadProgressDialog = document.querySelector("#uploadProgressDialog");
	const searchBtn = dialogRoot.querySelector("#btn-search");
	const gotoFileBtn = dialogRoot.querySelector("#btn-gotofile");

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
						console.info("upload successful!");
						console.debug(result);
						fileToSelect = metadata.fileName;
						renderExplorerDialog();
					})
					.catch(error => {
						console.info("an error occurred while uploading the file");
						console.debug(error);
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
					console.error(error);
					showErrorDialog(error.errorCode, errorCodes[error.errorCode]);
				})
		}

		confirmDeleteDialog.showModal();
	};

	nfButton.onclick = () => {
		// show the new folder dialog
		const msg = newFolderDialog.querySelector("#new-folder-message");
		const name = newFolderDialog.querySelector("#new-folder-name");
		const submit = newFolderDialog.querySelector("#new-folder-submit");
		const cancel = newFolderDialog.querySelector("#new-folder-cancel");

		msg.innerHTML = newFolderMessage;

		// this is the new folder dialog's submit button
		submit.onclick = () => {
			console.log(name.value);
			fileService.createFolder(getPath(), name.value)
				.then(response => {
					name.value = "";
					newFolderDialog.close();
					deselectElement();
					renderExplorerDialog();
				})
				.catch(error => {
					console.error(error);
					name.value = "";
					showErrorDialog(error.errorCode, errorCodes[error.errorCode]);
				})
		}

		cancel.onclick = () => {
			newFolderDialog.close();
		}

		newFolderDialog.showModal();
	};

	okButton.onclick = () => {
		console.debug(selectedElement);
		if (selectedElement === null)
			return;
		if (selectedElement.data.type === "folder") {
			navigateToFolder(selectedElement)
		} else {
			closeDialogForSuccess(cb);
		}
	};

	searchBtn.onclick = () => {
		const searchQueryInput = dialogRoot.querySelector("#title-bar-search");
		const searchQuery = searchQueryInput.value;
		console.debug(`searching: ${searchQuery}`);
		selectedElement = null;
		// if search query is empty, render the dialog as normal
		if (searchQuery === "") {
			console.debug("search query is empty, fetching the server files")
			selectedElement = null;
			isSearch = false;
			addBtn.disabled = false;
			nfButton.disabled = false;
			gotoFileBtn.style.display = "none";
			renderExplorerDialog();
			return;
		}
		dialogFileList.innerHTML = loaderHTML;
		fileService.searchFile(searchQuery, insertType)
			.then(response => {
				pathList = [];
				isSearch = true;
				addBtn.disabled = isSearch;
				nfButton.disabled = isSearch;
				gotoFileBtn.style.display = "block";
				renderExplorerDialogContent(response.data.results);
			})
			.catch(error => {
				console.error(error);
				showErrorDialog(error.errorCode, errorCodes[error.errorCode])
				pathList = [];
				isSearch = false;
				addBtn.disabled = isSearch;
				nfButton.disabled = isSearch;
				gotoFileBtn.style.display = "none";
				renderExplorerDialogContent([]);
			});
	}

	gotoFileBtn.onclick = () => {
		console.log("goto file!");
		console.log(selectedElement.data.url);
		// const path = selectedElement.data.url;
		// pathList = path.split("/");
		// pathList = pathList.slice(1);
		isSearch = false;
		addBtn.disabled = isSearch;
		nfButton.disabled = isSearch;
		gotoFileBtn.style.display = "none";
		extractFileInfo(selectedElement.data.url);
		renderExplorerDialog();
	}

	elementsContainer.ondblclick = () => {
		console.debug("db click");
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
	console.debug(data);
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
	console.info(`loading ${path}`);
	dialogFileList.innerHTML = loaderHTML;
	fileService.retrieveFileList(path, insertType)
		.then(response => {
			
			if (response.data.location !== "") {
				pathList = response.data.location.split("/");
			} else {
				pathList = [];
			}

			updateTitlePath(response.data.folder);
			renderExplorerDialogContent(response.data.files);

			// we need to select the previously selected file and scroll the element into view
			if (fileToSelect !== "") {
				console.debug("selecting file", fileToSelect);
				selectElementFromName(fileToSelect);
				scrollSelectedElementIntoView();

				// reset the fileToSelect to empty string so that we don't try to reselect
				// the file when we navigate to a different folder
				fileToSelect = "";
			}
		})
		.catch(error => {
			console.error(error);
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

	console.debug("previously selected file:", fileToSelect)
	console.debug(pathList);
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
	console.debug(value);
	console.debug(meta);
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

	// we need to clear the pathList so that we don't request to be taken back to the bandeau/banner 
	// (which should only be accessed when the user clicks on a specific button)
	if (previousInsertType === "bandeau" || previousInsertType === "banner") {
		pathList = [];
	}

	addDialogListeners(cb);

	dialog.showModal();
	if (meta.filetype === "bandeau" || meta.filetype === "banner") {
		document.querySelector("#title-bar-button-new-folder").style.display = "none";
		document.querySelector("#title-bar-search").style.display = "none";
		document.querySelector("#btn-search").style.display = "none";
	} else {
		document.querySelector("#title-bar-button-new-folder").style.display = "block";
		document.querySelector("#title-bar-search").style.display = "block";
		document.querySelector("#btn-search").style.display = "block";
	}
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
    toolbar: 'undo redo removeformat | styles | fontfamily fontsize | bold italic underline | forecolor backcolor emoticons | alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | table | link image media  | fullscreen preview | code ',
    menubar: false,
	statusbar: false,
	language: "fr_FR",

	file_picker_types: 'image,file,media',
	file_picker_callback: filePickerHandler,
});


document.querySelector("button#myButton").onclick = (e) => {
	selectedElement = null;
	filePickerHandler((url, meta) => {
		document.querySelector("input#myTextInput").value = url;
	}, document.querySelector("input#myTextInput").value, { filetype: "bandeau" });
};
