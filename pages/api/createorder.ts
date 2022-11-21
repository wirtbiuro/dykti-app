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

        // let _data = {}
        // let key: keyof typeof input
        // for (key in input) {
        //     if (input.hasOwnProperty(key)) {
        //         const element = input[key];
        //         _data = {..._data, element}
        //     }
        // }

        if (order) {
            const step = {
                ...order.steps[order.steps.length - 1],
            } as StepType & { orderId?: number }
            delete step.orderId
            delete step.id
            delete step.createdAt
            delete step.stepCreator

            const _order = await _prisma.order.update({
                where: { id: order.id },
                data: {
                    steps: {
                        create: {
                            ...step,
                            ...input,
                        },
                    },
                },
            })

            console.log({ _order })
        }

        if (!order) {
            const order = await _prisma.order.create({
                data: {
                    steps: {
                        create: {
                            ...input,
                        },
                    },
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
