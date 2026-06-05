import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const publicDirectory = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public"
);

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const MASTER_EMAILS = (process.env.MASTER_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const allPermissions = {
  canAdd: true,
  canEdit: true,
  canDelete: true,
};

const noPermissions = {
  canAdd: false,
  canEdit: false,
  canDelete: false,
};

const isMasterEmail = (email = "") => MASTER_EMAILS.includes(email.toLowerCase());

const publicUserFields = "-password -__v";

const getCurrentUser = async (req) => {
  if (!req.user?.id) return null;
  return User.findById(req.user.id);
};

const requireApproved = async (req, res) => {
  const currentUser = await getCurrentUser(req);

  if (!currentUser) {
    res.status(401).json({ message: "User account not found" });
    return null;
  }

  if (!currentUser.isApproved) {
    res.status(403).json({ message: "Your account is pending master approval" });
    return null;
  }

  return currentUser;
};

const requireMaster = async (req, res) => {
  const currentUser = await requireApproved(req, res);

  if (!currentUser) return null;

  if (currentUser.role !== "master") {
    res.status(403).json({ message: "Master access is required" });
    return null;
  }

  return currentUser;
};

const requirePermission = async (req, res, permission) => {
  const currentUser = await requireApproved(req, res);

  if (!currentUser) return null;

  if (currentUser.role === "master") return currentUser;

  if (!currentUser.permissions?.[permission]) {
    res.status(403).json({ message: `You do not have ${permission} access` });
    return null;
  }

  return currentUser;
};

const getToken = (user) =>
  jwt.sign(
    {
      id: user._id,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

const formatUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isApproved: user.isApproved,
  permissions: user.permissions || noPermissions,
});

// GET all users
export const getUser = async (req, res) => {
  try {
    if (
      req.query.format !== "json" &&
      req.get("accept")?.includes("text/html")
    ) {
      return res.sendFile("users.html", { root: publicDirectory });
    }

    const currentUser = await requireApproved(req, res);
    if (!currentUser) return;

    const users = await User.find().select(publicUserFields).sort({ createdAt: -1 });

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
    const currentUser = await requirePermission(req, res, "canAdd");
    if (!currentUser) return;

    const { name, email, password } = req.body || {};

    if (!name) {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    const generatedEmail = `record-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}@local.invalid`;
    const hashedPassword = await bcrypt.hash(password || crypto.randomUUID(), 10);

    const user = await User.create({
      name,
      email: email || generatedEmail,
      password: hashedPassword,
      isApproved: true,
      role: "user",
      permissions: noPermissions,
    });

    res.status(201).json({
      message: "User created successfully",
      user: formatUser(user)
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
    const currentUser = await requirePermission(req, res, "canEdit");
    if (!currentUser) return;

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
      user: formatUser(user)
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
    const currentUser = await requirePermission(req, res, "canDelete");
    if (!currentUser) return;

    if (currentUser._id.toString() === req.params.id) {
      return res.status(400).json({
        message: "You cannot delete your own account"
      });
    }

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
    const currentUser = await requirePermission(req, res, "canAdd");
    if (!currentUser) return;

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
    const master = isMasterEmail(email);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: master ? "master" : "user",
      isApproved: master,
      permissions: master ? allPermissions : noPermissions,
    });

    // generate token
    const token = getToken(user);

    res.status(201).json({
      message: master
        ? "Master user registered successfully"
        : "User registered successfully. Waiting for master approval.",
      token,
      user: formatUser(user)
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

    if (isMasterEmail(user.email) && (user.role !== "master" || !user.isApproved)) {
      user.role = "master";
      user.isApproved = true;
      user.permissions = allPermissions;
      await user.save();
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        message: "Your account is pending master approval"
      });
    }

    // generate token
    const token = getToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: formatUser(user)
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const currentUser = await requireApproved(req, res);
    if (!currentUser) return;

    res.status(200).json(formatUser(currentUser));
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const updateUserAccess = async (req, res) => {
  try {
    const currentUser = await requireMaster(req, res);
    if (!currentUser) return;

    const { isApproved, permissions, role } = req.body || {};

    if (currentUser._id.toString() === req.params.id && role === "user") {
      return res.status(400).json({
        message: "You cannot remove your own master access"
      });
    }

    const updates = {};

    if (typeof isApproved === "boolean") {
      updates.isApproved = isApproved;
    }

    if (role === "master" || role === "user") {
      updates.role = role;
      if (role === "master") {
        updates.isApproved = true;
        updates.permissions = allPermissions;
      }
    }

    if (permissions && updates.role !== "master") {
      updates.permissions = {
        canAdd: Boolean(permissions.canAdd),
        canEdit: Boolean(permissions.canEdit),
        canDelete: Boolean(permissions.canDelete),
      };
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select(publicUserFields);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      message: "Access updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
