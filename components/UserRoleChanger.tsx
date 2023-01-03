import React, { useState, useEffect } from 'react'
import { UserRoleChangerStyled } from '../styles/styled-components'

interface User {
    id: number
    name: string
    roles: string[]
}

function UserRoleChanger() {
    const allRoles = ['admin', 'user', 'other']

    const [users, setUsers] = useState<User[]>([
        { id: 1, name: 'John', roles: ['admin'] },
        { id: 2, name: 'Jane', roles: ['user'] },
        { id: 3, name: 'Bob', roles: ['user'] },
    ])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [unselectedRoles, setUnselectedRoles] = useState(['admin', 'user'])

    useEffect(() => {
        const user = users.find((user) => user.id === selectedUser?.id)
        setSelectedUser(user || null)
    }, [users])

    useEffect(() => {
        const unselectedRoles = allRoles.filter((role) => !selectedUser?.roles.includes(role))
        setUnselectedRoles(unselectedRoles)
    }, [selectedUser])

    const handleDrop = (event: React.DragEvent, role: string) => {
        event.preventDefault()
        if (!selectedUser) {
            return
        }
        const updatedUsers = users.map((user) => {
            if (user.id === selectedUser.id) {
                if (user.roles.includes(role)) {
                    // If the user already has the role, remove it
                    return { ...user, roles: user.roles.filter((r) => r !== role) }
                } else {
                    // If the user doesn't have the role, add it
                    return { ...user, roles: [...user.roles, role] }
                }
            }
            return user
        })
        setUsers(updatedUsers)
        setUnselectedRoles(unselectedRoles.filter((r) => r !== role))
    }

    const handleDrag = (event: React.DragEvent, role: string) => {
        event.dataTransfer.setData('text/plain', role)
    }

    return (
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
                                {selectedUser.roles.map((role) => (
                                    <div key={role} onDragStart={(event) => handleDrag(event, role)} draggable>
                                        {role}
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
                                        {role}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </UserRoleChangerStyled>
    )
}

export default UserRoleChanger
