import React, { useState, useEffect } from 'react'
import { UserRoleChangerStyled } from '../styles/styled-components'
import { extendedRoleTitles, Role, OtherRoles } from '../types'
import { dyktiApi, useUpdateUserRolesMutation } from '../state/apiSlice'
import { withRtkQueryTokensCheck } from '../utilities'
import useErrFn from '../hooks/useErrFn'
import { Spin } from 'antd'

const allRoles = Object.keys(extendedRoleTitles) as (Role | OtherRoles)[]

interface User {
    id: number
    name: string
    username: string
    role: typeof allRoles
}

function UserRoleChanger() {
    const [updateUser] = useUpdateUserRolesMutation()
    const errFn = useErrFn()

    const getUsers = dyktiApi.endpoints.getUsers as any
    const getWorkersQueryData = getUsers.useQuery()
    const { data: usersData } = getWorkersQueryData

    const [users, setUsers] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [unselectedRoles, setUnselectedRoles] = useState<typeof allRoles>([])

    const [isSpinning, setIsSpinning] = useState(false)

    useEffect(() => {
        console.log({ usersData })
        if (usersData?.users) {
            setUsers(usersData.users)
        }
    }, [usersData])

    useEffect(() => {
        const user = users.find((user) => user.id === selectedUser?.id)
        setSelectedUser(user || null)
    }, [users])

    useEffect(() => {
        const unselectedRoles = allRoles.filter((role) => !selectedUser?.role.includes(role))
        setUnselectedRoles(unselectedRoles)
    }, [selectedUser])

    const handleDrop = (event: React.DragEvent, role: string) => {
        event.preventDefault()
        console.log({ selectedUser, role })
        if (!selectedUser) {
            return
        }
        const _role = role as Role | OtherRoles
        const updatedUsers = users.map((user) => {
            if (user.id === selectedUser.id) {
                if (user.role.includes(_role)) {
                    // If the user already has the role, remove it
                    return { ...user, role: user.role.filter((r) => r !== _role) }
                } else {
                    // If the user doesn't have the role, add it
                    return { ...user, role: [...user.role, _role] }
                }
            }
            return user
        })
        console.log({ updatedUsers })
        setUsers(updatedUsers)
        setUnselectedRoles(unselectedRoles.filter((r) => r !== _role))
    }

    const handleDrag = (event: React.DragEvent, role: string) => {
        event.dataTransfer.setData('text/plain', role)
    }

    const onUpdate = async () => {
        setIsSpinning(true)

        await withRtkQueryTokensCheck({
            cb: submit,
            err: errFn,
        })

        async function submit() {
            return await updateUser({ username: selectedUser!.username, role: selectedUser!.role })
        }

        setIsSpinning(false)
    }

    return (
        <Spin spinning={isSpinning}>
            {' '}
            <UserRoleChangerStyled>
                <div className="wrapper">
                    {' '}
                    <label htmlFor="user-select">Select a user:</label>
                    <select
                        id="user-select"
                        onChange={(event) =>
                            setSelectedUser(users.find((user) => user.id === Number(event.target.value)) || null)
                        }
                    >
                        <option value="">--Select a user--</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                    {selectedUser && (
                        <div className="roles">
                            <div className="selected-roles">
                                <h3>Selected roles:</h3>
                                <div
                                    onDrop={(event) => handleDrop(event, event.dataTransfer.getData('text/plain'))}
                                    onDragOver={(event) => event.preventDefault()}
                                >
                                    {selectedUser.role.map((role) => (
                                        <div key={role} onDragStart={(event) => handleDrag(event, role)} draggable>
                                            {extendedRoleTitles[role]}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="unselected-roles">
                                <h3>Unselected roles:</h3>
                                <div
                                    onDrop={(event) => handleDrop(event, event.dataTransfer.getData('text/plain'))}
                                    onDragOver={(event) => event.preventDefault()}
                                >
                                    {unselectedRoles.map((role) => (
                                        <div key={role} onDragStart={(event) => handleDrag(event, role)} draggable>
                                            {extendedRoleTitles[role]}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {selectedUser && <button onClick={onUpdate}>Zaktualizuj</button>}
                </div>
            </UserRoleChangerStyled>
        </Spin>
    )
}

export default UserRoleChanger
