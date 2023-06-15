const dialog = document.querySelector("#myDialog");
const dialogRoot = dialog.querySelector("#dialog-root");
const dialogTitleBar = dialog.querySelector(".dialog-title-bar");
const dialogTitleBarPath = dialog.querySelector(".title-bar-path");
const dialogFileList = dialog.querySelector(".dialog-file-list");
const dialogFilePreview = dialog.querySelector(".dialog-file-preview");

let pathList = [];
let selectedElement = null;
let fileToSelect = "";
let fetchedData;

function getRandomArbitrary(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

async function fetchDocs_hardCoded(url) {
	let data = serverDir[url];
	const timeout = getRandomArbitrary(100, 1000);
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			console.info(`took ${timeout} ms`);
			if (data) {
				resolve(data);
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

// https://stackoverflow.com/questions/9068156/server-side-file-browsing
const fileBrowser = (cb) => {
	const input = document.createElement('input');
	input.setAttribute('type', 'file');
	input.setAttribute('accept', 'image/*');

	input.addEventListener('change', (e) => {
		const file = e.target.files[0];

		const reader = new FileReader();
		reader.addEventListener('load', () => {
			/*
			Note: Now we need to register the blob in TinyMCEs image blob
			registry. In the next release this part hopefully won't be
			necessary, as we are looking to handle it internally.
			*/
			const id = 'blobid' + (new Date()).getTime();
			const blobCache =  tinymce.activeEditor.editorUpload.blobCache;
			const base64 = reader.result.split(',')[1];
			const blobInfo = blobCache.create(id, file, base64);
			blobCache.add(blobInfo);

			/* call the callback and populate the Title field with the file name */
			cb(blobInfo.blobUri(), { title: file.name });
		});
		reader.readAsDataURL(file);
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

const updateFolderPath = () => {
	dialogTitleBarPath.innerHTML = defaultRootFolder + (pathList.length === 0 ? "" : "/") + pathList.join("/");
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
			console.debug(data);
			console.debug(metadata);
		});
	};
	xButton.onclick = closeDialog;
	cancelButton.onclick = closeDialog;

	okButton.onclick = () => {
		console.debug(selectedElement);
		if (selectedElement.data.type === "folder")
			navigateToFolder(selectedElement)
		else
			closeDialogForSuccess(cb);
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
	// potentially sort the data
	// data.sort((e1, e2) => e1.name.localeCompare(e2.name));
	dialogFileList.innerHTML = renderContent(data);
	if (selectedElement !== null) {
		const selectedNode = dialogFileList.querySelector(`#${elementIdPrefix}${selectedElement.index}`);
		selectElement(selectedNode, selectedElement.index);
	}
	updatePreview();
	updateFolderPath();
}

const renderDialog = () => {
	const path = pathList.join("/");
	console.info(`loading ${path}`);
	dialogFileList.innerHTML = loaderHTML;
	fetchDocs(path)
		.then(data => {
			renderDialogContent(data);
			if (fileToSelect !== "") {
				console.debug("selecting previously selected file", fileToSelect);
				selectElementFromName(fileToSelect);
				// reset the fileToSelect to empty string so that we don't try to reselect
				// the file when we navigate
				fileToSelect = "";
			}
		})
		.catch(error => {
			console.error(error);
			// we still want to render a folder to give the user the ability
			// to go up in the directory tree.
			renderDialogContent([]);
			// since an error occured, we don't want to select the file
			fileToSelect = "";
		});
}

const filePickerDialogHandler = () => {
	dialog.showModal();
	renderDialog();
}

const extractFileInfo = (originalFilePath) => {
	const i = originalFilePath.lastIndexOf('/');
	// truncate the file name (anything after the last '/')
	let filePath = originalFilePath.substring(0, i);

	// truncate the base url if it exists
	const j = filePath.indexOf(baseUrl);
	if (j !== -1) {
		filePath = filePath.substring(j + baseUrl.length);
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

const filePickerHandler = (cb, value, meta) => {
	console.debug("value", value);
	console.debug("meta", meta);
	if (value !== "") {
		extractFileInfo(value);
	}
	addDialogListeners(cb);
	filePickerDialogHandler();
};

const uploadHandler = (blobInfo, progress) => new Promise((resolve, reject) => {
	console.log("uploading...");

	const xhr = new XMLHttpRequest();
	xhr.withCredentials = false;
	xhr.open('POST', 'postAcceptor.php');
  
	xhr.upload.onprogress = (e) => {
	  progress(e.loaded / e.total * 100);
	};
  
	xhr.onload = () => {
	  if (xhr.status === 403) {
		reject({ message: 'HTTP Error: ' + xhr.status, remove: true });
		return;
	  }
  
	  if (xhr.status < 200 || xhr.status >= 300) {
		reject('HTTP Error: ' + xhr.status);
		return;
	  }
  
	  const json = JSON.parse(xhr.responseText);
  
	  if (!json || typeof json.location !== 'string') {
		reject('Invalid JSON: ' + xhr.responseText);
		return;
	  }
  
	  resolve(json.location);
	};
  
	xhr.onerror = () => {
	  reject('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
	};
  
	const formData = new FormData();
	formData.append('file', blobInfo.blob(), blobInfo.filename());

	console.log(formData);
  
	xhr.send(formData);
});

const fetchLinkList = () => [
    { title: '{companyname} Home Page', value: '{companyurl}' },
    { title: '{companyname} Blog', value: '{companyurl}/blog' },
    { title: '{productname} Support resources',
      menu: [
        { title: '{productname} Documentation', value: '{companyurl}/docs/' },
        { title: '{productname} on Stack Overflow', value: '{communitysupporturl}' },
        { title: '{productname} GitHub', value: 'https://github.com/tinymce/' }
      ]
    }
];

tinymce.init({
    selector: 'textarea#myTextArea',
	height: "700px",
    plugins: [
      'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
      'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime',
      'media', 'table', 'emoticons', 'template', 'help', 'save',
    ],
    toolbar: 'undo redo | styles | bold italic underline | alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | link image | preview media fullscreen | ' +
      'forecolor backcolor emoticons | help | save',
    // menubar: false,
	// statusbar: false,
	language: "fr_FR",

	file_picker_types: 'image,file',
	file_picker_callback: filePickerHandler,
});
