// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { Role, IServiceStep } from '../../types'
import { PrismaClient } from '@prisma/client'
import { withJwt } from '../../utilities'

type ReqBodyType = {
    orderId?: number
    userId?: number
    role?: Role
    userRoles?: Role[]
    serviceId?: number
} & IServiceStep

async function createorder(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()
    const _prisma = prisma as any

    try {
        console.log('req.body', req.body)

        let input = { ...req.body } as ReqBodyType
        const { orderId, serviceId, userId } = input

        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        console.log({ user })

        const userRoles = user?.role

        if (!userRoles?.includes('CompletedOrdersViewer')) {
            return res.status(500).json({ message: 'A role is not allowed by the User' })
        }

        let team: { connect: { username: string }[] } | undefined
        if (input.team) {
            let workers = input.team as string[]
            const prismaWorkersArr: { username: string }[] = []
            workers.forEach((worker) => {
                prismaWorkersArr.push({ username: worker })
            })
            team =
                workers.length > 0
                    ? {
                          connect: prismaWorkersArr,
                      }
                    : undefined
        }

        const newServiceStep = await _prisma.serviceStep.create({
            data: {
                serviceId,
                comment: input.comment,
                damage: input.damage,
                fixingDate: input.fixingDate,
                team,
            },
        })

        const data = {
            current: { connect: { id: newServiceStep.id } },
            order: {
                connect: { id: orderId },
            },
            all: {
                connect: {
                    id: newServiceStep.id,
                },
            },
        }

        if (serviceId) {
            const newService = await _prisma.service.update({
                where: { id: serviceId },
                data: {
                    currentServiceStepId: newServiceStep.id,
                    all: {
                        connect: {
                            id: newServiceStep.id,
                        },
                    },
                },
            })
        } else {
            const newService = await _prisma.service.create({
                data: {
                    current: { connect: { id: newServiceStep.id } },
                    order: {
                        connect: { id: orderId },
                    },
                    all: {
                        connect: {
                            id: newServiceStep.id,
                        },
                    },
                },
            })
        }

        return res.status(200).json({ message: 'Service was created/updated' })
    } catch (error) {
        console.log({ error })

        res.status(500).json({ message: 'Creating/updating service error' })
    } finally {
        await prisma.$disconnect()
        console.log('finally prisma disconnect.')
    }
}

export default withJwt(createorder)
// export default createorder
