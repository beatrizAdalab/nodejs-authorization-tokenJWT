import express from 'express'
import { UserRepository } from './user-repository.js'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'

import { PORT, SECRET_JWT_KEY } from './config.js'

const app = express()

/* express.json() es un MIDDELWARE
1. Parses JSON: Convierte el cuerpo de la solicitud (request body) en un objeto JavaScript
si la solicitud tiene un cuerpo JSON.

2. Pone el resultado en req.body, lo que permite acceder fácilmente a los datos del cuerpo de la solicitud
en los controladores de rutas. */
app.use(express.json())
// Para gestionar las cookies que recibimos por HTTP
app.use(cookieParser())

app.set('view engine', 'ejs')

app.use((req, res, next) => {
  // chequeamos si existe token en la peticion como cookie
  const token = req.cookies.access_token
  req.session = { user: null }

  try {
    // comprobamos si el token es valido
    const data = jwt.verify(token, SECRET_JWT_KEY)
    // anadimos la informacion de la cookie del usuario en session.user
    req.session.user = data
  } catch (error) {}
  next() // sigue a la siguiente ruta o middelware
})

app.get('/', (req, res) => {
  const { user } = req.session
  console.log(user, 'user')
  res.render('index', user)
})

app.post('/login', (req, res) => {
  const { username, password } = req.body
  try {
    const user = UserRepository.login({ username, password })
    const token = jwt.sign({ id: user._id, username: user.username }, SECRET_JWT_KEY, {
      expiresIn: '1h'
    })
    res.cookie('access_token', token, {
      httpOnly: true, // la cookie solo se puede leer desde el servidor
      secure: process.env.NODE_ENV === 'production', // accesible en https
      sameSite: 'strict', // solo accesible desde el mismo dominio
      maxAge: 1000 * 60 * 60 // validez de 1hora

    })
    res.send({ user })
  } catch (error) {
    res.status(401).send(error.message)
  }
})
app.post('/register', (req, res) => {
  const { username, password } = req.body
  console.log(req.body)

  try {
    const id = UserRepository.create({ username, password })
    res.send({ id })
  } catch (error) {
    res.status(400).send(error.message)
  }
})
app.post('/logout', (req, res) => {
  res.clearCookie('access_token')
    .json({ message: 'logout successful' })
})

app.get('/protected', (req, res) => {
  const { user } = req.session

  if (!user) {
    return res.status(403).send('Access not authorized')
  }
  res.render('protected', user)
})

app.listen(PORT, () => {
  console.log(`Server runing on port ${PORT}`)
})
