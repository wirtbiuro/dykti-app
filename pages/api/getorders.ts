// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { withJwt, getWhereStrategyBySteps } from '../../utilities'
import { Role, StepNames, StepName, getStepnameByRole } from '../../types'
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

        const where =
            _role === 'FormCreator'
                ? {
                      currentStep: {
                          isNot: {
                              OR: [
                                  {
                                      passedTo: 'completedOrdersStep',
                                  },
                                  {
                                      passedTo: 'rejectedOrdersStep',
                                  },
                              ],
                          },
                      },
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
                : ['CompletedOrdersViewer', 'RejectedOrdersViewer'].includes(_role)
                ? {
                      currentStep: {
                          OR: [
                              {
                                  passedTo: 'completedOrdersStep',
                              },
                              {
                                  passedTo: 'rejectedOrdersStep',
                              },
                          ],
                      },
                  }
                : {
                      currentStep: {
                          isNot: {
                              OR: [
                                  {
                                      passedTo: 'completedOrdersStep',
                                  },
                                  {
                                      passedTo: 'rejectedOrdersStep',
                                  },
                              ],
                          },
                      },
                      steps: {
                          some: {
                              passedTo: getStepnameByRole(_role),
                          },
                      },
                  }

        const orders = await prisma.order.findMany({
            where,
            include: {
                steps: {
                    include: { stepCreator: true, workStepTeam: true, currentOrder: true },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
                currentStep: { include: { stepCreator: true, workStepTeam: true, currentOrder: true } },
                services:
                    _role === 'CompletedOrdersViewer'
                        ? {
                              include: { current: { include: { team: true } }, all: { include: { team: true } } },
                              orderBy: { createdAt: 'desc' },
                          }
                        : undefined,
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
