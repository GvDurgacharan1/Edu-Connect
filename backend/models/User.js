import BaseModel from './BaseModel.js';
import bcrypt from 'bcryptjs';

const userPrototype = {
  async matchPassword(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  }
};

const User = new BaseModel('users', userPrototype);
export default User;
