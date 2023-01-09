// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Refresh, User } from '@prisma/client'
const bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
var cookie = require('cookie')
// import initMiddleware from '../../init-middleware'
import { NextApiRequestWithHeaders } from '../../types'
// var Cors = require('cors')

export type CreateUserData = {
    username: String
    password: String
}

// const cors = initMiddleware(
//     // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
//     Cors({
//         // Only allow requests with GET, POST and OPTIONS
//         methods: ['GET', 'POST'],
//         credentials: true,
//     })
// )

export default async function createuser(req: NextApiRequestWithHeaders, res: NextApiResponse) {
    // await cors(req, res)

    const prisma = new PrismaClient()

    const saltRounds = 10

    try {
        const { username, password } = req.body as CreateUserData

        console.log('req.body', req.body)
        const cookies = cookie.parse(req.headers.cookie || '')
        console.log({ cookies })

        let hashedPassword
        try {
            hashedPassword = await bcrypt.hash(password, saltRounds)
        } catch (error) {
            console.log(error)
            return res.status(500).json("Password hasn't been hashed.")
        }
        const user = await prisma.user.create({
            data: {
                username: username.trim(),
                name: username.trim(),
                password: hashedPassword,
                refreshes: {
                    create: {},
                },
            },
            include: {
                refreshes: true,
            },
        })

        console.log({ user })
        console.log('REFRESH_SECRET', process.env.REFRESH_SECRET)

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: 10 * 60,
        })
        const refresh = jwt.sign(
            {
                session: user.refreshes[0].session,
                refreshId: user.refreshes[0].id,
            },
            process.env.REFRESH_SECRET,
            { expiresIn: '30d' }
        )
        console.log({ refresh })

        console.log(cookie.serialize('refresh', String(refresh), { httpOnly: true }))

        res.setHeader('Set-Cookie', [
            cookie.serialize('refresh', String(refresh), { httpOnly: true }),
            cookie.serialize('token', String(token), { httpOnly: true }),
        ])

        const _user = { ...user } as any
        delete _user.password
        delete _user.refreshes
        res.status(200).json({ message: 'Creating user success', user: _user })
    } catch (error) {
        console.log({ error })

        res.status(500).json({ message: 'Creating user error' })
    } finally {
        await prisma.$disconnect()
        console.log('finally prisma disconnect.')
    }
}
