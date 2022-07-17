// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { NextApiRequestWithHeaders } from '../../types'
var cookie = require('cookie')
import { PrismaClient } from '@prisma/client'
var jwt = require('jsonwebtoken')

async function logout(req: NextApiRequestWithHeaders, res: NextApiResponse) {
    const prisma = new PrismaClient()

    const cookies = cookie.parse(req.headers.cookie || '')

    const refresh = cookies.refresh

    const decodedRefresh = jwt.decode(refresh)

    try {
        const deleteRes = await prisma.refresh.delete({
            where: { id: decodedRefresh.refreshId },
        })
        console.log({ deleteRes })
    } catch (error) {
        return res.status(500).json({
            message:
                "Something went wrong... Let's reload the page and try to log out again.",
        })
    }

    res.setHeader('Set-Cookie', [
        cookie.serialize('refresh', '', { httpOnly: true }),
        cookie.serialize('token', '', { httpOnly: true }),
    ])
    return res.status(200).json({ message: 'logout success' })
}

export default logout
