// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { withJwt, getWhereStrategyBySteps } from '../../utilities'
import { Role } from '../../types'
// import { IgetUserAxiosRes } from '../../types'

async function getorders(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()

    try {
        const orders = await prisma.order.findMany({
            where: {
                steps: {
                    some: {
                        contractCheckerStepIsProceedToNext: true,
                    },
                },
            },
            // include: {
            //     steps: {
            //         take: 1,
            //     },
            // },
        })

        console.log({ orders })

        return res.status(200).json([...orders])
    } catch (error) {
        console.log({ error })

        res.status(500).json({ message: 'Getting orders error' })
    } finally {
        await prisma.$disconnect()
        console.log('finally prisma disconnect.')
    }
}

export default getorders
