import users from "../data/users.js";

// GET all users
export const getUsers = (req, res) => {
  res.json(users);
};

// POST new user
export const createUser = (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name
  };

  users.push(newUser);

  res.status(201).json(newUser);
};