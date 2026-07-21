const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const NOTES_FILE = path.join(__dirname, "data", "notes.json");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// =======================
// GET ALL NOTES
// =======================
app.get("/api/notes", (req, res) => {
    const notesData = fs.readFileSync(NOTES_FILE, "utf8");
    const notes = JSON.parse(notesData);

    res.json(notes);
});

// =======================
// ADD NEW NOTE
// =======================
app.post("/api/notes", (req, res) => {

    const newNote = {
        id: Date.now(),
        pinned: req.body.pinned || false,
        category: req.body.category || "General",
        priority: req.body.priority || "Medium",
        color: req.body.color || "#ffffff",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...req.body
    };

    if (
        !newNote.title ||
        !newNote.content ||
        newNote.title.trim() === "" ||
        newNote.content.trim() === ""
    ) {
        return res.status(400).json({
            message: "Title and content cannot be empty."
        });
    }

    const validPriorities = ["Low", "Medium", "High"];

    if (!validPriorities.includes(newNote.priority)) {
        return res.status(400).json({
            message: "Priority must be Low, Medium or High."
        });
    }

    const notesData = fs.readFileSync(NOTES_FILE, "utf8");
    const notes = JSON.parse(notesData);

    notes.push(newNote);

    fs.writeFileSync(
        NOTES_FILE,
        JSON.stringify(notes, null, 4)
    );

    res.status(201).json({
        message: "Note added successfully!",
        note: newNote
    });

});

// =======================
// EDIT NOTE
// =======================
app.put("/api/notes/:id", (req, res) => {

    const noteId = Number(req.params.id);

    const {
        title,
        content,
        category,
        priority,
        pinned,
        color
    } = req.body;

    const notesData = fs.readFileSync(NOTES_FILE, "utf8");
    const notes = JSON.parse(notesData);

    const noteIndex = notes.findIndex(note => note.id === noteId);

    if (noteIndex === -1) {
        return res.status(404).json({
            message: "Note not found"
        });
    }

    if (title !== undefined && title.trim() === "") {
        return res.status(400).json({
            message: "Title cannot be empty."
        });
    }

    if (content !== undefined && content.trim() === "") {
        return res.status(400).json({
            message: "Content cannot be empty."
        });
    }

    if (
        priority !== undefined &&
        !["Low", "Medium", "High"].includes(priority)
    ) {
        return res.status(400).json({
            message: "Priority must be Low, Medium or High."
        });
    }

    notes[noteIndex].title = title || notes[noteIndex].title;
    notes[noteIndex].content = content || notes[noteIndex].content;
    notes[noteIndex].category = category || notes[noteIndex].category;
    notes[noteIndex].priority = priority || notes[noteIndex].priority;
    notes[noteIndex].pinned = pinned ?? notes[noteIndex].pinned;
    notes[noteIndex].color = color || notes[noteIndex].color;

    notes[noteIndex].updatedAt = new Date().toISOString();

    fs.writeFileSync(
        NOTES_FILE,
        JSON.stringify(notes, null, 4)
    );

    res.status(200).json({
        message: "Note updated successfully",
        note: notes[noteIndex]
    });

}); 

// =======================
// DELETE NOTE
// =======================
app.delete("/api/notes/:id", (req, res) => {

    const noteId = Number(req.params.id);

    const notesData = fs.readFileSync(NOTES_FILE, "utf8");
    const notes = JSON.parse(notesData);

    const noteIndex = notes.findIndex(note => note.id === noteId);

    if (noteIndex === -1) {
        return res.status(404).json({
            message: "Note not found"
        });
    }

    const deletedNote = notes.splice(noteIndex, 1);

    fs.writeFileSync(
        NOTES_FILE,
        JSON.stringify(notes, null, 4)
    );

    res.status(200).json({
        message: "Note deleted successfully",
        note: deletedNote[0]
    });

});

// =======================
// EXPORT NOTES AS TXT
// =======================
app.get("/api/notes/export/txt", (req, res) => {

    const notesData = fs.readFileSync(NOTES_FILE, "utf8");
    const notes = JSON.parse(notesData);

    let text = "========== QUICK NOTES APP ==========\n\n";

    notes.forEach((note, index) => {
        text += `Note ${index + 1}\n`;
        text += `ID: ${note.id}\n`;
        text += `Title: ${note.title}\n`;
        text += `Content: ${note.content}\n`;
        text += `Category: ${note.category}\n`;
        text += `Priority: ${note.priority}\n`;
        text += `Pinned: ${note.pinned}\n`;
        text += `Color: ${note.color}\n`;
        text += `Created At: ${note.createdAt}\n`;
        text += `Updated At: ${note.updatedAt}\n`;
        text += "------------------------------------------\n\n";
    });

    res.setHeader("Content-Type", "text/plain");

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=notes.txt"
    );

    res.send(text);

});

// =======================
// EXPORT NOTES AS PDF
// =======================
app.get("/api/notes/export/pdf", (req, res) => {

    const notesData = fs.readFileSync(NOTES_FILE, "utf8");
    const notes = JSON.parse(notesData);

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        "attachment; filename=notes.pdf"
    );

    doc.pipe(res);

    doc
        .fontSize(20)
        .text("Quick Notes App", {
            align: "center"
        });

    doc.moveDown();

    notes.forEach((note, index) => {

        doc
            .fontSize(16)
            .text(`Note ${index + 1}`);

        doc.fontSize(12).text(`ID: ${note.id}`);
        doc.text(`Title: ${note.title}`);
        doc.text(`Content: ${note.content}`);
        doc.text(`Category: ${note.category}`);
        doc.text(`Priority: ${note.priority}`);
        doc.text(`Pinned: ${note.pinned}`);
        doc.text(`Color: ${note.color}`);
        doc.text(`Created At: ${note.createdAt}`);
        doc.text(`Updated At: ${note.updatedAt}`);

        doc.moveDown();
        doc.text("---------------------------------------------");
        doc.moveDown();

    });

    doc.end();

});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});