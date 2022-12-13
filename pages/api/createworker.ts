// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { NextApiRequestWithHeaders } from '../../types'

export type CreateWorkerData = {
    username: String
    name: String
}

export default async function createuser(req: NextApiRequestWithHeaders, res: NextApiResponse) {
    const prisma = new PrismaClient()

    try {
        const { username, name } = req.body as CreateWorkerData

        const worker = await prisma.worker.create({
            data: {
                username,
                name,
            },
        })

        console.log({ worker })

        res.status(200).json({ message: 'Creating worker success', worker })
    } catch (error) {
        console.log({ error })

        res.status(500).json({ message: 'Creating user error' })
    } finally {
        await prisma.$disconnect()
        console.log('finally prisma disconnect.')
    }
}
