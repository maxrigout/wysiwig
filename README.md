# wysiwig

Pour aider mon papa avec TinyMCE.

Pour voir la page en action: https://maxrigout.github.io/wysiwig/

Si tu veux voir des exemples, tu peux regarder la: https://www.w3schools.com/howto/howto_css_image_overlay_title.asp

## TinyMCE
doc: https://www.tiny.cloud/docs/tinymce/6/
exemple: https://www.tiny.cloud/docs/demo/full-featured/

## Comment l'ajouter à votre page
* prendre la balise `<dialog>` du `index.html`
* copier le `dialog-style.css`
* 	rajouter le `style.css` sur votre html (`<link href="dialog-style.css" type="text/css" rel="stylesheet">`)
* copier le `index.js`
*	rajouter le `index.js` sur votre html (`<script src="index.js"></script>`)
* configurer le plugin:
* dans config.js:
* `baseUrl` pour changer l'url du serveur
* les `[*]IconPath` pour changer l'addresse des icones (laisser blanc pour ne pas afficher d'url)

## TODO
- [ ] New folder button
- [ ] Delete file button
- [ ] more previews...
