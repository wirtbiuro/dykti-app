import { IAxiosError, IgetUserAxiosRes } from '../types'
import axios, { AxiosResponse } from 'axios'
// import { GetTodosData } from '../pages/api/gettodos'

export const ServerController = {
    getUser: async () => {
        try {
            const res: AxiosResponse<IgetUserAxiosRes> = await axios({
                url: '/api/getuser',
                method: 'POST',
                withCredentials: true,
            })
            return {
                id: res.data.user.id,
                username: res.data.user.username,
                todos: res.data.user.todos,
            }
        } catch (error) {
            const _error = error as IAxiosError
            throw { message: _error.response.data.message }
        }
    },
    onTop: async (id: number) => {
        try {
            await axios({
                url: '/api/ontop',
                method: 'POST',
                data: { id },
                withCredentials: true,
            })
        } catch (error) {
            const _error = error as IAxiosError
            throw { message: _error.response.data.message }
        }
    },
    updateTodoName: async ({ id, name }: { id: number; name: string }) => {
        try {
            await axios({
                url: '/api/updatetodoname',
                method: 'POST',
                data: { id, name },
                withCredentials: true,
            })
        } catch (error) {
            const _error = error as IAxiosError
            throw { message: _error.response.data.message }
        }
    },
    logout: async () => {
        try {
            await axios({
                url: '/api/logout',
                method: 'POST',
                withCredentials: true,
            })
        } catch (error) {
            const _error = error as IAxiosError
            throw { message: _error.response.data.message }
        }
    },
    getTokens: async () => {
        try {
            await axios({
                url: '/api/gettokens',
                method: 'POST',
                withCredentials: true,
            })
        } catch (error) {
            const _error = error as IAxiosError
            throw { message: _error.response.data.message }
        }
    },
    createTodo: async ({ name }: { name: string }) => {
        try {
            // const res: AxiosResponse<GetTodosData> = await axios({
            const res: AxiosResponse = await axios({
                url: '/api/createtodo',
                method: 'POST',
                data: { todo: { name } },
                withCredentials: true,
            })
            return res.data.todos
        } catch (error) {
            const _error = error as IAxiosError
            console.log({ _error })
            throw { message: _error.response.data.message }
        }
    },
    deleteTodo: async (id: number) => {
        try {
            const res: AxiosResponse = await axios({
                url: '/api/deletetodo',
                method: 'POST',
                data: { id },
                withCredentials: true,
            })
        } catch (error) {
            const _error = error as IAxiosError
            console.log({ _error })
            throw { message: _error.response.data.message }
        }
    },
}
