import { dyktiApi } from '../state/apiSlice'
import { Modal } from 'antd'

export default () => {
    const [refetchUser] = dyktiApi.endpoints.getUser.useLazyQuery()

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
