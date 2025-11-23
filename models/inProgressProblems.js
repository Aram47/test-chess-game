import { Schema, model } from 'mongoose';

const inProgressProblemSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	problemId: { type: Schema.Types.ObjectId, ref: 'ChessProblem', required: true },
	currentFen: { type: String, required: true },
	movesMade: { type: [String], default: [] },
	isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

const InProgressProblem = model('InProgressProblem', inProgressProblemSchema);

export default InProgressProblem;