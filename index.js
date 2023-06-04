const fileSelectedClass = "file-selected";

const dialog = document.querySelector("#myDialog");
const dialogRoot = dialog.querySelector("#dialog-root");
const dialogTitleBar = dialog.querySelector(".dialog-title-bar");
const dialogFileList = dialog.querySelector(".dialog-file-list");
const dialogFilePreview = dialog.querySelector(".dialog-file-preview");
const dialogActionButtons = dialog.querySelector("#dialog-action-buttons");

let pathList = [];
let selectedElement = null;
let fetchedData;
let onDialogClose;
const defaultDialogContent = dialogRoot.innerHTML;

const svg = {
	folder: `<svg viewBox="0 0 40 40"><g fill-rule="evenodd"><path d="M3.908 4h10.104c1.163 0 1.582.073 2.032.229.45.156.838.395 1.179.728.34.333.593.675 1.113 1.716L19 8H0v-.092c0-.866.162-1.547.467-2.117a3.18 3.18 0 0 1 1.324-1.324C2.36 4.162 3.042 4 3.908 4zM0 8h34.872c1.783 0 2.43.186 3.082.534.652.349 1.163.86 1.512 1.512.348.652.534 1.299.534 3.082v17.744c0 1.783-.186 2.43-.534 3.082a3.635 3.635 0 0 1-1.512 1.512c-.652.348-1.299.534-3.082.534H5.128c-1.783 0-2.43-.186-3.082-.534a3.635 3.635 0 0 1-1.512-1.512C.186 33.302 0 32.655 0 30.872V8z"></path></g></svg>`,
	plus: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 11h6a1 1 0 0 1 0 2h-6v6a1 1 0 0 1-2 0v-6H5a1 1 0 0 1 0-2h6V5a1 1 0 0 1 2 0v6z"></path></svg>`,
	x: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.251 8.157L13.421 12l3.83 3.843a.996.996 0 0 1-1.408 1.408L12 13.421l-3.843 3.83a.996.996 0 0 1-1.408-1.408L10.579 12l-3.83-3.843A.996.996 0 0 1 8.157 6.75L12 10.579l3.843-3.83a.996.996 0 0 1 1.408 1.408z" fill-rule="evenodd"></path></svg>`,
	search: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.907 17.319a8 8 0 1 1 1.412-1.412c.013.011.026.023.038.036l4.35 4.35a1 1 0 0 1-1.414 1.414l-4.35-4.35a1.016 1.016 0 0 1-.036-.038zM11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path></svg>`,
}

const rootFiles = [
	{
		type: "folder",
		name: "pictures"
	},
	{
		type: "png",
		name: "cat.png",
		url: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg",
		localUrl: "img/cat.jpeg",
	},
	{
		type: "png",
		name: "dog.png",
		url: "https://www.hartz.com/wp-content/uploads/2022/04/small-dog-owners-1.jpg",
		localUrl: "img/dog.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	}
]

const pictureFiles = [
	{
		type: "folder",
		name: "folder1"
	},
	{
		type: "png",
		name: "cat.png",
		url: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg",
		localUrl: "img/cat.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/202984001/1800",
		localUrl: "img/bird.jpeg",
	}
]

const fetchDocs = async (url) => {
	let data = null;
	if (url === "root") {
		data = rootFiles
	} else if (url === "pictures") {
		data = pictureFiles;
	} else if (url === "pictures/folder1") {
		data = folder1Files;
}
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (data) {
				resolve(data);
			}
			else {
				reject({error: "no data available"});
			}
		}, 500)
	});
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

const renderTitleBar = () => {
	return `<div class="vertical-center align-right">
	${svg.search}
</div>
<input placeholder="Search" id="title-bar-search" type="text">
<button id="title-bar-button-add">
	${svg.plus}
</button>
<button id="title-bar-button-cancel">
	${svg.x}
</button>`
}

const updatePreview = () => {
	const filePreview = dialogFilePreview.querySelector(".file-preview");
	if (selectedElement.data.type === "folder") {
		filePreview.innerHTML = "";
		return;
	}
	filePreview.innerHTML = `<img src="${selectedElement.data.url}">`
}

const selectElement = (e, i) => {
	if (selectedElement === null) {
		selectedElement = { 
			node: e,
			index: i,
			data: fetchedData[i],
		 };
		selectedElement.node.classList.add(fileSelectedClass);
		updatePreview();
		return;
	}
	if (selectedElement.index === i) {
		console.log(`element already selected`);
		return;
	}
	console.log(`select element ${i}`);
	selectedElement.node.classList.remove(fileSelectedClass);
	e.classList.add(fileSelectedClass);
	selectedElement = { 
		node: e,
		index: i,
		data: fetchedData[i],
	 }
	updatePreview();
}

const navigateToFolder = (folder) => {
	selectedElement = null;
	console.log(`navigating to folder`, folder);
	pathList.push(folder.data.name);
	renderDialog(onDialogClose, pathList.join("/"));
}

const navigateUp = () => {
	selectedElement = null;
	pathList.pop();
	const newPath = pathList.join("/");
	renderDialog(onDialogClose, newPath.length === 0 ? "root" : newPath);
}

// https://www.w3schools.com/howto/howto_css_image_gallery.asp
const renderSingleImage = (image, index) => {
	console.log("rendering image", image);
	return `<div onclick="selectElement(this, ${index});">
	<div>
		<div>${image.name}</div>
	</div>
</div>`;
}

const renderSingleFolder = (folder, index) => {
	console.log("rendering folder", folder, index);
	return `<div onclick="selectElement(this, ${index});">
	${svg.folder}
	${folder.name}
	</div>`
}

const renderSingleElement = (element, index) => {
	switch (element.type) {
		case "folder": return renderSingleFolder(element, index);
		case "png": return renderSingleImage(element, index);
	}
}

const renderParentFolder = () => {
	return `<div onclick="navigateUp()">
				${svg.folder}parent
			</div>`;
}

const closeDialogForSuccess = (cb) => {
	console.log("closing for success")
	cb(selectedElement.data.localUrl, {title: selectedElement.data.name});
	dialog.close();
	pathList = [];
	selectedElement = null;
	// dialogRoot.innerHTML = defaultDialogContent;
}

const renderContent = (data, cb) => {
	const renderedContent = data.map((e, index) => renderSingleElement(e, index)).join("<hr>");
	if (pathList.length === 0)
		return `<div class="files-list">${renderedContent}</div>`
	const renderedParentFolder = renderParentFolder();
	return `<div class="files-list">${renderedParentFolder}<hr>${renderedContent}</div>`
}

const addListeners = (cb) => {
	const addBtn = dialogTitleBar.querySelector("#title-bar-button-add");
	const cancelBtn = dialogTitleBar.querySelector("#title-bar-button-cancel");
	const okButton = dialogRoot.querySelector("#btn-ok");
	const elementsContainer = dialogRoot.querySelector(".dialog-file-list");

	addBtn.onclick = () => {
		fileBrowser((data, metadata) => {
			console.log(data);
			console.log(metadata);
		});
	}
	cancelBtn.onclick = () => {
		console.log("closing...");
		pathList = [];
		selectedElement = null;
		dialog.close();
	};

	okButton.onclick = () => {
		console.log(selectedElement);
		if (selectedElement.data.type === "folder")
			navigateToFolder(selectedElement)
		else
			closeDialogForSuccess(cb);
	};

	elementsContainer.addEventListener("dbclick", () => {
		console.log("db click");
		if (selectedElement.data.type === "folder")
			navigateToFolder(selectedElement)
		else
			closeDialogForSuccess(cb);
	});
}

const renderDialogContent = (data, cb) => {
	console.log(data);
	fetchedData = data;
	dialogFileList.innerHTML = renderContent(data, cb);
	dialogFilePreview.querySelector(".file-preview").innerHTML = "";
	addListeners(cb);
}

const renderDialog = (cb, path) => {
	fetchDocs(path)
		.then(data => {
			renderDialogContent(data, cb)
		})
		.catch(error => {
			console.log(error.error)
			pathList.pop();
			addListeners(cb);
		});
}

const filePickerDialogHandler = (cb) => {
	onDialogClose = cb;
	dialog.showModal();
	console.log(dialog);
	renderDialog(cb, "root" /* initial path/folder to load */);
}

const filePickerHandler = (cb, value, meta) => {
	filePickerDialogHandler(cb);
	// fileBrowser(cb);
};

const uploadHandler = (blobInfo, progress) => new Promise((resolve, reject) => {
	console.log("uploading...")

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
  
	  if (!json || typeof json.location != 'string') {
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