import User from "../models/User.js";

// GET all users
export const getUser = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// POST create new user
export const createUser = async (req, res) => {
  try {
    const { name } = req.body || {};

    if (!name) {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    const user = await User.create({ name });

    res.status(201).json({
      message: "User created successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// PUT update user
export const updateUser = async (req, res) => {
  try {
    const { name } = req.body || {};

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      message: "User updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const createManyUsers = async (req, res) => {
  try {
    const users = await User.insertMany(req.body);

    res.status(201).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};