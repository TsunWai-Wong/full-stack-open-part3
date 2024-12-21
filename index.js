const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./Person')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

// Define a Custom Token
morgan.token('response-body', (req, res) => {
    return res.locals.body || '' // Log response body if available
});

app.use((req, res, next) => {
    // Save Original res.json Method
    const originalJson = res.json
    // Override res.json
    res.json = function (body) {
        // Store the Response Body
        res.locals.body = JSON.stringify(body)
        // Call the original `res.json`
        return originalJson.call(this, body) 
    };
    // Continue to the Next Middleware
    next();
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :response-body'))


let data = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
    response.send(`<div>
        <p>Phonebook has info for ${data.length} people</p>
        <p>${new Date()}</p>
    </div>`)
})

app.get('/api/persons', (request, response) => {
    Person.find({})
        .then(people => {
            response.json(people)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id

    Person.findById(id)
        .then(result => {
            response.json(result)
        })
        .catch(error => next(error))
    }   
)

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    console.log(`id is ${id}`)

    Person.findByIdAndDelete(id)
        .then(     
            result => 
                {
                    console.log('delete')
                    response.status(204).end()}   
        )
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    if (!request.body.name || !request.body.number) {
        response.status(400).json({
            error: 'content missing'
        })
    }

    else {
        person = new Person({
            name: request.body.name,
            number: request.body.number
        })
        
        person.save()
        .then(savedPerson => {
            console.log(savedPerson)
            response.json(savedPerson)
        })
        .catch(error => next(error)
        )
    }
    }
)

app.put('/api/persons/:id', (request, response, next) => {
    if (!request.body.name || !request.body.number) {
        response.status(400).json({
            error: 'content missing'
        })
    }
    else {
        const id = request.params.id

        const newPerson = {
            name: request.body.name,
            number: request.body.number
        }
        
        Person.findByIdAndUpdate(id, newPerson)
            .then(updatedPerson => {
                response.json(updatedPerson)
            })
            .catch(error => next(error))
    }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    console.error('error handler is reached')

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }
    else if (error.name === 'ValidationError'){
        return response.status(400).send({error: error.message})
    }

    next(error)
}

app.use(errorHandler)