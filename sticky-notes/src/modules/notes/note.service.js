import mongoose from "mongoose"
import Note from "../../DB/models/note.model.js"

const uid = (req) => req.query.id

const getOwnedNote = async (req, res) =>{
  const note = await Note.findById(req.params.noteId)
  if (!note) {
    res.status(404).json({ message: "Note not found"})
    return null
  }
  if (note.userId.toString() !== String(uid(req))) {
    res.status(403).json({ message: "You are not the owner" })
    return null
  }
  return note
}

// 1.POST/notes
export const createNote = async (req, res, next) =>{
  try {
    const { title, content } = req.body
    await Note.create({ title, content, userId: uid(req) })
    return res.status(201).json({ message: "Note created" })
  } catch (error) {
    next(error)
  }
}

// 2.PATCH/notes
export const updateNote = async (req, res, next) =>{
  try {
    const note = await getOwnedNote(req, res)
    if (!note) return

    const { title, content} = req.body
    if (title !== undefined) note.title = title
    if (content !== undefined) note.content = content
    await note.save()

    return res.status(200).json({ message: "updated", note })
  } catch (error) {
    next(error)
  }
}

// 3.PUT/notes/replace
export const replaceNote = async (req, res, next) =>{
  try {
    const note = await getOwnedNote(req, res)
    if (!note) return

    const { title, content, userId} = req.body
    const replaced = await Note.findOneAndReplace(
      {_id: note._id },
      {title, content, userId, createdAt: note.createdAt },
      {new: true, runValidators: true }
    )

    return res.status(200).json(replaced)
  } catch (error) {
    next(error)
  }
}

// 4.PATCH /notes
export const updateAllTitles = async (req, res, next) =>{
  try {
    const { title } = req.body
    const result = await Note.updateMany(
      { userId: uid(req) },
      { $set: { title } },
      { runValidators: true }
    )

    if (result.matchedCount === 0) return res.status(404).json({ message: "No note found"})
    return res.status(200).json({ message: "All notes updated"})
  } catch (error) {
    next(error)
  }
}

// 5.DELETE/notes
export const deleteNote = async (req, res, next) =>{
  try {
    const note = await getOwnedNote(req, res)
    if (!note) return

    await note.deleteOne()
    return res.status(200).json({ message: "deleted", note })
  } catch (error) {
    next(error)
  }
}

// 6.GET/notes
export const paginateSort = async (req, res, next) =>{
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.max(parseInt(req.query.limit) || 10, 1)

    const notes = await Note.find({ userId: uid(req)})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return res.status(200).json(notes)
  } catch (error) {
    next(error)
  }
}

// 7.GET/notes
export const getNoteById = async (req, res, next) =>{
  try {
    const note = await getOwnedNote(req, res)
    if (!note) return
    return res.status(200).json(note)
  } catch (error) {
    next(error)
  }
}

// 8.GET/notes/note-by-content?content
export const getNoteByContent = async (req, res, next) =>{
  try {
    const note = await Note.findOne({ userId: uid(req), content: req.query.content })
    if (!note) return res.status(404).json({ message: "No note found" })
    return res.status(200).json(note)
  } catch (error) {
    next(error)
  }
}

// 9. GET/notes/note-with-user
export const getNotesWithUser = async (req, res, next) =>{
  try {
    const notes = await Note.find({ userId: uid(req)})
      .select("title userId createdAt")
      .populate("userId", "email -_id")

    return res.status(200).json(notes)
  } catch (error) {
    next(error)
  }
}

// 10.GET/notes/aggregate
export const aggregateNotes = async (req, res, next) =>{
  try {
    if (!mongoose.isValidObjectId(uid(req))) {
      return res.status(400).json({ message: "Invalid id"})
    }

    const match = { userId: new mongoose.Types.ObjectId(uid(req)) }
    if (req.query.title) {
      match.title = {$regex: req.query.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" }
    }

    const notes = await Note.aggregate([
      { $match: match},
      { $lookup: {from: "users", localField: "userId", foreignField: "_id", as: "user"}},
      { $unwind: "$user"},
      {
        $project: {
          _id: 0,
          title: 1,
          userId: 1,
          createdAt: 1,
          "user.name": 1,
          "user.email": 1,
        },
      },
    ])

    return res.status(200).json(notes)
  } catch (error) {
    next(error)
  }
}

// 11.DELETE/notes
export const deleteAllNotes = async (req, res, next) =>{
  try {
    await Note.deleteMany({ userId: uid(req) })
    return res.status(200).json({ message: "Deleted"})
  } catch (error) {
    next(error)
  }
}
