// v0.0.3
// 05/07/2023

// lien:
// 		pdf, mscz, midi, mdi
// images:
//		png, gif, jpeg
// media
//		

const dialog = document.querySelector("#myDialog");
const dialogRoot = dialog.querySelector("#dialog-root");
const dialogTitleBar = dialog.querySelector(".dialog-title-bar");
const dialogTitleBarPath = dialog.querySelector(".title-bar-path");
const dialogFileList = dialog.querySelector(".dialog-file-list");
const dialogFilePreview = dialog.querySelector(".dialog-file-preview");

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
let insertType;
// 'insert type' map to file extensions
const acceptedExtensions = {
	file: acceptedLinkFileExtensions,
	image: acceptedImageFileExtensions,
	media: acceptedMediaFileExtensions
};

const getPath = () => {
	return pathList.join("/");
}

function getRandomArbitrary(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

async function fetchDocs_hardCoded(url) {
	let data = serverDir[url];
	const timeout = getRandomArbitrary(100, 1000);
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

async function fetchDocs_server(path) {
	const myHeaders = new Headers();

	// for a JSON body...
	// const body = JSON.stringify({path: path}).toString();
	// myHeaders.set("Content-Type", "application/json");

	// for a form encoded body...
	const body = new URLSearchParams();
	body.append("u", path);
	body.append("type", insertType); // will either be file, media or image

	const myRequest = new Request(retrieveListUrl, {
		method: "POST",
		headers: myHeaders,
		body: body,
	});

	const response = await fetch(myRequest);
	if (response.status != 200) {
		throw "expected status code to be 200!";
	}
	const jsonData = await response.json();
	return jsonData;
}

// another flavor of 'uploadHandler' that uses the fetch api
const fetchUploadHandler = async (file, metadata, progress) => {
	const myHeaders = new Headers();

	const formData = new FormData();
	formData.append("file", file, metadata.fileName);
	formData.set("u", getPath());

	const myRequest = new Request(uploadFileUrl, {
		method: "POST",
		headers: myHeaders,
		body: formData,
	});

	const response = await fetch(myRequest);
	if (response.status != 200) {
		throw "expected status code to be 200!";
	}
	const jsonData = await response.json();
	return jsonData;
}

// used to upload files to the server
const uploadHandler = (file, metadata, progress) => new Promise((resolve, reject) => {
	console.debug("uploading...");

	const xhr = new XMLHttpRequest();
	xhr.withCredentials = false;
	xhr.open('POST', uploadFileUrl);

	xhr.upload.onprogress = (e) => {
	  progress(e.loaded / e.total * 100);
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
	formData.append("file", file, metadata.fileName);
	formData.set("u", getPath());
  
	xhr.send(formData);
});

// https://stackoverflow.com/questions/9068156/server-side-file-browsing
const fileBrowser = (cb) => {
	const acceptedFileExtensions = acceptedExtensions[insertType].map(e => "." + e).join(",");
	console.log(acceptedFileExtensions);
	const input = document.createElement('input');
	input.setAttribute('type', 'file');
	input.setAttribute('accept', acceptedFileExtensions);

	input.addEventListener('change', (e) => {
		const file = e.target.files[0];
		const metadata = { fileName: file.name };
		cb(file, metadata);
	});

	input.click();
}

const updatePreview = () => {
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
	if (selectedElement !== null) {
		if (selectedElement.index === i) {
			console.debug(`element already selected`);
		}
		selectedElement.node.classList.remove(fileSelectedClass);
	}
	console.debug(`select element ${i}`);
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

const navigateToFolder = (folder) => {
	console.info(`navigating to folder`, folder);
	selectedElement = null;
	dialogFileList.innerHTML = "";
	pathList.push(folder.data.name);
	renderDialog();
}

const navigateUp = () => {
	console.info("navigating up");
	selectedElement = null;
	dialogFileList.innerHTML = "";
	pathList.pop();
	renderDialog();
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
	console.debug("closing dialog");
	dialog.close();
}

const closeDialogForSuccess = (cb) => {
	console.debug("closing for success")
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
	console.debug("adding dialog listeners");
	const addBtn = dialogTitleBar.querySelector("#title-bar-button-add");
	const xButton = dialogTitleBar.querySelector("#title-bar-button-cancel");
	const okButton = dialogRoot.querySelector("#btn-ok");
	const cancelButton = dialogRoot.querySelector("#btn-cancel");
	const elementsContainer = dialogRoot.querySelector(".dialog-file-list");

	addBtn.onclick = () => {
		fileBrowser((data, metadata) => {
			uploadHandler(data, metadata, (percent) => console.log(percent))
				.then(result => {
					console.info("upload successful!");
					console.debug(result);
					fileToSelect = metadata.fileName;
					renderDialog();
				})
				.catch(error => {
					console.info("an error occurred while uploading the file")
					console.debug(error);
				});
		});
	};
	xButton.onclick = closeDialog;
	cancelButton.onclick = closeDialog;

	okButton.onclick = () => {
		console.debug(selectedElement);
		if (selectedElement.data.type === "folder") {
			navigateToFolder(selectedElement)
		} else {
			closeDialogForSuccess(cb);
		}
	};

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

const renderDialogContent = (data) => {
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

const renderDialog = () => {
	const path = getPath();
	console.info(`loading ${path}`);
	dialogFileList.innerHTML = loaderHTML;
	fetchDocs(path)
		.then(data => {
			updateFolderPath(data.folder);
			renderDialogContent(data.data);

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
			pathList = [];
			renderDialogContent([]);
			// since an error occured, we don't want to select the file
			fileToSelect = "";
		});
}

const filePickerDialogHandler = () => {
	dialog.showModal();
	renderDialog();
}

const setInsertType = (type) => {
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
	meta:
		lien:
			fieldname: "url"
			filetype: "file"
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
	addDialogListeners(cb);
	filePickerDialogHandler();
};

tinymce.init({
    selector: 'textarea#myTextArea',
	height: "700px",
    plugins: [
      'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
      'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime',
      'media', 'table', 'emoticons', 'template', 'help', 'save',
    ],
    toolbar: 'undo redo | styles | bold italic underline | forecolor backcolor emoticons | alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | table | link image media  | fullscreen preview | code ' +
      '',
    menubar: false,
	statusbar: false,
	language: "fr_FR",

	file_picker_types: 'image,file,media',
	file_picker_callback: filePickerHandler,
});
