
# Autodesk View and Data API NPM Package


## Description
The official NPM package for Autodesk View & Data API

## Setup

* npm install view-and-data
* Request your own API keys from our developer portal: [developer.autodesk.com](http://developer.autodesk.com)
* Replace the placeholders with your own keys in config-view-and-data.js or use ENV variables:<br />
  ```
  ConsumerKey: process.env.CONSUMERKEY || '<replace with your consumer key>',
  ConsumerSecret: process.env.CONSUMERSECRET || '<replace with your consumer secret>'
  ```
* When using the module in your project, copy the config-view-and-data.js in your server config directory and update
  the credentials as described previously.
  
## Test

Make sure to modify defaultBucketKey in config-view-and-data.js then run command:

  npm test

## Usage

Here is a simple example on how to use the library. It will retrieve or create the specified bucket
(you will need to modify that value in config-view-and-data.js or provide directly a unique bucket name).
Then it will upload the test.dwf file, monitor it's translation status and get the thumbnail of model if
the translation is successful.


      var config = require('your-server-config/config-view-and-data');
      var Lmv = require('view-and-data');

      var lmv = new Lmv(config);

      function onError(error) {
        console.log(error);
      }

      function onInitialized(response) {

        var createIfNotExists = true;

        var bucketCreationData = {
          bucketKey: config.defaultBucketKey,
          servicesAllowed: {},
          policy: "transient"
        };

        lmv.getBucket(config.defaultBucketKey,
          createIfNotExists,
          bucketCreationData).then(
            onBucketCreated,
            onError);
      }

      function onBucketCreated(response) {

        //see resumableUpload instead for large files

        lmv.upload(path.join(__dirname, './data/test.dwf'),
          config.defaultBucketKey,
          'test.dwf').then(onUploadCompleted, onError);
      }

      function onUploadCompleted(response) {

        var fileId = response.objects[0].id;

        urn = lmv.toBase64(fileId);

        lmv.register(urn, true).then(onRegister, onError);
      }

      function onRegister(response) {

        if (response.Result === "Success") {

          console.log('Translating file...');

          lmv.checkTranslationStatus(
            urn, 1000 * 60 * 5, 1000 * 10,
            progressCallback).then(
              onTranslationCompleted,
              onError);
        }
        else {
          console.log(response);
        }
      }

      function progressCallback(progress) {

        console.log(progress);
      }

      function onTranslationCompleted(response) {

        console.log('URN: ' + response.urn);

        lmv.getThumbnail(urn).then(onThumbnail, onError);
      }

      function onThumbnail(response) {

        //response: base64 encoded thumbnail data
        //ex: var imgsrc = "data:image/png;base64," + response;
        //<img src=imgsrc>
      }

      //start the test
      lmv.initialise().then(onInitialized, onError);

## License

[MIT License](http://opensource.org/licenses/MIT).

## Written by 

Written by [Philippe Leefsma](http://adndevblog.typepad.com/cloud_and_mobile/philippe-leefsma.html)
Autodesk Developer Network.

