const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
});

const Todo = new Schema({
    title: { type: String },
    done: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true } // Correct ObjectId reference
});

const UserModel = mongoose.model('users', User);
const TodosModel = mongoose.model('todos', Todo);

module.exports = {
    UserModel,
    TodosModel
};

