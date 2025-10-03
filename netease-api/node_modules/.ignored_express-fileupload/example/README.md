# express-fileupload Examples

## Basic File Upload
**Your node.js code:**
```javascript
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

// default options
app.use(fileUpload());

app.post('/upload', function(req, res) {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = req.files.sampleFile;
  uploadPath = __dirname + '/somewhere/on/your/server/' + sampleFile.name;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(uploadPath, function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
});
```

**Your HTML file upload form:**
```html
<html>
  <body>
    <form ref='uploadForm' 
      id='uploadForm' 
      action='http://localhost:8000/upload' 
      method='post' 
      encType="multipart/form-data">
        <input type="file" name="sampleFile" />
        <input type='submit' value='Upload!' />
    </form>     
  </body>
</html>
```

## Multi-File Upload
express-fileupload supports multiple file uploads at the same time.

Let's say you have three files in your form, each of the inputs with the name `my_profile_pic`, `my_pet`, and `my_cover_photo`:
```html
<input type="file" name="my_profile_pic" />
<input type="file" name="my_pet" />
<input type="file" name="my_cover_photo" />
```

These uploaded files would be accessible like so:
```javascript
app.post('/upload', function(req, res) {
  // Uploaded files:
  console.log(req.files.my_profile_pic.name);
  console.log(req.files.my_pet.name);
  console.log(req.files.my_cover_photo.name);
});
```

