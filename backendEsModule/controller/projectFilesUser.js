import multer from "multer";
import fs from "fs";
import pool from "../models/db.js";
import cloudinary from "../cloudinary/setupfile.js";

const upload = multer({ dest: "uploads/" });

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const uploadFileToProject = async (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const project_id = req.params.project_id;
      const sender_id = req.token?.userId;

      if (!project_id)
        return res.status(400).json({ error: "Missing project_id" });
      if (!sender_id) return res.status(401).json({ error: "Unauthorized" });
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const filePath = req.file.path;
      const fileName = req.file.originalname;

      console.log("Uploading file to Cloudinary...");
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto",
        folder: "project_files",
      });

      console.log("Cloudinary upload response:", result);

      const fileUrl = result.secure_url;
      const fileSizeBytes = result.bytes;
      const fileSizeFormatted = formatFileSize(fileSizeBytes);
      const publicId = result.public_id;

      console.log("Inserting file info into DB...");
      await pool.query(
        `INSERT INTO project_files (project_id, sender_id, file_name, file_url, file_size, public_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [project_id, sender_id, fileName, fileUrl, fileSizeBytes, publicId]
      );

      console.log("Removing temp file...");
      fs.unlinkSync(filePath);

      res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        file_url: fileUrl,
        file_size_bytes: fileSizeBytes,
        file_size: fileSizeFormatted,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });
};

export const downloadFileFromProject = async (req, res) => {
  const { file_id } = req.params;

  try {
    const fileRecord = await pool.query(
      `SELECT file_url FROM project_files WHERE id = $1`,
      [file_id]
    );

    if (fileRecord.rows.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const { file_url } = fileRecord.rows[0];
    res.redirect(file_url);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteFileFromProject = async (req, res) => {
  const { file_id } = req.params;

  try {
    const fileRecord = await pool.query(
      `SELECT public_id FROM project_files WHERE id = $1`,
      [file_id]
    );

    if (fileRecord.rows.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const { public_id } = fileRecord.rows[0];

    console.log("Deleting file from Cloudinary...");
    await cloudinary.uploader.destroy(public_id, { resource_type: "auto" });

    console.log("Deleting file record from database...");
    await pool.query(`DELETE FROM project_files WHERE id = $1`, [file_id]);

    res
      .status(200)
      .json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: error.message });
  }
};
export const deleteAllFilesFromProject = async (project_id) => {
  try {
    const files = await pool.query(
      `SELECT public_id FROM project_files WHERE project_id = $1`,
      [project_id]
    );

    for (const file of files.rows) {
      await cloudinary.uploader.destroy(file.public_id, {
        resource_type: "auto",
      });
    }

    await pool.query(`DELETE FROM project_files WHERE project_id = $1`, [
      project_id,
    ]);

    console.log("All project files deleted successfully.");
  } catch (error) {
    console.error("Error deleting project files:", error);
  }
};
