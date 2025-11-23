import { Schema, model } from 'mongoose';

const chessProblemSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	fen: { type: String, required: true },
	solutionMoves: { type: [String], required: true },
	difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
	level: { type: Number, required: true },
	isPayable: { type: Boolean, default: false },
}, { timestamps: true	 });

const ChessProblem = model('ChessProblem', chessProblemSchema);

export default ChessProblem;