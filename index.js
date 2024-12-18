const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

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
    response.json(data)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const result = data.find(person => person.id === id)

    if (result) {
        response.json(result)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    data = data.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    if (!request.body.name || !request.body.number) {
        response.status(400).json({
            error: 'content missing'
        })
    }

    else if (data.find(person => person.name === request.body.name)) {
        response.status(400).json({
            error: 'name must be unique'
        })
    }

    else {
        const newPerson = request.body
        
        data = data.concat(newPerson)
        response.json(newPerson)
    }
})

app.put('/api/persons/:id', (request, response) => {
    if (!request.body.name || !request.body.number) {
        response.status(400).json({
            error: 'content missing'
        })
    }
    else {
        const id = request.params.id
        const newPerson = request.body

        data = data.map(person => (person.id === id ? {...person, ...newPerson} : person ))
        response.json(newPerson)
    }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})