import DBLocal from 'db-local'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from './config.js'

const { Schema } = new DBLocal({ path: './db' })

const User = Schema('User', {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})

export class UserRepository {
  static create ({ username, password }) {
    // 1. validacion de username y password (opcional usar zod)
    Validation.username(username)
    Validation.password(username)

    if (typeof password !== 'string') throw new Error('password must be a string')
    if (password.length < 5) throw new Error('password must be at least 6 characters long')

    // 2. Asegurarse que username no existe

    const user = User.findOne({ username })
    if (user) throw new Error('username alredy exists')

    // 3. Hash password
    // SALTROUNDS numero de vueltas normalmente 10
    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS)

    // 4. Crear una id
    const id = crypto.randomUUID()

    // 5. Creamos usuario
    User.create({
      _id: id,
      username,
      password: hashedPassword
    }).save()

    return id
  }

  static login ({ username, password }) {
    Validation.username(username)
    Validation.password(username)

    // Buscamos el usuario
    const user = User.findOne({ username })
    if (!user) throw new Error('username does not exists')

    // Comprobar si es valido
    const isValid = bcrypt.compareSync(password, user.password)
    if (!isValid) throw new Error('password is invalid')

    // NO enviar datos sensibles del usuario (eliminar el password)
    const { password: _, ...publicUser } = user
    // Alternativa crear un nuevo objeto
    return publicUser
  }
}

class Validation {
  static username (username) {
    console.log(username)
    console.log(typeof username)
    // 1. validacion de username y password (opcional usar zod)
    if (typeof username !== 'string') throw new Error('username must be a string')
    if (username.length < 3) throw new Error('username must be at least 3 characters long')
  }

  static password (password) {
    if (typeof password !== 'string') throw new Error('password must be a string')
    if (password.length < 5) throw new Error('password must be at least 6 characters long')
  }
}
