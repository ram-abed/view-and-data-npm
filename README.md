
# Autodesk View and Data API NPM Package


## Description
The official NPM package for [Autodesk View & Data API](https://developer.autodesk.com/api/view-and-data-api/)

## Setup

* As usual:<br>
  ```
  npm install view-and-data
  ```
  <br>
  <br>
* Request your own API keys from our developer portal: [developer.autodesk.com](http://developer.autodesk.com)
* Replace the placeholders with your own keys in config-view-and-data.js or use ENV variables:<br />
  ```
  ConsumerKey: process.env.CONSUMERKEY || '<replace with your consumer key>',

  ConsumerSecret: process.env.CONSUMERSECRET || '<replace with your consumer secret>'
  ```
* When using the module in your project, copy the config-view-and-data.js in your server config directory and update
  the credentials as described previously.

## Test

Make sure to modify __defaultBucketKey__ in config-view-and-data.js then run command:

    npm test

## Usage

Here is a simple example on how to use the library. It will retrieve or create the specified bucket
(you will need to modify that value in config-view-and-data.js or provide directly a unique bucket name).
Then it will upload the test.dwf file, monitor it's translation status and get the thumbnail of model if
the translation is successful.


      //Make sure config-view-and-data.js is copied at indicated location
      //in your server and that you filed up the API credentials as indicated above

      var config = require('your-server-config/config-view-and-data');
      var Lmv = require('view-and-data');

      var lmv = new Lmv(config);

      //you probably want a more specific error handler...
      function onError(error) {
        console.log(error);
      }

      //wrapper is initialized. Token refreshment will happen automatically
      //no need to worry about it
      function onInitialized(response) {

        var createIfNotExists = true;

        var bucketCreationData = {
          bucketKey: config.defaultBucketKey,
          servicesAllowed: {},
          policy: 'transient' //['temporary', 'transient', 'persistent']
        };

        lmv.getBucket(config.defaultBucketKey,
          createIfNotExists,
          bucketCreationData).then(
            onBucketCreated,
            onError);
      }

      //bucket retrieved or created successfully
      function onBucketCreated(response) {

        //see resumableUpload instead for large files

        lmv.upload(path.join(__dirname, './data/test.dwf'),
          config.defaultBucketKey,
          'test.dwf').then(onUploadCompleted, onError);
      }

      //upload complete
      function onUploadCompleted(response) {

        var fileId = response.objects[0].id;

        urn = lmv.toBase64(fileId);

        lmv.register(urn, true).then(onRegister, onError);
      }

      //registration complete but may have failed
      //need to check result
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

      //optional translation progress callback
      //may be used to display progress to user
      function progressCallback(progress) {

        console.log(progress);
      }

      //file ready for viewing
      function onTranslationCompleted(response) {

        console.log('URN: ' + response.urn);

        lmv.getThumbnail(urn).then(onThumbnail, onError);
      }

      //thumbnail retrieved successfully
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

[Cyrille Fauvel](http://around-the-corner.typepad.com/adn/cyrille-fauvel.html)

[Philippe Leefsma](http://adndevblog.typepad.com/cloud_and_mobile/philippe-leefsma.html)

Autodesk Developer Network.

