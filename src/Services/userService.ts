import { Request, Response } from "express"
import router from "../router"
import connection from "../connection"

interface UserData{
    nameUser: string,
    email: string,
    password_hash: string,
    role: number
}

export default class UserService {
    async createUser(userData: UserData){
        return await connection('users').insert(userData)
    }

    async getUserById(userId: number){
        return await connection('users').where({ id: userId }).select('*').first()
    }

    async getAllUsers(){
        return await connection('users').select('*')
    }

    async deleteUser(userId: number){
        return await connection('users').where({ id: userId }).delete()
    }
}