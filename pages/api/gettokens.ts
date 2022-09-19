// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
var jwt = require('jsonwebtoken')
var cookie = require('cookie')
const { v4: uuidv4 } = require('uuid')
import { NextApiRequestWithHeaders } from '../../types'

export default async function gettokens(req: NextApiRequestWithHeaders, res: NextApiResponse) {
    const prisma = new PrismaClient()

    const saltRounds = 10

    const cookies = cookie.parse(req.headers.cookie || '')
    console.log('get tokens')
    console.log('cookies', req.headers.cookie)
    const token = cookies.token
    const refresh = cookies.refresh

    try {
        let decodedToken = jwt.decode(token)
        let decodedRefresh
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        } catch (error) {
            const _error = error as {
                name: string
                message: string
            }
            console.log({ _error })
            console.log(_error.message)
            console.log(_error.name)
            if (_error.name !== 'TokenExpiredError') {
                console.log('Not a TokenExpiredError')
                res.setHeader('Set-Cookie', [
                    cookie.serialize('refresh', '', { httpOnly: true }),
                    cookie.serialize('token', '', { httpOnly: true }),
                ])
                return res.status(401).json({ message: 'No access' })
            }
        }

        console.log('next')
        try {
            decodedRefresh = jwt.decode(refresh)
            console.log({ decodedRefresh })
            console.log(refresh, process.env.REFRESH_SECRET)
            decodedRefresh = jwt.verify(refresh, process.env.REFRESH_SECRET)
            console.log({ decodedRefresh })
        } catch (error) {
            const _error = error as {
                name: string
                message: string
            }

            console.log({ _error })
            if (_error.name === 'TokenExpiredError') {
                try {
                    await prisma.refresh.delete({
                        where: { id: decodedRefresh.refreshId },
                    })
                } catch (error) {
                    res.setHeader('Set-Cookie', [
                        cookie.serialize('refresh', '', { httpOnly: true }),
                        cookie.serialize('token', '', { httpOnly: true }),
                    ])
                    return res.status(401).json({ message: 'No access' })
                }
            }
            res.setHeader('Set-Cookie', [
                cookie.serialize('refresh', '', { httpOnly: true }),
                cookie.serialize('token', '', { httpOnly: true }),
            ])
            return res.status(401).json({ message: 'No access' })
        }

        let _refresh
        try {
            _refresh = await prisma.refresh.update({
                where: {
                    session: decodedRefresh.session,
                },
                data: {
                    session: uuidv4(),
                    updatedAt: new Date(),
                },
            })
        } catch (error) {
            console.log({ error })
            res.setHeader('Set-Cookie', [
                cookie.serialize('refresh', '', { httpOnly: true }),
                cookie.serialize('token', '', { httpOnly: true }),
            ])
            return res.status(401).json({ message: 'No access' })
        }

        console.log({ _refresh })

        if (!_refresh || !decodedToken.userId || decodedToken.userId !== _refresh.userId) {
            await prisma.refresh.delete({
                where: { id: decodedRefresh.refreshId },
            })
            res.setHeader('Set-Cookie', [
                cookie.serialize('refresh', '', { httpOnly: true }),
                cookie.serialize('token', '', { httpOnly: true }),
            ])
            return res.status(401).json({ message: 'No access' })
        }

        const _token = jwt.sign(
            { userId: _refresh.userId },
            process.env.JWT_SECRET,
            { expiresIn: 10 * 60 }
            // { expiresIn: 5 }
        )
        const __refresh = jwt.sign(
            { session: _refresh.session, refreshId: _refresh.id },
            process.env.REFRESH_SECRET,
            { expiresIn: '30d' }
            // { expiresIn: 15 }
        )

        res.setHeader('Set-Cookie', [
            cookie.serialize('refresh', String(__refresh), { httpOnly: true }),
            cookie.serialize('token', String(_token), { httpOnly: true }),
        ])

        res.status(200).json({ message: 'Get tokens success' })
    } catch (error) {
        console.log({ error })

        res.setHeader('Set-Cookie', [
            cookie.serialize('refresh', '', { httpOnly: true }),
            cookie.serialize('token', '', { httpOnly: true }),
        ])
        res.status(500).json({ message: 'Get tokens error' })
    } finally {
        await prisma.$disconnect()
        console.log('finally prisma disconnect.')
    }
}
