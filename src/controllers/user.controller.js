import User from "../models/User.model.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const signup= AsyncHandler(async (req, res) => {
    const {fullName, email, password, role} = req.body;
    if(
        [fullName, email, password].some((field) =>
            field?.trim() === ""
    )) {
        throw new ApiError("All fields are required", 400);
    }
    if (password.length < 6) {
        throw new ApiError("Password must be at least 6 characters long", 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError("Invalid email format", 400);
    }

    const existingUser = await User.findOne ({ email });
    if (existingUser) {
        throw new ApiError("User already exists with this email", 400);
    }

    const user =await User.create({
        fullName,
        email,
        password,
        role,
    })

    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
    );
    res.cookie("jwt", token, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true, //prevents xss attacks
                sameSite: "strict", //prevents csrf attacks
                secure: process.env.NODE_ENV === "production", //ensures cookie is sent over HTTPS in production
            })

    res.status(201).json(new ApiResponse(true, "User created successfully"));
})

const login = AsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError("Email and password are required", 400);
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError("Invalid email or password", 401);
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError("Invalid email or password", 401);
    }
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
    );

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, //prevents xss attacks
        sameSite: "strict", //prevents csrf attacks
        secure: process.env.NODE_ENV === "production", //ensures cookie is sent over HTTPS in production
    });

    res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.fullName,
      email: user.email,
      role: user.role,
    },
    });
});

const logout = AsyncHandler(async (req, res) => {
    res.clearCookie("jwt");
    res.status(200).json(new ApiResponse(true, "Logout successful"));
});

export { signup, login, logout };