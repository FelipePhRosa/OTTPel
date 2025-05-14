import { Request, Response } from "express";
import AuthService from "../Services/authService";

export default class AuthController {
  constructor(private authService = new AuthService()) {}

  async login(req: Request, res: Response) {
    console.log("Login Request Body:", req.body);
    const { email, password } = req.body;

    try {
      const token = await this.authService.login({ email, password });
        res.status(200).json({ token });
    } catch (error) {
      console.error(error);
        res.status(401).json({ error: "Invalid credentials" });
    }
  }
}
