import users from "../data/users.js";

// GET all users
export const getUsers = (req, res) => {
  res.json(users);
};



export const createUser = (req, res) => {
  const { name } = req.body;

  const newUser = {
    id: users.length + 1,
    name
  };

  users.push(newUser);

  res.status(201).json(newUser);
};

export const deleteUser = (req, res) => {
  const id = Number(req.params.id);

  const index = users.findIndex(user => user.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const deletedUser = users.splice(index, 1);

  res.json({
    message: "User deleted",
    user: deletedUser[0]
  });
};



export const updateUser = (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;

  const user = users.find(user => user.id === id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = name || user.name;

  res.json({
    message: "User updated",
    user
  });
};