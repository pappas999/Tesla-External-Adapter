class Firestore {
    constructor() { }

    collection = () => ({
        doc: () => ({
            get: () => ({
                "exists": "true",
                "data": () => ({
                    "tokenToStore": "apikey123"
                })
            })
        })
    })
}

module.exports = Firestore