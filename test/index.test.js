const createRequest = require('../index.js').createRequest
const axios = require("axios")
const MockAdapter = require("axios-mock-adapter")
jest.mock("@google-cloud/firestore")

describe('createRequest', () => {
  const jobId = "1"
  const apiToken = "abcdefghi"
  const vehicleId = "5"

  const baseUrl = "http://baseurl/"
  process.env.BASE_URL = baseUrl

  const axiosMock = new MockAdapter(axios)

  const input = {
    "id": jobId,
    "data": {
      "apiToken": apiToken,
      "vehicleId": vehicleId,
      "action": "vehicle_data" //, "vehicles", "wake_up", "vehicle_data", "unlock", "lock", "honk_horn",
    }
  }

  axiosMock.onPost(`${baseUrl}api/1/vehicles/${vehicleId}/wake_up`).reply(200)

  axiosMock.onGet(`${baseUrl}api/1/vehicles/${vehicleId}/vehicle_data`).reply(200, {
    response: {
      vehicle_state: {
        odometer: 1000
      },
      charge_state: {
        battery_level: 50
      },
      drive_state: {
        latitude: 123.001,
        longitude: 321.002
      }
    }
  })

  it('correctly formats vehicle data', () => {
    return createRequest(input, (statusCode, data) => {
      expect(statusCode).toEqual(200)

      const { jobRunID, data: vehicleData, result } = data

      expect(jobRunID).toEqual("1")
      expect(vehicleData).toEqual("{1000,50,321002000,123001000}")
      expect(result).toEqual(null)
    })
  })
    
})
