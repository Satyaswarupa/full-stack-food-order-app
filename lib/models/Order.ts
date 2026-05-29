import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IOrderItem {
  itemId: Types.ObjectId
  name: string
  price: number
  quantity: number
  imageUrl: string
}

export interface IOrder extends Document {
  userId: Types.ObjectId
  userName: string
  userEmail: string
  items: IOrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  deliveryFee: number
  distanceMeters: number
  deliveryAddress: {
    mobile: string
    fullAddress: string
    lat: number
    lng: number
    label?: string
  }
  isDeliveryTracking?: boolean
  courierLocation?: {
    lat: number
    lng: number
    updatedAt: Date
  }
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  imageUrl: { type: String, required: true }
})

const OrderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  items: [OrderItemSchema],
  total: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  distanceMeters: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: {
    mobile: { type: String, required: true },
    fullAddress: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    label: { type: String },
  },
  isDeliveryTracking: { type: Boolean, default: false },
  courierLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date },
  },
}, {
  timestamps: true
})

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)

export default Order
