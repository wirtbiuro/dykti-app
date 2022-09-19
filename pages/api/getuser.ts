// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, User } from '@prisma/client'
import { withJwt } from '../../utilities'
// import { IgetUserAxiosRes } from '../../types'

async function getuser(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()

    const { userId } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        const _user = { ...user } as any

        delete _user?.password

        if (_user) {
            const __user = _user

            return res.status(200).json(__user)
        }
    } catch (error) {
        console.log({ error })

        res.status(500).json({ message: 'Getting user error' })
    } finally {
        await prisma.$disconnect()
        console.log('finally prisma disconnect.')
    }
}

export default withJwt(getuser)
