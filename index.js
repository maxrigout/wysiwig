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
const defaultDialogContent = dialogRoot.innerHTML;

const svg = {
	folder: `<svg viewBox="0 0 40 40"><g fill-rule="evenodd"><path d="M3.908 4h10.104c1.163 0 1.582.073 2.032.229.45.156.838.395 1.179.728.34.333.593.675 1.113 1.716L19 8H0v-.092c0-.866.162-1.547.467-2.117a3.18 3.18 0 0 1 1.324-1.324C2.36 4.162 3.042 4 3.908 4zM0 8h34.872c1.783 0 2.43.186 3.082.534.652.349 1.163.86 1.512 1.512.348.652.534 1.299.534 3.082v17.744c0 1.783-.186 2.43-.534 3.082a3.635 3.635 0 0 1-1.512 1.512c-.652.348-1.299.534-3.082.534H5.128c-1.783 0-2.43-.186-3.082-.534a3.635 3.635 0 0 1-1.512-1.512C.186 33.302 0 32.655 0 30.872V8z"></path></g></svg>`,
	plus: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 11h6a1 1 0 0 1 0 2h-6v6a1 1 0 0 1-2 0v-6H5a1 1 0 0 1 0-2h6V5a1 1 0 0 1 2 0v6z"></path></svg>`,
	x: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.251 8.157L13.421 12l3.83 3.843a.996.996 0 0 1-1.408 1.408L12 13.421l-3.843 3.83a.996.996 0 0 1-1.408-1.408L10.579 12l-3.83-3.843A.996.996 0 0 1 8.157 6.75L12 10.579l3.843-3.83a.996.996 0 0 1 1.408 1.408z" fill-rule="evenodd"></path></svg>`,
	search: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.907 17.319a8 8 0 1 1 1.412-1.412c.013.011.026.023.038.036l4.35 4.35a1 1 0 0 1-1.414 1.414l-4.35-4.35a1.016 1.016 0 0 1-.036-.038zM11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path></svg>`,
}

const animalFiles = [
	{
		type: "folder",
		name: "chats"
	},
	{
		type: "folder",
		name: "oiseaux"
	},
		{
		type: "folder",
		name: "chiens"
	}
];

const catFiles = [
	{
		type: "jpeg",
		name: "cat.jpeg",
		url: "img/cats/cat.jpeg",
	},
	{
		type: "jpg",
		name: "catz.jpg",
		url: "img/cats/catz.jpg",
	},
	{
		type: "jpg",
		name: "domestic-cat.jpg",
		url: "img/cats/domestic-cat.jpg",
	},
	{
		type: "jpeg",
		name: "kittens.jpeg",
		url: "img/cats/kittens.jpeg",
	},
	{
		type: "jpeg",
		name: "cats-party.jpeg",
		url: "img/cats/cats-party.jpeg",
	},
	{
		type: "jpeg",
		name: "black-cat-back.jpeg",
		url: "img/cats/black-cat-back.jpeg",
	},
	{
		type: "jpg",
		name: "cats1.jpg",
		url: "img/cats/	cats1.jpg",
	},
	{
		type: "jpg",
		name: "kittens1.jpg",
		url: "img/cats/kittens1.jpg",
	},
	{
		type: "jpeg",
		name: "egypt-kitty.jpeg",
		url: "img/cats/egypt-kitty.jpeg",
	},
	{
		type: "jpg",
		name: "white-cat-min.jpg",
		url: "img/cats/white-cat-min.jpg",
	},
	{
		type: "jpg",
		name: "p07ryyyj.jpg",
		url: "img/cats/p07ryyyj.jpg",
	},
];

const dogFiles = [
	{
		type: "png",
		name: "dog.png",
		url: "img/dogs/dog.jpeg",
	},
	{
		type: "png",
		name: "zouzou.png",
		url: "img/dogs/zouzou.jpeg",
	},
	{
		type: "jpg",
		name: "puppy-on-garden.jpg",
		url: "img/dogs/puppy-on-garden.jpg",
	},
	{
		type: "png",
		name: "angry_chihuahua.png",
		url: "img/dogs/angry_chihuahua.png",
	},
	{
		type: "jpg",
		name: "fuffy-dog.jpg",
		url: "img/dogs/fuffy-dog.jpg",
	},
];

const birdFiles = [
	{
		type: "jpeg",
		name: "bird2.jpeg",
		url: "img/birds/bird2.jpeg",
	},
	{
		type: "jpeg",
		name: "bird.jpeg",
		url: "img/birds/bird.jpeg",
	},
	{
		type: "jpg",
		name: "Tanager-Shapiro.jpg",
		url: "img/birds/Tanager-Shapiro.jpg",
	},
];

const rootFiles = [
	{
		type: "folder",
		name: "pictures"
	},
	{
		type: "folder",
		name: "animaux"
	},
	{
		type: "jpeg",
		name: "cat.jpeg",
		url: "img/cats/cat.jpeg",
	},
	{
		type: "jpg",
		name: "catz.jpg",
		url: "img/cats/catz.jpg",
	},
	{
		type: "jpg",
		name: "domestic-cat.jpg",
		url: "img/cats/domestic-cat.jpg",
	},
	{
		type: "jpeg",
		name: "kittens.jpeg",
		url: "img/cats/kittens.jpeg",
	},
	{
		type: "jpeg",
		name: "cats-party.jpeg",
		url: "img/cats/cats-party.jpeg",
	},
	{
		type: "jpeg",
		name: "black-cat-back.jpeg",
		url: "img/cats/black-cat-back.jpeg",
	},
	{
		type: "jpg",
		name: "cats1.jpg",
		url: "img/cats/	cats1.jpg",
	},
	{
		type: "jpg",
		name: "kittens1.jpg",
		url: "img/cats/kittens1.jpg",
	},
	{
		type: "jpeg",
		name: "egypt-kitty.jpeg",
		url: "img/cats/egypt-kitty.jpeg",
	},
	{
		type: "jpg",
		name: "white-cat-min.jpg",
		url: "img/cats/white-cat-min.jpg",
	},
	{
		type: "jpg",
		name: "p07ryyyj.jpg",
		url: "img/cats/p07ryyyj.jpg",
	},
	{
		type: "png",
		name: "dog.png",
		url: "img/dogs/dog.jpeg",
	},
	{
		type: "png",
		name: "zouzou.png",
		url: "img/dogs/zouzou.jpeg",
	},
	{
		type: "jpg",
		name: "puppy-on-garden.jpg",
		url: "img/dogs/puppy-on-garden.jpg",
	},
	{
		type: "png",
		name: "angry_chihuahua.png",
		url: "img/dogs/angry_chihuahua.png",
	},
	{
		type: "jpg",
		name: "fuffy-dog.jpg",
		url: "img/dogs/fuffy-dog.jpg",
	},
	{
		type: "jpeg",
		name: "bird2.jpeg",
		url: "img/birds/bird2.jpeg",
	},
	{
		type: "jpeg",
		name: "bird.jpeg",
		url: "img/birds/bird.jpeg",
	},
	{
		type: "jpg",
		name: "Tanager-Shapiro.jpg",
		url: "img/birds/Tanager-Shapiro.jpg",
	},
]

const pictureFiles = [
	{
		type: "folder",
		name: "goesnowhere"
	},
	{
		type: "png",
		name: "cat.png",
		url: "img/cat.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "img/birds/bird.jpeg",
	},
	{
		type: "png",
		name: "bird.png",
		url: "img/birds/bird.jpeg",
	},
]

const fetchDocs = async (url) => {
	let data = null;
	if (url === "root") {
		data = rootFiles
	} else if (url === "root/pictures") {
		data = pictureFiles;
	} else if (url === "root/pictures/folder1") {
		data = folder1Files;
	} else if (url === "root/animaux") {
		data = animalFiles;
	} else if (url === "root/animaux/chats") {
		data = catFiles;
	} else if (url === "root/animaux/chiens") {
		data = dogFiles;
	} else if (url === "root/animaux/oiseaux") {
		data = birdFiles;
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
	} else if (selectedElement.data.type === "parentFolder") {
		filePreview.innerHTML = "";
		return;
	}
	filePreview.innerHTML = `<img src="${selectedElement.data.url}">`
}

const selectElement = (e, i) => {
	if (selectedElement !== null) {
		if (selectedElement.index === i) {
			console.log(`element already selected`);
		}
		selectedElement.node.classList.remove(fileSelectedClass);
	}
	console.log(`select element ${i}`);
	selectedElement = { 
		node: e,
		index: i,
		data: null,
	};
	if (i === -1) {
		selectedElement.data = {type: "parentFolder"}
	} else if (i >= 0 && i < fetchedData.length) {
		selectedElement.data = fetchedData[i];
	}
	selectedElement.node.classList.add(fileSelectedClass);
	updatePreview();
}

const navigateToFolder = (folder) => {
	selectedElement = null;
	console.log(`navigating to folder`, folder);
	dialogFileList.innerHTML = "";
	pathList.push(folder.data.name);
	renderDialog();
}

const navigateUp = () => {
	selectedElement = null;
	pathList.pop();
	renderDialog();
}

// https://www.w3schools.com/howto/howto_css_image_gallery.asp
const renderSingleImage = (image, index) => {
	console.log("rendering image", image);
	return `<div id="element_${index}" onclick="selectElement(this, ${index});">
	<div>
		<div>${image.name}</div>
	</div>
</div>`;
}

const renderSingleFile = (file, index) => {
	switch (file.type) {
		case "jpeg":
		case "jpg":
		case "png": return renderSingleImage(file, index);
	}
}

const renderSingleFolder = (folder, index) => {
	console.log("rendering folder", folder, index);
	return `<div id="element_${index}" onclick="selectElement(this, ${index});">
	${svg.folder}
	${folder.name}
	</div>`
}

const renderSingleElement = (element, index) => {
	if (element.type === "folder") {
		return renderSingleFolder(element, index);
	}
	return renderSingleFile(element, index);
}

const renderParentFolder = () => {
	return `<div id="element_-1" onclick="selectElement(this, -1);">
				${svg.folder} dossier parent
			</div>`;
}

const closeDialog = () => {
	console.log("closing dialog");
	dialog.close();
}

const closeDialogForSuccess = (cb) => {
	console.log("closing for success")
	cb(selectedElement.data.url, {title: selectedElement.data.name});
	closeDialog();
}

const renderContent = (data) => {
	const renderedContent = data.map((e, index) => renderSingleElement(e, index)).join("<hr>");
	if (pathList.length === 0)
		return `<div class="file-list">${renderedContent}</div>`
	const renderedParentFolder = renderParentFolder();
	return `<div class="file-list">${renderedParentFolder}<hr>${renderedContent}</div>`
}

const addDialogListeners = (cb) => {
	console.log("adding dialog listeners");
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
	cancelBtn.onclick = closeDialog;

	okButton.onclick = () => {
		console.log(selectedElement);
		if (selectedElement.data.type === "folder")
			navigateToFolder(selectedElement)
		else
			closeDialogForSuccess(cb);
	};

	elementsContainer.ondblclick = () => {
		console.log("db click");
		if (selectedElement.data.type === "parentFolder") {
			navigateUp();
		} else if (selectedElement.data.type === "folder") {
			navigateToFolder(selectedElement)
		} else {
			closeDialogForSuccess(cb);
		}
	};
}

const renderDialogContent = (data) => {
	console.log(data);
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
	const path = "root" + (pathList.length === 0 ? "" : "/") + pathList.join("/");
	console.log(`loading ${path}`);
	fetchDocs(path)
		.then(data => {
			renderDialogContent(data)
		})
		.catch(error => {
			console.log(error.error)
			pathList.pop();
		});
}

const filePickerDialogHandler = () => {
	dialog.showModal();
	console.log(dialog);
	renderDialog();
}

const filePickerHandler = (cb, value, meta) => {
	addDialogListeners(cb);
	filePickerDialogHandler();
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