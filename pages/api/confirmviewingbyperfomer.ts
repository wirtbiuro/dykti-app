// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { ITodo, IOrder } from '../../types'
import { PrismaClient } from '@prisma/client'
import { withJwt } from '../../utilities'
import { DateTime } from 'luxon'

export type CreateOrderResData = {
    userId: string
}

export type CreateOrderReqData = {
    userId: number
    order: IOrder
}

async function confirmorderbyperfomer(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const prisma = new PrismaClient()

    try {
        const { userId, order } = req.body as CreateOrderReqData

        console.log({ order })

        const stepProps = order.steps[order.steps.length - 1]
        const recordProps = stepProps.formStep.record

        const befaringStepId = stepProps.befaringStep?.id
        const offerStepId = stepProps.offerStep?.id

        const connect = {
            befaringStep: befaringStepId
                ? { connect: { id: befaringStepId } }
                : undefined,
            offerStep: offerStepId
                ? { connect: { id: offerStepId } }
                : undefined,
        }

        const _order = await prisma.order.update({
            where: { id: order.id },
            data: {
                isFormStepCompleted: order.isFormStepCompleted,
                isBefaringStepCompleted: order.isBefaringStepCompleted,
                isOfferStepCompleted: order.isOfferStepCompleted,
                steps: {
                    create: {
                        formStep: {
                            create: {
                                clientData: stepProps.formStep.clientData,
                                whereClientFound:
                                    stepProps.formStep.whereClientFound,
                                record: {
                                    create: {
                                        comment: recordProps.comment,
                                        creatorId: userId,
                                        isCompleted: recordProps.isCompleted,
                                        shouldPerfomerConfirmViewing:
                                            recordProps.shouldPerfomerConfirmViewing,
                                        isViewingConfirmedByPerfomer: true,
                                        perfomerId: userId,
                                        perfomerViewingDate: DateTime.now().toISO(),
                                    },
                                },
                            },
                        },
                        ...connect,
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

export default withJwt(confirmorderbyperfomer)
