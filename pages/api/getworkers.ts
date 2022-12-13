// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { withJwt } from '../../utilities'
import { StepType, IWorker } from '../../types'
import { DateTime } from 'luxon'

async function getworkers(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()

    const {
        // userId,
    } = req.body

    try {
        // const busySteps = await prisma.step.findMany({
        //     where: {
        //         // workStepWorkStartDate: { lte: new Date(endDate) },
        //         workStepWorkEndDate: { gte: new Date() },
        //         orderId: { not: { equals: null } },
        //     },
        //     select: { id: true, orderId: true },
        // })

        // console.log({ busySteps })

        // const ids = busySteps.map((step: StepType) => step.id)
        // console.log({ ids })

        const workers = await prisma.worker.findMany({
            include: {
                steps: {
                    where: {
                        workStepWorkEndDate: { gte: new Date() },
                        workStepWorkStartDate: { not: { equals: null } },
                        currentOrder: { isNot: null },
                    },
                    select: {
                        currentOrder: {
                            include: {
                                currentStep: true,
                            },
                        },
                    },
                },
            },
        })

        // const _workers = workers.filter((worker: IWorker) =>{
        //     return worker.steps.filter(step => )
        // })

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
