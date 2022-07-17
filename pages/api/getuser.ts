// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { withJwt } from '../../utilities'
// import { IgetUserAxiosRes } from '../../types'

async function getuser(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()

    const { userId } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        delete user?.password

        if (user) {
            const _user = user

            return res.status(200).json(_user)
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
