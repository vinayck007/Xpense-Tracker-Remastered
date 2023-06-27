const mongoose = require('mongoose');

const downloadedFileSchema = new mongoose.Schema({
  user_id: Number,
  file_name: String,
  date_downloaded: Date,
});

module.exports = mongoose.model('DownloadedFile', downloadedFileSchema);
