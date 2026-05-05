'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader, PageLoader } from '@/components/loader'
import { emitUsersUpdate } from '@/contexts/socket-context'
import { Search, Trash2, Users, Shield, User as UserIcon } from 'lucide-react'
import { format } from 'date-fns'

interface User {
  _id: string
  email: string
  name: string
  role: 'admin' | 'user'
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function UsersSection() {
  const { data, isLoading, mutate } = useSWR<{ users: User[] }>('/api/users', fetcher)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)

  const handleRoleChange = useCallback(async (userId: string, newRole: string) => {
    setUpdatingUser(userId)

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (!res.ok) throw new Error('Failed to update user')

      emitUsersUpdate()
      mutate()
      toast.success(`User role updated to ${newRole}`)
    } catch {
      toast.error('Failed to update user role')
    } finally {
      setUpdatingUser(null)
    }
  }, [mutate])

  const handleDelete = useCallback(async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? All their orders will also be deleted.')) return

    setUpdatingUser(userId)

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      emitUsersUpdate()
      mutate()
      toast.success('User deleted successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user')
    } finally {
      setUpdatingUser(null)
    }
  }, [mutate])

  if (isLoading) return <PageLoader text="Loading users..." />

  const users = data?.users || []
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const adminCount = users.filter(u => u.role === 'admin').length
  const userCount = users.filter(u => u.role === 'user').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and roles</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>{adminCount} Admins</span>
            <span className="text-border">|</span>
            <UserIcon className="h-4 w-4" />
            <span>{userCount} Users</span>
          </div>
        </div>
      </div>

      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No users found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Users will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user._id, value)}
                        disabled={updatingUser === user._id}
                      >
                        <SelectTrigger className="w-28">
                          {updatingUser === user._id ? (
                            <Loader size="sm" />
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(user._id)}
                        disabled={updatingUser === user._id}
                      >
                        {updatingUser === user._id ? (
                          <Loader size="sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            {filteredUsers.map((user) => (
              <Card key={user._id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user._id, value)}
                      disabled={updatingUser === user._id}
                    >
                      <SelectTrigger className="flex-1">
                        {updatingUser === user._id ? (
                          <Loader size="sm" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleDelete(user._id)}
                      disabled={updatingUser === user._id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
