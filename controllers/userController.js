import users from "../data/users.js";

export const getUsers = (req, res) => {
  res.json(users);
};