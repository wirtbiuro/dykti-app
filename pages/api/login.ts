// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
const bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
var cookie = require('cookie')

export type LoginData = {
    username: string
    password: string
}

export default async function login(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()

    const saltRounds = 10

    try {
        const { username, password } = req.body as LoginData

        const user = await prisma.user.findUnique({
            where: { username },
            include: { refreshes: true },
        })

        console.log({ user })

        const match = await bcrypt.compare(password, user?.password)

        if (!match) {
            return res.status(500).json('There is no user or password wrong')
        }

        const _user = await prisma.user.update({
            where: { username },
            data: {
                refreshes: { create: {} },
            },
            include: {
                refreshes: { where: {}, orderBy: { createdAt: 'desc' } },
                // Todos: {orderBy: [{priority: 'desc'}, {createdAt: 'asc'}]}
            },
        })

        console.log({ _user })

        if (_user.refreshes.length > 5) {
            console.log('too many refreshes')
            const length = _user.refreshes.length
            await prisma.refresh.delete({
                where: { id: _user.refreshes[length - 1].id },
            })
        }

        const token = jwt.sign({ userId: user?.id }, process.env.JWT_SECRET, {
            expiresIn: 10 * 60,
        })
        const refresh = jwt.sign(
            {
                session: _user?.refreshes[0].session,
                refreshId: _user?.refreshes[0].id,
            },
            process.env.REFRESH_SECRET,
            { expiresIn: '30d' }
        )
        console.log({ refresh })

        res.setHeader('Set-Cookie', [
            cookie.serialize('refresh', String(refresh), { httpOnly: true }),
            cookie.serialize('token', String(token), { httpOnly: true }),
        ])

        delete _user.password
        delete _user.refreshes
        res.status(200).json({ message: 'Successing login', user: _user })
    } catch (error) {
        console.log({ error })

        res.status(500).json({ message: 'Login error' })
    } finally {
        await prisma.$disconnect()
        console.log('finally prisma disconnect.')
    }
}
