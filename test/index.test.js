const mockData = jest.fn().mockImplementation(() => {
  return {
    "tokenToStore": "apiKey123"
  }
})

const mockGet = jest.fn().mockImplementation(() => {
  return {
    "exists": "true",
    "data": mockData
  }
})

const mockSet = jest.fn()

const mockDoc = jest.fn().mockImplementation(() => {
  return {
    get: mockGet,
    set: mockSet
  }
})

const mockCollection = jest.fn().mockImplementation(() => {
  return {
    doc: mockDoc
  }
})

const createRequest = require('../index.js').createRequest
const axios = require("axios")
const MockAdapter = require("axios-mock-adapter")
const Firestore = require("@google-cloud/firestore")

jest.mock("@google-cloud/firestore", () => {
  return jest.fn().mockImplementation(() => {
    return {
      collection: mockCollection
    }
  })
})

beforeEach(() => {
  Firestore.mockClear();
  mockCollection.mockClear();
  mockDoc.mockClear();
  mockGet.mockClear();
  mockSet.mockClear();
  mockData.mockClear();
});

const jobId = "1"
const apiToken = "abcdefghi"
const vehicleId = "5"

const baseUrl = "http://baseurl/"
process.env.BASE_URL = baseUrl

const axiosMock = new MockAdapter(axios)

const mockVehicleData = {
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

axiosMock.onPost(`${baseUrl}api/1/vehicles/${vehicleId}/wake_up`).reply(200)

axiosMock.onGet(`${baseUrl}api/1/vehicles/${vehicleId}/vehicle_data`).reply(200, {
  response: mockVehicleData
})

axiosMock.onPost(`${baseUrl}api/1/vehicles/${vehicleId}/command/door_unlock`).reply(200)

axiosMock.onPost(`${baseUrl}api/1/vehicles/${vehicleId}/command/door_lock`).reply(200)

axiosMock.onPost(`${baseUrl}api/1/vehicles/${vehicleId}/command/honk_horn`).reply(200)


it('attempts to store apiToken in Firestore following successful authenticate request', () => {

  const input = {
    "id": jobId,
    "data": {
      "apiToken": apiToken,
      "vehicleId": vehicleId,
      "action": "authenticate",
      "address": "0x0000000000000000000000000000000000000123"
    }
  }

  return createRequest(input, (statusCode, data) => {
    expect(statusCode).toEqual(200)

    expect(mockSet).toHaveBeenCalledTimes(1)
    expect(mockGet).toHaveBeenCalledTimes(0)

    const { jobRunID, data: address, result } = data

    expect(jobRunID).toEqual("1")
    expect(address).toEqual("0x0000000000000000000000000000000000000123")
    expect(result).toEqual("0x0000000000000000000000000000000000000123")
  })
})

it('correctly formats vehicle data', () => {

  const input = {
    "id": jobId,
    "data": {
      "apiToken": apiToken,
      "vehicleId": vehicleId,
      "action": "vehicle_data",
    }
  }

  return createRequest(input, (statusCode, data) => {
    expect(statusCode).toEqual(200)

    const { jobRunID, data: vehicleData, result } = data

    expect(jobRunID).toEqual("1")
    expect(vehicleData).toEqual("{1000,50,321002000,123001000}")
    expect(result).toEqual(null)

    expect(mockGet).toHaveBeenCalledTimes(1)
    expect(mockSet).toHaveBeenCalledTimes(0)
  })
})

it('returns expected output when unlocking', () => {

  const input = {
    "id": jobId,
    "data": {
      "apiToken": apiToken,
      "vehicleId": vehicleId,
      "action": "unlock",
    }
  }

  return createRequest(input, (statusCode, data) => {
    expect(statusCode).toEqual(200)

    const { jobRunID, data: vehicleData, result } = data

    expect(jobRunID).toEqual("1")
    expect(vehicleData).toEqual("{1000,50,321002000,123001000}")
    expect(result).toEqual(null)

    expect(mockGet).toHaveBeenCalledTimes(1)
    expect(mockSet).toHaveBeenCalledTimes(0)
  })
})

it('returns expected output when locking', () => {

  const input = {
    "id": jobId,
    "data": {
      "apiToken": apiToken,
      "vehicleId": vehicleId,
      "action": "lock"
    }
  }

  return createRequest(input, (statusCode, data) => {
    expect(statusCode).toEqual(200)

    const { jobRunID, data: vehicleData, result } = data

    expect(jobRunID).toEqual("1")
    expect(vehicleData).toEqual("{1000,50,321002000,123001000}")
    expect(result).toEqual(null)

    expect(mockGet).toHaveBeenCalledTimes(1)
    expect(mockSet).toHaveBeenCalledTimes(0)
  })
})

it('returns expected output when honking horn', () => {

  const input = {
    "id": jobId,
    "data": {
      "apiToken": apiToken,
      "vehicleId": vehicleId,
      "action": "honk_horn"
    }
  }

  return createRequest(input, (statusCode, data) => {
    expect(statusCode).toEqual(200)

    const { jobRunID } = data

    expect(jobRunID).toEqual("1")

    expect(mockGet).toHaveBeenCalledTimes(1)
    expect(mockSet).toHaveBeenCalledTimes(0)

  })
})
