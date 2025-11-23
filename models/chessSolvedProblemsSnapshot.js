import { Schema, model } from 'mongoose';

const chessSolvedProblemsSnapshotSchema = new Schema({
	problemId: { type: Schema.Types.ObjectId, ref: 'ChessProblem', required: true },
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	solvedAt: { type: Date, default: Date.now },
	movesTaken: { type: [String], required: true },
	timeTakenSeconds: { type: Number, required: true },
}, { timestamps: true });

const ChessSolvedProblemsSnapshot = model('ChessSolvedProblemsSnapshot', chessSolvedProblemsSnapshotSchema);

export default ChessSolvedProblemsSnapshot;