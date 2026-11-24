import mongoose from 'mongoose';

const bookedSeatSchema = new mongoose.Schema({ id: String, row: String, number: Number, type: String, price: Number }, { _id: false });
const bookingSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  screening: { type: mongoose.Schema.Types.ObjectId, ref: 'Screening', required: true, index: true },
  seatIds: { type: [String], required: true },
  seats: { type: [bookedSeatSchema], required: true },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed', index: true },
  cancelledAt: Date,
}, { timestamps: true, toJSON: { virtuals: true, transform: (_doc, value) => { delete value._id; delete value.__v; return value; } } });
bookingSchema.index({ screening: 1, seatIds: 1 }, { unique: true, partialFilterExpression: { status: 'confirmed' } });
export const Booking = mongoose.model('Booking', bookingSchema);
