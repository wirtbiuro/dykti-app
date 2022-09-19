import { dyktiApi } from '../state/apiSlice'
import { Modal } from 'antd'

export default () => {
    const getUser = dyktiApi.endpoints.getUser as any
    const [refetchUser] = getUser.useLazyQuery()

    return () => {
        refetchUser()

        Modal.error({
            title: 'Bład',
            content: 'Brak dostępu!!!',
            onOk: () => {
                // refetchUser()
            },
        })
    }
}
