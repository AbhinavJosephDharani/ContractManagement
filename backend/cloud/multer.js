const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloud");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "service_request_photos",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) => Date.now() + "-" + file.originalname.replace(/\s+/g, '_'),
  },
});


const upload = multer({ storage });

module.exports = upload;
