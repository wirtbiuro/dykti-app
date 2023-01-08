// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { IFormStep, StepType, IOrder, Role } from '../../types'
import { PrismaClient } from '@prisma/client'
import { withJwt } from '../../utilities'

type ReqBodyType = {
    order?: IOrder
    userId?: number
    role?: Role
    userRoles?: Role[]
} & StepType

async function createorder(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()
    const _prisma = prisma as any

    try {
        const { order } = req.body as ReqBodyType
        console.log('req.body', req.body)

        let input = { ...req.body } as ReqBodyType
        delete input.order
        delete input.userId
        delete input.userRoles

        if (input.workStepTeam) {
            let workers = input.workStepTeam as string[]
            const prismaWorkersArr: { username: string }[] = []
            workers.forEach((worker) => {
                prismaWorkersArr.push({ username: worker })
            })
            console.log({ workers })
            input.workStepTeam =
                workers.length > 0
                    ? {
                          connect: prismaWorkersArr,
                      }
                    : undefined
        } else {
            input.workStepTeam = undefined
        }

        const stepCreator = {
            connect: { id: input.stepCreatorId },
        }
        delete input.stepCreatorId

        if (order) {
            const step = {
                ...order.steps[order.steps.length - 1],
            } as StepType & { orderId?: number; currentOrder?: IOrder }
            console.log({ step })
            delete step.orderId
            delete step.id
            delete step.createdAt
            delete step.stepCreatorId
            delete step.workStepTeam
            delete step.currentOrder

            const _step = await _prisma.step.create({
                data: { ...step, ...input, stepCreator },
            })

            const _order = await _prisma.order.update({
                where: { id: order.id },
                data: {
                    steps: {
                        connect: { id: _step.id },
                    },
                    currentStepId: _step.id,
                },
            })

            console.log({ _order })
        }

        if (!order) {
            const _step = await _prisma.step.create({
                data: { ...input, stepCreator },
            })

            const order = await _prisma.order.create({
                data: {
                    steps: {
                        connect: [{ id: _step.id }],
                    },
                    currentStepId: _step.id,
                },
            })

            console.log({ order })
        }

        return res.status(200).json({ message: 'Form was created' })
    } catch (error) {
        console.log({ error })

        res.status(500).json({ message: 'Creating order error' })
    } finally {
        await prisma.$disconnect()
        console.log('finally prisma disconnect.')
    }
}

export default withJwt(createorder)
// export default createorder
