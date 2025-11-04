const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sensorData: {
    bpm: { type: Number, required: true },
    spo2: { type: Number, required: true },
    gsr: { type: Number, required: true },
    suhu: { type: Number, required: true }
  },
  manualData: {
    sistol: { type: Number, required: true },
    diastol: { type: Number, required: true }
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    altitude: { type: Number, default: null },
    satellites: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    source: {
      type: String,
      enum: ['esp32', 'browser', 'manual'],
      default: 'esp32'
    }
  },
  diagnosis: {
    status: {
      type: String,
      enum: ['normal', 'perhatian', 'bahaya'],
      required: true
    },
    analisis: { type: String, required: true },
    indikatorKurang: [{ type: String }],
    penyakitMungkin: [{ type: String }],
    saran: [{ type: String }],
    // PASTIKAN INI ADA!
    referensiJurnal: [{
      judul: { type: String },
      penulis: { type: String },
      tahun: { type: String },
      kesimpulan: { type: String },
      link: { type: String }
    }],
    rawResponse: { type: String, default: null }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HealthData', healthDataSchema);