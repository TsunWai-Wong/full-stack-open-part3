// Database Configuration

const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

mongoose
    .connect(url)
    .then(result => console.log('connected to MongoDB'))
    .catch(error => console.log(error.message))

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3
    },
    number: {
        type: String,
        minLength: 8,
        validate: function(value){
            return /\b(\d{2}|\d{3})-\d+/.test(value)
        }
    } 
})

personSchema.set('toJSON', {
    transform: (document, returnObject) => {
        returnObject.id = returnObject._id.toString()
        delete returnObject._id
        delete returnObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)