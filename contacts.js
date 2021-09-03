const express = require("express");
const morgan = require("morgan");
const { body, validationResult } = require("express-validator");
const app = express();

let contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

const sortContacts = contacts => {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
};

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("common"));

app.get('/', (req, res) => {
  res.redirect('/contacts');
});

app.get('/contacts', (req, res) => {
  res.render("contacts", {
    contacts: sortContacts(contactData)
  });
});

app.get('/contacts/new', (req, res) => {
  res.render("new");
});

const validateName = (name, whichName) => {
  return body(name)
    .trim()
    .isLength({min: 1})
    .withMessage(`${whichName} name is required.`)
    .bail()
    .isLength({max: 25})
    .withMessage(`${whichName} name must be 25 characters or less.`)
    .isAlpha()
    .withMessage(`${whichName} name must only contain alphabetic characters.`);
};

app.post('/contacts/new',
  [
    validateName("firstName", "First"),
    validateName("lastName", "Last"),

    body("phoneNumber")
      .trim()
      .isLength({min: 1})
      .withMessage("Phone number is required.")
      .bail()
      .matches(/\d{3}-\d{3}-\d{4}/)
      .withMessage("Phone numbers must be formatted as ###-###-####")
  ],
  (req, res, next) => {
    res.locals.errorMessages = [];
    next();
  },
  (req, res, next) => {
    for (let idx = 0; idx < contactData.length; idx++) {
      if (req.body.firstName === contactData[idx].firstName &&
          req.body.lastName === contactData[idx].lastName) {
        res.locals.errorMessages
          .push("That name already exists. Please choose another");
      }
    }
    next();
  },
  (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty() || res.locals.errorMessages.length > 0) {
      res.render("new", {
        errorMessages: errors.array().map(error => error.msg)
          .concat(res.locals.errorMessages),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber
      });
    } else {
      next();
    }
  },
  (req, res) => {
    contactData.push({ ...req.body });
    res.redirect('/contacts');
  });

app.listen(3000, () => {
  console.log("Listening on port 3000...");
});
