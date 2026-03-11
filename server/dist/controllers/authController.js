"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const JWT_EXPIRES = "7d";
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ message: "Name, email and password are required" });
            return;
        }
        const existing = await User_1.User.findOne({ email });
        if (existing) {
            res.status(400).json({ message: "Email already registered" });
            return;
        }
        const user = await User_1.User.create({ name, email, password });
        const token = jsonwebtoken_1.default.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    }
    catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
        const user = await User_1.User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.login = login;
const me = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user?.id).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json({ user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (err) {
        console.error("Me error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.me = me;
