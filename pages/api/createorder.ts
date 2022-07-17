// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { IFormStep, ApiBodyType } from '../../types'
import { PrismaClient } from '@prisma/client'
import { withJwt } from '../../utilities'

async function createorder(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()

    try {
        const {
            address,
            city,
            clientName,
            email,
            meetingDate,
            phone,
            whereClientFound,
            comment,
            userId,
            isCompleted,
            shouldPerfomerConfirmViewing,
            order,
        } = req.body as ApiBodyType<IFormStep>

        console.log('req.body', req.body)
        console.log('req.body.order', order?.steps[order.steps.length - 1])

        if (order) {
            const _order = await prisma.order.update({
                where: { id: order.id },
                data: {
                    steps: {
                        create: {
                            formStep: {
                                create: {
                                    address,
                                    city,
                                    clientName,
                                    email,
                                    phone,
                                    whereClientFound,
                                    meetingDate,
                                    record: {
                                        create: {
                                            comment,
                                            creatorId: userId,
                                            isCompleted,
                                            shouldPerfomerConfirmViewing,
                                            isViewingConfirmedByPerfomer: false,
                                        },
                                    },
                                },
                            },
                            befaringStep: {
                                connect: {
                                    id:
                                        order.steps[order.steps.length - 1]
                                            .befaringStep?.id,
                                },
                            },
                        },
                    },
                },
            })

            console.log({ _order })
        }

        if (!order) {
            const order = await prisma.order.create({
                data: {
                    steps: {
                        create: {
                            formStep: {
                                create: {
                                    address,
                                    city,
                                    clientName,
                                    email,
                                    meetingDate,
                                    phone,
                                    whereClientFound,
                                    record: {
                                        create: {
                                            comment,
                                            creatorId: userId,
                                            isCompleted,
                                            shouldPerfomerConfirmViewing,
                                            isViewingConfirmedByPerfomer: false,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    isFormStepCompleted: isCompleted,
                    isBefaringStepCompleted: false,
                    isOfferStepCompleted: false,
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
