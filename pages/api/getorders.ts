// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { withJwt } from '../../utilities'
import { Role } from '../../types'
// import { IgetUserAxiosRes } from '../../types'

async function getorders(req: NextApiRequest, res: NextApiResponse) {
    const { completed } = req.query
    const isCompleted = completed === 'true' ? true : false

    const prisma = new PrismaClient()

    const { userId } = req.body

    const user = await prisma.user.findUnique({
        where: { id: userId },
    })

    console.log({ user })

    const role = user!.role as Role

    const whereStrategy: Record<Role, any> = {
        FormCreator: {
            isFormStepCompleted: isCompleted,
        },
        BefaringUser: {
            isFormStepCompleted: true,
            isBefaringStepCompleted: isCompleted,
        },
    }

    try {
        const orders = await prisma.order.findMany({
            where: whereStrategy[role],
            include: {
                steps: {
                    include: {
                        formStep: {
                            include: {
                                record: true,
                            },
                        },
                        befaringStep: {
                            include: {
                                record: true,
                            },
                        },
                    },
                },
            },
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

export default withJwt(getorders)
// export default getorders
