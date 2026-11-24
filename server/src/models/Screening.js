import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  id: { type: String, required: true }, row: String, rowIndex: Number, number: Number,
  type: { type: String, enum: ['standard', 'premium', 'recliner'], required: true },
  accessible: { type: Boolean, default: false },
}, { _id: false });

const screeningSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
  auditoriumName: { type: String, required: true, trim: true, maxlength: 80 },
  startsAt: { type: Date, required: true, index: true },
  seatLayout: { type: [seatSchema], required: true },
  prices: {
    standard: { type: Number, required: true, min: 0 },
    premium: { type: Number, min: 0 },
    recliner: { type: Number, min: 0 },
  },
  status: { type: String, enum: ['scheduled', 'cancelled', 'completed'], default: 'scheduled', index: true },
}, { timestamps: true, toJSON: { virtuals: true, transform: (_doc, value) => { delete value._id; delete value.__v; return value; } } });

export const Screening = mongoose.model('Screening', screeningSchema);
