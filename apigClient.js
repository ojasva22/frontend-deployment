/*
 * Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

var apigClientFactory = {};
apigClientFactory.newClient = function (config) {


 AWS.config.update({
  accessKeyId: '',
  secretAccessKey: '',
  region: 'us-east-1' // Example: 'us-east-1'
});

    var apigClient = { };
    if(config === undefined) {
        config = {
            accessKey: '',
            secretKey: '',
            sessionToken: '',
            region: '',
            apiKey: undefined,
            defaultContentType: 'application/json',
            defaultAcceptType: 'application/json'
        };
    }
    if(config.accessKey === undefined) {
        config.accessKey = '';
    }
    if(config.secretKey === undefined) {
        config.secretKey = '';
    }
    if(config.apiKey === undefined) {
        config.apiKey = '';
    }
    if(config.sessionToken === undefined) {
        config.sessionToken = '';
    }
    if(config.region === undefined) {
        config.region = 'us-east-1';
    }
    //If defaultContentType is not defined then default to application/json
    if(config.defaultContentType === undefined) {
        config.defaultContentType = 'application/json';
    }
    //If defaultAcceptType is not defined then default to application/json
    if(config.defaultAcceptType === undefined) {
        config.defaultAcceptType = 'application/json';
    }

    
    // extract endpoint and path from url
    var invokeUrl = 'https://jghjxsn6sd.execute-api.us-east-1.amazonaws.com/dev';
    var endpoint = /(^https?:\/\/[^\/]+)/g.exec(invokeUrl)[1];
    var pathComponent = invokeUrl.substring(endpoint.length);

    var sigV4ClientConfig = {
        accessKey: config.accessKey,
        secretKey: config.secretKey,
        sessionToken: config.sessionToken,
        serviceName: 'execute-api',
        region: config.region,
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var authType = 'NONE';
    if (sigV4ClientConfig.accessKey !== undefined && sigV4ClientConfig.accessKey !== '' && sigV4ClientConfig.secretKey !== undefined && sigV4ClientConfig.secretKey !== '') {
        authType = 'AWS_IAM';
    }

    var simpleHttpClientConfig = {
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var apiGatewayClient = apiGateway.core.apiGatewayClientFactory.newClient(simpleHttpClientConfig, sigV4ClientConfig);
    
    
    
    apigClient.photosObjectKeyPut = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['object-key'], ['body']);

        return s3Upload(params['object-key'], body, additionalParams)
        
        // var photosObjectKeyPutRequest = {
        //     verb: 'put'.toUpperCase(),
        //     path: pathComponent + uritemplate('/photos/{object-key}').expand(apiGateway.core.utils.parseParametersToObject(params, ['object-key', ])),
        //     headers: apiGateway.core.utils.parseParametersToObject(params, ['x-amz-meta-customLabels']),
        //     queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
        //     body: body
        // };
        
        
        // return apiGatewayClient.makeRequest(photosObjectKeyPutRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.photosObjectKeyOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var photosObjectKeyOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/photos/{object-key}').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(photosObjectKeyOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.searchGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['q'], ['body']);
        
        var searchGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/search').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['q']),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(searchGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.searchOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var searchOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/search').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(searchOptionsRequest, authType, additionalParams, config.apiKey);
    };
    

    return apigClient;
};

const s3Upload = async (objectKey, file, additionalParams) => {
  console.log("S3 Data", objectKey, file);
  const s3 = new AWS.S3();

  try {
    const params = {
      Bucket: 'photos-bucket-cloud',
      Key: objectKey,
      Body: file,
      ContentType: file.type, // Set the content type of the file
      Metadata: {
        customLabels: additionalParams.headers['x-amz-meta-customLabels'] || '' // Example metadata
      }
    };

    // Upload the file to S3 and return a Promise
    const data = await s3.upload(params).promise();
    console.log('File uploaded successfully:', data);

    // Return 200 response
    return {
      status: 200,
      body: JSON.stringify({ message: 'File uploaded successfully', data })
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      status: 500,
      body: JSON.stringify({ message: 'Error uploading file', error: error.message })
    };
  }
};
