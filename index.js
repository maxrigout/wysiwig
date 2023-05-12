const dialog = document.querySelector("#myDialog");
const root = dialog.querySelector("#dialog-root");
const addressBar = ["/"];

const fetchDocs = async () => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve([
				{
					type: "folder",
					name: "root"
				},
				{
					type: "png",
					name: "cat.png"
				}
			])
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

const drawFolder = () => {
	return `<svg viewBox="0 0 40 40"><g fill-rule="evenodd"><path d="M3.908 4h10.104c1.163 0 1.582.073 2.032.229.45.156.838.395 1.179.728.34.333.593.675 1.113 1.716L19 8H0v-.092c0-.866.162-1.547.467-2.117a3.18 3.18 0 0 1 1.324-1.324C2.36 4.162 3.042 4 3.908 4zM0 8h34.872c1.783 0 2.43.186 3.082.534.652.349 1.163.86 1.512 1.512.348.652.534 1.299.534 3.082v17.744c0 1.783-.186 2.43-.534 3.082a3.635 3.635 0 0 1-1.512 1.512c-.652.348-1.299.534-3.082.534H5.128c-1.783 0-2.43-.186-3.082-.534a3.635 3.635 0 0 1-1.512-1.512C.186 33.302 0 32.655 0 30.872V8z"></path></g></svg>`
}

const renderTitleBar2 = () => {
	return `
<div class="image-picker dialog title-bar">
	<div tabindex="-1" class="tam-navbar__main">
		<div tabindex="-1" class="tam-location tam-location--files">
			<span class="tam-icon tam-location__icon">
				${drawFolder()}
			</span>
			<button aria-haspopup="true" type="button" data-alloy-tabstop="true" tabindex="-1" class="tam-location__button" aria-expanded="false">
				<span class="tam-location__button-label">Files</span>
				<span class="tam-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path d="M15.667 9.217a.773.773 0 0 1 1.1.02c.303.313.311.818.02 1.141L12.56 14.76c-.31.32-.81.32-1.12 0l-4.227-4.382a.843.843 0 0 1 .02-1.14.773.773 0 0 1 1.1-.02l3.667 3.8 3.667-3.8z"></path>
					</svg>
				</span>
			</button>
		</div>
	</div>
	<div tabindex="-1" class="tam-navbar__actions">
		<div class="tam-search">
			<input type="search" placeholder="Search" tabindex="-1" data-alloy-tabstop="true" class="tam-input-field tam-input-field--search">
				<span class="tam-icon tam-search__icon">
					<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path d="M15.907 17.319a8 8 0 1 1 1.412-1.412c.013.011.026.023.038.036l4.35 4.35a1 1 0 0 1-1.414 1.414l-4.35-4.35a1.016 1.016 0 0 1-.036-.038zM11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path>
					</svg>
				</span>
			</input>
		</div>
		<button title="Upload/Create" aria-haspopup="true" type="button" data-alloy-tabstop="true" tabindex="-1" class="tam-button tam-button--icon" aria-expanded="false">
			<span class="tam-icon">
				<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path d="M13 11h6a1 1 0 0 1 0 2h-6v6a1 1 0 0 1-2 0v-6H5a1 1 0 0 1 0-2h6V5a1 1 0 0 1 2 0v6z"></path>
				</svg>
			</span>
		</button>
		<button title="Close" type="button" data-alloy-tabstop="true" tabindex="-1" class="tam-button tam-button--icon tam-button--naked">
			<span class="tam-icon">
				<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path d="M17.251 8.157L13.421 12l3.83 3.843a.996.996 0 0 1-1.408 1.408L12 13.421l-3.843 3.83a.996.996 0 0 1-1.408-1.408L10.579 12l-3.83-3.843A.996.996 0 0 1 8.157 6.75L12 10.579l3.843-3.83a.996.996 0 0 1 1.408 1.408z" fill-rule="evenodd"></path>
				</svg>
			</span>
		</button>
	</div>
</div>`;
}

