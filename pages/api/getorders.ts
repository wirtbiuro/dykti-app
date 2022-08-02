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
        FormCreator: isCompleted
            ? {
                  some: {
                      formStepIsProceedToNext: true,
                  },
              }
            : {
                  none: {
                      formStepIsProceedToNext: undefined,
                  },
              },
        BefaringUser: isCompleted
            ? {
                  some: {
                      formStepIsProceedToNext: true,
                      beffaringStepIsProceedToNext: true,
                  },
              }
            : {
                  some: {
                      formStepIsProceedToNext: true,
                  },
                  none: {
                      formStepIsProceedToNext: true,
                      beffaringStepIsProceedToNext: true,
                  },
              },
        OfferCreator: isCompleted
            ? {
                  some: {
                      offerStepIsProceedToNext: true,
                  },
              }
            : {
                  some: {
                      beffaringStepIsProceedToNext: true,
                  },
                  none: {
                      beffaringStepIsProceedToNext: true,
                      offerStepIsProceedToNext: true,
                  },
              },
        ContractCreator: isCompleted
            ? {
                  some: {
                      contractStepIsProceedToNext: true,
                  },
              }
            : {
                  some: {
                      offerStepIsProceedToNext: true,
                  },
                  none: {
                      offerStepIsProceedToNext: true,
                      contractStepIsProceedToNext: true,
                  },
              },
    }

    try {
        const orders = await prisma.order.findMany({
            where: {
                steps: whereStrategy[role],
            },
            include: {
                steps: true,
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
