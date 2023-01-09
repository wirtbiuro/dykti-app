// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { NextApiRequestWithHeaders } from '../../types'

export type CreateWorkerData = {
    username: string
    role: string[]
}

export default async function createuser(req: NextApiRequestWithHeaders, res: NextApiResponse) {
    const prisma = new PrismaClient()

    try {
        const { username, role } = req.body as CreateWorkerData

        const user = await prisma.user.update({
            where: { username },
            data: {
                role,
            },
        })

        console.log({ user })

        res.status(200).json({ message: 'Updating user success', user })
    } catch (error) {
        console.log({ error })

        res.status(500).json({ message: 'Updating user error' })
    } finally {
        await prisma.$disconnect()
        console.log('finally prisma disconnect.')
    }
}