const renderTitleBar = () => {
	return `<div class="image-picker dialog title-bar flex-container">
	<div class="title-bar flex-element left">
	  <!-- draw the folder icon -->
	  <div class="title-bar element flex-element icon">
		<svg width="40" height="40" viewBox="0 0 40 40"><g fill-rule="evenodd"><path d="M3.908 4h10.104c1.163 0 1.582.073 2.032.229.45.156.838.395 1.179.728.34.333.593.675 1.113 1.716L19 8H0v-.092c0-.866.162-1.547.467-2.117a3.18 3.18 0 0 1 1.324-1.324C2.36 4.162 3.042 4 3.908 4zM0 8h34.872c1.783 0 2.43.186 3.082.534.652.349 1.163.86 1.512 1.512.348.652.534 1.299.534 3.082v17.744c0 1.783-.186 2.43-.534 3.082a3.635 3.635 0 0 1-1.512 1.512c-.652.348-1.299.534-3.082.534H5.128c-1.783 0-2.43-.186-3.082-.534a3.635 3.635 0 0 1-1.512-1.512C.186 33.302 0 32.655 0 30.872V8z"></path></g></svg>
	  </div>
	  <!-- draw the address bar -->
	  <!-- should be able to navigate to parent folders upon clicking on an element -->
	  <div class="title-bar element flex-element address flex-container">
		<p>root</p><p>></p><p>media</p><p>></p><p>photos</p>
	  </div>
	</div>
	<div class="title-bar flex-element right">
	  <div class="title-bar element flex-element search flex-container">
		<!-- search icon -->
		<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.907 17.319a8 8 0 1 1 1.412-1.412c.013.011.026.023.038.036l4.35 4.35a1 1 0 0 1-1.414 1.414l-4.35-4.35a1.016 1.016 0 0 1-.036-.038zM11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path></svg>
		<input placeholder="Search" id="title-bar-search" type="text">
	  </div>
	  <div class="title-bar element flex-element btn add">
		<button id="title-bar-button-add">
		<!-- add icon -->
		  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 11h6a1 1 0 0 1 0 2h-6v6a1 1 0 0 1-2 0v-6H5a1 1 0 0 1 0-2h6V5a1 1 0 0 1 2 0v6z"></path></svg>
		</button>
	  </div>
	  <div class="title-bar element flex-element btn close">
		<button id="title-bar-button-cancel">
			<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.251 8.157L13.421 12l3.83 3.843a.996.996 0 0 1-1.408 1.408L12 13.421l-3.843 3.83a.996.996 0 0 1-1.408-1.408L10.579 12l-3.83-3.843A.996.996 0 0 1 8.157 6.75L12 10.579l3.843-3.83a.996.996 0 0 1 1.408 1.408z" fill-rule="evenodd"></path></svg>
		</button>
	  </div>
	</div>
  </div>`
}

const renderSingleImage = (image, index) => {
	console.log("rendering image", image);
	return `<div id="${index}" class="folder-container">
				<div class="element-icon"></div>
				<div class="element-text">${image.name}</div>
			</div>`
}

const renderSingleFolder = (folder, index) => {
	console.log("rendering folder", folder);
	return `<div id="${index}" class="folder-container">
				<div class="element-icon">${drawFolder()}</div>
				<div class="element-text">${folder.name}</div>
			</div>`
}

const renderSingleElement = (element) => {
	switch (element.type) {
		case "folder": return renderSingleFolder(element);
		case "png": return renderSingleImage(element);
	}
}

const renderContent = (data) => {
	return data.map(renderSingleElement).join("<hr>");
}

const renderPreview = () => {
	
}

const addListeners = () => {
	const addBtn = root.querySelector("#title-bar-button-add");
	const cancelBtn = root.querySelector("#title-bar-button-cancel");

	addBtn.onclick = () => {
		fileBrowser((data, metadata) => {
			console.log(data);
			console.log(metadata);
		});
	}
	cancelBtn.addEventListener("click", () => {
		console.log("closing...");
		root.innerHTML = "";
		dialog.close();
	});
}

const renderDialog = (data) => {
	console.log(data);
	const titleBar = renderTitleBar();
	const content = renderContent(data);
	const preview = renderPreview();
	root.innerHTML = `${titleBar}
	<div class="dialog-container">
		<div class="dialog-content">
			${content}
		</div>
		<div class="dialog-preview">
			${preview}
		</div>
	</div>
	<button>Ok</button>`
	addListeners();
}

const filePickerDialogHandler = (cb) => {
	dialog.showModal();
	console.log(dialog);
	console.log(dialog.clientHeight, dialog.clientWidth);
	const docs = fetchDocs().then(renderDialog);
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