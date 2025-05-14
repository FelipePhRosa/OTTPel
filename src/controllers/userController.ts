import { Request, Response } from "express";
import connection from "../connection";
import UserService from "../Services/userService";
import bcrypt from "bcryptjs";

export default class UserController{
    constructor(private userService = new UserService()){}

    async createUser(req: Request, res: Response) {
        try{
            const { nameUser, email, password_hash, role } = req.body

            const hashedPassword = await bcrypt.hash(password_hash, 10);
            if (!nameUser || !email || !password_hash) {
                res.status(400).json( `Please complete all required fields.` )
                return;
            }

            const userAlreadyExists = await connection('users').where({ email }).first()

            if (userAlreadyExists) {
                res.status(409).json({ message: `Email already register another account.` });
                return;
            };

            const user = await this.userService.createUser({
                nameUser,
                email,
                password_hash: hashedPassword,
                role: role ?? 5
            })
            res.status(201).json({ message: `User: ${nameUser}, registered successfully`});
            return;

        } catch(error){
            res.status(500).json({ 
                message: `Error to insert new User.`,
                details: error });
            return;
        }
    }

    async listAllUsers(req: Request, res: Response) {
        try {
            const users = await this.userService.getAllUsers()
            res.status(200).json({ 
                message: `/// List for All Users - OTTPel |||`, 
                data: users });
            return;
        } catch(error) {
            res.status(500).json({ 
                message:`Internal Server Error.`, 
                details: error });
            return;
        }
    }

    async listUserById (req: Request, res: Response) {
        const { userId } = req.body
        try {
            const user = await this.userService.getUserById(userId)
            if (!user){
                res.status(404).json({ message: `User Not Found.`})
            }
            res.status(200).json({ 
                message: `// ${user.name} - Informations. `,
                userInf: user });
            return;
        } catch(error) {
            res.status(500).json({ 
                message: `Error to Search User.`,
                details: error });
            return;
        }
    }

    async deleteUser(req: Request, res: Response) {
        const { userId } = req.body

        if (isNaN(userId)) {
            res.status(400).json({ error: "userId must be a valid number." });
            return;
        }
        try {
            const user = await this.userService.getUserById(userId)

            await this.userService.deleteUser(userId)
            res.status(200).json({ 
                message: `${user.nome} was deleted successfully!`,
                deleteuser: user });
            return;
        } catch(error) {
            res.status(500).json({ 
                message: `Error to delete user.`,
                details: error});
            return;
        }
    }
}