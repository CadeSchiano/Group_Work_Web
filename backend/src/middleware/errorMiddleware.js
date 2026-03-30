import multer from "multer";

export const errorHandler = (error, _req, res, _next) => {
  console.error(error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Files must be 10 MB or smaller." });
    }

    return res.status(400).json({
      message: "Unsupported file type. Upload a document, spreadsheet, presentation, image, text file, or zip archive.",
    });
  }

  return res.status(500).json({
    message: "Something went wrong. Please try again later.",
  });
};
