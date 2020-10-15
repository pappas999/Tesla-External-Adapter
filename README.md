# Tesla Chainlink External Adapter

This external adapter allows interaction with the Tesla, Inc Servers, which are used to interact with Tesla Vehicles and other Tesla products such as Powerwalls. It can also be used to interact with [mock servers](https://github.com/mseminatore/teslamock) for testing purposes

See [Tesla API](https://www.teslaapi.io/) for a community built Tesla API specification, including how to obtain a valid authentication token, as well as a valid vehicle ID.

This adapter was built as part of the [Link My Ride](https://github.com/pappas999/Link-My-Ride) submission to the Chainlink 2020 Virtual Hackathon, and currently supports the following API calls:
- Vehicle Authentication
- Vehicle Unlock
- Vehicle Lock
- Vehicle Honk Horn
- Vehicle obtain odometer, charge level & location data


## Prerequisites and installation

This implementation stores users' Tesla API tokens in a [Google Firestore](https://cloud.google.com/firestore) database. This is because it needs to support multiple vehicles.

[Guide for setting up Firestore in Google Cloud](https://firebase.google.com/docs/firestore/quickstart)

If only 1 vehicle is to be used, you can modify the adapter to store it in an environment variable

Here are the required environment variables for this external adapter:

## Environment variables

| Variable      |               | Description | Example |
|---------------|:-------------:|------------- |:---------:|
| `FIRESTORE_PROJECT_ID`     | **Required**  | The Project ID that contains your Google Cloud Firestore serverless DB | `tesla-firestore-db` |
| `FIRESTORE_COLLECTION_NAME`  | **Required**  | The collection name of your Google Cloud Firestore serverless DB | `telsa-api-tokens` |
| `BASE_URL`  | **Optional**  | The URL of the Tesla API. If left null will default to the Tesla Production Servers | `https://owner-api.teslamotors.com/` |

See [Install Locally](#install-locally) for a quickstart

## Input Params

The structure for the JSON input is as follows. In this example jobSpec is 534ea675a9524e8e834585b00368b178. Actions may be any of the following:
- authenticate
- wake_up
- vehicle_data
- unlock
- lock
- honk_horn

```json
{ 
    "id": "534ea675a9524e8e834585b00368b178",
    "data": { 
    	"apiToken": "abcdefghi",
    	"vehicleId": "23423423423423423423",
        "action": "authenticate",
        "address": "0x0000000000000000000000000000000000000000" // (only required for 'authenticate' action) The address corresponding to the vehicle to be verified
    }
}
```

## Output
If the action was unlock or lock, the data output json contains the following values:
- (odometer, chargeLevel, longitude to 6dp, latitude to 6dp)

If the action was authenticate, the result output responds with the wallet address representing the vehicle that was just authenticated
```json
{
    "jobRunID": 0,
    "data": "{50000,55,-35008518,138575206}",
    "result": "0x0000000000000000000000000000000000000000",
    "statusCode": 200
}
```

## Live Demo
We have a version of the adapter currently running on Google Cloud at the following location. It is currently pointing to a mock Tesla server

[https://australia-southeast1-link-my-ride.cloudfunctions.net/Tesla-External-Adapter](https://australia-southeast1-link-my-ride.cloudfunctions.net/Tesla-External-Adapter)


## Install Locally

Install dependencies:

```bash
npm install
```

### Test

To run the Jest unit tests (which mock Axios and Firestore):

```bash
npm test
```

Natively run the application (defaults to port 8080):

### Run

```bash
npm start
```

## Call the external adapter/API server

```bash
curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 534ea675a9524e8e834585b00368b178, "data": { "apiToken": "abcdefghi", "vehicleId": "23423423423423423423", "action": "authenticate" } }'
```
## Docker

If you wish to use Docker to run the adapter, you can build the image by running the following command:

```bash
docker build . -t tesla-external-adapter
```

Then run it with:

```bash
docker run -p 8080:8080 -it tesla-external-adapter:latest
```

## Serverless hosts

After [installing locally](#install-locally):

### Create the zip

```bash
zip -r tesla-external-adapter.zip .
```

### Install to AWS Lambda

- In Lambda Functions, create function
- On the Create function page:
  - Give the function a name
  - Use Node.js 12.x for the runtime
  - Choose an existing role or create a new one
  - Click Create Function
- Under Function code, select "Upload a .zip file" from the Code entry type drop-down
- Click Upload and select the `tesla-external-adapter.zip` file
- Handler:
    - index.handler for REST API Gateways
    - index.handlerv2 for HTTP API Gateways
- Add all environment variables mentioned further above
- Save

#### To Set Up an API Gateway (HTTP API)

If using a HTTP API Gateway, Lambda's built-in Test will fail, but you will be able to externally call the function successfully.

- Click Add Trigger
- Select API Gateway in Trigger configuration
- Under API, click Create an API
- Choose HTTP API
- Select the security for the API
- Click Add

#### To Set Up an API Gateway (REST API)

If using a REST API Gateway, you will need to disable the Lambda proxy integration for Lambda-based adapter to function.

- Click Add Trigger
- Select API Gateway in Trigger configuration
- Under API, click Create an API
- Choose REST API
- Select the security for the API
- Click Add
- Click the API Gateway trigger
- Click the name of the trigger (this is a link, a new window opens)
- Click Integration Request
- Uncheck Use Lamba Proxy integration
- Click OK on the two dialogs
- Return to your function
- Remove the API Gateway and Save
- Click Add Trigger and use the same API Gateway
- Select the deployment stage and security
- Click Add

### Install to GCP

- In Functions, create a new function, choose to ZIP upload
- Click Browse and select the `tesla-external-adapter.zip` file
- Select a Storage Bucket to keep the zip in
- Function to execute: gcpservice
- Click More, Add variable. Add all environment variables mentioned further above

  
  ## Support

Got questions or feedback? [harry@genesisblockchain.com.au](mailto:harry@genesisblockchain.com.au)

## License

MIT
