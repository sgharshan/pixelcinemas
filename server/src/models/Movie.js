import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120, index: true },
    synopsis: { type: String, required: true, trim: true, maxlength: 1200 },
    genre: [{ type: String, required: true, trim: true, maxlength: 40 }],
    durationMinutes: { type: Number, required: true, min: 1, max: 600 },
    ageRating: {
      type: String,
      enum: ['U', 'PG', '12A', '12', '15', '18'],
      required: true,
    },
    posterUrl: { type: String, required: true, trim: true },
    backdropUrl: { type: String, required: true, trim: true },
    trailerUrl: { type: String, trim: true, default: '' },
    releaseDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['coming-soon', 'now-showing', 'archived'],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_document, value) => {
        delete value._id;
        delete value.__v;
        return value;
      },
    },
  },
);

movieSchema.index({ title: 'text', synopsis: 'text' });

export const Movie = mongoose.model('Movie', movieSchema);
