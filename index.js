const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(express.json());
app.use(cors());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);
app.use(express.static("dist"));

let entries = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// app.get("/", (request, response) => {
//   response.send("<h1>Your Phone Book</h1>");
// });

app.get("/info", (request, response) => {
  const currentTime = Date();
  response.send(
    `<p>Phonebook has info for ${entries.length} people<br>${currentTime}</p>`
  );
});

app.get("/api/persons", (request, response) => {
  response.json(entries);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = entries.find((person) => person.id === id);
  if (!person) response.status(404).end();
  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = entries.find((person) => person.id === id);

  if (!person) response.status(404).end();

  entries = entries.filter((person) => person.id !== id);
  response.status(204).end();
});

const generateId = () => {
  return Math.floor(Math.random() * 95 + 6);
};

app.post("/api/persons", (request, response) => {
  const { name, number } = request.body;

  if (!number || !name) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const personExists = entries.find((person) => person.name === name);

  if (personExists) {
    return response.status(400).json({
      error: "name already exists",
    });
  }

  const person = {
    name,
    number,
    id: generateId(),
  };

  entries = entries.concat(person);
  response.json(person);
});

app.put("/api/persons/:id", (request, response) => {
  const updatedPerson = request.body;
  const id = Number(request.params.id);
  const filterPerson = entries.filter((p) => p.id !== id);
  entries = [...filterPerson, updatedPerson];
  response.json(updatedPerson);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running in port ${PORT} `);
});
