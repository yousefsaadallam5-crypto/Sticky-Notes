import { Router } from "express"
import * as NS from "./note.service.js"

const router = Router()

router.post("/", NS.createNote)
router.delete("/", NS.deleteAllNotes)
router.patch("/all", NS.updateAllTitles)
router.get("/paginate-sort", NS.paginateSort)
router.get("/note-by-content", NS.getNoteByContent)
router.get("/note-with-user", NS.getNotesWithUser)
router.get("/aggregate", NS.aggregateNotes)
router.put("/replace/:noteId", NS.replaceNote)

router.get("/:noteId", NS.getNoteById)
router.patch("/:noteId", NS.updateNote)
router.delete("/:noteId", NS.deleteNote)

export default router
