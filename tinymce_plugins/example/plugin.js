/*
  Note: We have included the plugin in the same JavaScript file as the TinyMCE
  instance for display purposes only. Tiny recommends not maintaining the plugin
  with the TinyMCE instance and using the `external_plugins` option.
*/
tinymce.PluginManager.add('example', (editor, url) => {
	const openDialog = (e) => e.windowManager.open({
	  title: 'Example plugin',
	  body: {
		type: 'panel',
		items: [
			{
				name: 'src',
				type: 'urlinput',
				filetype: 'file',
				label: 'Source'
			  },
		  {
			type: 'button',
			text: 'load',
			filetype: 'image',
			buttonType: 'primary',
		  }
		]
	  },
	  buttons: [
		{
		  type: 'cancel',
		  text: 'Close'
		},
		{
		  type: 'submit',
		  text: 'Save',
		  buttonType: 'primary'
		}
	  ],
	  onSubmit: (api) => {
		const data = api.getData();
		/* Insert content when the window form is submitted */
		console.log(data.src);
		editor.insertContent(`<a href=${data.src.value}>${data.title}</a>`);
		api.close();
	  }
	});
	/* Add a button that opens a window */
	editor.ui.registry.addButton('example', {
	  text: 'My Toolbar Button',
	  onAction: () => {
		/* Open window */
		openDialog(editor);
	  }
	});
	/* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
	editor.ui.registry.addMenuItem('example', {
	  text: 'Example plugin',
	  onAction: () => {
		/* Open window */
		openDialog(editor);
	  }
	});
	/* Return the metadata for the help plugin */
	return {
	  getMetadata: () => ({
		name: 'Example plugin',
		url: 'http://exampleplugindocsurl.com'
	  })
	};
  });
  
//   /*
// 	The following is an example of how to use the new plugin and the new
// 	toolbar button.
//   */
//   tinymce.init({
// 	selector: 'textarea#custom-plugin',
// 	plugins: 'example help',
// 	toolbar: 'example | help'
//   });