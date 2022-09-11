// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { withJwt, getWhereStrategyBySteps } from '../../utilities'
import { Role, StepNames, StepName } from '../../types'
// import { IgetUserAxiosRes } from '../../types'

async function getorders(req: NextApiRequest, res: NextApiResponse) {
    const { completed, role } = req.query
    const isCompleted = completed === 'true' ? true : false
    const prisma = new PrismaClient()

    const { userId } = req.body

    const stringRole = role as string

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        console.log({ user })

        const userRoles = user?.role

        if (!userRoles?.includes(stringRole)) {
            return res.status(500).json({ message: 'A role is not allowed by the User' })
        }

        const _role = role as Role

        const whereStrategy: Record<Role, StepName> = {
            FormCreator: 'formStep',
            BefaringUser: 'beffaringStep',
            OfferCreator: 'offerStep',
            ContractPreparer: 'contractStep',
            ContractChecker: 'contractCheckerStep',
            ContractCreator: 'contractCreatorStep',
            WorkRespUser: 'workStep',
            QuestionnaireUser: 'completionstep',
            ReferenceUser: 'completionstep',
        }

        const where =
            _role === 'FormCreator'
                ? {
                      steps: {
                          some: {
                              OR: [
                                  {
                                      passedTo: 'formStep',
                                  },
                                  {
                                      passedTo: 'beffaringStep',
                                  },
                              ],
                          },
                      },
                  }
                : {
                      steps: {
                          some: {
                              passedTo: whereStrategy[_role],
                          },
                      },
                  }

        const orders = await prisma.order.findMany({
            where,
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
