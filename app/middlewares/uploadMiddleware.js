// 
import multer from "multer";

// =========================================
// Memory Storage
// =========================================
const storage = multer.memoryStorage();


// =========================================
// IMAGE FILE FILTER
// =========================================
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      ),
      false
    );
  }
};


// =========================================
// EXCEL FILE FILTER
// =========================================
const excelFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only Excel files (.xlsx and .xls) are allowed."
      ),
      false
    );
  }
};


// =========================================
// IMAGE UPLOAD
// =========================================
const upload = multer({
  storage,

  fileFilter: imageFileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});


// =========================================
// EXCEL UPLOAD
// =========================================
const excelUpload = multer({
  storage,

  fileFilter: excelFileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});


// =========================================
// EXPORT
// =========================================
export {
  upload,
  excelUpload,
};

export default upload;