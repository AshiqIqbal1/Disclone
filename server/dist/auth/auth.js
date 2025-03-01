import User from "../models/user.js";
import bcrypt from "bcrypt";
export async function createUser(userData) {
    const { email, password } = userData;
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
        const newUser = new User ({
            email,
            password: await bcrypt.hash(password, 10)
        });
        const savedUser = await newUser.save();
        return savedUser;
    }
    else {
        throw new Error(`Email address has been used.`);
    }
}
//# sourceMappingURL=auth.js.map