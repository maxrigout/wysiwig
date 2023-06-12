const fileSelectedClass = "file-selected";
const folderIconPath = "icons/folder.png";
const parentFolderIconPath = "icons/folder.png";
const imageIconPath = "icons/image_icon.png";
const audioIconPath = "icons/audio_icon.png";
const pdfIconPath = "icons/pdf_icon.png";
const musescoreIconPath = "icons/musescore_icon.png";
const defaultFileIconPath = "icons/file_icon.png";

const dialog = document.querySelector("#myDialog");
const dialogRoot = dialog.querySelector("#dialog-root");
const dialogTitleBar = dialog.querySelector(".dialog-title-bar");
const dialogFileList = dialog.querySelector(".dialog-file-list");
const dialogFilePreview = dialog.querySelector(".dialog-file-preview");

let pathList = [];
let selectedElement = null;
let fetchedData;

const fetchDocs = async (path) => {
	const baseUrl = "http://192.168.1.222:3000/getliste.php";
	const myHeaders = new Headers();

	// for a JSON body...
	// const body = JSON.stringify({path: path}).toString();
	// myHeaders.set("Content-Type", "application/json");

	// for a form encoded body...
	const body = new URLSearchParams();
	body.append("path", path);
	const myRequest = new Request(baseUrl, {
		method: "POST",
		headers: myHeaders,
		body: body,
	});

	const response = await fetch(myRequest);
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

const navigateToFolder = (folder) => {
	selectedElement = null;
	console.info(`navigating to folder`, folder);
	dialogFileList.innerHTML = "";
	pathList.push(folder.data.name);
	renderDialog();
}

const navigateUp = () => {
	console.info("navigating up");
	selectedElement = null;
	pathList.pop();
	renderDialog();
}

// https://www.w3schools.com/howto/howto_css_image_gallery.asp
const renderSingleFile = (file, index) => {
	let iconPath = defaultFileIconPath;
	switch (file.type) {
		case "image":
		case "jpeg":
		case "jpg":
		case "png":
		case "gif":
		case "bmp":
			console.debug("rendering image", file);
			iconPath = imageIconPath;
			break;
		case "audio":
		case "mp3":
			console.debug("rendering audio file", file);
			iconPath = audioIconPath;
			break;
		case "pdf":
			console.debug("rendering pdf", file);
			iconPath = pdfIconPath;
			break;
		case "musescore":
			console.debug("rendering musescore file", file);
			iconPath = musescoreIconPath;
			break;
	}
	return `<div class="element_container" id="element_${index}" onclick="selectElement(this, ${index});">
		<img src="${iconPath}">
		${file.name}
	</div>`;
}

const renderSingleFolder = (folder, index) => {
	console.debug("rendering folder", folder, index);
	return `<div class="element_container" id="element_${index}" onclick="selectElement(this, ${index});">
		<img src="${folderIconPath}">
		${folder.name}
	</div>`;
}

const renderSingleElement = (element, index) => {
	if (element.type === "folder") {
		return renderSingleFolder(element, index);
	}
	return renderSingleFile(element, index);
}

const renderParentFolder = () => {
	return `<div class="element_container" id="element_-1" onclick="selectElement(this, -1);">
		<img src="${parentFolderIconPath}"> dossier parent
	</div>`;
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
	const renderedContent = data.map((e, index) => renderSingleElement(e, index)).join("");
	if (pathList.length === 0) {
		return `<div class="file-list">${renderedContent}</div>`;
	}
	const renderedParentFolder = renderParentFolder();
	return `<div class="file-list">${renderedParentFolder}${renderedContent}</div>`;
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
		const selectedNode = dialogFileList.querySelector(`#element_${selectedElement.index}`);
		selectElement(selectedNode, selectedElement.index);
	}
	updatePreview();
}

const renderDialog = () => {
	const path = pathList.join("/");
	console.info(`loading ${path}`);
	fetchDocs(path)
		.then(data => {
			renderDialogContent(data);
		})
		.catch(error => {
			console.error(error);
			pathList.pop();
		});
}

const filePickerDialogHandler = () => {
	dialog.showModal();
	renderDialog();
}

const filePickerHandler = (cb, value, meta) => {
	addDialogListeners(cb);
	filePickerDialogHandler();
	// fileBrowser(cb);
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
    selector: 'textarea#open-source-plugins',
	height: "500px",
    plugins: [
      'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
      'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime',
      'media', 'table', 'emoticons', 'template', 'help', 'save'
    ],
    toolbar: 'undo redo | styles | bold italic underline | alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | link image | preview media fullscreen | ' +
      'forecolor backcolor emoticons | help | save',
    // menu: {
    //   favs: { title: 'My Favorites', items: 'code visualaid | searchreplace | emoticons' }
    // },
    // menubar: false,
	// statusbar: false,
    content_css: 'css/content.css',
	language: "fr_FR",

	// image_advtab: true,

	// image_list: (success) => {
	// 	console.log("fetching images...")
	// 	success([
	// 	  { title: 'Dog', value: 'https://git-scm.com/images/logo@2x.png' },
	// 	  { title: 'Cat', value: 'mycat.gif' }
	// 	]);
	// },

	link_list: (success) => { // called on link dialog open
		const links = fetchLinkList(); // get link_list data
		success(links); // pass link_list data to {productname}
	},

	file_picker_types: 'image',
	file_picker_callback: filePickerHandler,

	// automatic_uploads: false,
	// image_uploadtab: true,
	// images_upload_handler: uploadHandler,
	// images_upload_url: 'test/postAcceptor.php',
	// images_upload_base_path: '/some/basepath', // https://www.tiny.cloud/docs/tinymce/6/image/#images_upload_base_path
	// images_upload_credentials: true, // https://www.tiny.cloud/docs/tinymce/6/image/#images_upload_credentials
	// https://www.tiny.cloud/docs/tinymce/6/image/#images_upload_handler

  });