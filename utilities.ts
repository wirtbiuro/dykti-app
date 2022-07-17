import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { IAxiosError, IServerControllerError } from './types'
import { ServerController } from './server-controller'
var cookie = require('cookie')
var jwt = require('jsonwebtoken')

interface NextApiRequestWithHeaders extends NextApiRequest {
    headers: any
}

export const withJwt = (fn: Function) => (
    req: NextApiRequestWithHeaders,
    res: NextApiResponse
) => {
    const cookies = cookie.parse(req.headers.cookie || '')
    // const cookies = cookie.parse(req.cookies || '')
    console.log({ cookies })
    const token = cookies.token || ''

    try {
        var decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log({ decoded })
        req.body = { ...req.body, userId: decoded.userId }
        return fn(req, res)
    } catch (err) {
        // err
        console.log({ err })
        return res.status(401).json({ message: 'No access' })
    }
}

export const withTokensCheck = async ({
    cb,
    err,
}: {
    cb: Function
    err: (error: IServerControllerError) => void
}) => {
    try {
        console.log('withTokensCheck')
        await cb()
    } catch (error) {
        try {
            console.log('withTokensCheck first error handling')
            await ServerController.getTokens()
            await cb()
        } catch (error) {
            err(error)
        }
    }
}

export const showErrorFormModal = ({
    element,
    errElement,
    modal,
    onOk,
    content = 'Aby przekazać sprawę dalej, musisz wypełnić wymagane pola.',
    errDescription = 'Pole wymagane',
}: {
    element: HTMLInputElement
    errElement: HTMLDivElement
    modal: any
    onOk?: Function
    content?: string
    errDescription?: string
}) =>
    modal.error({
        content,
        onOk: () => {
            if (onOk) {
                return onOk()
            }
            element.focus()
            errElement.innerHTML = errDescription
        },
    })
