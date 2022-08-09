// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { withJwt, getWhereStrategyBySteps } from '../../utilities'
import { Role } from '../../types'
// import { IgetUserAxiosRes } from '../../types'

async function getorders(req: NextApiRequest, res: NextApiResponse) {
    const { completed, role } = req.query
    const isCompleted = completed === 'true' ? true : false
    const prisma = new PrismaClient()

    const { userId } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        console.log({ user })

        const userRoles = user?.role

        if (!userRoles?.includes(role)) {
            return res
                .status(500)
                .json({ message: 'A role is not allowed by the User' })
        }

        const _role = role as Role

        const whereStrategy: Record<Role, any> = {
            FormCreator: isCompleted
                ? {
                      some: {
                          formStepIsProceedToNext: true,
                      },
                  }
                : {
                      none: {
                          formStepIsProceedToNext: undefined,
                      },
                  },
            BefaringUser: getWhereStrategyBySteps(
                'beffaringStep',
                'formStep',
                isCompleted
            ),
            OfferCreator: getWhereStrategyBySteps(
                'offerStep',
                'beffaringStep',
                isCompleted
            ),
            ContractPreparer: getWhereStrategyBySteps(
                'contractStep',
                'offerStep',
                isCompleted
            ),
            ContractChecker: getWhereStrategyBySteps(
                'contractCheckerStep',
                'contractStep',
                isCompleted
            ),
            ContractCreator: getWhereStrategyBySteps(
                'contractCreatorStep',
                'contractCheckerStep',
                isCompleted
            ),
            WorkRespUser: getWhereStrategyBySteps(
                'workStep',
                'contractCreatorStep',
                isCompleted
            ),
        }

        const orders = await prisma.order.findMany({
            where: {
                steps: whereStrategy[_role],
            },
            include: {
                steps: true,
            },
        })

        console.log({ orders })

        return res.status(200).json([...orders])
    } catch (error) {
        console.log({ error })

        res.status(500).json({ message: 'Getting orders error' })
    } finally {
        await prisma.$disconnect()
        console.log('finally prisma disconnect.')
    }
}

export default withJwt(getorders)
// export default getorders
