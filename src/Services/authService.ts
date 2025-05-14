import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import connection from "../connection";

interface LoginCredentials {
  email: string;
  password: string;
}

interface TokenPayload {
  userId: number;
  email: string;
}

export default class AuthService {
  private JWT_SECRET: Secret = process.env.JWT_SECRET || "chave-super-secreta";
  private JWT_EXPIRES_IN: SignOptions["expiresIn"] = "24h";

  generateToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.JWT_EXPIRES_IN,
    };
    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  // Verifica se o token é válido
  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;

    } catch (error) {
        
      throw new Error("Invalid Token or Expired.");
    }
  }

  // Autentica um usuário
  async login(credentials: LoginCredentials) {
    try {
      const user = await connection('users')
        .where({ email: credentials.email })
        .first();

      if (!user) {
        throw new Error("Invalid Credentials");
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password_hash
      );

      if (!isPasswordValid) {
        throw new Error("Invalid Credentials");
      }

      const token = this.generateToken({
        userId: user.id,
        email: user.email,
      });

      return {
        userId: user.id,
        name: user.nameUser,
        email: user.email,
        token,
      };
    } catch (error) {
      throw error;
    }
  }
}
