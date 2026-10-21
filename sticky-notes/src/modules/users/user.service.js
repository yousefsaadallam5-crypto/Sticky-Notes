import bcrypt from "bcryptjs"
import CryptoJS from "crypto-js"
import User from "../../DB/models/user.model.js"

const SECRET = process.env.PHONE_SECRET || "phone-secret-key"

const encryptPhone =(phone) => CryptoJS.AES.encrypt(String(phone), SECRET).toString()

// POST/users/signup
export const signup = async (req, res, next) =>{
  try {
    const { name, email, password, phone, age } = req.body

    const exists = await User.findOne({ email: email?.toLowerCase()})
    if (exists) return res.status(409).json({ message: "Email already exists."})

    if (!password || !phone) {
      return res.status(400).json({ message: "Password and phone are required" })
    }

    await User.create({
      name,
      email,
      age,
      password: bcrypt.hashSync(password, 10),
      phone: encryptPhone(phone),
    })

    return res.status(201).json({ message: "User added successfully."})
  } catch (error) {
    next(error)
  }
}

// POST/users/login
export const login = async (req, res, next) =>{
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email: email?.toLowerCase() })
    if (!user || !password || !bcrypt.compareSync(password, user.password)){
      return res.status(401).json({ message: "Invalid email or password" })
    }

    return res.status(200).json({ message: "Login successful", userId: user._id})
  } catch (error) {
    next(error)
  }
}

// PATCH/users/:id
export const updateUser = async (req, res, next) =>{
  try {
    const id = req.params.id || req.query.id
    const { name, email, phone, age } = req.body

    const user = await User.findById(id)
    if (!user) return res.status(404).json({ message: "User not found" })

    if (email && email.toLowerCase() !== user.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase(), _id: {$ne: id}})
      if (emailTaken) return res.status(409).json({ message: "Email already exists."})
      user.email = email
    }

    if (name !== undefined) user.name = name
    if (age !== undefined) user.age = age
    if (phone !== undefined) user.phone = encryptPhone(phone)

    await user.save()
    return res.status(200).json({ message: "User updated" })
  } catch (error) {
    next(error)
  }
}

// DELETE/users
export const deleteUser = async (req, res, next) =>{
  try {
    const user = await User.findByIdAndDelete(req.query.id)
    if (!user) return res.status(404).json({ message: "User not found" })
    return res.status(200).json({ message: "User deleted" })
  } catch (error) {
    next(error)
  }
}

// GET/users
export const getUser = async (req, res, next) =>{
  try {
    const user = await User.findById(req.query.id)
    if (!user) return res.status(404).json({ message: "User not found" })
    return res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}
