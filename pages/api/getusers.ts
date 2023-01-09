// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { withJwt } from '../../utilities'
import { StepType, IWorker } from '../../types'
import { DateTime } from 'luxon'

async function getusers(req: NextApiRequest, res: NextApiResponse) {
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

        const users = await prisma.user.findMany({})

        // const _workers = workers.filter((worker: IWorker) =>{
        //     return worker.steps.filter(step => )
        // })

        return res.status(200).json({ users })
    } catch (error) {
        console.log({ error })

        res.status(500).json({ message: 'Getting users error' })
    } finally {
        await prisma.$disconnect()
        console.log('finally prisma disconnect.')
    }
}

// export default withJwt(getworkers)
export default getusers
