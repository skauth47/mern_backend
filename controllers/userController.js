import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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





// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check empty fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // generate token
    const token = jwt.sign(
      {
        id: user._id
      },
      "mysecretkey",
      {
        expiresIn: "7d"
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // generate token
    const token = jwt.sign(
      {
        id: user._id
      },
      "mysecretkey",
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};