require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(express.json());
app.use(cors());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);
app.use(express.static("dist"));

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.get("/info", (request, response) => {
  const currentTime = Date();
  response.send(
    `<p>Phonebook has info for ${Person.length} people<br>${currentTime}</p>`
  );
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((err) => next(err));
});

app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;

  Person.findByIdAndDelete(id)
    .then((result) => response.status(404).end())
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const { name, number } = request.body;

  if (!number || !name) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const person = new Person({
    name,
    number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((err) => console.log(err));
});

app.put("/api/persons/:id", (request, response, next) => {
  const updatedPerson = request.body;
  const id = request.params.id;
  // Person.findById(id).then((person) => {
  //   if (!person) {
  //     response.status(404).json({
  //       error: `${updatedPerson.name} was already removed from server`,
  //     });
  //   } else {
  //     Person.findByIdAndUpdate(id, updatedPerson, { new: true })
  //       .then((returnedPerson) => response.json(returnedPerson))
  //       .catch((err) => next(err));
  //   }
  // });
  Person.findByIdAndUpdate(id, updatedPerson, { new: true })
    .then((returnedPerson) => response.json(returnedPerson))
    .catch((err) => next(err));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running in port ${PORT} `);
});
