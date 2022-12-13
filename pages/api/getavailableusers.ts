// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { withJwt } from '../../utilities'
import { StepType } from '../../types'
import { DateTime } from 'luxon'

async function getworkers(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()

    const {
        // userId,
        startDate,
        endDate,
    } = req.body

    try {
        const busySteps = await prisma.step.findMany({
            where: {
                workStepWorkStartDate: { lte: new Date(endDate) },
                workStepWorkEndDate: { gte: new Date(startDate) },
                orderId: { not: { equals: null } },
            },
            select: { id: true, orderId: true },
        })

        console.log({ busySteps })

        const ids = busySteps.map((step: StepType) => step.id)
        console.log({ ids })

        const workers = await prisma.worker.findMany({
            where: {
                steps: {
                    every: {
                        id: {
                            notIn: ids,
                        },
                    },
                },
            },
            include: {
                steps: {
                    select: {
                        orderId: true,
                    },
                },
            },
        })

        console.log({ workers })

        return res.status(200).json({ workers })
    } catch (error) {
        console.log({ error })

        res.status(500).json({ message: 'Getting workers error' })
    } finally {
        await prisma.$disconnect()
        console.log('finally prisma disconnect.')
    }
}

// export default withJwt(getworkers)
export default getworkers
