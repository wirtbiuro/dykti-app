// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { withJwt } from '../../utilities'
// import { IgetUserAxiosRes } from '../../types'

async function isformstepcompletedupdate(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const prisma = new PrismaClient()

    const { formStepId, orderId, isCompleted } = req.body

    console.log({ formStepId, orderId, isCompleted })

    const formStep = await prisma.formStep.findUnique({
        where: {
            id: formStepId,
        },
        include: {
            record: true,
        },
    })

    console.log({ formStep })

    const _formStep = { ...formStep }

    delete _formStep.stepId
    delete _formStep.recordId
    delete _formStep.record
    delete _formStep.id
    delete _formStep.createdAt

    const _record = formStep.record
    delete _record.id
    delete _record.createdAt

    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
    })

    console.log({ order })

    try {
        const _order = await prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                isFormStepCompleted: isCompleted,
                steps: {
                    create: {
                        formSteps: {
                            create: {
                                ..._formStep,
                                record: {
                                    create: {
                                        ..._record,
                                        isCompleted,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        console.log({ _order })

        // transaction

        // const _order = prisma.order.update({
        //     where: {
        //         id: orderId,
        //     },
        //     data: {
        //         isFormStepCompleted: isCompleted,
        //     },
        // })

        // console.log({ _order })

        // const __formStep = prisma.step.create({
        //     data: {
        //         formSteps: {
        //             create: {
        //                 ..._formStep,
        //                 record: {
        //                     create: {
        //                         ..._record,
        //                         isCompleted,
        //                     },
        //                 },
        //             },
        //         },
        //         order: {
        //             connect: { id: orderId },
        //         },
        //     },
        // })

        // const transaction = await prisma.$transaction([_order, __formStep])

        // console.log({ transaction })

        return res.status(200).json({})
    } catch (error) {
        console.log({ error })

        res.status(500).json({ message: 'update error' })
    } finally {
        await prisma.$disconnect()
        console.log('finally prisma disconnect.')
    }
}

// export default withJwt(isformstepcompletedupdates)
export default isformstepcompletedupdate
