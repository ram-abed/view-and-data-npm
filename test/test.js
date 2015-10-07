/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2015 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////
var should = require('chai').should(),
  Lmv = require('../view-and-data'),
  path = require('path');

//only fill up credentials & bucket fields, other fields are defaulted
var config = {

  defaultBucketKey: 'adn-bucket', //!Change that name to a unique one,
                                  // append ConsumerKey to it for example

  credentials: {
    ConsumerKey: process.env.CONSUMERKEY || '<replace with your consumer key>',
    ConsumerSecret: process.env.CONSUMERSECRET || '<replace with your consumer secret>'
  }
}

describe('# View & Data Tests: ', function() {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  it('Get token', function(done) {

    //set a 15'' timeout
    this.timeout(15 * 1000);

    var lmv = new Lmv(config);

    lmv.getToken().then(function(response) {

      console.log('Token Response:');
      console.log(response);

      done();

    }, function(error) {

      done(error);
    });

  });

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  it('Get bucket (create if does not exist)', function(done) {

    this.timeout(15 * 1000);

    var lmv = new Lmv(config);

    function onError(error) {
      done(error);
    }

    function onInitialized(response) {

      var createIfNotExists = true;

      var bucketCreationData = {
        bucketKey: config.defaultBucketKey,
        servicesAllowed: [],
        policy: "transient"
      };

      lmv.getBucket(config.defaultBucketKey,
        createIfNotExists,
        bucketCreationData).then(
        onBucketCreated,
        onError);
    }

    function onBucketCreated(response) {

      done();
    }

    lmv.initialise().then(onInitialized, onError);
  });

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  it('Full workflow (bucket/upload/registration/translation/thumbnail)', function(done) {

    this.timeout(5 * 60 * 1000); //5 mins timeout

    var urn = '';

    var lmv = new Lmv(config);

    function onError(error) {
      done(error);
    }

    function onInitialized(response) {

      var createIfNotExists = true;

      var bucketCreationData = {
        bucketKey: config.defaultBucketKey,
        servicesAllowed: [],
        policy: "transient"
      };

      lmv.getBucket(config.defaultBucketKey,
        createIfNotExists,
        bucketCreationData).then(
          onBucketCreated,
          onError);
    }

    function onBucketCreated(response) {

      lmv.upload(
        path.join(__dirname, './data/test.dwf'),
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
        done(response);
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

      done();
    }

    //start the test
    lmv.initialise().then(onInitialized, onError);
  });

});