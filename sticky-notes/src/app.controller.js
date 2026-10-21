import connectDB from "./DB/connection.js"
import userRouter from "./modules/users/user.controller.js"
import noteRouter from "./modules/notes/note.controller.js"

const bootstrap = async (app, express) =>{
  app.use(express.json())

  await connectDB()

  app.use("/users", userRouter)
  app.use("/notes", noteRouter)

  app.all("*", (req, res) => res.status(404).json({ message: "Route not found" }))

  app.use((err, req, res, next) =>{
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already exists." })
    }
    if (err.name === "ValidationError"){
      return res.status(400).json({ message: err.message })
    }
    if (err.name === "CastError"){
      return res.status(400).json({ message: "Invalid id" })
    }
    return res.status(err.status || 500).json({ message: err.message})
  })
}

export default bootstrap
