// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { ITodo, CreateBefaringStepReqData } from '../../types'
import { PrismaClient } from '@prisma/client'
import { withJwt } from '../../utilities'
import { DateTime } from 'luxon'

async function createbefaringstep(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient()

    try {
        const {
            meetingDate,
            wasOfferSent,
            comment,
            userId,
            orderId,
            formStepId,
        } = req.body as CreateBefaringStepReqData

        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                isBefaringStepCompleted: true,
                steps: {
                    create: {
                        befaringStep: {
                            create: {
                                meetingDate,
                                wasOfferSent,
                                record: {
                                    create: {
                                        comment,
                                        creatorId: userId,
                                        isCompleted: true,
                                        shouldPerfomerConfirmViewing: true,
                                        isViewingConfirmedByPerfomer: false,
                                    },
                                },
                            },
                        },
                        formStep: {
                            connect: {
                                id: formStepId,
                            },
                        },
                    },
                },
            },
        })

        console.log({ order })

        return res.status(200).json({ order })
    } catch (error) {
        console.log({ error })

        res.status(500).json({ message: 'Creating order error' })
    } finally {
        await prisma.$disconnect()
        console.log('finally prisma disconnect.')
    }
}

export default withJwt(createbefaringstep)
