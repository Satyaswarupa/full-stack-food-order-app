import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

let io: SocketIOServer | null = null

export const initSocket = (server: HTTPServer) => {
  if (!io) {
    io = new SocketIOServer(server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join-admin', () => {
        socket.join('admin-room')
        console.log('Admin joined:', socket.id)
      })

      socket.on('join-user', (userId: string) => {
        socket.join(`user-${userId}`)
        console.log('User joined:', userId)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  return io
}

export const getIO = () => io

export const emitOrderUpdate = (order: unknown) => {
  if (io) {
    io.to('admin-room').emit('order-update', order)
  }
}

export const emitNewOrder = (order: unknown) => {
  if (io) {
    io.to('admin-room').emit('new-order', order)
  }
}

export const emitOrderStatusToUser = (userId: string, order: unknown) => {
  if (io) {
    io.to(`user-${userId}`).emit('order-status-update', order)
  }
}

export const emitItemsUpdate = () => {
  if (io) {
    io.emit('items-update')
  }
}

export const emitUsersUpdate = () => {
  if (io) {
    io.to('admin-room').emit('users-update')
  }
}
